KAIVYRA - all in one

Run: open a terminal INSIDE this folder (the one that contains index.html) and run
     python -m http.server 8000
then open http://localhost:8000 in Chrome. Needs internet the first time.

phase1_data_and_report/ : read AGENT_1_COMPLETION_REPORT.md first.
source_App.tsx          : same app as source code, for developers.

Honest status: prototype. The heart picture is a 2D drawing, not real 3D. Content is an unreviewed draft.

UPDATE v13: index.html ab latest build hai (duplicate hata diya gaya). Run karne ke liye: python server.py (ya start.bat / start.sh) -> http://localhost:8000 . Quiz: /quiz.html. Taxonomy HTML ke saath sync check ki gayi (100 chapters, 0 difference).

POWERSHELL: .\start.ps1   (agar script block ho: Set-ExecutionPolicy -Scope Process Bypass, phir .\start.ps1)
        ya seedha: python server.py
        port badalne ke liye: $env:PORT=9000; python server.py
