# ZoonoCheck

Ensiklopedi zoonosis (kucing, anjing, manusia, lingkungan) — situs statis tanpa backend.

- Deploy: import repo ke Vercel, tanpa build command (static, root `.`).
- Lokal: `python3 tools/serve.py 8123`
- Setelah mengubah `tools/template.html` atau menambah entri: `python3 tools/build.py`
- Detail: `docs/HANDOFF.md`
