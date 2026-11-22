# ZoonoCheck — Handoff

Versi: **v3 playful field guide, 8 November 2026**  
Status konten: **Draft edukasi — belum ditelaah dokter hewan atau tenaga medis.**

## Jalankan

- **Langsung tanpa server:** buka `index.html` di browser (`file://`). Font, CSS, JavaScript, dan seluruh ilustrasi SVG sudah inline; tidak ada permintaan jaringan.
- **Dengan server lokal (untuk PWA/offline):**

  ```powershell
  python -m http.server 8123 --bind 127.0.0.1
  ```

  Lalu buka `http://127.0.0.1:8123/index.html`.
- Service worker hanya didaftarkan pada `http(s)`. Saat dibuka lewat `file://`, situs tetap berjalan penuh tanpa PWA.

## Deliverable

| File | Keterangan |
|---|---|
| `index.html` | Aplikasi utama. Satu file berisi CSS, JS, SVG, dan font WOFF2 base64. |
| `manifest.webmanifest` | Metadata PWA, ikon, shortcut. |
| `sw.js` | Service worker cache `zoonocheck-v5`; navigasi network-first, aset cache-first. |
| `icons/` | Ikon 192, 512, dan maskable 512. |
| `HANDOFF.md` | Dokumen ini. |
| `SRS_ZoonoCheck_Interactive_Scroll_Experience.pdf` | Sumber kebutuhan. |

File sumber opsional untuk pengembangan: `_head.html`, `_body.html`, `_js1.html`–`_js4.html`, `build.py`, `fraunces.b64`, `inter.b64`, `bricolage.b64`, `make_icons.py`.

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
- Router hash: `#home`, `#ensiklopedi`, `#entri-<slug>`, `#skrining`, `#pengingat`, `#tentang`, serta `#bab1`–`#bab6`.
- Reveal on scroll, parallax ringan, progress bar baca, reduced-motion, menu seluler, bottom nav.
- **Kunang**, maskot kunang-kunang orisinal: berkedip, melayang, mengepakkan sayap, mengikuti pointer, tersenyum saat diketuk, menguap saat idle, dan berbicara lewat balon teks. Ditempatkan di hero, One Health, skrining, hasil skrining, pengingat, tentang, header ensiklopedi, detail entri, dan footer.
- Partikel canvas ambient di panggung hero; efek percikan DOM saat maskot diketuk. Keduanya berhenti saat reduced-motion aktif.
- Fokus keyboard, `aria-*`, skip link, `prefers-reduced-motion`, dan kontras teks.
- PWA: installable, offline reload, shortcut Skrining/Ensiklopedi/Pengingat. Manifest hanya ditautkan saat `http(s)` agar pembukaan `file://` bebas error CORS.

## Struktur kode

`index.html` dirakit dari:

```
_head.html   -> <head>, seluruh CSS, placeholder font (Fraunces, Inter, Bricolage)
_body.html   -> shell: header, footer, bottom nav, mobile menu, <main>
_js1.html    -> helper, storage, DATA, QS, GEN, NAV, ONE, ROOMS, STAGES, HABITS
_js2.html    -> sistem ilustrasi SVG (ART.*), termasuk ART.kunang()
_js3.html    -> helper UI, controller maskot/partikel, beranda, ensiklopedi
_js4.html    -> detail, skrining, pengingat, tentang, router/init global
build.py     -> menggabungkan semua + font base64 -> index.html
```

Perintah build:

```powershell
python build.py
node --check _check.js
```

> `index.html` adalah hasil build. Untuk perubahan besar, edit file sumber lalu jalankan `build.py`; jangan mengedit `index.html` langsung karena akan tertimpa.

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
- `file://` berfungsi; manifest tidak diminta pada protokol file sehingga tidak ada error CORS, dan tidak ada resource `http(s)` yang diminta.
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

Arah visual: **playful field guide / museum print** — kertas hangat, tinta plum, outline tebal, offset shadow, sudut membulat, Bricolage Grotesque untuk display, Inter untuk teks, Fraunces italic untuk aksen editorial. Maskot Kunang memberi rasa hidup tanpa menyalin referensi. Ilustrasi dibuat khusus sebagai SVG inline; tidak ada stok foto. Warna aksen per agen: coral (dermatofitosis), biru (toksokariasis), lavender (toksoplasmosis), teal (lingkungan/pengingat).
