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

const PATHS = { home: '/', ensiklopedi: '/ensiklopedi/', skrining: '/skrining/', pengingat: '/pengingat/', tentang: '/tentang/' };
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
