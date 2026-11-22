'use strict';
document.documentElement.classList.add('js');

/* ---------- tiny helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const uid = p => p + Math.random().toString(36).slice(2, 8);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso, opts = {}) => {
  try { return new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', ...opts }); }
  catch (e) { return iso; }
};
const fmtShort = iso => {
  try { return new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); }
  catch (e) { return iso; }
};
const hoursLeft = ts => Math.max(0, Math.ceil((ts - Date.now()) / 36e5));

/* ---------- storage ---------- */
const NS = 'zoonocheck:v2:';
const S = {
  get(k, d) { try { const v = localStorage.getItem(NS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(NS + k); } catch (e) {} },
  clear() { try { Object.keys(localStorage).filter(k => k.startsWith('zoonocheck:')).forEach(k => localStorage.removeItem(k)); } catch (e) {} }
};
/* gentle migration from the v1 prototype, if present */
(function migrate() {
  if (S.get('migrated', false)) return;
  try {
    const oldChecks = localStorage.getItem('zoonocheck:v1:checks');
    if (oldChecks && !localStorage.getItem(NS + 'checks')) S.set('checks', JSON.parse(oldChecks));
    const oldRem = localStorage.getItem('zoonocheck:v1:reminders');
    if (oldRem && !localStorage.getItem(NS + 'reminders')) {
      const arr = JSON.parse(oldRem);
      if (Array.isArray(arr)) S.set('reminders', arr.map(r => ({
        id: r.id || uid('r'), title: r.t || r.title || 'Tugas kebersihan', intervalHours: r.h || 24,
        lastDone: r.last || null, enabled: r.on !== false, custom: false
      })));
    }
  } catch (e) {}
  S.set('migrated', true);
})();

/* ---------- motion preference ---------- */
const RM = matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = S.get('reduceMotion', RM.matches);
function applyMotion() {
  document.body.classList.toggle('reduce-motion', !!motionOff);
  $$('#motion-btn,#motion-btn-2').forEach(b => {
    b.setAttribute('aria-pressed', String(!!motionOff));
    if (b.id === 'motion-btn-2') b.textContent = motionOff ? 'Nyalakan gerak' : 'Kurangi gerak';
    if (b.id === 'motion-btn') b.title = motionOff ? 'Nyalakan gerak' : 'Kurangi gerak';
  });
  if (motionOff) { $$('.reveal,.reveal-x,.reveal-scale').forEach(e => e.classList.add('in')); }
}
function toggleMotion() {
  motionOff = !motionOff; S.set('reduceMotion', motionOff); applyMotion();
  document.dispatchEvent(new CustomEvent('motionchange', { detail: motionOff }));
  toast(motionOff ? 'Gerak dikurangi. Animasi dekoratif dimatikan.' : 'Gerak dinyalakan kembali.');
}

/* ---------- data ---------- */
const REV = 'Draft edukasi — belum ditelaah dokter hewan atau tenaga medis. Jangan dipakai sebagai rekomendasi klinis.';

const DATA = [
  {
    slug: 'dermatofitosis', name: 'Dermatofitosis', alt: 'Ringworm', sci: 'Microsporum canis', type: 'Jamur', typeEn: 'Fungi',
    color: '#EE5B6C', deep: '#B72F45', soft: '#FFD9DD', animals: ['kucing', 'anjing'], risk: ['anak', 'imunokompromais'], routes: ['kontak'],
    tagline: 'Bukan cacing. Jamur yang pintar menyamar.',
    summary: [
      'Ringworm disebabkan jamur, bukan cacing. Namanya berasal dari ruam melingkar yang kadang terlihat di kulit.',
      'Penularan terjadi lewat kontak langsung dengan hewan terinfeksi atau benda yang menyimpan bulu dan sisik kulit.',
      'Hewan bisa tampak sehat namun tetap membawa jamur. Diagnosis hanya bisa dipastikan oleh dokter hewan.'
    ],
    transmission: [
      { t: 'Hewan terinfeksi', d: 'Jamur tumbuh di lapisan kulit dan bulu. Sebagian hewan tidak menunjukkan tanda yang jelas.' },
      { t: 'Bulu dan benda', d: 'Sisik kulit, bulu, alas tidur, sisir, dan sofa bisa menjadi perantara.' },
      { t: 'Kulit manusia', d: 'Kontak langsung atau melalui benda membawa jamur ke kulit yang lembap atau tergores.' }
    ],
    animalSigns: [
      'Bulu rontok membulat dengan tepi bersisik.',
      'Kulit kemerahan, bersisik, atau kadang berkerak.',
      'Sebagian kucing, terutama berbulu panjang, tampak sehat tanpa lesi yang jelas.'
    ],
    humanSigns: [
      'Ruam melingkar, bersisik, dan gatal.',
      'Bercak bisa melebar atau muncul di beberapa tempat.',
      'Ruam tidak otomatis berarti ringworm; perlu diperiksa tenaga medis.'
    ],
    riskNote: 'Anak-anak dan orang dengan daya tahan tubuh rendah lebih mudah terinfeksi. Hewan berbulu panjang dan lingkungan lembap juga memberi jamur tempat tumbuh.',
    prevention: {
      Hewan: [
        { text: 'Periksakan hewan baru atau yang berbulu rontok ke dokter hewan.', rem: true },
        { text: 'Pisahkan alas tidur dan perlengkapan hewan yang sedang diperiksa.', rem: true },
        { text: 'Ikuti rencana perawatan dari dokter hewan; jangan memakai obat tanpa arahan.', rem: false }
      ],
      Manusia: [
        { text: 'Cuci tangan dengan sabun setelah memegang hewan atau perlengkapannya.', rem: true },
        { text: 'Hindari kontak kulit langsung dengan area bulu rontok.', rem: false },
        { text: 'Jangan berbagi handuk, sisir, atau pakaian dengan hewan.', rem: false }
      ],
      Lingkungan: [
        { text: 'Vakum bulu secara rutin dan buang isi vakum dengan aman.', rem: true },
        { text: 'Cuci alas tidur dan selimut hewan dengan air panas bila memungkinkan.', rem: true },
        { text: 'Bersihkan sisir, kandang, dan permukaan yang sering disentuh.', rem: true }
      ]
    },
    myths: [
      { m: 'Lampu Wood negatif berarti pasti bebas ringworm.', f: 'Tidak. Hasil negatif tidak otomatis menyingkirkan infeksi. Pemeriksaan dan konteks klinis tetap diperlukan.' },
      { m: 'Ringworm disebabkan cacing.', f: 'Bukan. Ringworm adalah infeksi jamur. Nama itu menggambarkan bentuk ruam, bukan penyebabnya.' },
      { m: 'Kucing yang tidak gatal tidak bisa menularkan.', f: 'Hewan tanpa gejala jelas tetap mungkin membawa jamur. Konfirmasi memerlukan pemeriksaan dokter hewan.' }
    ],
    help: 'Hubungi dokter hewan bila ada kerontokan, kulit bersisik, atau lesi yang meluas pada hewan. Hubungi dokter bila ruam pada manusia menetap, meluas, nyeri, atau muncul pada orang dengan daya tahan tubuh rendah.',
    refs: [
      { authors: 'Centers for Disease Control and Prevention', year: '2024', title: 'Ringworm: Basics', source: 'CDC', url: 'https://www.cdc.gov/ringworm/' },
      { authors: 'Centers for Disease Control and Prevention', year: '2024', title: 'Ringworm: Prevention', source: 'CDC', url: 'https://www.cdc.gov/ringworm/prevention/index.html' },
      { authors: 'Merck Veterinary Manual', year: '2023', title: 'Dermatophytosis in Animals', source: 'Merck & Co.', url: 'https://www.merckvetmanual.com/integumentary-system/ringworm/dermatophytosis-in-animals' }
    ],
    updated: '2026-11-07', reviewer: 'Belum ditetapkan'
  },
  {
    slug: 'toksokariasis', name: 'Toksokariasis', alt: 'Toxocariasis', sci: 'Toxocara canis / T. cati', type: 'Cacing', typeEn: 'Nematode',
    color: '#2B59D8', deep: '#173A9B', soft: '#DCE6FF', animals: ['kucing', 'anjing'], risk: ['anak'], routes: ['tanah'],
    tagline: 'Telur yang menunggu di tanah.',
    summary: [
      'Disebabkan cacing gelang yang hidup di usus anjing dan kucing.',
      'Telur keluar bersama feses, lalu menjadi infektif setelah matang di lingkungan.',
      'Manusia terinfeksi bila tanpa sengaja menelan telur, misalnya dari tanah, mainan, atau tangan yang kotor.'
    ],
    transmission: [
      { t: 'Feses hewan', d: 'Cacing dewasa mengeluarkan telur lewat feses. Feses segar belum tentu langsung infektif.' },
      { t: 'Tanah dan pasir', d: 'Telur matang di tanah, pasir bermain, atau kebun dan bisa bertahan lama di lingkungan.' },
      { t: 'Tertelan', d: 'Tangan, mainan, atau sayur yang tercemar tanah membawa telur ke mulut manusia.' }
    ],
    animalSigns: [
      'Anak anjing atau kucing: perut buncit, muntah, diare, dan bulu kusam.',
      'Hewan dewasa sering tanpa tanda yang jelas.',
      'Pemeriksaan feses dan pengobatan cacing ditentukan oleh dokter hewan.'
    ],
    humanSigns: [
      'Sering tanpa gejala.',
      'Sebagian kasus: demam, batuk, nyeri perut, atau gangguan penglihatan.',
      'Diagnosis dan pemeriksaan lanjutan dilakukan oleh tenaga medis.'
    ],
    riskNote: 'Anak-anak paling berisiko karena lebih sering bermain di tanah dan memasukkan tangan atau benda ke mulut. Siapa pun yang menelan telur infektif dapat terpapar.',
    prevention: {
      Hewan: [
        { text: 'Bawa hewan ke dokter hewan dan ikuti jadwal pemeriksaan feses serta pengobatan cacing yang ditetapkan.', rem: true },
        { text: 'Bersihkan area tidur dan tempat bermain hewan secara rutin.', rem: true }
      ],
      Manusia: [
        { text: 'Cuci tangan dengan sabun setelah bermain di tanah dan sebelum makan.', rem: true },
        { text: 'Awasi anak agar tidak memasukkan tanah atau benda kotor ke mulut.', rem: false },
        { text: 'Cuci sayur dan buah yang tumbuh dekat tanah sebelum dimakan.', rem: false }
      ],
      Lingkungan: [
        { text: 'Angkat feses hewan setiap hari dan buang dengan aman.', rem: true },
        { text: 'Tutup kotak pasir saat tidak dipakai.', rem: true },
        { text: 'Pakai sarung tangan saat berkebun, lalu cuci tangan.', rem: false }
      ]
    },
    myths: [
      { m: 'Hanya anak anjing yang bisa menularkan.', f: 'Hewan dewasa juga bisa mengeluarkan telur. Angka dan konteksnya perlu merujuk sumber primer.' },
      { m: 'Feses hewan langsung menularkan saat itu juga.', f: 'Telur biasanya perlu waktu di lingkungan sebelum menjadi infektif. Tetap angkat feses setiap hari dan jaga kebersihan tanah.' },
      { m: 'Kucing tidak bisa membawa Toxocara.', f: 'Toxocara cati dapat ditemukan pada kucing. Pemeriksaan dan pengobatan tetap ditentukan dokter hewan.' }
    ],
    help: 'Hubungi dokter bila anak mengalami demam berkepanjangan, batuk, nyeri perut, atau gangguan penglihatan setelah bermain di tanah yang mungkin tercemar. Hubungi dokter hewan untuk rencana pemeriksaan dan pengobatan cacing.',
    refs: [
      { authors: 'Centers for Disease Control and Prevention', year: '2024', title: 'Toxocariasis: About', source: 'CDC', url: 'https://www.cdc.gov/toxocariasis/' },
      { authors: 'Centers for Disease Control and Prevention', year: '2024', title: 'Toxocariasis: Prevention', source: 'CDC', url: 'https://www.cdc.gov/toxocariasis/prevention/index.html' },
      { authors: 'Companion Animal Parasite Council', year: '2024', title: 'Toxocara canis and Toxocara cati', source: 'CAPC', url: 'https://capcvet.org/guidelines/roundworms/' }
    ],
    updated: '2026-11-07', reviewer: 'Belum ditetapkan'
  },
  {
    slug: 'toksoplasmosis', name: 'Toksoplasmosis', alt: 'Toxoplasmosis', sci: 'Toxoplasma gondii', type: 'Protozoa', typeEn: 'Protozoa',
    color: '#7C5CE0', deep: '#5B21B6', soft: '#EDE9FE', animals: ['kucing'], risk: ['ibu hamil', 'imunokompromais'], routes: ['tanah', 'makanan'],
    tagline: 'Bukan hanya soal kucing.',
    summary: [
      'Disebabkan protozoa Toxoplasma gondii. Kucing adalah inang tempat parasit berkembang biak dan mengeluarkan ookista.',
      'Manusia bisa terinfeksi lewat ookista dari feses kucing atau dari daging dan sayur yang tidak aman.',
      'Banyak orang sehat tidak bergejala. Kehamilan dan daya tahan tubuh rendah perlu perhatian khusus.'
    ],
    transmission: [
      { t: 'Kucing mengeluarkan ookista', d: 'Ookista keluar lewat feses. Di lingkungan, ookista perlu waktu sebelum menjadi infektif.' },
      { t: 'Tanah, air, makanan', d: 'Tanah, pasir, air, sayur, atau daging mentah dapat menjadi perantara.' },
      { t: 'Tertelan manusia', d: 'Ookista atau jaringan parasit tertelan lewat makanan, air, atau tangan yang tercemar.' }
    ],
    animalSigns: [
      'Kucing umumnya tidak menunjukkan tanda yang jelas.',
      'Sebagian kucing bisa mengalami gejala ringan, tetapi diagnosis tidak bisa ditegakkan dari gejala saja.',
      'Pemeriksaan dan pengobatan hanya oleh dokter hewan.'
    ],
    humanSigns: [
      'Sering tanpa gejala atau mirip flu ringan.',
      'Infeksi saat hamil dapat berdampak pada janin; konsultasikan ke tenaga medis.',
      'Orang dengan daya tahan tubuh rendah perlu perhatian khusus.'
    ],
    riskNote: 'Ibu hamil dan orang dengan daya tahan tubuh rendah perlu lebih berhati-hati. Sumber infeksi tidak hanya kucing: daging kurang matang, sayur tidak dicuci, dan air yang tidak aman juga berperan.',
    prevention: {
      Hewan: [
        { text: 'Beri makanan matang atau komersial; hindari daging mentah.', rem: true },
        { text: 'Jaga kucing tetap di dalam rumah bila memungkinkan.', rem: false },
        { text: 'Bersihkan litter box setiap hari dengan sarung tangan.', rem: true }
      ],
      Manusia: [
        { text: 'Masak daging hingga matang; cuci sayur dan buah.', rem: true },
        { text: 'Cuci tangan dengan sabun setelah berkebun atau menyentuh litter box.', rem: true },
        { text: 'Ibu hamil sebaiknya tidak membersihkan litter box; minta anggota lain.', rem: false }
      ],
      Lingkungan: [
        { text: 'Bersihkan litter box setiap hari dan buang kotoran dengan aman.', rem: true },
        { text: 'Gunakan sarung tangan saat berkebun dan cuci tangan setelahnya.', rem: true },
        { text: 'Tutup tempat sampah dan jangan biarkan hewan mengaksesnya.', rem: false }
      ]
    },
    myths: [
      { m: 'Memelihara kucing pasti menyebabkan toksoplasmosis.', f: 'Tidak. Sumber lain seperti daging kurang matang dan sayur tercemar juga berperan. Kebersihan dan makanan yang aman mengurangi risiko.' },
      { m: 'Ookista langsung infektif begitu keluar dari kucing.', f: 'Ookista memerlukan waktu di lingkungan sebelum menjadi infektif. Tetap bersihkan litter box setiap hari dan cuci tangan.' },
      { m: 'Ibu hamil harus menyingkirkan kucingnya.', f: 'Tidak harus. Yang penting adalah menghindari kontak langsung dengan feses dan meminta anggota lain membersihkan litter box. Diskusikan dengan dokter kandungan.' }
    ],
    help: 'Hubungi dokter kandungan atau dokter bila sedang hamil atau memiliki daya tahan tubuh rendah dan merasa terpapar atau sakit. Hubungi dokter hewan bila kucing menunjukkan gejala yang mengkhawatirkan.',
    refs: [
      { authors: 'Centers for Disease Control and Prevention', year: '2024', title: 'Toxoplasmosis: About', source: 'CDC', url: 'https://www.cdc.gov/toxoplasmosis/' },
      { authors: 'Centers for Disease Control and Prevention', year: '2024', title: 'Toxoplasmosis: Prevention', source: 'CDC', url: 'https://www.cdc.gov/toxoplasmosis/prevention/index.html' },
      { authors: 'One Health High-Level Expert Panel', year: '2022', title: 'One Health: A new definition for a sustainable and healthy future', source: 'PLOS Pathogens', url: 'https://doi.org/10.1371/journal.ppat.1010537' }
    ],
    updated: '2026-11-07', reviewer: 'Belum ditetapkan'
  }
];

const QS = [
  { id: 'balita', q: 'Apakah ada anak balita di rumah?', hint: 'Anak kecil lebih sering bermain di tanah dan memasukkan tangan atau benda ke mulut.', related: ['toksokariasis', 'dermatofitosis'], reason: 'Anak balita lebih sering terpapar tanah, hewan, dan benda yang masuk ke mulut.', art: 'child' },
  { id: 'hamil', q: 'Apakah ada ibu hamil di rumah?', hint: 'Infeksi saat hamil perlu perhatian khusus, terutama dari makanan dan feses kucing.', related: ['toksoplasmosis'], reason: 'Kehamilan membuat beberapa infeksi perlu dicegah dan dikonsultasikan lebih awal.', art: 'pregnant' },
  { id: 'luar', q: 'Apakah kucing sering keluar rumah atau berburu?', hint: 'Hewan di luar lebih mungkin terpapar tanah, mangsa, dan feses hewan lain.', related: ['toksoplasmosis', 'toksokariasis'], reason: 'Kucing yang keluar rumah punya lebih banyak kesempatan terpapar tanah dan mangsa.', art: 'outside' },
  { id: 'daging', q: 'Apakah hewan diberi daging mentah?', hint: 'Daging mentah dapat membawa parasit. Masak hingga matang atau pilih makanan komersial.', related: ['toksoplasmosis'], reason: 'Daging mentah adalah salah satu jalur paparan Toxoplasma yang penting.', art: 'meat' },
  { id: 'tanah', q: 'Apakah ada kotak pasir, kebun, atau area tanah?', hint: 'Tanah dan pasir dapat tercemar feses hewan. Tutup kotak pasir dan cuci tangan setelah berkebun.', related: ['toksokariasis', 'toksoplasmosis'], reason: 'Tanah dan pasir bisa menyimpan telur cacing atau ookista yang sudah matang.', art: 'soil' },
  { id: 'lesi', q: 'Apakah hewan memiliki lesi atau kerontokan kulit?', hint: 'Kerontokan tidak otomatis berarti ringworm. Perlu pemeriksaan dokter hewan.', related: ['dermatofitosis'], reason: 'Lesi dan kerontokan kulit perlu dievaluasi dokter hewan, bukan didiagnosis sendiri.', art: 'skin' },
  { id: 'imun', q: 'Apakah ada anggota keluarga dengan daya tahan tubuh rendah?', hint: 'Misalnya sedang menjalani pengobatan tertentu atau memiliki kondisi imun.',
    related: ['dermatofitosis', 'toksokariasis', 'toksoplasmosis'], reason: 'Daya tahan tubuh rendah membuat pencegahan dan konsultasi lebih penting.', art: 'immune' }
];

const GEN = [
  { id: 'g1', text: 'Cuci tangan dengan sabun setelah kontak dengan hewan.' },
  { id: 'g2', text: 'Angkat feses hewan dari halaman hari ini.' },
  { id: 'g3', text: 'Bersihkan litter box dengan sarung tangan.' },
  { id: 'g4', text: 'Cuci alas tidur atau selimut hewan.' },
  { id: 'g5', text: 'Simpan makanan hewan tertutup dan jauh dari jangkauan.' }
];

const NAV = [
  ['home', 'Beranda'], ['ensiklopedi', 'Ensiklopedi'], ['pengingat', 'Pengingat'], ['skrining', 'Skrining'], ['tentang', 'Tentang']
];

const ONE = [
  { id: 'hewan', label: 'Hewan', color: '#EE5B6C', soft: '#FFD9DD', text: 'Kucing dan anjing bisa membawa agen tanpa tampak sakit. Bulu, kulit, feses, dan air liur adalah titik lepas yang sering terlewat.', quote: 'Hewan yang sehat belum tentu bebas agen.' },
  { id: 'manusia', label: 'Manusia', color: '#2B59D8', soft: '#DCE6FF', text: 'Tangan yang menyentuh hewan, tanah, atau makanan adalah jembatan paling umum. Anak kecil dan ibu hamil punya risiko yang berbeda.', quote: 'Paparan tidak sama dengan infeksi.' },
  { id: 'lingkungan', label: 'Lingkungan', color: '#7C5CE0', soft: '#EDE9FE', text: 'Litter box, alas tidur, kotak pasir, dan tanah kebun menyimpan agen lebih lama dari yang kita kira.', quote: 'Agen tidak butuh rumah baru. Ia hanya butuh jalur.' }
];

const ROOMS = [
  { id: 'litter', num: 1, name: 'Litter box', color: '#7C5CE0', soft: '#EDE9FE', x: 320, y: 344, risk: ['Toksoplasmosis', 'Toksokariasis'], text: 'Litter box adalah titik pertemuan feses, tangan, dan lantai. Ookista dan telur tidak terlihat, jadi kebersihan harian lebih penting daripada tanda yang kasat mata.', action: 'Bersihkan hari ini, pakai sarung tangan, lalu cuci tangan dengan sabun.', art: 'litter' },
  { id: 'dapur', num: 2, name: 'Dapur', color: '#2B59D8', soft: '#DCE6FF', x: 460, y: 136, risk: ['Toksoplasmosis'], text: 'Daging mentah, talenan, dan sayur yang belum dicuci adalah jalur paparan yang sering luput. Cuci tangan dan pisahkan alat masak untuk daging mentah.', action: 'Masak daging hingga matang; cuci sayur dan permukaan talenan.', art: 'kitchen' },
  { id: 'halaman', num: 3, name: 'Halaman & tanah', color: '#1C9C96', soft: '#D4F2EE', x: 520, y: 344, risk: ['Toksokariasis', 'Toksoplasmosis'], text: 'Tanah dan pasir bisa menyimpan telur cacing atau ookista yang sudah matang. Anak-anak yang bermain di sini paling sering menelan tanah tanpa sadar.', action: 'Angkat feses setiap hari, tutup kotak pasir, dan cuci tangan setelah berkebun.', art: 'yard' },
  { id: 'kamar', num: 4, name: 'Kamar & alas tidur', color: '#EE5B6C', soft: '#FFD9DD', x: 120, y: 344, risk: ['Dermatofitosis'], text: 'Bulu dan sisik kulit yang tertinggal di alas tidur bisa menjadi perantara jamur. Vakum dan cuci perlengkapan secara rutin, terutama bila hewan sedang diperiksa.', action: 'Cuci alas tidur dan vakum bulu di sekitar tempat tidur.', art: 'bedroom' },
  { id: 'ruang', num: 5, name: 'Ruang bermain', color: '#B96A0C', soft: '#FFEBC4', x: 160, y: 136, risk: ['Dermatofitosis', 'Toksokariasis'], text: 'Sofa, karpet, dan mainan adalah area kontak langsung. Anak dan hewan berbagi ruang yang sama, jadi bersihkan permukaan dan mainan secara berkala.', action: 'Bersihkan mainan dan permukaan yang sering disentuh.', art: 'living' }
];

const STAGES = [
  { id: 'paparan', label: 'Paparan', title: 'Agen keluar dari hewan.', text: 'Bulu, kulit, feses, atau air liur membawa agen ke benda dan tanah. Di titik ini belum ada infeksi — hanya ada jejak yang menunggu kesempatan.', note: 'Paparan adalah peristiwa. Infeksi adalah kemungkinan.' },
  { id: 'masuk', label: 'Masuk ke tubuh', title: 'Tangan menjadi jembatan.', text: 'Tangan, makanan, atau kulit yang tercemar menyentuh mulut, mata, atau luka. Anak kecil lebih sering melakukannya tanpa sadar.', note: 'Cuci tangan memutus jalur paling sederhana.' },
  { id: 'risiko', label: 'Risiko infeksi', title: 'Tidak setiap paparan berakhir infeksi.', text: 'Jumlah agen, daya tahan tubuh, dan kondisi rumah menentukan. Karena itu, pencegahan tidak perlu menunggu diagnosis.', note: 'Risiko lebih tinggi pada anak, ibu hamil, dan imunokompromais.' }
];

const HABITS = [
  { t: 'Cuci tangan', d: 'Sabun, 20 detik', icon: 'hand', c: '#1D4ED8' },
  { t: 'Angkat feses', d: 'Setiap hari', icon: 'scoop', c: '#0F766E' },
  { t: 'Cuci alas', d: 'Rutin, air panas', icon: 'bed', c: '#EC4899' }
];

const E = slug => DATA.find(d => d.slug === slug);
const vars = d => `--accent:${d.color};--soft:${d.soft};`;
const colorFor = s => (E(s) || {}).color || '#1D4ED8';
/* ============================================================
   ILLUSTRATION SYSTEM — flat ink + paper, built to feel drawn
   ============================================================ */
const INK = '#2A0F1C', PAPER = '#FFF8EF', PAPER2 = '#FBF6EA', PINK = '#EE5B6C', BLUE = '#2B59D8', LAV = '#7C5CE0', SKY = '#1C9C96', MOSS = '#1C9C96', AMBER = '#B96A0C';
const AMBER2 = '#FFD27A', CREAM = '#FBF6EA', TEAL2 = '#7FD6CF';
const st = (w = 2.4, c = INK) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const fillSt = (f = PAPER, w = 2.4, c = INK) => `fill="${f}" ${st(w, c)}`;
const svg = (vb, label, body, cls = '') => `<svg class="art ${cls}" viewBox="${vb}" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const g = (x, y, s, body) => `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;

const cat = (x, y, s = 1, o = {}) => g(x, y, s, `
  <path d="M20 44q24 6 21-18" fill="none" ${st(2.4)}/>
  <path d="M-24 4c-10 14-10 34 4 44h40c14-10 14-30 4-44-10-12-38-12-48 0Z" fill="${o.fill || PAPER}" ${st()}/>
  <path d="M-24-10-33-33-13-23Z" fill="${o.fill || PAPER}" ${st()}/>
  <path d="M24-10 33-33 13-23Z" fill="${o.fill || PAPER}" ${st()}/>
  <circle cx="0" cy="-14" r="20" fill="${o.fill || PAPER}" ${st()}/>
  <circle cx="-7" cy="-16" r="2.4" fill="${INK}"/><circle cx="7" cy="-16" r="2.4" fill="${INK}"/>
  <path d="M-3-9 3-9 0-5Z" fill="${o.nose || PINK}" ${st(1.6)}/>
  <path d="M0-4q-5 5-9 1M0-4q5 5 9 1" fill="none" ${st(1.6)}/>
  <path d="M-20-12h-10M-20-7l-10 2M20-12h10M20-7l10 2" ${st(1.6)}/>
  <path d="M-9 48v8M9 48v8" ${st()}/>
  ${o.patch ? `<path d="M${(o.px || -14) - 10} ${o.py || 22}q10-11 20 0t-2 18q-12 6-18-4t0-14Z" fill="${o.patch}" ${st(2)}/>` : ''}
  ${o.belly ? `<ellipse cx="0" cy="28" rx="17" ry="12" fill="${o.belly}" opacity=".85"/>` : ''}
`);

const dog = (x, y, s = 1, o = {}) => g(x, y, s, `
  <path d="M22 36q24 0 18-20" fill="none" ${st(2.6)}/>
  <path d="M-28 14c0-18 12-28 28-28s28 10 28 28v14c0 18-12 28-28 28S-28 46-28 28Z" fill="${o.fill || PAPER}" ${st()}/>
  <path d="M-22 50v8M22 50v8" ${st()}/>
  <ellipse cx="-27" cy="-17" rx="10" ry="22" fill="${o.ear || '#38BDF8'}" ${st()}/>
  <ellipse cx="27" cy="-17" rx="10" ry="22" fill="${o.ear || '#38BDF8'}" ${st()}/>
  <circle cx="0" cy="-18" r="22" fill="${o.fill || PAPER}" ${st()}/>
  <ellipse cx="0" cy="-5" rx="14" ry="10" fill="${o.snout || '#E8DCC4'}" ${st(2)}/>
  <circle cx="-8" cy="-20" r="2.5" fill="${INK}"/><circle cx="8" cy="-20" r="2.5" fill="${INK}"/>
  <ellipse cx="0" cy="-9" rx="4" ry="3" fill="${INK}"/>
  <path d="M0-6v4m0 0q-5 5-9 0m9 0q5 5 9 0" fill="none" ${st(1.8)}/>
  <path d="M-6 6q6 10 12 0" fill="${PINK}" ${st(1.8)}/>
  ${o.patch ? `<circle cx="${o.px || 14}" cy="${o.py || 26}" r="${o.pr || 10}" fill="${o.patch}" ${st(2)}/>` : ''}
  ${o.belly ? `<ellipse cx="0" cy="28" rx="16" ry="13" fill="${o.belly}" opacity=".85"/>` : ''}
`);

const person = (x, y, s = 1, o = {}) => g(x, y, s, `
  <path d="M-11 26v22M11 26v22" fill="none" stroke="${o.pants || INK}" stroke-width="9" stroke-linecap="round"/>
  <path d="M-20 4q0-14 20-14t20 14v24q0 12-20 12T-20 28Z" fill="${o.shirt || BLUE}" ${st()}/>
  ${o.pregnant ? `<path d="M-18 12q-8 20 6 30t26 0 6-30" fill="${o.shirt || BLUE}" ${st()}/><path d="M-8 18q8 10 18 4" fill="none" ${st(2)}/>` : ''}
  <path d="M-20 8q-12 8-12 20M20 8q12 8 12 20" fill="none" ${st(2.6)}/>
  <circle cx="-32" cy="30" r="4" fill="${o.skin || '#F2C9A0'}" ${st(1.6)}/>
  <circle cx="32" cy="30" r="4" fill="${o.skin || '#F2C9A0'}" ${st(1.6)}/>
  <circle cx="0" cy="-28" r="16" fill="${o.skin || '#F2C9A0'}" ${st()}/>
  <path d="M-15-32q3-15 15-15t15 15q-15-6-30 0Z" fill="${o.hair || INK}" ${st(2)}/>
  <circle cx="-5" cy="-29" r="1.9" fill="${INK}"/><circle cx="5" cy="-29" r="1.9" fill="${INK}"/>
  <path d="M-5-21q5 4 10 0" fill="none" ${st(1.7)}/>
  ${o.patch ? `<path d="M${o.px || -14} ${o.py || 14}q7-8 14 0t-1 12q-8 4-12-2t-1-10Z" fill="${o.patch}" ${st(1.8)}/>` : ''}
  ${o.scarf ? `<path d="M-16-12q16 9 32 0" fill="none" stroke="${o.scarf}" stroke-width="7" stroke-linecap="round"/>` : ''}
  ${o.bag ? `<path d="M-34 20h14v18h-14z" fill="${o.bag}" ${st(2)}/>` : ''}
`);

const child = (x, y, s = 1, o = {}) => person(x, y, s, { shirt: '#EC4899', pants: '#12211D', skin: '#F2C9A0', ...o });

const spore = (x, y, c = PINK, s = 1) => g(x, y, s, `
  <g stroke="${c}" stroke-width="2.4" stroke-linecap="round">
    <path d="M-13 0h26M0-13v26M-9-9l18 18M9-9-9 9"/>
  </g>
  <circle r="8" fill="${c}" ${st(2)}/><circle r="3" fill="${PAPER}"/>
`);

const worm = (x, y, c = SKY, s = 1) => g(x, y, s, `
  <path d="M-26-14q22-18 34 4t-12 26q-20 8-24-10t18-16 18 12" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
  <path d="M-26-14q22-18 34 4t-12 26q-20 8-24-10t18-16 18 12" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".55" stroke-dasharray="3 7"/>
  <circle cx="-27" cy="-14" r="4" fill="${c}" ${st(1.8)}/>
`);

const oocyst = (x, y, c = LAV, s = 1) => g(x, y, s, `
  <circle r="15" fill="${c}" opacity=".2" ${st(2.2, c)}/>
  <path d="M-6-8q10-4 12 5t-7 12-11-5 6-12Z" fill="${c}" ${st(1.4, INK)}/>
  <path d="M6-2q8 2 5 9" fill="none" ${st(2.4, c)}/>
  <circle cx="4" cy="5" r="2" fill="${PAPER}"/>
`);

const plant = (x, y, s = 1, c = MOSS) => g(x, y, s, `
  <path d="M-18 12h36l-5 22h-26z" fill="#E9D5FF" ${st()}/>
  <path d="M0 12V-18M0-6q-12-2-14-14M0-6q12-2 14-14M0 2q-10 0-12-8M0 2q10 0 12-8" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
`);

const litter = (x, y, s = 1, c = LAV) => g(x, y, s, `
  <path d="M-32-8h64l-7 28h-50z" fill="#E9D5FF" ${st()}/>
  <path d="M-27-8q27-15 54 0" fill="${PAPER}" ${st()}/>
  <path d="M-22 8q22-8 44 0" fill="none" stroke="${c}" stroke-width="2.2" stroke-dasharray="3 5"/>
  <circle cx="-8" cy="6" r="2.6" fill="${c}"/><circle cx="9" cy="10" r="2.2" fill="${c}"/>
`);

const bowl = (x, y, s = 1, c = SKY) => g(x, y, s, `
  <ellipse cx="0" cy="0" rx="26" ry="9" fill="${c}" opacity=".25" ${st()}/>
  <path d="M-22 0q4 16 22 16T22 0" fill="${PAPER}" ${st()}/>
  <ellipse cx="0" cy="0" rx="22" ry="7" fill="${c}" opacity=".6"/>
`);

const soil = (x, y, s = 1) => g(x, y, s, `
  <path d="M-58 18q58-24 116 0v10h-116z" fill="#D1FAE5" ${st()}/>
  <path d="M-26 8V-10M-26 0q-10-4-12-12M-26 0q10-4 12-12M20 10V-4M20 2q-8-2-9-9M20 2q8-2 9-9" fill="none" stroke="${MOSS}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="-38" cy="18" r="3" fill="${AMBER}" opacity=".6"/><circle cx="38" cy="20" r="2.4" fill="${AMBER}" opacity=".6"/>
`);

const bed = (x, y, s = 1, c = PINK) => g(x, y, s, `
  <rect x="-44" y="-24" width="88" height="52" rx="8" fill="${PAPER}" ${st()}/>
  <path d="M-44 4h88" ${st(2)}/>
  <rect x="-34" y="-18" width="28" height="18" rx="6" fill="${c}" opacity=".35" ${st(2)}/>
  <path d="M-8-14q24-8 40 4v12H-8z" fill="${c}" opacity=".25" ${st(2)}/>
`);

const sofa = (x, y, s = 1, c = BLUE) => g(x, y, s, `
  <path d="M-52-10q0-14 14-14h76q14 0 14 14v20q0 10-10 10h-84q-10 0-10-10Z" fill="${c}" opacity=".25" ${st()}/>
  <path d="M-58 4q-8 0-8 10v16h8M58 4q8 0 8 10v16h-8" fill="${PAPER}" ${st()}/>
  <path d="M-40-20v26M40-20v26" ${st(2)}/>
  <rect x="-36" y="6" width="72" height="16" rx="5" fill="${PAPER}" ${st(2)}/>
`);

const counter = (x, y, s = 1) => g(x, y, s, `
  <path d="M-46-18h92v16h-92z" fill="${PAPER}" ${st()}/>
  <path d="M-40-2v42M40-2v42M-40 20h80" ${st(2)}/>
  <rect x="-30" y="-12" width="20" height="7" rx="2" fill="${SKY}" opacity=".5"/>
  <circle cx="14" cy="-9" r="3" fill="${INK}"/><circle cx="26" cy="-9" r="3" fill="${INK}"/>
`);

const tree = (x, y, s = 1) => g(x, y, s, `
  <path d="M0 60V-8" ${st(5)}/>
  <path d="M0-8q-6-22 8-34M0-8q8-20-4-34" fill="none" ${st(3)}/>
  <circle cx="-24" cy="-26" r="20" fill="#D1FAE5" ${st()}/>
  <circle cx="24" cy="-30" r="24" fill="#A7F3D0" ${st()}/>
  <circle cx="0" cy="-52" r="26" fill="#D1FAE5" ${st()}/>
`);

const fence = (x, y, s = 1) => g(x, y, s, `
  <path d="M-50 20h100" ${st(3)}/>
  <path d="M-40 20V-14M-12 20V-14M16 20V-14M44 20V-14" ${st(3)}/>
  <path d="M-46 2h92M-46 12h92" ${st(2)}/>
`);

const sun = (x, y, s = 1) => g(x, y, s, `
  <circle r="24" fill="#FEF3C7" ${st(2.6)}/>
  <g stroke="${AMBER}" stroke-width="2.4" stroke-linecap="round">
    <path d="M0-36v-8M0 36v8M-36 0h-8M36 0h8M-25-25l-6-6M25 25l6 6M25-25l6-6M-25 25l-6 6"/>
  </g>
`);

const arrow = (x, y, s = 1, c = INK) => g(x, y, s, `
  <path d="M-22 0h38M4-8l12 8-12 8" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
`);

const labelTag = (x, y, text, c = INK, anchor = 'start', rot = 0) => `
  <g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="${anchor === 'end' ? -text.length * 6.1 - 10 : -6}" y="-12" width="${text.length * 6.1 + 16}" height="22" rx="4" fill="${PAPER}" ${st(1.4, c)}/>
    <text x="${anchor === 'end' ? -text.length * 6.1 - 1 : 1}" y="3" font-family="monospace" font-size="8" letter-spacing="1" fill="${c}" text-anchor="${anchor}">${text}</text>
  </g>`;

const sceneBg = (w = 520, h = 360, c = '#FCE7F3') => `
  <rect x="0" y="0" width="${w}" height="${h}" rx="14" fill="${PAPER}"/>
  <path d="M0 ${h - 54}H${w}" stroke="${INK}" stroke-width="2.4" opacity=".35"/>
  <circle cx="${w - 70}" cy="62" r="42" fill="${c}" opacity=".8"/>
  <g fill="${INK}" opacity=".16">${Array.from({ length: 18 }, (_, i) => `<circle cx="${30 + (i * 47) % (w - 60)}" cy="${24 + (i * 31) % (h - 110)}" r="1.4"/>`).join('')}</g>
`;

/* ---------- the illustrations ---------- */
const ART = {
  kunang({ mood = 'happy', arms = true, lens = false } = {}) {
    const sleepy = mood === 'sleepy';
    return svg('0 0 220 220', 'Kunang, kunang-kunang pemandu ZoonoCheck', `
      <ellipse cx="110" cy="198" rx="54" ry="7" fill="${INK}" opacity=".14"/>
      <circle class="k-glow" cx="110" cy="112" r="82" fill="${AMBER2}" opacity=".34"/>
      <g class="k-wing k-wing-l">
        <path d="M82 92C56 64 22 70 26 102c3 26 30 34 58 16Z" fill="${TEAL2}" opacity=".72" ${st(3.4)}/>
        <path d="M74 98C54 84 38 84 38 100c0 13 16 19 38 10" fill="none" stroke="${PAPER}" stroke-width="3" stroke-linecap="round" opacity=".65"/>
      </g>
      <g class="k-wing k-wing-r">
        <path d="M138 92c26-28 60-22 56 10-3 26-30 34-58 16Z" fill="${TEAL2}" opacity=".72" ${st(3.4)}/>
        <path d="M146 98c20-14 36-14 36 2 0 13-16 19-38 10" fill="none" stroke="${PAPER}" stroke-width="3" stroke-linecap="round" opacity=".65"/>
      </g>
      ${arms ? `
        <g class="k-arm k-arm-l"><path d="M52 132C38 140 34 154 40 166" fill="none" ${st(9)}/><path d="M52 132C38 140 34 154 40 166" fill="none" stroke="${AMBER2}" stroke-width="4" stroke-linecap="round"/></g>
        <g class="k-arm k-arm-r"><path d="M168 132C182 140 186 154 180 166" fill="none" ${st(9)}/><path d="M168 132C182 140 186 154 180 166" fill="none" stroke="${AMBER2}" stroke-width="4" stroke-linecap="round"/></g>` : ''}
      <g class="k-body">
        <g class="k-antenna k-antenna-l"><path d="M88 50C84 34 78 26 70 20" fill="none" ${st(4.4)}/><circle cx="68" cy="17" r="6" fill="${PINK}" ${st(3.4)}/></g>
        <g class="k-antenna k-antenna-r"><path d="M132 50c4-16 10-24 18-30" fill="none" ${st(4.4)}/><circle cx="152" cy="17" r="6" fill="${PINK}" ${st(3.4)}/></g>
        <path d="M110 40c42 0 68 34 68 76 0 42-30 70-68 70s-68-28-68-70c0-42 26-76 68-76Z" fill="${AMBER2}" ${st(5)}/>
        <path d="M110 52c33 0 54 27 54 62 0 35-24 58-54 58s-54-23-54-58c0-35 21-62 54-62Z" fill="${CREAM}" opacity=".92"/>
        <path d="M54 84c6-18 22-30 42-32" fill="none" stroke="${PAPER}" stroke-width="7" stroke-linecap="round" opacity=".8"/>
        <ellipse class="k-cheek" cx="64" cy="132" rx="10" ry="6" fill="${PINK}"/>
        <ellipse class="k-cheek" cx="156" cy="132" rx="10" ry="6" fill="${PINK}"/>
        ${sleepy
          ? `<path d="M74 108q14 10 28 0M118 108q14 10 28 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
          : `<g class="k-eyes">
              <circle cx="88" cy="104" r="17" fill="${PAPER}" ${st(4.4)}/>
              <circle cx="132" cy="104" r="17" fill="${PAPER}" ${st(4.4)}/>
              <g class="k-pupil"><circle cx="88" cy="106" r="8.4" fill="${INK}"/><circle cx="132" cy="106" r="8.4" fill="${INK}"/>
              <circle cx="91.5" cy="102.5" r="2.7" fill="${PAPER}"/><circle cx="135.5" cy="102.5" r="2.7" fill="${PAPER}"/></g>
            </g>`}
        <path class="k-squint" d="M74 108q14-14 28 0M118 108q14-14 28 0" fill="none" stroke="${INK}" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="k-smile" d="M94 136q16 14 32 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
        <g class="k-open">
          <path d="M94 133q16-5 32 0-1 22-16 24-15-2-16-24Z" fill="#4A0F22" ${st(4.2)}/>
          <path d="M102 150q8-7 16 0-3 7-8 7.5-5-.5-8-7.5Z" fill="${PINK}"/>
          <path d="M104 132.5h12v3.4a6 3.2 0 0 1-12 0Z" fill="${PAPER}"/>
        </g>
        <path d="M88 164q22 10 44 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" opacity=".22"/>
        ${mood === 'wow' ? `<path d="M72 76l12-7M148 76l-12-7" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` : ''}
        ${lens ? `<g class="k-lens" transform="rotate(8 182 166)"><circle cx="182" cy="166" r="19" fill="${TEAL2}" opacity=".34" ${st(5)}/><circle cx="182" cy="166" r="13" fill="${PAPER}" opacity=".6" ${st(2.4)}/><path d="M195 179l17 17" ${st(7)}/></g>` : ''}
      </g>
      <text class="k-zzz" x="170" y="48" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="26" fill="${INK}">z</text>
    `, 'kunang');
  },

  hero() {
    return svg('0 0 640 560', 'Rumah dengan kucing, anjing, manusia, dan mikroorganisme yang melayang di sekitar rumah', `
      <defs>
        <pattern id="heroDots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${INK}" opacity=".14"/></pattern>
        <clipPath id="lensClip"><circle cx="500" cy="120" r="72"/></clipPath>
      </defs>
      <circle cx="310" cy="290" r="245" fill="#FCE7F3" opacity=".62"/>
      <circle cx="310" cy="290" r="245" fill="url(#heroDots)" opacity=".7"/>
      <path d="M0 482h640" stroke="${INK}" stroke-width="3"/>
      ${sun(566, 74, .9)}
      ${tree(70, 430, .95)}
      ${fence(470, 470, 1.1)}

      <path d="M96 214 320 86l224 128" fill="${BLUE}" ${st(3.2)}/>
      <path d="M120 208v262h400V208" fill="${PAPER}" ${st(3.2)}/>
      <path d="M120 352h400M320 208v262" ${st(2.4)}/>
      <rect x="322" y="210" width="196" height="140" fill="#E0F2FE" opacity=".55"/>
      <rect x="122" y="354" width="196" height="114" fill="#FCE7F3" opacity=".45"/>
      <rect x="322" y="354" width="196" height="114" fill="#EDE9FE" opacity=".5"/>

      ${sofa(190, 322, .78, BLUE)}
      ${cat(282, 320, .82, { patch: PINK, px: -14, py: 24 })}
      <rect x="132" y="244" width="56" height="46" rx="4" fill="${PAPER}" ${st(2.2)}/>
      <path d="M160 244v46M132 267h56" ${st(1.6)}/>
      ${plant(292, 250, .55)}

      ${counter(408, 262, .9)}
      ${dog(466, 330, .78, { ear: '#38BDF8', patch: '#38BDF8', px: 12, py: 26, pr: 8 })}
      ${bowl(408, 338, .6, SKY)}

      ${bed(196, 424, .85, PINK)}
      ${litter(426, 432, .9, LAV)}
      <path d="M500 414h20" ${st(2.4)}/>
      <path d="M520 414q10 0 10 10" fill="none" ${st(2.4)}/>

      <path d="M426 398q30-40 68-22t34 62" fill="none" stroke="${PINK}" stroke-width="2.6" stroke-dasharray="5 8" stroke-linecap="round"/>
      <circle cx="426" cy="398" r="11" fill="${PINK}" ${st(2)}/><text x="426" y="402" text-anchor="middle" font-family="monospace" font-size="9" fill="#fff">1</text>
      <circle cx="494" cy="376" r="11" fill="${AMBER}" ${st(2)}/><text x="494" y="380" text-anchor="middle" font-family="monospace" font-size="9" fill="#fff">2</text>
      <circle cx="528" cy="438" r="11" fill="${BLUE}" ${st(2)}/><text x="528" y="442" text-anchor="middle" font-family="monospace" font-size="9" fill="#fff">3</text>

      <g class="float">${spore(64, 120, PINK, .85)}</g>
      <g class="float2">${spore(590, 250, LAV, .7)}</g>
      <g class="float3">${spore(88, 350, SKY, .6)}</g>
      <g class="float">${worm(600, 360, SKY, .55)}</g>
      <g class="float2">${oocyst(560, 190, LAV, .8)}</g>

      <circle cx="500" cy="120" r="78" fill="${PAPER}" ${st(5)}/>
      <g clip-path="url(#lensClip)">
        <circle cx="500" cy="120" r="72" fill="#F5EFE2"/>
        <g fill="${INK}" opacity=".15">${Array.from({ length: 14 }, (_, i) => `<circle cx="${456 + (i * 23) % 88}" cy="${88 + (i * 19) % 64}" r="1.3"/>`).join('')}</g>
        ${spore(476, 102, PINK, 1)}
        ${worm(518, 142, SKY, .72)}
        ${oocyst(510, 94, LAV, .9)}
      </g>
      <path d="M556 176l42 42" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <path d="M556 176l42 42" stroke="${PAPER2}" stroke-width="4" stroke-linecap="round" opacity=".55"/>
      <text x="500" y="214" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="2" fill="${INK}">AGEN · TIDAK TERLIHAT</text>

      ${labelTag(142, 232, 'BULU', PINK, 'start', -4)}
      <path d="M180 238q14-6 24 12" fill="none" ${st(1.4, PINK)} stroke-dasharray="3 4"/>
      ${labelTag(566, 424, 'TANAH', MOSS, 'end', 3)}
      <path d="M548 430q-10-10-18-6" fill="none" ${st(1.4, MOSS)} stroke-dasharray="3 4"/>
      ${labelTag(360, 500, 'TANGAN', BLUE, 'start', 0)}
      <path d="M390 496q12-8 20-20" fill="none" ${st(1.4, BLUE)} stroke-dasharray="3 4"/>
    `);
  },

  oneHealth() {
    const node = (id, x, y, c, soft, art, label) => `
      <g class="oh-node" role="button" tabindex="0" aria-pressed="${id === 'hewan'}" aria-label="Baca penjelasan ${label}" data-node="${id}" style="--c:${c};--soft:${soft}">
        <circle class="halo" cx="${x}" cy="${y}" r="98"/>
        <circle class="ring" cx="${x}" cy="${y}" r="82"/>
        ${art}
        <text x="${x}" y="${y + 112}" text-anchor="middle">${label}</text>
      </g>`;
    return svg('0 0 600 520', 'Diagram One Health: hewan, manusia, dan lingkungan saling terhubung', `
      <defs><pattern id="ohDots" width="15" height="15" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${INK}" opacity=".13"/></pattern></defs>
      <rect width="600" height="520" rx="18" fill="${PAPER2}"/>
      <rect width="600" height="520" rx="18" fill="url(#ohDots)"/>
      <g fill="none" stroke="${PINK}" stroke-width="2.2" stroke-dasharray="5 8" opacity=".8">
        <path d="M150 150Q300 52 450 150"/>
        <path d="M150 150Q108 340 300 390"/>
        <path d="M450 150Q492 340 300 390"/>
      </g>
      <g>
        <circle r="4" fill="${PINK}"><animateMotion dur="7s" repeatCount="indefinite" path="M150 150Q300 52 450 150"/></circle>
        <circle r="4" fill="${BLUE}"><animateMotion dur="8s" repeatCount="indefinite" path="M450 150Q492 340 300 390"/></circle>
        <circle r="4" fill="${LAV}"><animateMotion dur="9s" repeatCount="indefinite" path="M300 390Q108 340 150 150"/></circle>
      </g>
      <text x="300" y="252" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="2.5" fill="${INK}" opacity=".55">SATU</text>
      <text x="300" y="272" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="2.5" fill="${INK}" opacity=".55">KESEHATAN</text>
      ${node('hewan', 150, 150, PINK, '#FCE7F3', cat(150, 165, .95, { patch: PINK, px: -15, py: 24 }), 'Hewan')}
      ${node('manusia', 450, 150, BLUE, '#DCE7FF', person(450, 160, 1.05, { shirt: BLUE }), 'Manusia')}
      ${node('lingkungan', 300, 390, LAV, '#EDE9FE', `${soil(300, 398, .75)}${litter(348, 414, .55, LAV)}`, 'Lingkungan')}
      <g class="float">${spore(58, 70, PINK, .6)}</g>
      <g class="float2">${oocyst(548, 84, LAV, .7)}</g>
      <g class="float3">${worm(72, 452, SKY, .5)}</g>
    `);
  },

  houseMap() {
    const hotspot = r => `
      <g class="hotspot" role="button" tabindex="0" aria-pressed="${r.id === 'litter'}" aria-label="${r.name}: ${r.risk.join(', ')}" data-room="${r.id}" style="--c:${r.color};--soft:${r.soft}">
        <circle class="hit" cx="${r.x}" cy="${r.y}" r="34"/>
        <circle class="pulse" cx="${r.x}" cy="${r.y}" r="18"/>
        <circle class="ring" cx="${r.x}" cy="${r.y}" r="16"/>
        <text class="num" x="${r.x}" y="${r.y + 1}">${r.num}</text>
      </g>`;
    return svg('0 0 640 460', 'Denah rumah dengan lima titik risiko: litter box, dapur, halaman, kamar, dan ruang bermain', `
      <defs><pattern id="mapDots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${INK}" opacity=".12"/></pattern></defs>
      <rect x="20" y="20" width="600" height="420" rx="8" fill="${PAPER}" ${st(6)}/>
      <rect x="26" y="26" width="588" height="408" fill="url(#mapDots)"/>
      <rect x="26" y="26" width="274" height="214" fill="#FCE7F3" opacity=".55"/>
      <rect x="300" y="26" width="314" height="214" fill="#E0F2FE" opacity=".55"/>
      <rect x="26" y="240" width="174" height="194" fill="#FCE7F3" opacity=".4"/>
      <rect x="200" y="240" width="220" height="194" fill="#EDE9FE" opacity=".5"/>
      <rect x="420" y="240" width="194" height="194" fill="#D1FAE5" opacity=".6"/>
      <path d="M300 26v408M26 240h588M200 240v194M420 240v194" ${st(4)}/>

      ${sofa(120, 150, .9, BLUE)}
      <rect x="54" y="190" width="96" height="30" rx="4" fill="${PAPER}" ${st(2)}/>
      ${cat(250, 172, .7, { patch: PINK, px: -14, py: 22 })}
      ${plant(74, 86, .65)}
      <rect x="204" y="58" width="54" height="34" rx="3" fill="${PAPER}" ${st(2)}/>
      <path d="M231 58v34M204 75h54" ${st(1.4)}/>

      ${counter(392, 78, 1)}
      <rect x="502" y="52" width="54" height="72" rx="5" fill="${PAPER}" ${st(2)}/>
      <path d="M516 52v72M542 52v72" ${st(1.4)}/>
      ${dog(486, 188, .7, { ear: '#38BDF8' })}
      ${bowl(392, 186, .7, SKY)}

      ${bed(104, 332, 1, PINK)}
      <rect x="152" y="300" width="34" height="30" rx="3" fill="${PAPER}" ${st(2)}/>
      ${litter(310, 352, 1.1, LAV)}
      <path d="M236 390h128" ${st(2)} stroke-dasharray="4 6"/>
      <path d="M236 390q64-26 128 0" fill="none" ${st(1.6, LAV)} stroke-dasharray="3 6"/>

      ${soil(520, 372, 1)}
      <circle cx="472" cy="314" r="12" fill="${PAPER}" ${st(2)}/>
      <path d="M464 314h16M472 306v16" ${st(1.4)}/>
      <path d="M430 410h150" ${st(2)} stroke-dasharray="5 7"/>
      ${plant(578, 310, .55)}

      <path d="M286 240v34" ${st(2)} stroke-dasharray="4 5"/>
      <path d="M286 274q0 10 10 10" fill="none" ${st(2)}/>
      <path d="M400 240v30" ${st(2)} stroke-dasharray="4 5"/>

      <text x="58" y="46" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".5">RUANG</text>
      <text x="322" y="46" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".5">DAPUR</text>
      <text x="58" y="262" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".5">KAMAR</text>
      <text x="222" y="262" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".5">LITTER</text>
      <text x="442" y="262" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".5">HALAMAN</text>

      <g transform="translate(590 54)">
        <path d="M0 16V-8M0-8l-5 7M0-8l5 7" fill="none" ${st(1.6)}/>
        <text x="0" y="26" text-anchor="middle" font-family="monospace" font-size="7" fill="${INK}" opacity=".55">N</text>
      </g>

      ${ROOMS.map(hotspot).join('')}
    `);
  },

  agent(slug) {
    const d = E(slug);
    const specimen = {
      dermatofitosis: `
        <path d="M150 84q34-16 52 12t-4 54q-12 28-46 30t-44-22 4-50 38-24Z" fill="${PINK}" opacity=".22" ${st(2.6, d.deep)}/>
        <path d="M126 112q18-14 38-2t10 34-30 18-26-18 8-32Z" fill="none" ${st(2.2, d.deep)} stroke-dasharray="5 6"/>
        <g stroke="${d.deep}" stroke-width="2.2" stroke-linecap="round">
          <path d="M150 128q-20-18-34-14M150 128q22-20 36-10M150 128q-18 22-30 30M150 128q24 18 34 30M150 128q-4-26 2-40M150 128q10 24 8 38"/>
        </g>
        <circle cx="150" cy="128" r="7" fill="${d.deep}"/>
        <circle cx="112" cy="146" r="3.4" fill="${d.deep}"/><circle cx="190" cy="154" r="3" fill="${d.deep}"/><circle cx="184" cy="94" r="2.6" fill="${d.deep}"/>
        <circle cx="118" cy="98" r="2.4" fill="${d.deep}"/><circle cx="206" cy="120" r="2.2" fill="${d.deep}"/>
      `,
      toksokariasis: `
        <path d="M150 78q42-18 54 18t-18 60q-26 24-54 2t-16-52 34-28Z" fill="${SKY}" opacity=".16" ${st(2.4, d.deep)}/>
        <path d="M128 104q30-24 44 2t-16 40q-24 12-32-10t4-32 26-12 20 18" fill="none" stroke="${d.deep}" stroke-width="8" stroke-linecap="round"/>
        <path d="M128 104q30-24 44 2t-16 40q-24 12-32-10t4-32 26-12 20 18" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".45" stroke-dasharray="3 7"/>
        <circle cx="127" cy="103" r="4.6" fill="${d.deep}" ${st(1.6)}/>
        <circle cx="106" cy="154" r="2.6" fill="${AMBER}" opacity=".7"/><circle cx="190" cy="90" r="2.2" fill="${AMBER}" opacity=".7"/>
        <circle cx="198" cy="156" r="2.6" fill="${AMBER}" opacity=".7"/>
      `,
      toksoplasmosis: `
        <circle cx="150" cy="128" r="52" fill="${LAV}" opacity=".16" ${st(2.6, d.deep)}/>
        <path d="M128 108q26-14 34 8t-16 34-30-8 12-34Z" fill="${d.deep}" opacity=".8" ${st(2, d.deep)}/>
        <path d="M156 104q18 6 14 24" fill="none" ${st(4, d.deep)}/>
        <path d="M136 122q8 10 20 4" fill="none" ${st(3, PAPER)}/>
        <circle cx="172" cy="148" r="3" fill="${d.deep}"/><circle cx="118" cy="154" r="2.6" fill="${d.deep}"/>
        <circle cx="184" cy="96" r="2.2" fill="${d.deep}"/><circle cx="112" cy="92" r="2.2" fill="${d.deep}"/>
      `
    }[slug];
    return svg('0 0 300 300', `Ilustrasi skematis ${d.sci}`, `
      <circle cx="150" cy="150" r="124" fill="${d.soft}" ${st(2.4)}/>
      <circle cx="150" cy="150" r="105" fill="none" ${st(1.4, d.deep)} stroke-dasharray="3 7" opacity=".55"/>
      <g stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".55">
        <path d="M150 20v10M150 270v10M20 150h10M270 150h10M58 58l7 7M242 242l7 7M242 58l-7 7M58 242l-7-7"/>
      </g>
      ${specimen}
      <text x="150" y="286" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="2" fill="${INK}" opacity=".55">SPESIMEN · TIDAK BERSKALA</text>
    `);
  },

  cardArt(slug) {
    const d = E(slug);
    if (slug === 'dermatofitosis') return svg('0 0 360 220', 'Kucing dengan lesi kulit dan spora di sekitarnya', `
      <rect width="360" height="220" fill="none"/>
      ${cat(140, 126, 1.05, { patch: PINK, px: -15, py: 24 })}
      <g class="float">${spore(238, 66, PINK, .8)}</g>
      <g class="float2">${spore(276, 136, PINK, .6)}</g>
      <g class="float3">${spore(70, 62, PINK, .5)}</g>
      <path d="M238 174q30-20 56 0" fill="none" ${st(2, d.deep)} stroke-dasharray="4 7"/>
      <path d="M238 174h56" ${st(2, d.deep)}/>
      <text x="266" y="198" text-anchor="middle" font-family="monospace" font-size="7" letter-spacing="1.4" fill="${INK}" opacity=".55">KONTAK · BULU</text>
      <circle cx="256" cy="174" r="3" fill="${PINK}"/>
    `);
    if (slug === 'toksokariasis') return svg('0 0 360 220', 'Anjing di dekat tanah dengan telur cacing', `
      ${dog(136, 126, 1.05, { ear: '#38BDF8' })}
      ${soil(254, 174, .9)}
      <g class="float">${worm(260, 90, SKY, .7)}</g>
      <g class="float2">${spore(80, 68, SKY, .4)}</g>
      <path d="M216 148q22-8 38 6" fill="none" ${st(2, d.deep)} stroke-dasharray="4 7"/>
      <text x="268" y="206" text-anchor="middle" font-family="monospace" font-size="7" letter-spacing="1.4" fill="${INK}" opacity=".55">TANAH · TELUR</text>
    `);
    return svg('0 0 360 220', 'Kucing di dekat litter box dan makanan', `
      ${cat(128, 120, 1.02, {})}
      ${litter(256, 162, 1, LAV)}
      <g class="float">${oocyst(246, 74, LAV, .8)}</g>
      <g class="float2">${oocyst(86, 66, LAV, .45)}</g>
      <path d="M204 148q20-6 34 4" fill="none" ${st(2, d.deep)} stroke-dasharray="4 7"/>
      <text x="262" y="204" text-anchor="middle" font-family="monospace" font-size="7" letter-spacing="1.4" fill="${INK}" opacity=".55">FESES · MAKANAN</text>
    `);
  },

  stage(i) {
    if (i === 0) return svg('0 0 520 360', 'Kucing di litter box mengeluarkan agen yang mencemari bulu, benda, dan tanah', `
      ${sceneBg(520, 360, '#FCE7F3')}
      ${cat(150, 206, 1.25, { patch: PINK, px: -15, py: 24 })}
      ${litter(292, 268, 1.15, LAV)}
      ${sofa(410, 190, .78, BLUE)}
      ${soil(430, 286, .8)}
      <g class="float">${spore(224, 120, PINK, .9)}</g>
      <g class="float2">${spore(258, 160, LAV, .7)}</g>
      <g class="float3">${worm(336, 150, SKY, .55)}</g>
      <g class="float">${oocyst(388, 116, LAV, .7)}</g>
      <path d="M192 236q40 10 74 30" fill="none" stroke="${PINK}" stroke-width="2.4" stroke-dasharray="5 8" stroke-linecap="round"/>
      <path d="M300 240q50-24 82-26" fill="none" stroke="${AMBER}" stroke-width="2.4" stroke-dasharray="5 8" stroke-linecap="round"/>
      <text x="42" y="326" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".55">BULU · FESES · BENDA</text>
      <path d="M28 306h100" ${st(1.4)} stroke-dasharray="3 5"/>
    `);
    if (i === 1) return svg('0 0 520 360', 'Tangan anak yang tercemar menyentuh mulut, makanan, dan tanah', `
      ${sceneBg(520, 360, '#DCE7FF')}
      ${child(168, 204, 1.35, { shirt: PINK })}
      ${bowl(340, 284, .9, SKY)}
      ${soil(420, 290, .8)}
      <path d="M214 188q42-30 68-12" fill="none" stroke="${PINK}" stroke-width="2.6" stroke-dasharray="5 8" stroke-linecap="round"/>
      <path d="M232 200q22 20 18 46" fill="none" stroke="${BLUE}" stroke-width="2.6" stroke-dasharray="5 8" stroke-linecap="round"/>
      <circle cx="282" cy="176" r="13" fill="#F2C9A0" ${st(2.4)}/>
      <g class="float">${spore(300, 144, PINK, .7)}</g>
      <g class="float2">${oocyst(344, 196, LAV, .55)}</g>
      <g class="float3">${worm(406, 222, SKY, .45)}</g>
      <path d="M282 190q-6 20-18 32" fill="none" ${st(2.4, PINK)}/>
      <text x="42" y="326" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".55">TANGAN · MULUT · MAKANAN</text>
      <path d="M28 306h126" ${st(1.4)} stroke-dasharray="3 5"/>
    `);
    return svg('0 0 520 360', 'Perisai perlindungan dan keluarga dengan risiko berbeda', `
      ${sceneBg(520, 360, '#D1FAE5')}
      <path d="M300 96l72 24v62c0 48-30 74-72 90-42-16-72-42-72-90v-62z" fill="${PAPER}" ${st(3)}/>
      <path d="M268 188l22 22 42-50" fill="none" stroke="${MOSS}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="float">${spore(182, 106, PINK, .6)}</g>
      <g class="float2">${oocyst(424, 130, LAV, .6)}</g>
      <g class="float3">${worm(400, 262, SKY, .5)}</g>
      ${child(88, 268, .9, { shirt: PINK })}
      ${person(430, 278, .9, { shirt: BLUE, pregnant: true })}
      ${person(168, 292, .72, { shirt: LAV, scarf: AMBER })}
      <path d="M300 266v54" ${st(2.4)} stroke-dasharray="4 6"/>
      <text x="42" y="326" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".55">PAPARAN ≠ INFEKSI</text>
      <path d="M28 306h118" ${st(1.4)} stroke-dasharray="3 5"/>
    `);
  },

  animalSigns(slug) {
    const isCat = slug !== 'toksokariasis';
    const body = isCat
      ? cat(178, 142, 1.55, slug === 'dermatofitosis' ? { patch: PINK, px: -18, py: 28, pr: 14 } : {})
      : dog(178, 142, 1.55, { ear: '#38BDF8', belly: slug === 'toksokariasis' ? '#BAE6FD' : null });
    const callouts = {
      dermatofitosis: [['bulu rontok', 124, 168, 60, 74, PINK], ['kulit bersisik', 238, 178, 310, 96, PINK]],
      toksokariasis: [['perut', 178, 202, 84, 264, SKY], ['feses', 270, 250, 330, 278, SKY]],
      toksoplasmosis: [['sering tanpa tanda', 236, 132, 300, 66, LAV]]
    }[slug] || [];
    return svg('0 0 380 300', `Tanda pada hewan untuk ${E(slug).name}`, `
      <circle cx="190" cy="150" r="128" fill="${E(slug).soft}" opacity=".65"/>
      ${body}
      <path d="M28 268h324" ${st(2)} stroke-dasharray="4 7"/>
      ${callouts.map(([t, x, y, lx, ly, c]) => `
        <path d="M${x} ${y}Q${(x + lx) / 2} ${ly - 20} ${lx} ${ly}" fill="none" ${st(1.6, c)} stroke-dasharray="3 5"/>
        <circle cx="${x}" cy="${y}" r="5" fill="${c}" ${st(1.6)}/>
        <text x="${lx}" y="${ly - 6}" text-anchor="${lx > 190 ? 'start' : 'end'}" font-family="monospace" font-size="8" letter-spacing="1" fill="${INK}">${t}</text>
      `).join('')}
    `);
  },

  humanSigns(slug) {
    const callouts = {
      dermatofitosis: [['ruam melingkar', 196, 160, 292, 100, PINK]],
      toksokariasis: [['mata', 172, 92, 78, 58, SKY], ['perut', 190, 186, 302, 206, SKY]],
      toksoplasmosis: [['mirip flu', 172, 94, 70, 64, LAV], ['konsultasi bila hamil', 196, 186, 300, 232, LAV]]
    }[slug] || [];
    return svg('0 0 380 300', `Tanda pada manusia untuk ${E(slug).name}`, `
      <circle cx="190" cy="150" r="128" fill="${E(slug).soft}" opacity=".65"/>
      ${person(190, 160, 1.45, { shirt: E(slug).color, patch: slug === 'dermatofitosis' ? PINK : null, px: -22, py: 24 })}
      <path d="M28 268h324" ${st(2)} stroke-dasharray="4 7"/>
      ${callouts.map(([t, x, y, lx, ly, c]) => `
        <path d="M${x} ${y}Q${(x + lx) / 2} ${ly - 20} ${lx} ${ly}" fill="none" ${st(1.6, c)} stroke-dasharray="3 5"/>
        <circle cx="${x}" cy="${y}" r="5" fill="${c}" ${st(1.6)}/>
        <text x="${lx}" y="${ly - 6}" text-anchor="${lx > 190 ? 'start' : 'end'}" font-family="monospace" font-size="8" letter-spacing="1" fill="${INK}">${t}</text>
      `).join('')}
    `);
  },

  riskArt() {
    return svg('0 0 520 260', 'Tiga kelompok yang perlu perhatian: anak, ibu hamil, dan orang dengan daya tahan tubuh rendah', `
      <circle cx="260" cy="130" r="120" fill="${PAPER2}" ${st(1.6)} stroke-dasharray="4 7"/>
      ${child(120, 150, 1.1, { shirt: PINK })}
      ${person(260, 150, 1.1, { shirt: BLUE, pregnant: true })}
      ${person(400, 150, 1.1, { shirt: LAV, scarf: AMBER })}
      <text x="120" y="228" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="1.2" fill="${INK}">ANAK</text>
      <text x="260" y="228" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="1.2" fill="${INK}">IBU HAMIL</text>
      <text x="400" y="228" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="1.2" fill="${INK}">IMUNOKOMPROMAIS</text>
      <g class="float">${spore(52, 50, PINK, .5)}</g>
      <g class="float2">${oocyst(468, 48, LAV, .55)}</g>
    `);
  },

  screenArt() {
    return svg('0 0 460 300', 'Keluarga di rumah dengan pertanyaan skrining', `
      <circle cx="230" cy="150" r="138" fill="#DCE7FF" opacity=".55"/>
      <path d="M74 216 230 116l156 100v92H74z" fill="${PAPER}" ${st(2.8)}/>
      <path d="M60 222 230 110l170 112" fill="none" ${st(4)}/>
      ${cat(134, 248, .82, { patch: PINK, px: -14, py: 22 })}
      ${dog(326, 250, .82, { ear: '#38BDF8' })}
      ${child(230, 236, .95, { shirt: PINK })}
      <g class="float">
        <rect x="282" y="46" width="120" height="34" rx="17" fill="${PAPER}" ${st(2)}/>
        <text x="342" y="67" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="1" fill="${INK}">ADA BALITA?</text>
      </g>
      <g class="float2">
        <rect x="46" y="76" width="104" height="34" rx="17" fill="${PAPER}" ${st(2)}/>
        <text x="98" y="97" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="1" fill="${INK}">IBU HAMIL?</text>
      </g>
      <path d="M28 276h404" ${st(2)} stroke-dasharray="4 7"/>
    `);
  },

  reminderArt() {
    return svg('0 0 460 300', 'Jam, sapu, dan litter box sebagai simbol rutinitas kebersihan', `
      <circle cx="230" cy="150" r="136" fill="#D1FAE5" opacity=".55"/>
      <circle cx="230" cy="144" r="78" fill="${PAPER}" ${st(3)}/>
      <circle cx="230" cy="144" r="62" fill="none" ${st(1.4)} stroke-dasharray="3 7"/>
      <path d="M230 144V98M230 144l32 20" ${st(4)}/>
      <circle cx="230" cy="144" r="6" fill="${PINK}" ${st(1.8)}/>
      <g stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".55">
        <path d="M230 76v8M230 204v8M162 144h8M290 144h8"/>
      </g>
      <path d="M126 206l58 24" ${st(5, AMBER)}/>
      <path d="M184 230l-16 34M184 230l16 34M174 226l20 8" ${st(3, AMBER)}/>
      ${litter(330, 232, .9, LAV)}
      <g class="float">${spore(120, 82, PINK, .55)}</g>
      <g class="float2">${oocyst(348, 96, LAV, .55)}</g>
      <text x="230" y="282" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".55">24 JAM · SATU KEBIASAAN</text>
    `);
  },

  aboutArt() {
    return svg('0 0 460 340', 'Meja kerja editorial dengan buku catatan, kaca pembesar, dan spesimen', `
      <circle cx="230" cy="170" r="150" fill="#FEF3C7" opacity=".6"/>
      <rect x="60" y="88" width="340" height="190" rx="8" fill="${PAPER}" ${st(3)}/>
      <path d="M60 122h340" ${st(2)}/>
      <rect x="90" y="146" width="128" height="108" rx="4" fill="${PAPER2}" ${st(2)}/>
      <path d="M104 164h100M104 180h100M104 196h76M104 212h88M104 228h60" ${st(1.6)} stroke-dasharray="3 5"/>
      <circle cx="304" cy="180" r="44" fill="${PAPER2}" ${st(4)}/>
      <circle cx="304" cy="180" r="30" fill="${PINK}" opacity=".18" ${st(2)}/>
      <path d="M336 212l34 34" ${st(8)}/>
      <g class="float">${spore(272, 166, PINK, .65)}</g>
      <g class="float2">${oocyst(326, 166, LAV, .65)}</g>
      <g class="float3">${worm(300, 194, SKY, .45)}</g>
      <path d="M92 302h276" ${st(2.4)}/>
      <text x="230" y="324" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".55">CATATAN LAPANGAN · EDISI RUMAH</text>
    `);
  },

  qArt(kind) {
    const map = {
      child: `${child(120, 100, 1.1, { shirt: PINK })}${soil(210, 150, .7)}${spore(76, 50, PINK, .5)}`,
      pregnant: `${person(120, 100, 1.1, { shirt: BLUE, pregnant: true })}${cat(210, 142, .7, {})}${spore(70, 48, LAV, .5)}`,
      outside: `${cat(112, 108, .9, {})}${tree(206, 124, .7)}${spore(70, 46, PINK, .45)}`,
      meat: `${bowl(110, 132, 1, SKY)}<path d="M84 118q26-22 52 0" fill="${PINK}" opacity=".55" ${st(2)}/>${oocyst(196, 88, LAV, .6)}`,
      soil: `${soil(130, 132, 1)}${litter(222, 146, .7, LAV)}${worm(76, 60, SKY, .45)}`,
      skin: `${cat(126, 108, .95, { patch: PINK, px: -14, py: 24 })}${spore(216, 72, PINK, .55)}`,
      immune: `${person(116, 104, 1, { shirt: LAV, scarf: AMBER })}<path d="M190 82l26 10v22c0 18-12 28-26 34-14-6-26-16-26-34V92z" fill="${PAPER}" ${st(2)}/><path d="M180 112l8 8 16-20" fill="none" ${st(4, MOSS)}/>`
    };
    return svg('0 0 280 180', '', `<rect width="280" height="180" rx="12" fill="${PAPER2}"/>${map[kind] || map.child}`, 'q-art');
  },

  icon(name) {
    const paths = {
      hand: '<path d="M8 12V6a2 2 0 1 1 4 0v6M12 12V4a2 2 0 1 1 4 0v8M16 12V7a2 2 0 1 1 4 0v7c0 5-3 8-8 8h-1a8 8 0 0 1-7-4L2 14a2 2 0 0 1 3-2l3 3"/>',
      scoop: '<path d="M4 20h16M8 20V9a4 4 0 0 1 8 0v11M6 9h12M16 4l4-2"/>',
      bed: '<path d="M3 18V8h18v10M3 14h18M6 8V5h5v3M13 8V5h5v3M3 18v2M21 18v2"/>',
      cook: '<path d="M4 12h16v3a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6zM7 8c0-2 2-2 2-4M12 8c0-2 2-2 2-4M17 8c0-2 2-2 2-4M4 12h16"/>',
      gloves: '<path d="M7 21v-5l-2-3V8a2 2 0 0 1 4 0v3M11 21V6a2 2 0 0 1 4 0v8M15 21v-6a2 2 0 0 1 4 0v4a4 4 0 0 1-4 4H7"/>',
      vacuum: '<path d="M4 21h9M8 21l3-9M11 12l-2-6a3 3 0 0 1 3-4h2l4 10M17 12h4v4h-4z"/>',
      vet: '<path d="M12 21s-7-4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 10-7 10z"/><path d="M9 11h2l1-2 1 4 1-2h2"/>',
      spray: '<path d="M9 21V8h7v13zM9 8V5h5v3M16 6h4M16 10h4M16 14h4M4 10l3 2M4 16l3-2"/>',
      shield: '<path d="M12 3l8 3v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/><path d="M8 12l3 3 5-6"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
      share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/>',
      arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
      back: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      check: '<path d="M4 12l5 5L20 6"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
      alert: '<path d="M12 3l9 17H3z"/><path d="M12 9v5M12 17h.01"/>',
      home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M9 20v-6h6v6"/>',
      book: '<path d="M4 5a3 3 0 0 1 3-3h13v18H7a3 3 0 0 0-3 3z"/><path d="M4 5v18M8 7h8M8 11h8"/>',
      bell: '<path d="M6 17h12l-2-3V9a4 4 0 0 0-8 0v5zM10 20h4"/>',
      compass: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-4 2 2-5z"/>',
      close: '<path d="M6 6l12 12M18 6L6 18"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      download: '<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>',
      trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>'
    };
    return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`;
  }
};
/* ============================================================
   SHARED UI HELPERS
   ============================================================ */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
const checks = () => S.get('checks', {});
function ck(id, text) {
  return `<label class="check"><input type="checkbox" data-ck="${esc(id)}" ${checks()[id] ? 'checked' : ''}><span>${esc(text)}</span></label>`;
}
function updateRing(ring, root) {
  if (!ring) return;
  const inputs = $$('[data-ck]', root || document);
  if (!inputs.length) return;
  const n = inputs.filter(i => i.checked).length;
  const val = $('.val', ring); if (val) val.style.strokeDashoffset = 201 - (n / inputs.length) * 201;
  const b = $('b', ring); if (b) b.textContent = `${n}/${inputs.length}`;
  const copy = $('#act-copy');
  if (copy) copy.textContent = n === 0 ? 'Belum ada yang ditandai.' : n === inputs.length ? 'Semua selesai. Ulangi besok.' : `${inputs.length - n} kebiasaan lagi untuk hari ini.`;
}
function bindChecks(root = document, ring = null) {
  $$('[data-ck]', root).forEach(inp => {
    if (inp.dataset.bound) return; inp.dataset.bound = '1';
    inp.addEventListener('change', () => {
      const c = checks();
      if (inp.checked) c[inp.dataset.ck] = true; else delete c[inp.dataset.ck];
      S.set('checks', c);
      updateRing(ring, root);
      if (inp.checked) toast('Tersimpan di perangkat ini.');
    });
  });
  updateRing(ring, root);
}
function bindRemButtons(root = document) {
  $$('[data-rem]', root).forEach(b => {
    if (b.dataset.bound) return; b.dataset.bound = '1';
    b.addEventListener('click', () => addReminder(b.dataset.rem));
  });
}
function localDay(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addReminder(title, extra = {}) {
  const R = S.get('reminders', null) || defaultReminders();
  if (R.some(r => r.title.toLowerCase() === String(title).toLowerCase())) { toast('Tugas ini sudah ada di pengingat.'); return; }
  R.push({ id: uid('r'), title: String(title), intervalHours: 24, lastDone: null, enabled: true, custom: true, group: extra.group || null, ...extra });
  S.set('reminders', R);
  toast('Ditambahkan ke pengingat.');
}
async function shareEntry(slug) {
  const d = E(slug); if (!d) return;
  const url = location.href.split('#')[0] + '#entri-' + slug;
  const text = `${d.name} (${d.sci}) — ZoonoCheck`;
  try {
    if (navigator.share) { await navigator.share({ title: text, text: d.tagline, url }); return; }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('Tautan disalin.');
  } catch (e) {
    try { await navigator.clipboard.writeText(url); toast('Tautan disalin.'); } catch (e2) { toast('Tidak bisa menyalin tautan di browser ini.'); }
  }
}

/* ============================================================
   KUNANG — mascot controller + ambient particles
   ============================================================ */
const KUNANG_LINES = {
  hero: [
    'Halo! Aku Kunang. Aku bantu membaca jalurnya, bukan menebak penyakitnya.',
    'Aku tidak mendiagnosis. Aku cuma menunjukkan titik yang sering terlewat.',
    'Mulai dari skrining dua menit, kalau mau. Jawabanmu tetap di perangkat ini.'
  ],
  oh: [
    'Tiga dunia, satu rumah. Kesehatan mereka saling terhubung.',
    'Manusia, hewan, lingkungan — satu jalur yang sama.'
  ],
  screen: [
    'Tidak ada jawaban benar atau salah di sini. Lewati juga boleh.',
    'Jawabanmu tidak dikirim ke mana-mana. Santai saja.'
  ],
  result: [
    'Ini peta materi, bukan vonis. Mulai dari satu langkah kecil.',
    'Bila ada tanda bahaya, tanyakan ke profesional. Aku hanya pemandu.'
  ],
  rem: [
    'Satu tugas kecil hari ini sudah cukup.',
    'Aku jaga waktunya, kamu jaga kebiasaannya.'
  ],
  about: [
    'Dibuat untuk dibaca pelan-pelan.',
    'Tanpa akun, tanpa pelacakan. Data tetap di perangkatmu.'
  ],
  ensi: [
    'Ketik / untuk langsung mencari.',
    'Coba cari “tanah”, “jamur”, atau “litter”.'
  ],
  entry: [
    'Baca ringkasan 30 detiknya dulu.',
    'Tanda bukan diagnosis. Hanya dokter hewan yang bisa memastikan.'
  ],
  footer: [
    'Terima kasih sudah mampir. Cuci tangan, ya.',
    'Rumah yang sehat dimulai dari kebiasaan kecil.'
  ]
};

const MASCOT = (() => {
  const pick = a => a[(Math.random() * a.length) | 0] || '';
  function spark(host) {
    if (motionOff) return;
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('i');
      s.className = 'k-spark';
      s.style.left = `${30 + Math.random() * 40}%`;
      s.style.top = `${38 + Math.random() * 24}%`;
      s.style.setProperty('--dx', `${(Math.random() - .5) * 86}px`);
      s.style.setProperty('--dy', `${-30 - Math.random() * 58}px`);
      host.appendChild(s);
      setTimeout(() => s.remove(), 740);
    }
  }
  function mount(host, opts = {}) {
    if (!host) return null;
    if (host._kunang) return host._kunang;
    host.classList.add('mascot-host');
    const pettable = opts.pettable !== false;
    if (pettable) {
      host.classList.add('pettable');
      host.tabIndex = 0;
      host.setAttribute('role', 'button');
    }
    host.setAttribute('aria-label', opts.label || 'Kunang, kunang-kunang pemandu. Ketuk untuk menyapa.');
    const sayEl = typeof opts.say === 'string' ? $(opts.say) : opts.say;
    const lookRoot = typeof opts.lookRoot === 'string' ? $(opts.lookRoot) : opts.lookRoot;
    const lines = opts.lines || [];
    const baseMood = opts.mood || 'happy';
    let mood = baseMood;
    let idleTimer = 0, sayTimer = 0, lineIdx = 0, raf = 0;

    const ctl = { host, el: null, get mood() { return mood; } };
    ctl.render = () => {
      host.querySelector('svg.kunang')?.remove();
      host.insertAdjacentHTML('afterbegin', ART.kunang({ mood, arms: opts.arms !== false, lens: !!opts.lens }));
      ctl.el = host.querySelector('svg.kunang');
      if (!ctl.el) return;
      ctl.el.setAttribute('aria-hidden', 'true');
      ctl.el.removeAttribute('role');
      ctl.el.removeAttribute('aria-label');
      ctl.el.classList.toggle('kunang-float', opts.float !== false);
    };
    ctl.setMood = m => {
      if (!m || m === mood) return;
      mood = m;
      ctl.render();
    };
    ctl.speak = (text, ms = 0) => {
      if (!sayEl || !text) return;
      sayEl.textContent = text;
      sayEl.classList.remove('pop'); void sayEl.offsetWidth; sayEl.classList.add('pop');
      clearTimeout(sayTimer);
      if (ms) sayTimer = setTimeout(() => {
        if (!host.isConnected || !lines.length) return;
        lineIdx = (lineIdx + 1) % lines.length;
        ctl.speak(lines[lineIdx], ms);
      }, ms);
    };
    const resetIdle = () => {
      clearTimeout(idleTimer);
      if (motionOff) return;
      idleTimer = setTimeout(() => {
        if (!host.isConnected) return;
        host.classList.add('is-yawn');
        ctl.setMood('sleepy');
        setTimeout(() => {
          host.classList.remove('is-yawn');
          ctl.setMood(baseMood);
          resetIdle();
        }, 2400);
      }, 26000);
    };
    const react = () => {
      host.classList.add('is-giggle');
      spark(host);
      clearTimeout(host._giggleT);
      host._giggleT = setTimeout(() => host.classList.remove('is-giggle'), 640);
      if (lines.length) ctl.speak(pick(lines), opts.rotate || 0);
      resetIdle();
    };
    const look = e => {
      if (!ctl.el) return;
      const root = lookRoot || host;
      const r = root.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
      const dy = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
      $$('.k-pupil', ctl.el).forEach(p => {
        p.style.transform = `translate(${(dx * 4.2).toFixed(1)}px,${(dy * 3.6).toFixed(1)}px)`;
      });
      resetIdle();
    };
    const clearLook = () => $$('.k-pupil', ctl.el || host).forEach(p => { p.style.transform = ''; });
    const move = e => {
      const x = e.clientX, y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; look({ clientX: x, clientY: y }); });
    };

    ctl.render();
    if (pettable) {
      host.addEventListener('click', react);
      host.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); react(); }
      });
    }
    (lookRoot || host).addEventListener('pointermove', move, { passive: true });
    (lookRoot || host).addEventListener('pointerleave', clearLook);
    resetIdle();
    if (sayEl && lines.length) ctl.speak(sayEl.textContent.trim() || lines[0], opts.rotate || 0);
    host._kunang = ctl;
    return ctl;
  }
  return { mount, spark };
})();

function mountPageMascots(root = document) {
  $$('[data-kunang]', root).forEach(host => {
    if (host.dataset.kunangMounted) return;
    const key = host.dataset.kunang;
    const sayEl = document.querySelector(`[data-say="${key}"]`);
    const lines = KUNANG_LINES[key] || [];
    const ctl = MASCOT.mount(host, {
      mood: host.dataset.mood || 'happy',
      lens: host.dataset.lens === '1',
      arms: host.dataset.arms !== '0',
      float: host.dataset.float !== '0',
      say: sayEl,
      lookRoot: host.dataset.look || host.closest('.hero-stage'),
      lines,
      rotate: key === 'hero' ? 12000 : 0
    });
    if (!ctl) return;
    host.dataset.kunangMounted = '1';
    if (sayEl && !sayEl.textContent.trim() && lines.length) ctl.speak(lines[0], 0);
  });
}

const FX = (() => {
  const COLORS = ['#FFD27A', '#EE5B6C', '#7FD6CF', '#FFF8EF', '#FFD27A'];
  const all = new Set();
  function ambient(canvas, opts = {}) {
    if (!canvas) return null;
    if (canvas._fx) return canvas._fx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const count = opts.count || 24;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, running = false, visible = true;
    let parts = [];
    const seed = () => {
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * (w || 300),
        y: Math.random() * (h || 300),
        r: 1.3 + Math.random() * 2.5,
        vx: (Math.random() - .5) * .16,
        vy: -.12 - Math.random() * .28,
        a: .22 + Math.random() * .5,
        ph: Math.random() * Math.PI * 2,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      }));
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const frame = t => {
      if (motionOff) { running = false; ctx.clearRect(0, 0, w, h); return; }
      if (!visible) { running = false; return; }
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.life != null) {
          p.life -= .017;
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          p.x += p.vx; p.y += p.vy; p.vy += .052; p.vx *= .992;
        } else {
          p.x += p.vx + Math.sin(time * .8 + p.ph) * .1;
          p.y += p.vy;
          if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
          if (p.x < -12) p.x = w + 12; else if (p.x > w + 12) p.x = -12;
        }
        const live = p.life != null ? Math.max(0, p.life) : 1;
        const alpha = (p.life != null ? live : p.a) * (.62 + Math.sin(time * 2 + p.ph) * .38);
        const r = p.r * (p.life != null ? 1 + (1 - p.life) : 1);
        ctx.globalAlpha = Math.max(0, alpha * .32);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || motionOff) return;
      resize();
      if (!parts.length) seed();
      visible = true;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const ctl = {
      start, stop,
      burst(x, y, n = 16) {
        if (motionOff) return;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, s = 1.2 + Math.random() * 3.2;
          parts.push({
            x, y, r: 1.4 + Math.random() * 2.2, c: COLORS[(Math.random() * COLORS.length) | 0],
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 1, ph: 0
          });
        }
        if (!running) start();
      }
    };
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (running) resize(); }).observe(canvas);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => {
        es.forEach(e => { visible = e.isIntersecting; if (visible) start(); else stop(); });
      }, { threshold: 0 }).observe(canvas);
    }
    if (!motionOff) start();
    all.add(ctl);
    canvas._fx = ctl;
    return ctl;
  }
  document.addEventListener('motionchange', () => {
    all.forEach(fx => motionOff ? fx.stop() : fx.start());
  });
  return { ambient };
})();


function diseaseCard(d, i = 0) {
  return `<a class="dcard reveal" style="${vars(d)};--d:${i * 90}ms" href="#entri-${d.slug}">
    <div class="dcard-art"><span class="dcard-num">0${i + 1}</span>${ART.cardArt(d.slug)}</div>
    <div class="dcard-body">
      <div class="kicker-row"><span class="tag soft">${d.type}</span><span class="tag">${d.animals.join(' · ')}</span></div>
      <h3>${d.name}</h3>
      <span class="sci">${d.sci}</span>
      <p>${d.summary[0]}</p>
      <div class="dcard-foot"><span>Baca entri</span><span class="arrow" aria-hidden="true">→</span></div>
    </div>
  </a>`;
}

function roomPanel(room) {
  const idx = ROOMS.findIndex(r => r.id === room.id);
  const icon = { litter: 'scoop', dapur: 'cook', halaman: 'vet', kamar: 'bed', ruang: 'hand' }[room.id] || 'home';
  return `<div class="room-top">
      <span class="tag" style="--accent:${room.color}">Titik ${String(room.num).padStart(2, '0')}</span>
      <span class="mono" style="color:${room.color}">${room.id === 'ruang' ? 'kontak' : room.id}</span>
    </div>
    <div style="display:flex;gap:14px;align-items:flex-start">
      <div style="flex:none;width:46px;color:${room.color}">${ART.icon(icon)}</div>
      <h3>${room.name}</h3>
    </div>
    <div class="room-risk">${room.risk.map(r => `<span class="tag soft" style="--accent:${room.color};--soft:${room.soft}">${r}</span>`).join('')}</div>
    <p style="font-size:.92rem;color:var(--ink-2)">${room.text}</p>
    <div class="room-action" style="--c:${room.color}"><b style="font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:3px">Langkah hari ini</b>${room.action}</div>
    <div class="room-nav">
      <button class="btn small ghost" type="button" data-room-prev>← Sebelumnya</button>
      <button class="btn small ghost" type="button" data-room-next>Berikutnya →</button>
    </div>
    <div class="room-dots" style="--c:${room.color}">${ROOMS.map((r, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join('')}</div>`;
}

function home() {
  const mq = `<span>Jamur</span><span>Cacing</span><span>Protozoa</span><span>Tanah</span><span>Bulu</span><span>Tangan</span><span>Litter box</span><span>Dapur</span><span>Halaman</span><span>Alas tidur</span>`;
  return `<nav class="rail" aria-label="Bab beranda">
      ${[1, 2, 3, 4, 5, 6].map(i => `<a href="#bab${i}" data-b="bab${i}" aria-label="Bab ${i}" title="Bab ${i}"></a>`).join('')}
    </nav>

    <section class="hero" id="bab1" aria-labelledby="hero-title">
      <div class="wrap hero-in">
        <div class="hero-grid">
          <div>
            <p class="eyebrow reveal">Ensiklopedi zoonosis · edisi rumah</p>
            <h1 id="hero-title" class="reveal" style="--d:70ms">Yang tak <span class="it">terlihat,</span><br>tinggal <span class="blue">bersama</span> kita.</h1>
            <p class="lede reveal" style="--d:160ms">Zoonosis berpindah lewat bulu, tanah, litter box, dan tangan. ZoonoCheck memetakan jalurnya — tanpa menakut-nakuti, tanpa mendiagnosis.</p>
            <div class="btn-row reveal" style="--d:240ms">
              <a class="btn pink" href="#skrining">Mulai skrining 2 menit ${ART.icon('arrow')}</a>
              <a class="btn ghost" href="#ensiklopedi">Buka indeks penyakit</a>
            </div>
            <div class="hero-meta reveal" style="--d:320ms">
              <div><b>03</b><span>agen prioritas</span></div>
              <div><b>07</b><span>pertanyaan skrining</span></div>
              <div><b>00</b><span>data dikirim</span></div>
              <div><b>100%</b><span>tersimpan lokal</span></div>
            </div>
          </div>
          <div class="hero-art reveal-scale" style="--d:120ms">
            <div class="hero-stage" id="hero-stage">
              <canvas class="hero-fx" data-fx="hero" aria-hidden="true"></canvas>
              ${ART.hero()}
              <div class="say say-float hero-say" data-say="hero">Halo! Aku Kunang. Aku bantu membaca jalurnya, bukan menebak penyakitnya.</div>
              <div class="hero-kunang" data-kunang="hero" data-mood="happy" data-look="#hero-stage"></div>
            </div>
            <div class="hero-sticker a"><span class="dot"></span>tiga dunia, satu jalur</div>
            <div class="hero-sticker b">${ART.icon('search')} agen tak terlihat</div>
          </div>
        </div>
        <div class="hero-scroll"><i aria-hidden="true"></i><span>Gulir untuk membuka cerita</span></div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">${mq}${mq}</div></div>

    <section class="chapter" id="bab2" aria-labelledby="h2">
      <div class="wrap">
        <div class="chapter-head">
          <div class="left">
            <div class="chapter-num"><b>02</b> Bab dua / enam</div>
            <h2 class="chapter-title" id="h2">Satu rumah, <em>tiga dunia.</em></h2>
            <p class="lede">Kesehatan hewan, manusia, dan lingkungan bukan tiga urusan terpisah. Ketiganya bertemu di titik yang sama: rumah.</p>
          </div>
          <div class="chapter-side"><b>Yang perlu diingat</b>Agen tidak butuh rumah baru. Ia hanya butuh jalur. Pilih salah satu lingkaran atau gulir untuk membaca.</div>
        </div>
        <div class="oh-grid">
          <div class="oh-sticky">
            <div class="oh-art-frame">${ART.oneHealth()}</div>
            <div class="oh-legend">
              ${ONE.map(o => `<span class="tag soft" style="--accent:${o.color};--soft:${o.soft}">${o.label}</span>`).join('')}
              <span class="tag">One Health</span>
            </div>
            <div class="oh-mascot">
              <div data-kunang="oh" data-mood="happy"></div>
              <div class="say tiny-say" data-say="oh">Tiga dunia, satu rumah. Kesehatan mereka saling terhubung.</div>
            </div>
          </div>
          <div class="oh-copy" id="oh-copy">
            ${ONE.map((o, i) => `<div class="oh-step ${i === 0 ? 'active' : ''}" data-oh="${o.id}" style="--c:${o.color}">
              <div class="step-k"><i></i> ${o.label}</div>
              <h3>${o.label}</h3>
              <p>${o.text}</p>
              <p class="oh-quote">“${o.quote}”</p>
            </div>`).join('')}
          </div>
        </div>
        <div class="chapter-foot">
          <p class="tiny muted" style="margin:0">Sumber kerangka: One Health High-Level Expert Panel, 2022.</p>
          <a class="link-arrow" href="#entri-toksoplasmosis">Lihat contoh jalurnya ${ART.icon('arrow')}</a>
        </div>
      </div>
    </section>

    <section class="chapter alt" id="bab3" aria-labelledby="h3">
      <div class="wrap">
        <div class="chapter-head">
          <div class="left">
            <div class="chapter-num"><b>03</b> Bab tiga / enam</div>
            <h2 class="chapter-title" id="h3">Setiap sudut rumah punya <em>perannya.</em></h2>
            <p class="lede">Bukan untuk menakuti. Peta ini hanya menunjukkan titik-titik yang paling mudah terlewat saat membersihkan rumah.</p>
          </div>
          <div class="chapter-side"><b>Cara pakai</b>Ketuk angka pada denah. Setiap titik punya risiko dan satu langkah kecil yang bisa dilakukan hari ini.</div>
        </div>
        <div class="map-grid">
          <div class="map-frame">${ART.houseMap()}</div>
          <div class="room-panel" id="room-panel" aria-live="polite">${roomPanel(ROOMS[0])}</div>
        </div>
        <div class="chapter-foot">
          <p class="tiny muted" style="margin:0">Peta ini bukan penilaian kebersihan rumahmu. Ini pengingat jalur, bukan diagnosis.</p>
          <a class="link-arrow" href="#pengingat">Ubah jadi rutinitas ${ART.icon('arrow')}</a>
        </div>
      </div>
    </section>

    <section class="chapter" id="bab4" aria-labelledby="h4">
      <div class="wrap">
        <div class="chapter-head">
          <div class="left">
            <div class="chapter-num"><b>04</b> Bab empat / enam</div>
            <h2 class="chapter-title" id="h4">Tiga agen, <em>tiga jalur.</em></h2>
            <p class="lede">Mulai dari yang paling relevan dengan rumahmu. Semua entri ditulis dalam bahasa sehari-hari, dengan nama ilmiah tetap utuh.</p>
          </div>
          <div class="chapter-side"><b>Filter</b>Pilih hewan, kelompok risiko, atau jalur penularan. Hasil berubah tanpa memuat ulang halaman.</div>
        </div>
        <div class="explorer-top">
          <div class="filters" id="home-filters">
            <span class="filter-label">Hewan</span>
            <button class="chip" type="button" data-f="animals" data-v="kucing" aria-pressed="false">Kucing</button>
            <button class="chip" type="button" data-f="animals" data-v="anjing" aria-pressed="false">Anjing</button>
            <span class="filter-label" style="margin-left:8px">Risiko</span>
            <button class="chip" type="button" data-f="risk" data-v="anak" aria-pressed="false">Anak</button>
            <button class="chip" type="button" data-f="risk" data-v="ibu hamil" aria-pressed="false">Ibu hamil</button>
            <button class="chip" type="button" data-f="risk" data-v="imunokompromais" aria-pressed="false">Imunokompromais</button>
            <span class="filter-label" style="margin-left:8px">Jalur</span>
            <button class="chip" type="button" data-f="routes" data-v="kontak" aria-pressed="false">Kontak &amp; benda</button>
            <button class="chip" type="button" data-f="routes" data-v="tanah" aria-pressed="false">Tanah &amp; feses</button>
            <button class="chip" type="button" data-f="routes" data-v="makanan" aria-pressed="false">Makanan &amp; air</button>
          </div>
          <span class="result-count" id="home-count" aria-live="polite"></span>
        </div>
        <div class="disease-grid" id="home-cards"></div>
        <div class="chapter-foot">
          <button class="btn small ghost" type="button" id="home-reset">Reset filter</button>
          <a class="link-arrow" href="#ensiklopedi">Buka ensiklopedi lengkap ${ART.icon('arrow')}</a>
        </div>
      </div>
    </section>

    <section class="chapter alt" id="bab5" aria-labelledby="h5">
      <div class="wrap">
        <div class="chapter-head">
          <div class="left">
            <div class="chapter-num"><b>05</b> Bab lima / enam</div>
            <h2 class="chapter-title" id="h5">Dari paparan ke risiko, <em>bukan lompatan.</em></h2>
            <p class="lede">Tiga tahap yang sering dianggap satu. Memisahkannya membuat kita lebih tenang dan lebih tepat dalam mencegah.</p>
          </div>
          <div class="chapter-side"><b>Gulir atau pilih tahap</b>Ilustrasi dan uraian berubah mengikuti tahap yang aktif. Konten tetap terbaca tanpa animasi.</div>
        </div>
        <div class="timeline-grid">
          <div class="tl-art">
            <div class="tl-tabs" role="tablist" aria-label="Tahap penularan">
              ${STAGES.map((s, i) => `<button class="tl-tab" type="button" role="tab" aria-selected="${i === 0}" data-tab="${i}">${s.label}</button>`).join('')}
            </div>
            <div class="tl-stage">
              <span class="scene-label" id="tl-label">Tahap 01 · Paparan</span>
              <div class="scene" id="tl-scene">${ART.stage(0)}</div>
            </div>
            <div class="panel flat" style="margin-top:14px;background:var(--paper-2)">
              <p class="tiny" style="margin:0;color:var(--ink-2)"><b style="font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);display:block;margin-bottom:3px">Catatan</b><span id="tl-note">${STAGES[0].note}</span></p>
            </div>
          </div>
          <div class="tl-steps" id="tl-steps">
            ${STAGES.map((s, i) => `<div class="tl-step ${i === 0 ? 'active' : ''}" data-stage="${i}">
              <div class="step-k"><i>0${i + 1}</i> ${s.label}</div>
              <h3>${s.title}</h3>
              <p>${s.text}</p>
              <p class="tl-note">${s.note}</p>
            </div>`).join('')}
          </div>
        </div>
        <div class="chapter-foot">
          <p class="tiny muted" style="margin:0">Paparan ≠ infeksi. Keberadaan agen tidak otomatis berarti seseorang sakit.</p>
          <a class="link-arrow" href="#skrining">Petakan risiko rumahmu ${ART.icon('arrow')}</a>
        </div>
      </div>
    </section>

    <section class="chapter" id="bab6" aria-labelledby="h6">
      <div class="wrap">
        <div class="chapter-head">
          <div class="left">
            <div class="chapter-num"><b>06</b> Bab enam / enam</div>
            <h2 class="chapter-title" id="h6">Tidak perlu mengubah <em>semuanya</em> hari ini.</h2>
            <p class="lede">Satu kebiasaan yang konsisten lebih berguna daripada sepuluh rencana yang tidak pernah dimulai.</p>
          </div>
          <div class="chapter-side"><b>Progres lokal</b>Centang yang sudah kamu lakukan. Status tersimpan di browser ini, bukan di server.</div>
        </div>
        <div class="action-grid">
          <div class="action-copy">
            <p class="big-quote">“Kebersihan yang baik bukan berarti steril. Ia berarti <em>memutus jalur</em> yang paling mungkin.”</p>
            <p class="lede">Mulai dari lima hal kecil. Tidak semuanya harus selesai hari ini; yang penting jalurnya terputus.</p>
            <div class="habit-strip">
              ${HABITS.map(h => `<div class="habit" style="--accent:${h.c}">${ART.icon(h.icon)}<b>${h.t}</b>${h.d}</div>`).join('')}
            </div>
            <div class="btn-row mt-3"><a class="btn primary" href="#pengingat">Atur pengingat ${ART.icon('bell')}</a><a class="btn ghost" href="#skrining">Ulangi skrining</a></div>
          </div>
          <div class="action-card reveal-scale">
            <div class="action-top">
              <div class="ring-wrap" id="act-ring">
                <svg viewBox="0 0 74 74" aria-hidden="true"><circle class="track" cx="37" cy="37" r="32"/><circle class="val" cx="37" cy="37" r="32"/></svg>
                <b>0/5</b>
              </div>
              <div class="at-copy"><b>Ritual hari ini</b><span id="act-copy">Belum ada yang ditandai.</span></div>
            </div>
            <div id="act-list">${GEN.map(g => ck(g.id, g.text)).join('')}</div>
            <p class="tiny muted" style="margin:14px 0 0">Tersimpan otomatis di perangkat ini. <a href="#tentang">Cara kerja data</a>.</p>
          </div>
        </div>
      </div>
    </section>`;
}

function initHome() {
  /* reveal + rail */
  initReveals();
  const heroFx = $('[data-fx="hero"]');
  if (heroFx) FX.ambient(heroFx, { count: 28 });
  const rail = $('.rail');
  if (rail && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) $$('.rail a').forEach(a => a.classList.toggle('on', a.dataset.b === e.target.id));
    }), { rootMargin: '-42% 0px -52% 0px' });
    $$('.ch, .chapter, .hero').forEach(s => io.observe(s));
  }

  /* one health */
  const ohSteps = $$('.oh-step');
  const ohNodes = $$('.oh-node');
  const setOH = id => {
    ohSteps.forEach(s => s.classList.toggle('active', s.dataset.oh === id));
    ohNodes.forEach(n => n.setAttribute('aria-pressed', String(n.dataset.node === id)));
  };
  ohNodes.forEach(n => {
    n.addEventListener('click', () => setOH(n.dataset.node));
    n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOH(n.dataset.node); } });
  });
  if ('IntersectionObserver' in window && ohSteps.length) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setOH(e.target.dataset.oh); }), { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    ohSteps.forEach(s => io.observe(s));
  }

  /* house map */
  let roomIdx = 0;
  const panel = $('#room-panel');
  const setRoom = i => {
    roomIdx = (i + ROOMS.length) % ROOMS.length;
    panel.innerHTML = roomPanel(ROOMS[roomIdx]);
    $$('.hotspot').forEach(h => h.setAttribute('aria-pressed', String(h.dataset.room === ROOMS[roomIdx].id)));
    bindRoomNav();
  };
  const bindRoomNav = () => {
    const prev = $('[data-room-prev]', panel), next = $('[data-room-next]', panel);
    if (prev) prev.onclick = () => setRoom(roomIdx - 1);
    if (next) next.onclick = () => setRoom(roomIdx + 1);
  };
  $$('.hotspot').forEach(h => {
    h.addEventListener('click', () => setRoom(ROOMS.findIndex(r => r.id === h.dataset.room)));
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRoom(ROOMS.findIndex(r => r.id === h.dataset.room)); } });
  });
  bindRoomNav();

  /* home explorer */
  const f = { animals: new Set(), risk: new Set(), routes: new Set() };
  const draw = () => {
    const r = DATA.filter(d => ['animals', 'risk', 'routes'].every(k => !f[k].size || [...f[k]].some(v => d[k].includes(v))));
    $('#home-cards').innerHTML = r.length ? r.map((d, i) => diseaseCard(d, i)).join('') : `<div class="empty" style="grid-column:1/-1"><h3>Tidak ada entri yang cocok.</h3><p class="muted">Coba hapus satu filter atau reset.</p><button class="btn small" type="button" id="home-empty-reset">Reset filter</button></div>`;
    $('#home-count').textContent = `${r.length} dari ${DATA.length} entri`;
    const er = $('#home-empty-reset'); if (er) er.onclick = reset;
    initReveals($('#home-cards'));
  };
  const reset = () => {
    Object.values(f).forEach(s => s.clear());
    $$('#home-filters .chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    draw();
  };
  $$('#home-filters .chip').forEach(c => {
    c.onclick = () => {
      const s = f[c.dataset.f];
      s.has(c.dataset.v) ? s.delete(c.dataset.v) : s.add(c.dataset.v);
      c.setAttribute('aria-pressed', String(s.has(c.dataset.v)));
      draw();
    };
  });
  const resetBtn = $('#home-reset'); if (resetBtn) resetBtn.onclick = reset;
  draw();

  /* timeline */
  let stage = 0;
  const setStage = (i, scroll = false) => {
    stage = clamp(i, 0, STAGES.length - 1);
    const s = STAGES[stage];
    $('#tl-scene').innerHTML = ART.stage(stage);
    $('#tl-label').textContent = `Tahap 0${stage + 1} · ${s.label}`;
    $('#tl-note').textContent = s.note;
    $$('.tl-tab').forEach((t, j) => t.setAttribute('aria-selected', String(j === stage)));
    $$('.tl-step').forEach((t, j) => t.classList.toggle('active', j === stage));
    if (scroll) { const el = $$('.tl-step')[stage]; if (el) el.scrollIntoView({ behavior: motionOff ? 'auto' : 'smooth', block: 'center' }); }
  };
  $$('.tl-tab').forEach(t => t.onclick = () => setStage(+t.dataset.tab, true));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setStage(+e.target.dataset.stage); }), { rootMargin: '-32% 0px -50% 0px' });
    $$('.tl-step').forEach(s => io.observe(s));
  }
  setStage(0);

  /* checklist */
  bindChecks($('#act-list'), $('#act-ring'));
  bindRemButtons($('#main'));
}

/* ============================================================
   ENCYCLOPEDIA
   ============================================================ */
function ensi() {
  return `<header class="page-head" style="--soft:var(--blue-soft)">
    <div class="wrap">
      <div class="crumbs"><a href="#home">Beranda</a><span>/</span><span>Ensiklopedi</span></div>
      <p class="eyebrow">Indeks penyakit</p>
      <h1 class="page-title">Tiga agen, <em>tiga jalur.</em></h1>
      <p class="lede page-sub">Cari berdasarkan nama penyakit, nama ilmiah, atau kata kunci. Filter bisa digabung, dan hasilnya diperbarui tanpa memuat ulang halaman.</p>
      <div class="head-kunang">
        <div class="say tiny-say" data-say="ensi">Ketik / untuk langsung mencari.</div>
        <div data-kunang="ensi" data-mood="happy"></div>
      </div>
    </div>
  </header>
  <div class="wrap page-body">
    <div class="ens-layout">
      <aside class="filter-panel" aria-label="Filter ensiklopedi">
        <div class="search-wrap">
          ${ART.icon('search')}
          <label class="sr-only" for="ens-q">Cari penyakit</label>
          <input class="search-input" type="search" id="ens-q" placeholder="Cari: Toxocara, jamur, tanah…" autocomplete="off">
          <span class="search-kbd">/</span>
        </div>
        <div class="filter-group">
          <h3>Hewan</h3>
          <div class="chips">
            <button class="chip" type="button" data-k="animals" data-v="kucing" aria-pressed="false">Kucing</button>
            <button class="chip" type="button" data-k="animals" data-v="anjing" aria-pressed="false">Anjing</button>
          </div>
        </div>
        <div class="filter-group">
          <h3>Kelompok risiko</h3>
          <div class="chips">
            <button class="chip" type="button" data-k="risk" data-v="anak" aria-pressed="false">Anak</button>
            <button class="chip" type="button" data-k="risk" data-v="ibu hamil" aria-pressed="false">Ibu hamil</button>
            <button class="chip" type="button" data-k="risk" data-v="imunokompromais" aria-pressed="false">Imunokompromais</button>
          </div>
        </div>
        <div class="filter-group">
          <h3>Jalur penularan</h3>
          <div class="chips">
            <button class="chip" type="button" data-k="routes" data-v="kontak" aria-pressed="false">Kontak &amp; benda</button>
            <button class="chip" type="button" data-k="routes" data-v="tanah" aria-pressed="false">Tanah &amp; feses</button>
            <button class="chip" type="button" data-k="routes" data-v="makanan" aria-pressed="false">Makanan &amp; air</button>
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn small" type="button" id="ens-reset">Reset filter</button>
          <a class="btn small ghost" href="#skrining">Skrining</a>
        </div>
        <p class="tiny muted" style="margin:16px 0 0">Semua entri masih draft edukasi dan menunggu penelaahan dokter hewan.</p>
      </aside>
      <div>
        <div class="ens-results-head">
          <h2 id="ens-heading">Semua entri</h2>
          <span class="result-count" id="ens-count" aria-live="polite"></span>
        </div>
        <div class="active-filters" id="ens-active"></div>
        <div class="ens-list" id="ens-list"></div>
      </div>
    </div>
  </div>`;
}

function initEnsi() {
  initReveals();
  const sel = { animals: new Set(), risk: new Set(), routes: new Set() };
  const q = $('#ens-q');
  const list = $('#ens-list');
  const draw = () => {
    const term = (q.value || '').toLowerCase().trim();
    const r = DATA.filter(d => {
      const text = [d.name, d.alt, d.sci, d.type, ...d.summary, ...d.animals, ...d.risk, ...d.routes].join(' ').toLowerCase();
      return (!term || text.includes(term)) && Object.entries(sel).every(([k, s]) => !s.size || [...s].some(v => d[k].includes(v)));
    });
    $('#ens-count').textContent = `${r.length} dari ${DATA.length} entri`;
    $('#ens-heading').textContent = term || Object.values(sel).some(s => s.size) ? 'Hasil pencarian' : 'Semua entri';
    const active = [];
    Object.entries(sel).forEach(([k, s]) => s.forEach(v => active.push(`<button class="chip" type="button" data-remove="${k}|${v}" aria-pressed="true">${v} <span class="x">×</span></button>`)));
    $('#ens-active').innerHTML = active.join('');
    list.innerHTML = r.length ? r.map(d => `<a class="ens-item reveal" style="${vars(d)}" href="#entri-${d.slug}">
      <div class="ens-item-art">${ART.cardArt(d.slug)}</div>
      <div class="ens-item-body">
        <div class="kicker-row"><span class="tag soft">${d.type}</span><span class="tag">${d.animals.join(' · ')}</span></div>
        <h3>${d.name}</h3>
        <span class="sci">${d.sci}</span>
        <p>${d.summary[0]}</p>
        <div class="meta"><span class="go">Baca entri →</span></div>
      </div>
    </a>`).join('') : `<div class="empty"><h3>Tidak ada entri yang cocok.</h3><p class="muted">Coba kata kunci lain, hapus satu filter, atau reset semuanya.</p><button class="btn small" type="button" id="ens-empty-reset">Reset filter</button></div>`;
    const er = $('#ens-empty-reset'); if (er) er.onclick = reset;
    $$('[data-remove]', $('#ens-active')).forEach(b => b.onclick = () => {
      const [k, v] = b.dataset.remove.split('|'); sel[k].delete(v);
      $$(`#ens-active .chip[data-remove="${k}|${v}"]`).forEach(x => x.remove());
      $$(`.filter-panel .chip[data-k="${k}"][data-v="${v}"]`).forEach(c => c.setAttribute('aria-pressed', 'false'));
      draw();
    });
    initReveals(list);
  };
  const reset = () => {
    q.value = ''; Object.values(sel).forEach(s => s.clear());
    $$('.filter-panel .chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    draw();
  };
  $$('.filter-panel .chip').forEach(c => c.onclick = () => {
    const s = sel[c.dataset.k]; const v = c.dataset.v;
    s.has(v) ? s.delete(v) : s.add(v);
    c.setAttribute('aria-pressed', String(s.has(v)));
    draw();
  });
  $('#ens-reset').onclick = reset;
  q.addEventListener('input', draw);
  draw();
}
/* ============================================================
   ENTRY DETAIL
   ============================================================ */
function detail(slug) {
  const d = E(slug); if (!d) return '';
  const routeName = { kontak: 'Kontak & benda', tanah: 'Tanah & feses', makanan: 'Makanan & air' };
  const riskName = { anak: 'Anak', 'ibu hamil': 'Ibu hamil', imunokompromais: 'Imunokompromais' };
  const secs = [
    ['ringkasan', 'Ringkasan 30 detik', 'Identitas & hal yang paling penting'],
    ['penularan', 'Bagaimana menular?', 'Tiga tahap, satu jalur'],
    ['hewan', 'Tanda pada hewan', 'Apa yang bisa terlihat — dan yang tidak'],
    ['manusia', 'Tanda pada manusia', 'Gejala tidak sama dengan diagnosis'],
    ['risiko', 'Siapa paling berisiko?', 'Kelompok yang perlu perhatian'],
    ['pencegahan', 'Pencegahan 3 level', 'Hewan, manusia, lingkungan'],
    ['mitos', 'Mitos vs fakta', 'Klaim yang perlu diluruskan'],
    ['bantuan', 'Kapan mencari bantuan?', 'Tanda bahaya dan langkah berikutnya'],
    ['sumber', 'Sumber ilmiah', 'Bahan bacaan dan tautan otoritatif'],
    ['status', 'Status penelaahan', 'Sejauh mana konten ini diperiksa']
  ];
  const prevIcon = { Hewan: 'vet', Manusia: 'hand', Lingkungan: 'home' };
  const prev = Object.entries(d.prevention).map(([level, items]) => `<div class="prev-level">
    <div class="prev-level-head">${ART.icon(prevIcon[level] || 'shield')}<h3>${level}</h3></div>
    ${items.map((it, i) => `<div class="prev-item">
      <label class="check"><input type="checkbox" data-ck="${esc(`${d.slug}-${level}-${i}`)}" ${checks()[`${d.slug}-${level}-${i}`] ? 'checked' : ''}><span>${esc(it.text)}</span></label>
      ${it.rem ? `<button class="rem-btn" type="button" data-rem="${esc(it.text)}">Ingatkan</button>` : ''}
    </div>`).join('')}
  </div>`).join('');
  const refs = d.refs.map(r => `<li class="ref-item">
    <b>${r.title}</b>
    <div class="ref-meta">${r.authors} · ${r.year} · ${r.source}</div>
    <a href="${r.url}" target="_blank" rel="noopener">${r.url}</a>
  </li>`).join('');
  const myths = d.myths.map(m => `<details class="myth">
    <summary><span class="m-label">Mitos</span><span>${esc(m.m)}</span><span class="plus" aria-hidden="true">+</span></summary>
    <div class="fact"><b>Fakta</b>${esc(m.f)}</div>
  </details>`).join('');
  const other = DATA.filter(x => x.slug !== d.slug);

  return `<header class="entry-hero" style="${vars(d)}">
    <div class="wrap">
      <div class="crumbs"><a href="#home">Beranda</a><span>/</span><a href="#ensiklopedi">Ensiklopedi</a><span>/</span><span>${d.name}</span></div>
      <div class="entry-hero-grid" style="margin-top:18px">
        <div>
          <div class="entry-kicker"><span class="tag soft">${d.type}</span><span class="tag">${d.animals.join(' · ')}</span><span class="stamp">draft</span></div>
          <h1 class="entry-title">${d.name}</h1>
          <p class="entry-sci">${d.sci}</p>
          <p class="lede" style="margin-top:10px">${d.tagline}</p>
          <div class="entry-facts">
            <div><b>Agen</b><span>${d.type}</span></div>
            <div><b>Inang</b><span>${d.animals.join(', ')}</span></div>
            <div><b>Jalur</b><span>${d.routes.map(r => routeName[r]).join(', ')}</span></div>
            <div><b>Risiko</b><span>${d.risk.map(r => riskName[r]).join(', ')}</span></div>
          </div>
          <div class="btn-row">
            <button class="btn small" type="button" data-share="${d.slug}">${ART.icon('share')} Bagikan</button>
            <a class="btn small ghost" href="#skrining">Cek risiko rumah</a>
          </div>
        </div>
        <div class="entry-art-wrap">
          <span class="specimen-tag">Spesimen · ${d.type}</span>
          ${ART.agent(d.slug)}
          <div class="entry-kunang" data-kunang="entry" data-mood="wow" data-lens="1"></div>
        </div>
      </div>
    </div>
  </header>

  <div class="wrap">
    <div class="entry-layout">
      <article class="entry-main" style="${vars(d)}">
        <section id="ringkasan" aria-labelledby="t-ringkasan">
          <div class="sec-head"><span class="sec-num">01</span><div><h2 id="t-ringkasan">Ringkasan 30 detik</h2><div class="sec-sub">Identitas & hal yang paling penting</div></div></div>
          <div class="summary-box">
            <h3>Yang perlu kamu tahu</h3>
            <ul>${d.summary.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
          <div class="specimen-meta">
            <div><b>Nama ilmiah</b><span><i>${d.sci}</i></span></div>
            <div><b>Jenis agen</b><span>${d.type}</span></div>
            <div><b>Hewan terkait</b><span>${d.animals.join(', ')}</span></div>
            <div><b>Jalur utama</b><span>${d.routes.map(r => routeName[r]).join(', ')}</span></div>
          </div>
        </section>

        <section id="penularan" aria-labelledby="t-penularan">
          <div class="sec-head"><span class="sec-num">02</span><div><h2 id="t-penularan">Bagaimana menular?</h2><div class="sec-sub">Tiga tahap, satu jalur</div></div></div>
          <div class="trans-flow">${d.transmission.map((t, i) => `<div class="trans-step"><b>Tahap 0${i + 1}</b>${t.t}<br><span style="color:var(--ink-2);font-size:.76rem">${t.d}</span></div>`).join('')}</div>
          <p class="tiny muted">Alur ini adalah gambaran umum, bukan satu-satunya jalur. Konteks rumah dan perilaku hewan tetap menentukan.</p>
        </section>

        <section id="hewan" aria-labelledby="t-hewan">
          <div class="sec-head"><span class="sec-num">03</span><div><h2 id="t-hewan">Tanda pada hewan</h2><div class="sec-sub">Apa yang bisa terlihat — dan yang tidak</div></div></div>
          <div class="signs-grid">
            <div class="sign-card"><h3>Ilustrasi tanda</h3>${ART.animalSigns(d.slug)}</div>
            <div class="sign-card"><h3>Yang mungkin terlihat</h3><ul>${d.animalSigns.map(s => `<li>${s}</li>`).join('')}</ul><p class="tiny muted" style="margin:10px 0 0">Tanda ini tidak spesifik. Hanya dokter hewan yang dapat menegakkan diagnosis.</p></div>
          </div>
        </section>

        <section id="manusia" aria-labelledby="t-manusia">
          <div class="sec-head"><span class="sec-num">04</span><div><h2 id="t-manusia">Tanda pada manusia</h2><div class="sec-sub">Gejala tidak sama dengan diagnosis</div></div></div>
          <div class="signs-grid">
            <div class="sign-card"><h3>Ilustrasi tanda</h3>${ART.humanSigns(d.slug)}</div>
            <div class="sign-card"><h3>Yang mungkin terjadi</h3><ul>${d.humanSigns.map(s => `<li>${s}</li>`).join('')}</ul><p class="tiny muted" style="margin:10px 0 0">Jangan menentukan diagnosis sendiri. Hubungi tenaga medis bila khawatir.</p></div>
          </div>
        </section>

        <section id="risiko" aria-labelledby="t-risiko">
          <div class="sec-head"><span class="sec-num">05</span><div><h2 id="t-risiko">Siapa paling berisiko?</h2><div class="sec-sub">Kelompok yang perlu perhatian</div></div></div>
          ${ART.riskArt()}
          <div class="risk-row">${d.risk.map(r => `<div class="risk-chip"><b>${riskName[r]}</b>${r === 'anak' ? 'Lebih sering terpapar tanah dan benda yang masuk ke mulut.' : r === 'ibu hamil' ? 'Infeksi tertentu perlu dicegah dan dikonsultasikan lebih awal.' : 'Daya tahan tubuh rendah membuat pencegahan lebih penting.'}</div>`).join('')}</div>
          <p style="margin-top:14px">${d.riskNote}</p>
        </section>

        <section id="pencegahan" aria-labelledby="t-pencegahan">
          <div class="sec-head"><span class="sec-num">06</span><div><h2 id="t-pencegahan">Pencegahan 3 level</h2><div class="sec-sub">Hewan, manusia, lingkungan</div></div></div>
          <div class="prev-levels">${prev}</div>
          <p class="tiny muted" style="margin-top:12px">Checklist ini bersifat edukatif. Ikuti rencana pemeriksaan dan pengobatan dari dokter hewan. Tombol “Ingatkan” menambahkan tugas ke halaman Pengingat.</p>
        </section>

        <section id="mitos" aria-labelledby="t-mitos">
          <div class="sec-head"><span class="sec-num">07</span><div><h2 id="t-mitos">Mitos vs fakta</h2><div class="sec-sub">Klaim yang perlu diluruskan</div></div></div>
          <div class="myth-list">${myths}</div>
        </section>

        <section id="bantuan" aria-labelledby="t-bantuan">
          <div class="sec-head"><span class="sec-num">08</span><div><h2 id="t-bantuan">Kapan mencari bantuan?</h2><div class="sec-sub">Tanda bahaya dan langkah berikutnya</div></div></div>
          <div class="help-box"><h3>Jangan menunggu sampai memburuk.</h3><p>${d.help}</p><p class="small">ZoonoCheck tidak memberikan diagnosis, obat, atau dosis. Bila ragu, hubungi profesional yang sesuai.</p></div>
        </section>

        <section id="sumber" aria-labelledby="t-sumber">
          <div class="sec-head"><span class="sec-num">09</span><div><h2 id="t-sumber">Sumber ilmiah</h2><div class="sec-sub">Bahan bacaan dan tautan otoritatif</div></div></div>
          <ul class="ref-list">${refs}</ul>
          <p class="tiny muted" style="margin-top:12px">Tautan diperiksa pada 7 November 2026. DOI tidak tersedia untuk semua halaman edukasi. Metadata bibliografi lengkap menyusul proses penelaahan.</p>
        </section>

        <section id="status" aria-labelledby="t-status">
          <div class="sec-head"><span class="sec-num">10</span><div><h2 id="t-status">Status penelaahan</h2><div class="sec-sub">Sejauh mana konten ini diperiksa</div></div></div>
          <div class="draft-note"><b>Status konten</b>${REV}</div>
          <div class="specimen-meta" style="margin-top:14px">
            <div><b>Diperbarui</b><span>${fmtDate(d.updated)}</span></div>
            <div><b>Penelaah</b><span>${d.reviewer}</span></div>
            <div><b>Sumber</b><span>Halaman otoritatif</span></div>
            <div><b>Versi</b><span>Draft 1.0</span></div>
          </div>
          <p class="tiny muted" style="margin-top:12px">Nama penelaah tidak dicantumkan sebelum ada persetujuan. Bila kamu menemukan ketidaktepatan, gunakan kanal kontak yang tersedia di halaman Tentang.</p>
        </section>

        <div class="next-entries">
          ${other.map(x => `<a class="next-card" href="#entri-${x.slug}" style="${vars(x)}"><small>Entri lain · ${x.type}</small><b>${x.name}</b></a>`).join('')}
        </div>
      </article>

      <aside class="entry-toc" style="${vars(d)}" aria-label="Daftar isi entri">
        <h3>Di halaman ini</h3>
        <div class="read-progress"><i id="read-progress"></i></div>
        <nav>
          ${secs.map(([id, t], i) => `<a class="toc-link" href="#entri-${d.slug}" data-toc="${id}"><span>${String(i + 1).padStart(2, '0')}</span>${t}</a>`).join('')}
        </nav>
        <div class="entry-share"><button class="btn small" type="button" data-share="${d.slug}">${ART.icon('share')} Bagikan entri</button></div>
        <p class="tiny muted" style="margin-top:12px">Konten draft. Bukan rekomendasi klinis.</p>
      </aside>
    </div>
  </div>`;
}

function initDetail(slug) {
  initReveals();
  bindChecks($('#main'));
  bindRemButtons($('#main'));
  $$('[data-share]').forEach(b => b.onclick = () => shareEntry(b.dataset.share));
  const links = $$('.toc-link');
  const sections = links.map(a => document.getElementById(a.dataset.toc)).filter(Boolean);
  links.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const el = document.getElementById(a.dataset.toc);
    if (el) el.scrollIntoView({ behavior: motionOff ? 'auto' : 'smooth', block: 'start' });
  }));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.dataset.toc === e.target.id)); });
    }, { rootMargin: '-18% 0px -68% 0px' });
    sections.forEach(s => io.observe(s));
  }
}

/* ============================================================
   SCREENING
   ============================================================ */
function skrining() {
  return `<header class="page-head" style="--soft:var(--pink-soft)">
    <div class="wrap">
      <div class="crumbs"><a href="#home">Beranda</a><span>/</span><span>Skrining</span></div>
      <p class="eyebrow">Skrining risiko keluarga</p>
      <h1 class="page-title">Bukan diagnosis. <em>Hanya peta.</em></h1>
      <p class="lede page-sub">Tujuh pertanyaan singkat untuk menemukan materi yang relevan dengan rumahmu. Jawaban diproses di perangkat ini dan tidak dikirim ke server.</p>
    </div>
  </header>
  <div class="wrap screen-shell" id="screen-root"></div>`;
}

function initSkrining() {
  initReveals();
  const root = $('#screen-root');
  const state = { step: 0, answers: {} };
  const total = QS.length;

  const intro = () => {
    root.innerHTML = `<div class="screen-card">
      <div class="screen-intro">
        <div>
          <p class="eyebrow">7 pertanyaan · sekitar 2 menit</p>
          <h2 style="font-size:clamp(1.8rem,3.6vw,2.8rem);line-height:1.02;margin:8px 0 12px">Mulai dari rumahmu, bukan dari diagnosis.</h2>
          <p class="muted">Skrining ini memetakan jawaban ke materi edukasi yang relevan. Tidak ada skor, probabilitas, atau label sehat/sakit.</p>
          <ul class="muted" style="font-size:.9rem;padding-left:1.1em">
            <li>Jawaban tidak disimpan setelah kamu menutup halaman.</li>
            <li>Tidak ada data yang dikirim ke server.</li>
            <li>Bisa dilewati atau diulang kapan saja.</li>
          </ul>
          <div class="btn-row" style="margin-top:18px"><button class="btn pink" type="button" id="start-screen">Mulai skrining ${ART.icon('arrow')}</button><a class="btn ghost" href="#ensiklopedi">Lihat ensiklopedi</a></div>
        </div>
        <div class="screen-kunang">
          <div data-kunang="screen" data-mood="wow" data-lens="1"></div>
          <div class="say tiny-say" data-say="screen">Tidak ada jawaban benar atau salah di sini. Lewati juga boleh.</div>
        </div>
      </div>
      <div class="screen-note">${ART.icon('info')}<span>Ini bukan alat diagnosis. Bila ada tanda bahaya, hubungi dokter hewan atau fasilitas kesehatan.</span></div>
    </div>`;
    $('#start-screen').onclick = () => { state.step = 0; question(0); };
    mountPageMascots(root);
  };

  const question = (i) => {
    state.step = i;
    const q = QS[i];
    const ans = state.answers[q.id] || '';
    root.innerHTML = `<div class="screen-card">
      <div class="screen-top">
        <div class="screen-progress" aria-hidden="true">${QS.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'on' : ''}"></i>`).join('')}</div>
        <span class="screen-step">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
      </div>
      <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">
        <div style="flex:1;min-width:240px">
          <p class="eyebrow">Pertanyaan ${i + 1}</p>
          <h2 class="question">${q.q}</h2>
          <p class="q-hint">${q.hint}</p>
        </div>
        <div style="flex:0 1 230px;min-width:170px">${ART.qArt(q.art)}</div>
      </div>
      <div class="options" role="radiogroup" aria-label="${esc(q.q)}">
        ${['Ya', 'Tidak', 'Tidak yakin'].map(v => `<label class="option"><input type="radio" name="screen-q" value="${v}" ${ans === v ? 'checked' : ''}><span>${v}</span></label>`).join('')}
      </div>
      <div class="screen-actions">
        <button class="btn small ghost" type="button" id="screen-back" ${i === 0 ? 'disabled' : ''}>${ART.icon('back')} Kembali</button>
        <div class="right">
          <button class="btn small" type="button" id="screen-skip">Lewati</button>
          <button class="btn primary" type="button" id="screen-next" ${ans ? '' : 'disabled'}>${i === total - 1 ? 'Lihat hasil' : 'Lanjut'} ${ART.icon('arrow')}</button>
        </div>
      </div>
      <div class="screen-note">${ART.icon('info')}<span>Jawaban diproses di perangkat ini. Tidak ada yang dikirim ke server.</span></div>
    </div>`;
    const next = $('#screen-next');
    $$('input[name="screen-q"]', root).forEach(r => r.onchange = () => { state.answers[q.id] = r.value; next.disabled = false; });
    $('#screen-back').onclick = () => { if (i > 0) question(i - 1); };
    $('#screen-skip').onclick = () => { if (i === total - 1) result(); else question(i + 1); };
    next.onclick = () => { if (i === total - 1) result(); else question(i + 1); };
    const first = $('input[name="screen-q"]', root); if (first) first.focus({ preventScroll: true });
  };

  const result = () => {
    const map = {};
    QS.forEach(q => {
      const a = state.answers[q.id];
      if (a === 'Ya' || a === 'Tidak yakin') {
        q.related.forEach(s => {
          map[s] = map[s] || [];
          map[s].push((a === 'Tidak yakin' ? 'Kamu belum yakin — kami sertakan agar bisa dicek. ' : '') + q.reason);
        });
      }
    });
    const ids = Object.keys(map).sort((a, b) => (map[b].length - map[a].length) || (DATA.findIndex(d => d.slug === a) - DATA.findIndex(d => d.slug === b)));
    const priority = ids.flatMap(s => Object.entries(E(s).prevention).map(([level, arr]) => arr[0] ? { id: `prio-${s}-${level}`, text: `${E(s).name}: ${arr[0].text}` } : null)).filter(Boolean).slice(0, 6);
    root.innerHTML = `<div class="screen-card">
      <div class="result-head">
        <p class="eyebrow">Hasil skrining</p>
        <div class="result-kunang" data-kunang="result" data-mood="happy"></div>
        <p class="say tiny-say" data-say="result">Ini peta materi, bukan vonis. Mulai dari satu langkah kecil.</p>
        <h2>${ids.length ? 'Materi yang paling relevan' : 'Tidak ada materi khusus dari jawabanmu.'}</h2>
        <p class="muted">${ids.length ? 'Mulai dari entri yang paling dekat dengan situasi rumahmu. Ini bukan diagnosis.' : 'Tetap jelajahi ensiklopedi untuk gambaran umum. Bila ada kekhawatiran, hubungi profesional.'}</p>
      </div>
      ${ids.length ? `<div class="result-grid">${ids.map(s => `<a class="result-card" href="#entri-${s}" style="${vars(E(s))}"><div><h3>${E(s).name}</h3><ul class="why">${[...new Set(map[s])].map(w => `<li>${esc(w)}</li>`).join('')}</ul></div><span class="go">Buka entri →</span></a>`).join('')}</div>` : ''}
      ${priority.length ? `<div class="priority-list"><h3>Checklist prioritas</h3>${priority.map(p => ck(p.id, p.text)).join('')}</div>` : ''}
      <div class="red-flag"><b>Bila ada tanda bahaya:</b> hubungi dokter hewan atau fasilitas kesehatan. Hasil ini bukan diagnosis, bukan skor risiko, dan tidak menggantikan konsultasi.</div>
      <div class="screen-actions">
        <button class="btn small ghost" type="button" id="screen-restart">${ART.icon('back')} Ulangi skrining</button>
        <div class="right"><a class="btn small" href="#ensiklopedi">Buka ensiklopedi</a><a class="btn primary" href="#pengingat">Atur pengingat ${ART.icon('arrow')}</a></div>
      </div>
    </div>`;
    $('#screen-restart').onclick = () => { state.answers = {}; state.step = 0; intro(); };
    bindChecks(root);
    bindRemButtons(root);
    mountPageMascots(root);
    const h = $('h2', root); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  };

  intro();
}

/* ============================================================
   REMINDERS
   ============================================================ */
function defaultReminders() {
  return [
    { id: 'litter', title: 'Bersihkan litter box', intervalHours: 24, lastDone: null, enabled: true, custom: false, group: 'daily' },
    { id: 'feses', title: 'Angkat feses halaman', intervalHours: 24, lastDone: null, enabled: true, custom: false, group: 'daily' }
  ];
}
const RW_TASKS = [
  { id: 'rw-vacuum', title: 'Vakum bulu dan permukaan', intervalHours: 24, group: 'ringworm' },
  { id: 'rw-bed', title: 'Cuci alas tidur hewan', intervalHours: 72, group: 'ringworm' },
  { id: 'rw-disinfect', title: 'Disinfeksi perlengkapan', intervalHours: 24, group: 'ringworm' }
];

function pengingat() {
  return `<header class="page-head" style="--soft:var(--moss-soft)">
    <div class="wrap">
      <div class="crumbs"><a href="#home">Beranda</a><span>/</span><span>Pengingat</span></div>
      <p class="eyebrow">Ritual kebersihan</p>
      <h1 class="page-title">Kebiasaan kecil, <em>dijaga pelan-pelan.</em></h1>
      <div class="rem-hero">
        <p class="lede page-sub">Pengingat ini tersimpan di perangkatmu. Tidak ada akun dan tidak ada notifikasi yang dikirim ke server. Tugas yang jatuh tempo ditandai saat kamu membuka halaman.</p>
        <div class="rem-stage">
          ${ART.reminderArt()}
          <div class="say tiny-say rem-say" data-say="rem">Satu tugas kecil hari ini sudah cukup.</div>
          <div class="rem-kunang" data-kunang="rem" data-mood="sleepy"></div>
        </div>
      </div>
    </div>
  </header>
  <div class="wrap page-body">
    <div class="rem-layout">
      <div class="rem-main">
        <div class="panel" id="today-panel">
          <div class="panel-head"><h2>Hari ini</h2><span class="mono" id="today-date"></span></div>
          <div class="dial-wrap">
            <div class="dial"><svg viewBox="0 0 140 140" aria-hidden="true"><circle class="track" cx="70" cy="70" r="60"/><circle class="val" cx="70" cy="70" r="60"/></svg><b id="dial-num">0</b><span>tugas</span></div>
            <div class="dial-copy"><b id="dial-title">Belum ada ritual hari ini.</b><span id="dial-text">Tandai satu tugas untuk memulai. Progres disimpan lokal.</span></div>
          </div>
          <div class="week-strip" id="week" aria-label="Tujuh hari terakhir"></div>
        </div>

        <div class="panel">
          <div class="panel-head"><h2>Tugas kebersihan</h2><span class="mono" id="task-count"></span></div>
          <div class="task-list" id="task-list"></div>
          <div class="add-row">
            <label class="sr-only" for="new-task">Nama tugas baru</label>
            <input type="text" id="new-task" placeholder="Tambah tugas, misalnya: cuci mangkuk" maxlength="80">
            <button class="btn small primary" type="button" id="add-task">${ART.icon('plus')} Tambah</button>
          </div>
          <p class="tiny muted" style="margin:12px 0 0">Interval dapat diubah. Tugas nonmedis bisa dinonaktifkan kapan saja.</p>
        </div>

        <div class="panel flat" style="background:var(--paper-2)">
          <div class="panel-head"><h3>Cara kerja pengingat</h3><span class="tag">jujur soal batas</span></div>
          <p class="tiny muted" style="margin:0">Pengingat dihitung dari waktu terakhir kamu menandai tugas. Notifikasi latar belakang tidak dijamin berjalan di semua browser, terutama saat browser ditutup atau sistem membatasi aktivitas background. Saat halaman dibuka, tugas yang jatuh tempo akan ditandai.</p>
        </div>
      </div>

      <aside class="side-stack">
        <div class="panel">
          <div class="panel-head"><h2 style="font-size:1.15rem">Jadwal kontrol</h2></div>
          <p class="tiny muted" style="margin-top:0">Isi sesuai arahan dokter hewan. ZoonoCheck tidak menetapkan jadwal medis.</p>
          <form id="control-form">
            <div class="form-grid">
              <label class="field">Tanggal<input type="date" id="control-date"></label>
              <label class="field">Jam<input type="time" id="control-time"></label>
            </div>
            <div class="btn-row" style="margin-top:10px"><button class="btn small primary" type="submit">Simpan</button><button class="btn small ghost" type="button" id="control-clear">Hapus</button></div>
          </form>
          <p class="notice mt-1" id="control-status">Belum ada jadwal tersimpan.</p>
        </div>

        <div class="panel">
          <div class="panel-head"><h2 style="font-size:1.15rem">Mode ringworm</h2></div>
          <label class="switch"><input type="checkbox" id="rw-toggle"><span class="track"></span> Aktifkan mode</label>
          <p class="tiny muted" style="margin:10px 0 0">Menambahkan tiga tugas kebersihan tambahan. Ini bukan instruksi medis; ikuti rencana dokter hewan.</p>
          <div class="ringworm-tasks" id="rw-list"></div>
        </div>

        <div class="panel">
          <div class="panel-head"><h2 style="font-size:1.15rem">Notifikasi</h2></div>
          <p class="notice" id="notif-status">Memeriksa dukungan browser…</p>
          <div class="data-actions" style="margin-top:10px"><button class="btn small" type="button" id="notif-btn">Izinkan</button><button class="btn small ghost" type="button" id="notif-test">Uji</button></div>
          <p class="tiny muted" style="margin:10px 0 0">Notifikasi hanya setelah izin eksplisit. Tidak ada jaminan alarm tepat waktu di semua perangkat.</p>
        </div>

        <div class="panel">
          <div class="panel-head"><h2 style="font-size:1.15rem">Data lokal</h2></div>
          <p class="tiny muted" style="margin-top:0">Checklist, pengingat, dan riwayat tersimpan di browser ini. Menghapus data browser juga menghapusnya.</p>
          <div class="data-actions"><button class="btn small" type="button" id="export-btn">${ART.icon('download')} Ekspor</button><button class="btn small ghost" type="button" id="delete-btn">${ART.icon('trash')} Hapus</button></div>
        </div>
      </aside>
    </div>
  </div>`;
}

function initReminders() {
  initReveals();
  let R = S.get('reminders', null);
  if (!Array.isArray(R) || !R.length) { R = defaultReminders(); S.set('reminders', R); }
  let control = S.get('control', null);
  let ringworm = S.get('ringworm', false);
  const save = () => S.set('reminders', R);
  const isDue = r => r.enabled && (!r.lastDone || Date.now() >= r.lastDone + r.intervalHours * 36e5);
  const nextText = r => {
    if (!r.enabled) return 'Nonaktif';
    if (!r.lastDone) return 'Belum pernah ditandai';
    const due = r.lastDone + r.intervalHours * 36e5;
    if (Date.now() >= due) return 'Jatuh tempo';
    return `Jatuh tempo dalam ${hoursLeft(due)} jam`;
  };
  const renderTasks = () => {
    const list = $('#task-list'); if (!list) return;
    const sorted = [...R].sort((a, b) => (isDue(b) - isDue(a)) || (b.enabled - a.enabled));
    list.innerHTML = sorted.length ? sorted.map(r => `<div class="task ${isDue(r) ? 'due' : ''} ${r.enabled ? '' : 'off'}">
      <div>
        <h3>${esc(r.title)}</h3>
        <div class="task-meta">
          <span class="status ${!r.enabled ? 'off' : isDue(r) ? 'due' : 'ok'}">${!r.enabled ? 'Nonaktif' : isDue(r) ? 'Jatuh tempo' : 'Aman'}</span>
          <span>Setiap <b>${r.intervalHours} jam</b></span>
          <span>${nextText(r)}</span>
          <span>Terakhir: <b>${r.lastDone ? fmtShort(new Date(r.lastDone).toISOString()) : '—'}</b></span>
        </div>
      </div>
      <div class="task-actions">
        <label>Interval <input type="number" min="1" max="720" value="${r.intervalHours}" data-interval="${r.id}" aria-label="Interval ${esc(r.title)} dalam jam"> jam</label>
        <button class="btn small" type="button" data-done="${r.id}">${ART.icon('check')} Selesai</button>
        <button class="btn small ghost" type="button" data-toggle="${r.id}">${r.enabled ? 'Nonaktifkan' : 'Aktifkan'}</button>
        ${r.custom ? `<button class="btn small ghost" type="button" data-del="${r.id}" aria-label="Hapus ${esc(r.title)}">${ART.icon('trash')}</button>` : ''}
      </div>
    </div>`).join('') : `<p class="muted">Belum ada tugas. Tambahkan satu di bawah.</p>`;
    $('#task-count').textContent = `${R.length} tugas`;
  };
  const renderToday = () => {
    const enabled = R.filter(r => r.enabled);
    const recent = enabled.filter(r => r.lastDone && Date.now() - r.lastDone < 24 * 36e5);
    const pct = enabled.length ? recent.length / enabled.length : 0;
    const val = $('.dial .val'); if (val) val.style.strokeDashoffset = 377 - pct * 377;
    $('#dial-num').textContent = recent.length;
    $('#dial-title').textContent = recent.length === 0 ? 'Belum ada ritual hari ini.' : recent.length === enabled.length ? 'Semua ritual selesai.' : 'Sudah mulai. Teruskan.';
    $('#dial-text').textContent = enabled.length ? `${recent.length} dari ${enabled.length} tugas aktif sudah ditandai dalam 24 jam terakhir.` : 'Tidak ada tugas aktif.';
    const now = new Date();
    $('#today-date').textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
    const log = S.get('log', []);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const day = localDay(d);
      const done = log.some(l => l.day === day);
      days.push(`<div class="week-day"><i class="${done ? 'done' : ''} ${i === 0 ? 'today' : ''}" title="${d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}${done ? ' — ada tugas ditandai' : ''}"><span>${d.getDate()}</span>${done ? '<em aria-hidden="true">✓</em>' : ''}</i>${d.toLocaleDateString('id-ID', { weekday: 'short' })}</div>`);
    }
    $('#week').innerHTML = days.join('');
  };
  const renderControl = () => {
    const st = $('#control-status'); if (!st) return;
    if (!control || !control.date) { st.textContent = 'Belum ada jadwal tersimpan.'; st.className = 'notice mt-1'; return; }
    const when = new Date(`${control.date}T${control.time || '00:00'}`);
    const diff = when.getTime() - Date.now();
    if (diff < 0) { st.textContent = `Jadwal ${fmtDate(control.date)} ${control.time || ''} sudah lewat.`; st.className = 'notice warn mt-1'; }
    else { st.textContent = `Tersimpan: ${fmtDate(control.date)} ${control.time || ''} · ${Math.ceil(diff / 864e5)} hari lagi.`; st.className = 'notice mt-1'; }
    const date = $('#control-date'), time = $('#control-time');
    if (date) date.value = control.date || '';
    if (time) time.value = control.time || '';
  };
  const renderRingworm = () => {
    const t = $('#rw-toggle'); if (t) t.checked = ringworm;
    const list = $('#rw-list'); if (list) list.innerHTML = ringworm ? RW_TASKS.map(x => `<div class="check" style="padding:7px 0"><span style="font-size:.78rem">${x.title}</span></div>`).join('') : '';
  };
  const renderNotif = () => {
    const st = $('#notif-status'); if (!st) return;
    if (!('Notification' in window)) { st.textContent = 'Browser ini tidak mendukung notifikasi. Pengingat tetap tampil saat halaman dibuka.'; st.className = 'notice warn'; $('#notif-btn').disabled = true; $('#notif-test').disabled = true; return; }
    const p = Notification.permission;
    st.textContent = p === 'granted' ? 'Izin diberikan. Notifikasi uji bisa dikirim.' : p === 'denied' ? 'Izin ditolak. Pengingat tetap berjalan di halaman.' : 'Izin belum diminta. Notifikasi bersifat opsional.';
    st.className = p === 'denied' ? 'notice warn' : 'notice';
    $('#notif-btn').disabled = p === 'granted';
    $('#notif-test').disabled = p !== 'granted';
  };
  const renderAll = () => { renderTasks(); renderToday(); renderControl(); renderRingworm(); renderNotif(); };

  renderAll();

  $('#task-list').addEventListener('click', e => {
    const done = e.target.closest('[data-done]');
    const toggle = e.target.closest('[data-toggle]');
    const del = e.target.closest('[data-del]');
    if (done) {
      const r = R.find(x => x.id === done.dataset.done); if (!r) return;
      r.lastDone = Date.now(); save();
      const log = S.get('log', []); log.push({ day: localDay(), id: r.id }); S.set('log', log.slice(-240));
      renderAll(); toast('Tugas ditandai selesai.');
    }
    if (toggle) { const r = R.find(x => x.id === toggle.dataset.toggle); if (r) { r.enabled = !r.enabled; save(); renderAll(); } }
    if (del) { R = R.filter(x => x.id !== del.dataset.del); save(); renderAll(); toast('Tugas dihapus.'); }
  });
  $('#task-list').addEventListener('change', e => {
    const inp = e.target.closest('[data-interval]'); if (!inp) return;
    const r = R.find(x => x.id === inp.dataset.interval); if (!r) return;
    r.intervalHours = clamp(parseInt(inp.value, 10) || 24, 1, 720); save(); renderAll(); toast('Interval diperbarui.');
  });
  $('#add-task').onclick = () => {
    const v = $('#new-task').value.trim();
    if (!v) { $('#new-task').focus(); toast('Tulis nama tugas terlebih dahulu.'); return; }
    R.push({ id: uid('r'), title: v, intervalHours: 24, lastDone: null, enabled: true, custom: true, group: 'custom' });
    save(); $('#new-task').value = ''; renderAll(); toast('Tugas ditambahkan.');
  };
  $('#new-task').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#add-task').click(); } });

  $('#control-form').addEventListener('submit', e => {
    e.preventDefault();
    const date = $('#control-date').value, time = $('#control-time').value;
    if (!date) { $('#control-status').textContent = 'Isi tanggal terlebih dahulu.'; $('#control-status').className = 'notice warn mt-1'; return; }
    control = { date, time }; S.set('control', control); renderControl(); toast('Jadwal kontrol disimpan.');
  });
  $('#control-clear').onclick = () => { control = null; S.del('control'); $('#control-date').value = ''; $('#control-time').value = ''; renderControl(); toast('Jadwal kontrol dihapus.'); };

  $('#rw-toggle').addEventListener('change', e => {
    ringworm = e.target.checked; S.set('ringworm', ringworm);
    if (ringworm) {
      RW_TASKS.forEach(t => { if (!R.some(r => r.id === t.id)) R.push({ ...t, lastDone: null, enabled: true, custom: false }); });
    } else {
      R = R.filter(r => r.group !== 'ringworm');
    }
    save(); renderAll();
    toast(ringworm ? 'Mode ringworm aktif. Tiga tugas ditambahkan.' : 'Mode ringworm nonaktif. Tugas tambahan dihapus.');
  });

  $('#notif-btn').onclick = async () => {
    if (!('Notification' in window)) return;
    try { await Notification.requestPermission(); renderNotif(); } catch (e) { toast('Izin notifikasi tidak tersedia.'); }
  };
  $('#notif-test').onclick = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') { toast('Izin notifikasi belum diberikan.'); return; }
    try {
      const reg = await navigator.serviceWorker?.getRegistration?.();
      if (reg && reg.showNotification) reg.showNotification('ZoonoCheck', { body: 'Notifikasi uji. Pengingat tetap perlu dibuka untuk status terbaru.', icon: 'icons/icon-192.png' });
      else new Notification('ZoonoCheck', { body: 'Notifikasi uji dari ZoonoCheck.' });
      toast('Notifikasi uji dikirim.');
    } catch (e) { toast('Notifikasi tidak bisa dikirim di browser ini.'); }
  };

  $('#export-btn').onclick = () => {
    const data = { exportedAt: new Date().toISOString(), reminders: R, checks: checks(), log: S.get('log', []), control, ringworm };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'zoonocheck-data.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('Data diekspor.');
  };
  $('#delete-btn').onclick = () => {
    if (!confirm('Hapus semua checklist, pengingat, dan riwayat di perangkat ini?')) return;
    S.clear(); R = defaultReminders(); control = null; ringworm = false; S.set('reminders', R);
    renderAll(); toast('Semua data lokal dihapus.');
  };
}

/* ============================================================
   ABOUT
   ============================================================ */
function tentang() {
  return `<header class="page-head" style="--soft:var(--lav-soft)">
    <div class="wrap">
      <div class="crumbs"><a href="#home">Beranda</a><span>/</span><span>Tentang</span></div>
      <p class="eyebrow">Tentang ZoonoCheck</p>
      <h1 class="page-title">Edisi rumah, <em>untuk dibaca pelan-pelan.</em></h1>
      <p class="lede page-sub">ZoonoCheck adalah pendamping digital untuk video edukasi 90 detik tentang zoonosis pada kucing dan anjing. Situs ini memperdalam informasi yang mungkin terlewat dalam satu tontonan.</p>
    </div>
  </header>
  <div class="wrap">
    <div class="about-hero">
      <div>
        <p class="eyebrow">Kenapa situs ini ada</p>
        <h2 style="font-size:clamp(1.9rem,4vw,3rem);line-height:1;margin:10px 0 14px">Informasi kesehatan yang tidak perlu menakut-nakuti.</h2>
        <p class="lede">Kami menulis dengan bahasa sehari-hari, tetapi tetap menyertakan nama ilmiah dan tautan sumber. Tujuannya bukan membuatmu takut pada hewan, melainkan memahami jalur penularan dan memutusnya dengan kebiasaan kecil.</p>
        <div class="btn-row"><a class="btn primary" href="#skrining">Mulai skrining</a><a class="btn ghost" href="#ensiklopedi">Baca ensiklopedi</a></div>
      </div>
      <div class="about-stage">
        ${ART.aboutArt()}
        <div class="say tiny-say about-say" data-say="about">Dibuat untuk dibaca pelan-pelan.</div>
        <div class="about-kunang" data-kunang="about" data-mood="happy"></div>
      </div>
    </div>
    <div class="about-layout">
      <div class="about-main">
        <section id="cara">
          <h2>Cara membaca situs ini</h2>
          <div class="info-grid">
            <div class="info-card" style="--accent:var(--pink)">${ART.icon('book')}<b>01. Kenali</b>Mulai dari beranda atau indeks. Setiap entri punya ringkasan 30 detik dan sepuluh bagian yang konsisten.</div>
            <div class="info-card" style="--accent:var(--blue)">${ART.icon('compass')}<b>02. Petakan</b>Skrining membantu menemukan materi yang relevan dengan kondisi rumah. Bukan diagnosis, bukan skor.</div>
            <div class="info-card" style="--accent:var(--moss)">${ART.icon('bell')}<b>03. Lakukan</b>Centang checklist dan atur pengingat. Data tersimpan lokal, tanpa akun.</div>
          </div>
        </section>
        <section id="prinsip">
          <h2>Prinsip yang kami pegang</h2>
          <div class="principle"><span class="p-num">01</span><div><b>Evidence first</b><span>Klaim penting diarahkan ke sumber otoritatif. Status penelaahan ditampilkan terbuka, termasuk saat masih draft.</span></div></div>
          <div class="principle"><span class="p-num">02</span><div><b>Plain language</b><span>Istilah ilmiah tetap ada, tetapi dijelaskan dengan bahasa yang bisa dipakai di rumah.</span></div></div>
          <div class="principle"><span class="p-num">03</span><div><b>Actionable</b><span>Informasi pencegahan dihubungkan dengan checklist dan pengingat yang bisa dilakukan hari ini.</span></div></div>
          <div class="principle"><span class="p-num">04</span><div><b>Privacy by default</b><span>Tidak ada akun, tidak ada telemetri, dan tidak ada jawaban skrining yang dikirim ke server.</span></div></div>
          <div class="principle"><span class="p-num">05</span><div><b>Non-diagnostic</b><span>Kami tidak menentukan penyakit, obat, atau dosis. Kami mengedukasi dan mengarahkan.</span></div></div>
        </section>
        <section id="bukan">
          <h2>Apa yang bukan</h2>
          <ul>
            <li>Bukan pengganti pemeriksaan dokter hewan atau tenaga medis.</li>
            <li>Bukan alat diagnosis, skor risiko, atau label sehat/sakit.</li>
            <li>Bukan rekomendasi obat, dosis, atau perubahan jadwal pengobatan.</li>
            <li>Bukan pengumpul data kesehatan pribadi, identitas keluarga, atau lokasi.</li>
          </ul>
          <div class="draft-note"><b>Status konten</b>${REV}</div>
        </section>
        <section id="privasi">
          <h2>Privasi & data lokal</h2>
          <p>Checklist, pengingat, jadwal kontrol, dan riwayat 7 hari disimpan di <code>localStorage</code> browser ini dengan namespace <code>zoonocheck:v2:</code>. Tidak ada data yang dikirim ke server. Menghapus data browser atau berganti perangkat akan menghilangkan data tersebut.</p>
          <p>Jawaban skrining hanya berada di memori halaman dan hilang saat halaman ditutup. Kamu bisa menghapus seluruh data lokal kapan saja.</p>
          <div class="btn-row"><button class="btn" type="button" id="about-delete">${ART.icon('trash')} Hapus data lokal</button><a class="btn ghost" href="#pengingat">Kelola data</a></div>
        </section>
        <section id="status">
          <h2>Status penelaahan</h2>
          <p>Konten medis di situs ini masih berstatus draft. Belum ada dokter hewan atau tenaga medis yang ditetapkan sebagai penelaah. Tautan sumber sudah diarahkan ke halaman otoritatif, tetapi metadata bibliografi lengkap dan kecocokan klaim perlu diverifikasi sebelum rilis.</p>
          <div class="specimen-meta">
            <div><b>Versi</b><span>Draft 1.0</span></div>
            <div><b>Diperbarui</b><span>7 November 2026</span></div>
            <div><b>Penelaah</b><span>Belum ditetapkan</span></div>
            <div><b>Kontak</b><span>Belum tersedia</span></div>
          </div>
        </section>
        <section id="sumber">
          <h2>Sumber umum</h2>
          <ul class="ref-list">
            <li class="ref-item"><b>Centers for Disease Control and Prevention</b><div class="ref-meta">Ringworm, Toxocariasis, Toxoplasmosis · halaman edukasi</div><a href="https://www.cdc.gov/" target="_blank" rel="noopener">https://www.cdc.gov/</a></li>
            <li class="ref-item"><b>World Health Organization</b><div class="ref-meta">Zoonoses · fact sheet</div><a href="https://www.who.int/news-room/fact-sheets/detail/zoonoses" target="_blank" rel="noopener">https://www.who.int/news-room/fact-sheets/detail/zoonoses</a></li>
            <li class="ref-item"><b>One Health High-Level Expert Panel</b><div class="ref-meta">One Health: A new definition for a sustainable and healthy future · 2022</div><a href="https://doi.org/10.1371/journal.ppat.1010537" target="_blank" rel="noopener">https://doi.org/10.1371/journal.ppat.1010537</a></li>
            <li class="ref-item"><b>Companion Animal Parasite Council</b><div class="ref-meta">Parasite guidelines · roundworms</div><a href="https://capcvet.org/guidelines/roundworms/" target="_blank" rel="noopener">https://capcvet.org/guidelines/roundworms/</a></li>
          </ul>
        </section>
        <section id="kolofon">
          <h2>Kolofon</h2>
          <p class="colophon">Tipografi: Fraunces untuk judul, Inter untuk teks. Ilustrasi: SVG inline yang digambar khusus untuk ZoonoCheck. Tidak ada gambar stok. Situs ini adalah aplikasi statis tanpa backend; seluruh interaksi berjalan di browser. Dibuat sebagai media edukasi, bukan produk klinis.</p>
        </section>
      </div>
      <aside class="about-aside">
        <h3>Ringkas</h3>
        <p class="tiny" style="margin:0 0 12px">Media edukasi zoonosis untuk pemilik kucing dan anjing. Tanpa akun. Tanpa pelacakan.</p>
        <div class="stack-sm">
          <a class="btn small primary" href="#skrining">Skrining risiko</a>
          <a class="btn small" href="#ensiklopedi">Ensiklopedi</a>
          <a class="btn small ghost" href="#pengingat">Pengingat</a>
        </div>
        <hr class="rule" style="margin:16px 0">
        <h3>Data</h3>
        <p class="tiny" style="margin:0 0 10px">Semua data tersimpan di perangkat ini.</p>
        <button class="btn small ghost" type="button" id="about-delete-2">Hapus data lokal</button>
      </aside>
    </div>
  </div>`;
}

function initAbout() {
  initReveals();
  const del = () => {
    if (!confirm('Hapus semua checklist, pengingat, dan riwayat di perangkat ini?')) return;
    S.clear(); toast('Semua data lokal dihapus.');
  };
  const a = $('#about-delete'), b = $('#about-delete-2');
  if (a) a.onclick = del; if (b) b.onclick = del;
}

/* ============================================================
   GLOBAL: reveal, chrome, router
   ============================================================ */
let revealIO = null;
function initReveals(root = document) {
  const els = $$('.reveal:not(.in),.reveal-x:not(.in),.reveal-scale:not(.in)', root);
  if (!els.length) return;
  if (motionOff || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  if (!revealIO) {
    revealIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  }
  els.forEach(e => { if (e.dataset.obs) return; e.dataset.obs = '1'; revealIO.observe(e); });
}

function renderNav() {
  const icons = { home: 'home', ensiklopedi: 'book', pengingat: 'bell', skrining: 'compass', tentang: 'info' };
  $('.top-nav').innerHTML = NAV.map(([id, label]) => `<a href="#${id}" data-nav="${id}">${label}</a>`).join('');
  $('.bottom-nav').innerHTML = NAV.slice(0, 4).map(([id, label]) => `<a href="#${id}" data-nav="${id}">${ART.icon(icons[id])}<span>${label}</span></a>`).join('');
  $('.mobile-menu-links').innerHTML = NAV.map(([id, label]) => `<a href="#${id}" data-nav="${id}">${ART.icon(icons[id])}<span>${label}</span><span class="mm-arrow" aria-hidden="true">→</span></a>`).join('');
}

function setActiveNav(active) {
  $$('[data-nav]').forEach(a => {
    if (a.dataset.nav === active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function renderPage(page, slug) {
  const main = $('#main');
  if (page === 'home') main.innerHTML = home();
  else if (page === 'ensiklopedi') main.innerHTML = ensi();
  else if (page === 'entri') main.innerHTML = detail(slug);
  else if (page === 'skrining') main.innerHTML = skrining();
  else if (page === 'pengingat') main.innerHTML = pengingat();
  else main.innerHTML = tentang();

  const active = page === 'entri' ? 'ensiklopedi' : page;
  setActiveNav(active);
  const titles = {
    home: 'ZoonoCheck — Ensiklopedi zoonosis untuk rumah yang hidup',
    ensiklopedi: 'Ensiklopedi — ZoonoCheck',
    skrining: 'Skrining risiko keluarga — ZoonoCheck',
    pengingat: 'Pengingat kebersihan — ZoonoCheck',
    tentang: 'Tentang — ZoonoCheck'
  };
  document.title = page === 'entri' && E(slug) ? `${E(slug).name} — ZoonoCheck` : titles[page] || titles.home;

  scrollTo({ top: 0, left: 0, behavior: 'auto' });
  main.classList.remove('page-in'); void main.offsetWidth; main.classList.add('page-in');

  bindRemButtons(main);
  initReveals(main);

  if (page === 'home') initHome();
  else if (page === 'ensiklopedi') initEnsi();
  else if (page === 'entri') initDetail(slug);
  else if (page === 'skrining') initSkrining();
  else if (page === 'pengingat') initReminders();
  else initAbout();

  mountPageMascots(main);
  if (page !== 'home') main.focus({ preventScroll: true });
  tick();
}

function route() {
  const raw = (location.hash || '#home').replace(/^#/, '');
  if (/^bab\d$/.test(raw)) {
    if (!$('#bab1')) renderPage('home');
    const el = document.getElementById(raw);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: motionOff ? 'auto' : 'smooth', block: 'start' }), 50);
    return;
  }
  const parts = raw.split('-');
  let page = parts[0] || 'home';
  const slug = parts.slice(1).join('-');
  if (page === 'entri') {
    if (!E(slug)) { location.hash = '#ensiklopedi'; return; }
  } else if (!['home', 'ensiklopedi', 'skrining', 'pengingat', 'tentang'].includes(page)) {
    page = 'home';
  }
  renderPage(page, slug);
}

function tick() {
  const y = scrollY;
  const h = document.documentElement.scrollHeight - innerHeight;
  const rb = $('#readbar i');
  if (rb) rb.style.transform = `scaleX(${h > 0 ? clamp(y / h, 0, 1) : 0})`;

  if (!motionOff && innerWidth > 760) {
    $$('[data-parallax]').forEach(el => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translate3d(0,${(-center * parseFloat(el.dataset.parallax || 0.03)).toFixed(1)}px,0)`;
    });
  }

  const art = $('.entry-main');
  if (art) {
    const r = art.getBoundingClientRect();
    const total = Math.max(1, art.offsetHeight - innerHeight * 0.55);
    const p = clamp((-r.top + 120) / total, 0, 1);
    const rp = $('#read-progress'); if (rp) rp.style.transform = `scaleX(${p})`;
  }
}

function initChrome() {
  renderNav();
  applyMotion();
  const menu = $('#mobile-menu'), menuBtn = $('#menu-btn'), closeBtn = $('#menu-close');
  const openMenu = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); menuBtn.setAttribute('aria-expanded', 'true'); document.body.classList.add('nav-open'); closeBtn.focus(); };
  const closeMenu = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); menuBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open'); menuBtn.focus(); };
  menuBtn.onclick = openMenu; closeBtn.onclick = closeMenu;
  $$('.mobile-menu-links a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      const q = $('#ens-q');
      if (q) { e.preventDefault(); q.focus(); }
    }
  });
  $$('#motion-btn,#motion-btn-2').forEach(b => b.addEventListener('click', toggleMotion));
  RM.addEventListener('change', () => { if (!S.get('reduceMotion', null)) { motionOff = RM.matches; applyMotion(); } });

  const online = () => document.body.classList.toggle('is-offline', !navigator.onLine);
  addEventListener('online', online); addEventListener('offline', online); online();

  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; tick(); }); } }, { passive: true });
  addEventListener('resize', () => tick(), { passive: true });

  addEventListener('hashchange', route);
  route();
  mountPageMascots(document);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

initChrome();