import json
import hashlib
import hmac
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request as UrlRequest, urlopen

from fastapi import Cookie, FastAPI, File, Form, Header, HTTPException, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import Boolean, DateTime, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column
from starlette.responses import Response

APP_VERSION = "1.0.0"
MAX_UPLOAD_BYTES = 75 * 1024 * 1024
OWNER_COOKIE = "kaivyra_owner_session"
SESSION_TTL_HOURS = 12

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

ALLOWED_CATEGORIES = {
    "pdf": {".pdf"},
    "images": {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"},
    "word": {".doc", ".docx"},
    "markdown": {".md", ".markdown"},
    "text": {".txt"},
    "formula": {".tex"},
    "spreadsheet": {".csv", ".xls", ".xlsx"},
    "presentation": {".ppt", ".pptx"},
}

ALLOWED_EXTENSIONS = {ext for exts in ALLOWED_CATEGORIES.values() for ext in exts}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def normalize_name(name: str) -> str:
    name = os.path.basename(name or "file")
    name = re.sub(r"[^A-Za-z0-9._ -]+", "_", name).strip(" .")
    if not name:
        name = "file"
    return name[:180]


def extension(name: str) -> str:
    return os.path.splitext(name.lower())[1]


def category_for(category: str, name: str) -> bool:
    return category in ALLOWED_CATEGORIES and extension(name) in ALLOWED_CATEGORIES[category]


class Base(DeclarativeBase):
    pass


class Content(Base):
    __tablename__ = "kaivyra_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    category: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(180), nullable=False)
    object_key: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    mime_type: Mapped[str] = mapped_column(String(180), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


Base.metadata.create_all(engine)


SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
SUPABASE_BUCKET = os.environ.get("SUPABASE_BUCKET", "kaivyra-content")

if not all([SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_BUCKET]):
    raise RuntimeError("SUPABASE_URL, SUPABASE_SECRET_KEY and SUPABASE_BUCKET are required")


def _storage_request(
    method: str,
    path: str,
    body: bytes = b"",
    content_type: str = "application/json",
) -> bytes:
    encoded_path = quote(path, safe="/")
    url = f"{SUPABASE_URL}/storage/v1/{encoded_path}"

    headers = {
        "apikey": SUPABASE_SECRET_KEY,
        "Content-Type": content_type,
    }

    request = UrlRequest(
        url,
        data=body if body else None,
        headers=headers,
        method=method,
    )

    try:
        with urlopen(request, timeout=60) as response:
            return response.read()

    except HTTPError as exc:
        raise RuntimeError(
            f"SUPABASE_STORAGE_HTTP_{exc.code}"
        ) from exc

    except URLError as exc:
        raise RuntimeError(
            "SUPABASE_STORAGE_CONNECTION_FAILED"
        ) from exc


OWNER_ACCESS_CODE = os.environ.get("OWNER_ACCESS_CODE", "")
SESSION_SECRET = os.environ.get("SESSION_SECRET", "")
CORS_ORIGINS = [x.strip() for x in os.environ.get(
    "CORS_ORIGINS",
    "https://kaivyra.in,https://www.kaivyra.in",
).split(",") if x.strip()]

if not OWNER_ACCESS_CODE or not re.fullmatch(r"\d{10}", OWNER_ACCESS_CODE):
    raise RuntimeError("OWNER_ACCESS_CODE must be exactly 10 digits and must be stored only as a Render secret")
if len(SESSION_SECRET) < 32:
    raise RuntimeError("SESSION_SECRET must be at least 32 characters")

app = FastAPI(title="KAIVYRA Content API", version=APP_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Owner-CSRF"],
)


class LoginBody(BaseModel):
    code: str


def _token_for(code: str) -> str:
    expiry = int((utcnow() + timedelta(hours=SESSION_TTL_HOURS)).timestamp())
    raw = f"{expiry}.{code}".encode()
    sig = hmac.new(SESSION_SECRET.encode(), raw, hashlib.sha256).hexdigest()
    return f"{expiry}.{sig}"


def _csrf_for(token: str) -> str:
    return hmac.new(SESSION_SECRET.encode(), token.encode(), hashlib.sha256).hexdigest()[:32]


def owner_auth(session_cookie: Optional[str], csrf: Optional[str]) -> None:
    if not session_cookie or not csrf:
        raise HTTPException(status_code=401, detail="OWNER_AUTH_REQUIRED")
    parts = session_cookie.split(".", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=401, detail="INVALID_OWNER_SESSION")
    try:
        expiry = int(parts[0])
    except ValueError:
        raise HTTPException(status_code=401, detail="INVALID_OWNER_SESSION")
    if expiry <= int(utcnow().timestamp()):
        raise HTTPException(status_code=401, detail="OWNER_SESSION_EXPIRED")
    expected_sig = hmac.new(
        SESSION_SECRET.encode(),
        session_cookie.split(".", 1)[0].encode() + b"." + OWNER_ACCESS_CODE.encode(),
        hashlib.sha256,
    ).hexdigest()
    # The actual token signature is derived from secret + expiry + code.
    raw = f"{expiry}.{OWNER_ACCESS_CODE}".encode()
    expected_token_sig = hmac.new(SESSION_SECRET.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(parts[1], expected_token_sig):
        raise HTTPException(status_code=401, detail="INVALID_OWNER_SESSION")
    expected_csrf = _csrf_for(session_cookie)
    if not hmac.compare_digest(csrf, expected_csrf):
        raise HTTPException(status_code=403, detail="INVALID_OWNER_CSRF")


def signed_download_url(object_key: str) -> str:
    payload = b'{"expiresIn":900}'

    response_bytes = _storage_request(
        "POST",
        f"object/sign/{SUPABASE_BUCKET}/{object_key}",
        body=payload,
        content_type="application/json",
    )

    try:
        response = json.loads(response_bytes.decode("utf-8"))
    except Exception as exc:
        raise RuntimeError("SUPABASE_SIGNED_URL_INVALID_RESPONSE") from exc

    signed_path = response.get("signedURL")

    if not signed_path:
        raise RuntimeError("SUPABASE_SIGNED_URL_FAILED")

    if signed_path.startswith("http://") or signed_path.startswith("https://"):
        return signed_path

    return SUPABASE_URL + "/storage/v1" + signed_path
@app.get("/health")
def health():
    return {"ok": True, "service": "kaivyra-content-api", "version": APP_VERSION, "status": "ready"}


@app.post("/api/owner/login")
def owner_login(body: LoginBody, response: Response, request: Request):
    if not re.fullmatch(r"\d{10}", body.code or ""):
        raise HTTPException(status_code=400, detail="OWNER_CODE_MUST_BE_10_DIGITS")
    if not hmac.compare_digest(body.code, OWNER_ACCESS_CODE):
        raise HTTPException(status_code=401, detail="INVALID_OWNER_CODE")

    token = _token_for(body.code)
    csrf = _csrf_for(token)
    response.set_cookie(
        OWNER_COOKIE,
        token,
        httponly=True,
        secure=request.url.hostname not in {"localhost", "127.0.0.1", "::1"},
        samesite="none",
        max_age=SESSION_TTL_HOURS * 3600,
        path="/",
    )
    return {"ok": True, "csrf": csrf, "expires_in": SESSION_TTL_HOURS * 3600}


@app.post("/api/owner/logout")
def owner_logout(response: Response, session_cookie: Optional[str] = Cookie(default=None, alias=OWNER_COOKIE)):
    response.delete_cookie(OWNER_COOKIE, path="/")
    return {"ok": True}


@app.get("/api/owner/content")
def owner_content(
    session_cookie: Optional[str] = Cookie(default=None, alias=OWNER_COOKIE),
    x_owner_csrf: Optional[str] = Header(default=None),
):
    owner_auth(session_cookie, x_owner_csrf)
    with Session(engine) as db:
        rows = db.scalars(select(Content).order_by(Content.created_at.desc())).all()
        return [
            {
                "id": row.id,
                "title": row.title,
                "category": row.category,
                "filename": row.filename,
                "size_bytes": row.size_bytes,
                "published": row.is_published,
                "created_at": row.created_at.isoformat(),
                "published_at": row.published_at.isoformat() if row.published_at else None,
                "url": signed_download_url(row.object_key),
            }
            for row in rows
        ]


@app.post("/api/owner/upload")
async def owner_upload(
    category: str = Form(...),
    title: Optional[str] = Form(default=None),
    file: UploadFile = File(...),
    session_cookie: Optional[str] = Cookie(default=None, alias=OWNER_COOKIE),
    x_owner_csrf: Optional[str] = Header(default=None),
):
    owner_auth(session_cookie, x_owner_csrf)

    filename = normalize_name(file.filename)
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail="INVALID_CATEGORY")
    if not category_for(category, filename):
        raise HTTPException(status_code=400, detail="FILE_TYPE_NOT_ALLOWED_FOR_CATEGORY")

    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="FILE_TOO_LARGE")

    object_key = f"published/{category}/{uuid.uuid4().hex}/{filename}"
    content_type = file.content_type or "application/octet-stream"

    try:
        _storage_request(
            "POST",
            f"object/{SUPABASE_BUCKET}/{object_key}",
            body=data,
            content_type=content_type,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="STORAGE_UPLOAD_FAILED:" + str(exc),
        ) from exc

    with Session(engine) as db:
        row = Content(
            title=(title or os.path.splitext(filename)[0]).strip()[:240],
            category=category,
            filename=filename,
            object_key=object_key,
            mime_type=content_type,
            size_bytes=len(data),
            is_published=False,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return {
            "ok": True,
            "id": row.id,
            "status": "uploaded",
            "published": False,
            "filename": row.filename,
            "category": row.category,
        }


@app.post("/api/owner/content/{content_id}/publish")
def publish_content(
    content_id: int,
    session_cookie: Optional[str] = Cookie(default=None, alias=OWNER_COOKIE),
    x_owner_csrf: Optional[str] = Header(default=None),
):
    owner_auth(session_cookie, x_owner_csrf)
    with Session(engine) as db:
        row = db.get(Content, content_id)
        if not row:
            raise HTTPException(status_code=404, detail="CONTENT_NOT_FOUND")
        row.is_published = True
        row.published_at = utcnow()
        db.commit()
        return {"ok": True, "id": row.id, "published": True}


@app.post("/api/owner/content/{content_id}/unpublish")
def unpublish_content(
    content_id: int,
    session_cookie: Optional[str] = Cookie(default=None, alias=OWNER_COOKIE),
    x_owner_csrf: Optional[str] = Header(default=None),
):
    owner_auth(session_cookie, x_owner_csrf)
    with Session(engine) as db:
        row = db.get(Content, content_id)
        if not row:
            raise HTTPException(status_code=404, detail="CONTENT_NOT_FOUND")
        row.is_published = False
        row.published_at = None
        db.commit()
        return {"ok": True, "id": row.id, "published": False}


@app.delete("/api/owner/content/{content_id}")
def delete_content(
    content_id: int,
    session_cookie: Optional[str] = Cookie(default=None, alias=OWNER_COOKIE),
    x_owner_csrf: Optional[str] = Header(default=None),
):
    owner_auth(session_cookie, x_owner_csrf)
    with Session(engine) as db:
        row = db.get(Content, content_id)
        if not row:
            raise HTTPException(status_code=404, detail="CONTENT_NOT_FOUND")
        object_key = row.object_key
        db.delete(row)
        db.commit()

    try:
        delete_payload = json.dumps(
            {"prefixes": [object_key]}
        ).encode("utf-8")

        _storage_request(
            "DELETE",
            f"object/{SUPABASE_BUCKET}",
            body=delete_payload,
            content_type="application/json",
        )

    except Exception as exc:
        # The DB record is already removed. Return a controlled warning rather than lying.
        return JSONResponse(
            status_code=207,
            content={"ok": True, "id": content_id, "deleted": True, "storage_warning": "OBJECT_DELETE_FAILED"},
        )

    return {"ok": True, "id": content_id, "deleted": True}


@app.get("/api/public/content")
def public_content(category: Optional[str] = None):
    with Session(engine) as db:
        query = select(Content).where(Content.is_published.is_(True)).order_by(Content.published_at.desc(), Content.created_at.desc())
        if category:
            if category not in ALLOWED_CATEGORIES:
                raise HTTPException(status_code=400, detail="INVALID_CATEGORY")
            query = query.where(Content.category == category)
        rows = db.scalars(query).all()
        return [
            {
                "id": row.id,
                "title": row.title,
                "category": row.category,
                "filename": row.filename,
                "size_bytes": row.size_bytes,
                "published_at": row.published_at.isoformat() if row.published_at else None,
                "url": signed_download_url(row.object_key),
            }
            for row in rows
        ]

