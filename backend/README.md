# KAIVYRA Content API — Render backend

This backend implements the required Owner → Upload → Publish → Public Read → Delete flow.

## API flow

- `POST /api/owner/login` — verifies the 10-digit owner code from the Render environment.
- `POST /api/owner/upload` — owner-only upload, max 75 MB.
- `POST /api/owner/content/{id}/publish` — makes content public.
- `POST /api/owner/content/{id}/unpublish` — removes it from the public library without deleting it.
- `DELETE /api/owner/content/{id}` — owner-only permanent delete from database and R2.
- `GET /api/owner/content` — owner-only management list.
- `GET /api/public/content?category=pdf` — public, read-only published content feed.
- `GET /health` — Render health check.

## Storage model

Render handles the API only. Do not store uploaded files on the Render filesystem.

- Postgres stores content metadata and publish state.
- Cloudflare R2 stores the actual files.
- Public API returns short-lived signed file URLs.

## Render environment variables

Set these in the Render dashboard under Environment. Never commit `.env` or secret values.

- `DATABASE_URL`
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `OWNER_ACCESS_CODE` — exactly 10 digits
- `SESSION_SECRET` — long random secret, 32+ characters
- `CORS_ORIGINS` — `https://kaivyra.in,https://www.kaivyra.in`

## Deploy

Create a Render Web Service from this folder/repository.

Build:

`pip install -r requirements.txt`

Start:

`uvicorn main:app --host 0.0.0.0 --port $PORT`

Health:

`/health`

## Security note

The owner code is never embedded in the frontend. It is read only from the server environment. The owner session uses an HttpOnly secure cookie and a CSRF token.

The API is designed so public users only have GET access to published content. Upload, publish, unpublish and delete routes require owner authentication.

## Frontend integration

The existing KAIVYRA white Insights page should call:

Public:

`GET https://YOUR-RENDER-SERVICE.onrender.com/api/public/content?category=pdf`

Owner:

`POST /api/owner/login`

then include the returned `csrf` value as `X-Owner-CSRF` for owner operations with credentials enabled.
