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
  const url = location.origin + '/ensiklopedi/' + slug + '/';
  const text = `${d.name} (${d.sci}) — ZoonoCheck`;
  try {
    if (navigator.share) { await navigator.share({ title: text, text: d.tagline, url }); return; }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('Tautan disalin.');
  } catch (e) {
    try { await navigator.clipboard.writeText(url); toast('Tautan disalin.'); } catch (e2) { toast('Tidak bisa menyalin tautan di browser ini.'); }
  }
}

function diseaseCard(d, i = 0) {
  return `<a class="dcard reveal" style="${vars(d)};--d:${i * 90}ms" href="/ensiklopedi/${d.slug}/">
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
  return `<nav class="rail" aria-label="Bab beranda">
      ${[1, 2, 3, 4, 5, 6].map(i => `<button type="button" data-b="bab${i}" aria-label="Bab ${i}" title="Bab ${i}"></button>`).join('')}
    </nav>

    <section class="hero" id="bab1" aria-labelledby="hero-title">
      <div class="wrap hero-in">
        <div class="hero-grid">
          <div>
            <p class="eyebrow reveal">Ensiklopedi zoonosis · edisi rumah</p>
            <h1 id="hero-title" class="reveal" style="--d:70ms">Yang tak <span class="it">terlihat,</span><br>tinggal <span class="blue">bersama</span> kita.</h1>
            <p class="lede reveal" style="--d:160ms">Zoonosis berpindah lewat bulu, tanah, litter box, dan tangan. ZoonoCheck memetakan jalurnya — tanpa menakut-nakuti, tanpa mendiagnosis.</p>
            <div class="btn-row reveal" style="--d:240ms">
              <a class="btn pink" href="/skrining/">Mulai skrining 2 menit ${ART.icon('arrow')}</a>
              <a class="btn ghost" href="/ensiklopedi/">Buka indeks penyakit</a>
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
              ${ART.hero()}
            </div>
          </div>
        </div>
      </div>
    </section>


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
          <a class="link-arrow" href="/ensiklopedi/toksoplasmosis/">Lihat contoh jalurnya ${ART.icon('arrow')}</a>
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
          <a class="link-arrow" href="/pengingat/">Ubah jadi rutinitas ${ART.icon('arrow')}</a>
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
          <a class="link-arrow" href="/ensiklopedi/">Buka ensiklopedi lengkap ${ART.icon('arrow')}</a>
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
          <a class="link-arrow" href="/skrining/">Petakan risiko rumahmu ${ART.icon('arrow')}</a>
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
            <div class="btn-row mt-3"><a class="btn primary" href="/pengingat/">Atur pengingat ${ART.icon('bell')}</a><a class="btn ghost" href="/skrining/">Ulangi skrining</a></div>
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
            <p class="tiny muted" style="margin:14px 0 0">Tersimpan otomatis di perangkat ini. <a href="/tentang/">Cara kerja data</a>.</p>
          </div>
        </div>
      </div>
    </section>`;
}

function initHome() {
  /* reveal + rail */
  initReveals();
  const rail = $('.rail');
  if (rail && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) $$('.rail button').forEach(a => a.classList.toggle('on', a.dataset.b === e.target.id));
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
      <div class="crumbs"><a href="/">Beranda</a><span>/</span><span>Ensiklopedi</span></div>
      <p class="eyebrow">Indeks penyakit</p>
      <h1 class="page-title">Tiga agen, <em>tiga jalur.</em></h1>
      <p class="lede page-sub">Cari berdasarkan nama penyakit, nama ilmiah, atau kata kunci. Filter bisa digabung, dan hasilnya diperbarui tanpa memuat ulang halaman.</p>
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
          <a class="btn small ghost" href="/skrining/">Skrining</a>
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
    list.innerHTML = r.length ? r.map(d => `<a class="ens-item reveal" style="${vars(d)}" href="/ensiklopedi/${d.slug}/">
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
