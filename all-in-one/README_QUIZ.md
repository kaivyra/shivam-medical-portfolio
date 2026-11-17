# Quick start
1. Install Python 3 (python.org). Nothing else to install.
2. Windows: double-click start.bat.  Mac/Linux: sh start.sh
3. Open http://localhost:8000/quiz.html
First run loads the built-in questions, then (if you are online) fetches MedMCQA and PubMedQA in the background (about a minute). Reload the page when the terminal says "Open question sets ready." Set KAIVYRA_AUTOPULL=0 to turn the fetch off.

# KAIVYRA Quiz Arena (quiz.html)
Run: `python -m http.server 8000` inside this folder, open http://localhost:8000/quiz.html (also linked from index.html).

## Rules built in
- Levels: MBBS, MD/MS, DM/MCh, PhD. Subjects/chapters come from phase1_data_and_report/master_medical_taxonomy.json (20 domains, 100 chapters).
- Every chapter has 10 quizzes. Each quiz = 5 phases x 10 questions = 50. Score 6/10 to pass a phase; finish 5 phases to unlock the next quiz.
- Daily goal 50 questions; reaching it extends the streak. Missing a day resets it. Progress is saved in the browser (localStorage).

## Connecting content (API)
Paste your endpoint in the page. It is called as
GET <url>?level=MBBS&subject=ANAT&chapter=<title>&quiz=1&phase=1&n=10
and must return {"questions":[{"q":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]}
If the API is empty or fails, the built-in 33-question SAMPLE bank is used (questions repeat).

## Honest limits
- 100 chapters x 10 quizzes x 50 = 50,000 questions are needed for full coverage. They are NOT included; the sample bank is a starter.
- MD/MS/DM/MCh/PhD syllabi are not mapped yet (taxonomy is the MBBS-style prototype). Load them through the API.
- Every question must be reviewed by a qualified doctor before real exam use. Progress is per browser, no login or server leaderboard yet.

## Backend (server.py) - run this instead of http.server
`python server.py` then open http://localhost:8000/quiz.html (needs only Python 3, no installs).
- Question bank in SQLite (kaivyra.db, auto-created). First run loads question_bank/seed_sample.csv (33 AI-drafted, UNREVIEWED starters).
- quiz.html auto-detects the server and uses /api/questions. Chapter-specific questions are used when your CSV fills the chapter column, otherwise the whole subject is used.
- Accounts: name + PIN (PBKDF2-hashed). Streak and daily-50 are counted on the server; /api/leaderboard shows the top 20.
- Bulk add: fill question_bank/question_template.csv (columns: level,subject,chapter,question,A,B,C,D,answer,explanation,source,reviewed) then
  `python server.py import question_bank/yourfile.csv`  (or POST to /api/import with header X-Admin-Key; the key is printed at start or set via KAIVYRA_ADMIN).
  Level values: MBBS, MD/MS, DM/MCh, PhD. Subject = domain code (ANAT, PHYS, ...) or * for all subjects. JSON is also accepted.
- Put reviewed=1 only after a qualified doctor has checked the question.

## Still not covered (needs your content/hosting)
- The 50,000 reviewed questions and the MD/MS/MCh/PhD syllabus chapters: supply them through the CSV/JSON import.
- The leaderboard can be gamed (answers are counted, not verified). No email, password reset or HTTPS. For a public site use HTTPS (Caddy/nginx), a domain and rate limiting, and move to PostgreSQL if traffic grows.

## Source verification (2026-11-08)
- question_bank/vhd_source_linked.csv: 12 original-wording questions drawn from official AHA/ACC pages for the 2020 VHD guideline. Each row records its source URL. reviewed=0 until a cardiologist checks it.
- phase1_data_and_report/academic_source_registry.json updated: Gray's 42e ISBN verified (catalogue); VHD guideline PMID/DOI verified via Guideline Central; NMC pages recorded. Moore and Terminologia Anatomica still pending.
- Import: python server.py import question_bank/vhd_source_linked.csv

## NMC syllabus check (2026-11-08)
- Anatomy chapter ranges were compared with the text of NMC UG Curriculum Vol I 2024 (third-party hosted copy). 9 of 10 ranges match; ANAT-003 should end at AN20.10 and ANAT-005's range overlaps the heart chapter (proposed fix recorded).
- ANAT-004 subchapters now carry proposed AN codes in phase1_data_and_report/medical_curriculum_crosswalk.json, with gaps listed. All 'proposed', none 'confirmed'.
- 3 anatomy sample questions now carry their chapter title so the server can serve chapter-specific questions.

## Getting thousands of questions from open, paper-backed sources (needs internet on YOUR machine)
    python server.py pull medmcqa 3000     # AIIMS / NEET-PG exam MCQs (MedMCQA, CHIL 2022, Apache-2.0)
    python server.py pull pubmedqa 1000    # PhD-level: PubMed abstracts + expert yes/no/maybe (PubMedQA, EMNLP 2019, MIT)
- MedMCQA rows are mapped to the 20 subject codes and added at levels MD/MS and MBBS. Skipped: multi-answer items, Dental, Unknown. Rerun to add more (duplicates are ignored).
- PubMedQA rows go to level PhD (all subjects); every row shows its PubMed ID. Run it again after more pulls only if you want to refresh.
- Each question shows its source line and "not yet doctor-reviewed" in the quiz. Nothing is marked reviewed automatically.
- The pull uses the Hugging Face dataset-viewer API, documented for exploration, so keep N to a few thousand. For all 182k rows use the Parquet files with pandas/DuckDB, then python server.py import.
- NOT tested live: my sandbox could not reach huggingface.co. The converters, subject mapping, 0/1-based answer detection and import were tested offline with mock responses shaped like the documented API. If the first pull fails, send me the error text.
- Still no open bank for DM/MCh super-specialty. Use CSV import from your faculty or a licensed source.
- Exam MCQs can contain outdated or disputed answers. Doctor review is still needed before presenting them as verified.
