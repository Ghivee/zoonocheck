# ZoonoCheck

ZoonoCheck is an encyclopedia of zoonoses, diseases that pass between animals and people, aimed squarely at households that keep cats or dogs, where that transmission risk is highest but least often explained in plain language. It is a fully static site with no backend, and it works offline once opened as a Progressive Web App.

[Baca dalam Bahasa Indonesia di bawah](#bahasa-indonesia)

The content is an educational draft. It has not been reviewed by a veterinarian or a medical professional, and should not be treated as medical or veterinary advice.

## What it has

- **Encyclopedia pages** for three specific zoonoses: dermatophytosis (ringworm), toxocariasis and toxoplasmosis (`ensiklopedi/`), chosen because they are common in household pets and frequently misunderstood (toxoplasmosis especially, which carries a lot of folklore that does not match what is actually known about transmission).
- **Risk screening** (`skrining/`): a short interactive check to gauge a household's exposure risk.
- **Hygiene reminders** (`pengingat/`): practical, repeatable habits rather than one-time advice.
- An about page, a service worker (`sw.js`) and web manifest that make the site installable and usable offline, a sitemap, and a custom 404 page.
- `docs/SRS.pdf` holds the project's software requirements specification, and `docs/HANDOFF.md` records the site's current version and content status for whoever picks the project up next.

## Running it

URLs use real paths without a `#`, so the site has to be served over HTTP rather than opened as a local file:

```bash
python3 tools/serve.py 8123      # a dev server that falls back to index.html for unmatched paths
```

Open `http://127.0.0.1:8123/`. For production, upload this folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, or similar); it is deployed on Vercel today (`vercel.json`). Old links in the previous hash-based format (`/#entri-slug`) redirect automatically to the new path-based URLs.

Pages are generated from `tools/template.html`:

```bash
python3 tools/build.py
```

Set `BASE` in `tools/build.py` to your production domain first; it is currently a placeholder, and the generated sitemap and canonical URLs would otherwise point at a domain that does not exist.

Photos used throughout the site are CC0 (public domain, no attribution required), credited in `assets/img/CREDITS.md`.

---

## Bahasa Indonesia

ZoonoCheck adalah ensiklopedi zoonosis, penyakit yang berpindah antara hewan dan manusia, menyasar tepat pada rumah tangga yang memelihara kucing atau anjing, tempat risiko penularan itu paling tinggi tapi paling jarang dijelaskan dengan bahasa yang mudah dipahami. Ini situs statis sepenuhnya tanpa backend, dan berjalan offline setelah dibuka sebagai Progressive Web App.

Isinya adalah draf edukasi. Belum ditelaah dokter hewan atau tenaga medis, dan tidak boleh diperlakukan sebagai saran medis atau kedokteran hewan.

### Isi

- **Halaman ensiklopedi** untuk tiga zoonosis spesifik: dermatofitosis (kurap), toksokariasis, dan toksoplasmosis (`ensiklopedi/`), dipilih karena umum terjadi pada hewan peliharaan rumah tangga dan sering salah dipahami (khususnya toksoplasmosis, yang membawa banyak mitos yang tidak sesuai dengan yang sebenarnya diketahui tentang cara penularannya).
- **Skrining risiko** (`skrining/`): pengecekan interaktif singkat untuk mengukur risiko paparan sebuah rumah tangga.
- **Pengingat kebersihan** (`pengingat/`): kebiasaan praktis dan berulang, bukan saran sekali jalan.
- Halaman tentang, service worker (`sw.js`) dan web manifest yang membuat situs bisa dipasang dan dipakai offline, sitemap, dan halaman 404 khusus.
- `docs/SRS.pdf` menyimpan spesifikasi kebutuhan perangkat lunak proyek, dan `docs/HANDOFF.md` mencatat versi situs saat ini dan status kontennya untuk siapa pun yang melanjutkan proyek ini.

### Menjalankan

URL memakai path asli tanpa `#`, jadi situs harus disajikan lewat HTTP, bukan dibuka sebagai berkas lokal:

```bash
python3 tools/serve.py 8123      # server dev yang fallback ke index.html untuk path yang tidak cocok
```

Buka `http://127.0.0.1:8123/`. Untuk produksi, unggah folder ini ke host statis apa pun (Netlify, Cloudflare Pages, GitHub Pages, atau sejenisnya); saat ini dideploy di Vercel (`vercel.json`). Tautan lama berformat hash (`/#entri-slug`) otomatis dialihkan ke URL berbasis path yang baru.

Halaman dibuat dari `tools/template.html`:

```bash
python3 tools/build.py
```

Isi dulu `BASE` di `tools/build.py` dengan domain produksi; saat ini masih placeholder, dan sitemap serta URL kanonis yang dihasilkan akan mengarah ke domain yang tidak ada.

Foto yang dipakai di seluruh situs berlisensi CC0 (domain publik, tanpa perlu atribusi), dikreditkan di `assets/img/CREDITS.md`.
