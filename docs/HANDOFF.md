# ZoonoCheck — Handoff

Versi: **v4 — routing path, struktur folder baru, gerak dirapikan, 8 November 2026**  
Status konten: **Draft edukasi — belum ditelaah dokter hewan atau tenaga medis.**

## Jalankan

URL memakai path asli (tanpa `#`), jadi situs harus disajikan lewat server HTTP:

```bash
python3 tools/serve.py 8123      # dev server dengan fallback ke index.html
```

Buka `http://127.0.0.1:8123/`. Untuk produksi, unggah folder ini ke host statis apa pun (Netlify, Cloudflare Pages, GitHub Pages, nginx). Setiap rute punya `index.html` sendiri dan `404.html` menjadi fallback.

Tautan lama berformat `/#entri-slug` otomatis dialihkan ke path baru.

## Struktur folder

```
index.html, 404.html        shell halaman (hasil tools/build.py)
ensiklopedi/[slug]/         satu index.html per rute (hasil build)
skrining/ pengingat/ tentang/
assets/css/main.css         seluruh gaya
assets/js/core.js           helper, storage, DATA, konstanta
assets/js/art.js            foto, diagram spesimen SVG, ikon
assets/img/                 foto CC0 + CREDITS.md
assets/js/ui.js             komponen UI, beranda, ensiklopedi
assets/js/pages.js          detail, skrining, pengingat, tentang, router
assets/fonts/ assets/icons/
manifest.webmanifest, sw.js, sitemap.xml, robots.txt
tools/template.html         template shell
tools/build.py              membuat folder rute + sitemap
tools/serve.py              dev server
docs/                       HANDOFF.md, SRS.pdf
```

Setelah menambah entri di `DATA` (core.js) atau mengubah template: `python3 tools/build.py`. Ganti `BASE` di `tools/build.py` dengan domain produksi. Naikkan `V` di `sw.js` setiap rilis.

## Routing

`/`, `/ensiklopedi/`, `/ensiklopedi/<slug>/`, `/skrining/`, `/pengingat/`, `/tentang/`. Navigasi memakai History API (`navigate()` di pages.js). Rail bab di beranda hanya men-scroll tanpa mengubah URL.

## Gerak

Gerak dibatasi pada hal yang punya fungsi: reveal saat scroll (singkat), transisi halaman, pergantian tahap timeline, ring/progres. Dihapus: grain overlay, marquee, partikel canvas, parallax, objek melayang terus-menerus, easing memantul, maskot Kunang (dihapus seluruhnya).

Visual: foto hewan asli (CC0) menggantikan ilustrasi hewan hasil gambar kode; logo monogram Z + titik (assets/icons/logo.svg, ikon PNG dibuat dari tools/icons.html).

## Fitur yang sudah ada

### Beranda — 6 bab
1. **Hero** “Yang tak terlihat, tinggal bersama kita” + ilustrasi rumah, metrik, marquee, rail bab.
2. **One Health** — diagram tiga dunia interaktif (Hewan, Manusia, Lingkungan).
3. **Peta rumah** — 5 hotspot (litter box, dapur, halaman, kamar, ruang bermain); panel risiko dan aksi berubah.
4. **Indeks penyakit** — kartu 3 entri + filter hewan/jalur, hasil langsung, reset.
5. **Timeline penularan** — 3 tahap; tab, scroll, ilustrasi, catatan, dan teks aktif berganti.
6. **Ritual hari ini** — checklist 5 kebiasaan, ring progres, tautan ke pengingat/skrining.

### Ensiklopedi
- Pencarian nama/ilmiah/kata kunci.
- Filter hewan, kelompok risiko, dan jalur penularan; filter bisa digabung.
- Chip filter aktif bisa dihapus satu per satu.
- Kartu entri dengan ilustrasi kontekstual dan tautan detail.

### Detail entri — 10 bagian
Ringkasan 30 detik, cara menular, tanda pada hewan, tanda pada manusia, kelompok risiko, pencegahan 3 level, mitos vs fakta, kapan mencari bantuan, sumber ilmiah, status penelaahan. Dilengkapi TOC sticky, progres baca, checklist, tombol “Ingatkan”, dan tombol bagikan.

### Skrining
- 7 pertanyaan, satu per layar, dengan Kembali/Lewati.
- Jawaban hanya di memori; tidak ditulis ke `localStorage`, tidak dikirim ke server.
- Hasil diurutkan berdasarkan jumlah alasan yang cocok; menampilkan entri relevan, alasan, checklist prioritas, dan tanda bahaya.
- Bisa diulang kapan saja.

### Pengingat
- Dua tugas default (litter box, feses halaman), interval dapat diubah 1–720 jam.
- Tandai selesai, aktif/nonaktif, tambah tugas sendiri, hapus tugas.
- Riwayat 7 hari dengan tanggal dan tanda selesai.
- Jadwal kontrol dokter hewan (tanggal + jam) dari input pengguna.
- Mode ringworm menambahkan 3 tugas tambahan.
- Notifikasi browser opsional dengan izin eksplisit; ada tombol uji dan penjelasan batas browser.
- Ekspor JSON dan hapus seluruh data lokal dengan konfirmasi.

### Tentang
Prinsip editorial, batas produk, privasi/data lokal, status penelaahan, sumber umum, kolofon, dan tombol hapus data.

### Lintas halaman
- Router berbasis path (lihat Routing).
- Reveal on scroll, parallax ringan, progress bar baca, reduced-motion, menu seluler, bottom nav.
- Partikel canvas ambient di panggung hero; efek percikan DOM saat maskot diketuk. Keduanya berhenti saat reduced-motion aktif.
- Fokus keyboard, `aria-*`, skip link, `prefers-reduced-motion`, dan kontras teks.
- PWA: installable, offline reload, shortcut Skrining/Ensiklopedi/Pengingat. Manifest hanya ditautkan saat `http(s)` agar pembukaan `file://` bebas error CORS.

## Data dan penyimpanan lokal

Namespace: `zoonocheck:v2:*`

| Key | Isi |
|---|---|
| `checks` | Checklist beranda dan detail |
| `reminders` | Daftar tugas, interval, status, waktu terakhir |
| `log` | Riwayat penandaan (maks. 240 entri) |
| `control` | Jadwal kontrol `{ date, time }` |
| `ringworm` | Boolean mode ringworm |
| `reduceMotion` | Preferensi gerak |
| `migrated` | Penanda migrasi dari `zoonocheck:v1:*` |

Jawaban skrining **tidak** disimpan. Tidak ada akun, telemetri, atau permintaan ke server.

## QA yang sudah dijalankan

Diuji dengan Chrome headless via CDP pada 8 Nov 2026:

- Desktop 1440×1000, tablet 768/1024, mobile 390×844, dan layar kecil 320×900.
- Tidak ada error console/page error; tidak ada horizontal overflow.
- manifest tidak diminta pada protokol file sehingga tidak ada error CORS, dan tidak ada resource `http(s)` yang diminta.
- Service worker aktif dan halaman tetap terbuka saat offline.
- Interaksi: filter beranda/ensiklopedi, hotspot peta, tab timeline, checklist + persistensi, TOC detail tanpa reset router, skrining (termasuk kembali dan ulang), CRUD pengingat, jadwal kontrol, mode ringworm, ekspor JSON, hapus data, menu seluler.
- Maskot: mount di semua halaman, ketuk/keyboard memicu giggle + percikan + balon teks, pointer menggerakkan pupil, idle yawn, dan tidak ada error saat berpindah rute.
- Canvas hero memiliki dimensi benar dan partikel berhenti saat reduced-motion.
- Reduced motion: konten langsung terlihat tanpa animasi; canvas dan animasi dekoratif berhenti.
- Ikon PWA 192/512/maskable sudah sesuai ukuran manifest.

## TODO sebelum publikasi

1. **Penelaahan medis wajib.** Ganti `Belum ditetapkan` pada `DATA[].reviewer` dan `REV`, lalu perbarui halaman status. Verifikasi istilah, cakupan spesies, periode infektivitas, angka epidemiologi (jika ditambahkan), dan kecocokan klaim dengan sumber primer.
2. **Sumber.** Lengkapi DOI/metadata bibliografi, cek ulang semua URL/tahun, dan tambahkan kanal kontak/koreksi.
3. **Kebijakan privasi formal** bila situs dipublikasikan; saat ini belum ada data yang dikirim, tetapi tetap perlu pernyataan tertulis.
4. **Uji lintas browser/perangkat:** Safari iOS (terutama PWA + notifikasi), Android Chrome, Firefox, serta screen reader (NVDA/VoiceOver).
5. **Notifikasi:** jangan menjanjikan alarm latar belakang. Di iOS, notifikasi web memerlukan web app di Home Screen, izin, dan dukungan push; implementasi statis ini hanya mengirim notifikasi saat halaman aktif.
6. **Opsional:** pisahkan `DATA` ke JSON, tambahkan gambar OG, embed Fraunces italic asli, dan siapkan proses versioning cache (`zoonocheck-vN`) setiap rilis.
7. **Konten:** pertimbangkan menambah entri lain atau memperdalam bagian “kapan mencari bantuan” setelah review.

## Catatan desain

Arah visual: **playful field guide / museum print** — kertas hangat, tinta plum, outline tebal, offset shadow, sudut membulat, Bricolage Grotesque untuk display, Inter untuk teks, Fraunces italic untuk aksen editorial. Foto hewan asli (CC0) dan diagram spesimen SVG. Warna aksen per agen: coral (dermatofitosis), biru (toksokariasis), lavender (toksoplasmosis), teal (lingkungan/pengingat).
