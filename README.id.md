# ZoonoCheck

Ensiklopedi zoonosis untuk rumah yang memelihara hewan: penyakit yang berpindah antara kucing, anjing, manusia, dan lingkungan rumah. Situs statis tanpa backend, dan bisa dipakai tanpa internet sebagai aplikasi web progresif.

[English](README.md)

Isinya draf edukasi. Isi ini belum ditelaah dokter hewan atau tenaga medis.

## Isi

- Halaman **ensiklopedi** untuk dermatofitosis, toksokariasis, dan toksoplasmosis (`ensiklopedi/`).
- **Skrining risiko** (`skrining/`) dan **pengingat kebersihan** (`pengingat/`).
- Halaman tentang, service worker (`sw.js`), web manifest, sitemap, dan halaman 404.
- Dokumen kebutuhan ada di `docs/SRS.pdf`, dan `docs/HANDOFF.md` mencatat kondisi situs.

## Menjalankan

URL memakai path asli tanpa `#`, jadi situs harus disajikan lewat HTTP:

```bash
python3 tools/serve.py 8123      # server dev dengan fallback ke index.html
```

Halaman dibuat dari `tools/template.html`. Isi dulu `BASE` di `tools/build.py` dengan domain produksi (sekarang masih placeholder):

```bash
python3 tools/build.py
```

Dideploy di Vercel (`vercel.json`). Foto berlisensi CC0.
