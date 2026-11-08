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
      <div class="crumbs"><a href="/">Beranda</a><span>/</span><a href="/ensiklopedi/">Ensiklopedi</a><span>/</span><span>${d.name}</span></div>
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
            <a class="btn small ghost" href="/skrining/">Cek risiko rumah</a>
          </div>
        </div>
        <div class="entry-art-wrap">
          <span class="specimen-tag">Spesimen · ${d.type}</span>
          ${ART.agent(d.slug)}
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
            <div class="sign-card"><h3>Contoh hewan</h3>${ART.animalSigns(d.slug)}</div>
            <div class="sign-card"><h3>Yang mungkin terlihat</h3><ul>${d.animalSigns.map(s => `<li>${s}</li>`).join('')}</ul><p class="tiny muted" style="margin:10px 0 0">Tanda ini tidak spesifik. Hanya dokter hewan yang dapat menegakkan diagnosis.</p></div>
          </div>
        </section>

        <section id="manusia" aria-labelledby="t-manusia">
          <div class="sec-head"><span class="sec-num">04</span><div><h2 id="t-manusia">Tanda pada manusia</h2><div class="sec-sub">Gejala tidak sama dengan diagnosis</div></div></div>
          <div class="signs-grid">
            <div class="sign-card" style="grid-column:1/-1"><h3>Yang mungkin terjadi</h3><ul>${d.humanSigns.map(s => `<li>${s}</li>`).join('')}</ul><p class="tiny muted" style="margin:10px 0 0">Jangan menentukan diagnosis sendiri. Hubungi tenaga medis bila khawatir.</p></div>
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
          ${other.map(x => `<a class="next-card" href="/ensiklopedi/${x.slug}/" style="${vars(x)}"><small>Entri lain · ${x.type}</small><b>${x.name}</b></a>`).join('')}
        </div>
      </article>

      <aside class="entry-toc" style="${vars(d)}" aria-label="Daftar isi entri">
        <h3>Di halaman ini</h3>
        <div class="read-progress"><i id="read-progress"></i></div>
        <nav>
          ${secs.map(([id, t], i) => `<a class="toc-link" href="/ensiklopedi/${d.slug}/" data-toc="${id}"><span>${String(i + 1).padStart(2, '0')}</span>${t}</a>`).join('')}
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
      <div class="crumbs"><a href="/">Beranda</a><span>/</span><span>Skrining</span></div>
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
          <div class="btn-row" style="margin-top:18px"><button class="btn pink" type="button" id="start-screen">Mulai skrining ${ART.icon('arrow')}</button><a class="btn ghost" href="/ensiklopedi/">Lihat ensiklopedi</a></div>
        </div>
        ${ART.screenArt()}
      </div>
      <div class="screen-note">${ART.icon('info')}<span>Ini bukan alat diagnosis. Bila ada tanda bahaya, hubungi dokter hewan atau fasilitas kesehatan.</span></div>
    </div>`;
    $('#start-screen').onclick = () => { state.step = 0; question(0); };
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
        <h2>${ids.length ? 'Materi yang paling relevan' : 'Tidak ada materi khusus dari jawabanmu.'}</h2>
        <p class="muted">${ids.length ? 'Mulai dari entri yang paling dekat dengan situasi rumahmu. Ini bukan diagnosis.' : 'Tetap jelajahi ensiklopedi untuk gambaran umum. Bila ada kekhawatiran, hubungi profesional.'}</p>
      </div>
      ${ids.length ? `<div class="result-grid">${ids.map(s => `<a class="result-card" href="/ensiklopedi/${s}/" style="${vars(E(s))}"><div><h3>${E(s).name}</h3><ul class="why">${[...new Set(map[s])].map(w => `<li>${esc(w)}</li>`).join('')}</ul></div><span class="go">Buka entri →</span></a>`).join('')}</div>` : ''}
      ${priority.length ? `<div class="priority-list"><h3>Checklist prioritas</h3>${priority.map(p => ck(p.id, p.text)).join('')}</div>` : ''}
      <div class="red-flag"><b>Bila ada tanda bahaya:</b> hubungi dokter hewan atau fasilitas kesehatan. Hasil ini bukan diagnosis, bukan skor risiko, dan tidak menggantikan konsultasi.</div>
      <div class="screen-actions">
        <button class="btn small ghost" type="button" id="screen-restart">${ART.icon('back')} Ulangi skrining</button>
        <div class="right"><a class="btn small" href="/ensiklopedi/">Buka ensiklopedi</a><a class="btn primary" href="/pengingat/">Atur pengingat ${ART.icon('arrow')}</a></div>
      </div>
    </div>`;
    $('#screen-restart').onclick = () => { state.answers = {}; state.step = 0; intro(); };
    bindChecks(root);
    bindRemButtons(root);
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
      <div class="crumbs"><a href="/">Beranda</a><span>/</span><span>Pengingat</span></div>
      <p class="eyebrow">Ritual kebersihan</p>
      <h1 class="page-title">Kebiasaan kecil, <em>dijaga pelan-pelan.</em></h1>
      <div class="rem-hero">
        <p class="lede page-sub">Pengingat ini tersimpan di perangkatmu. Tidak ada akun dan tidak ada notifikasi yang dikirim ke server. Tugas yang jatuh tempo ditandai saat kamu membuka halaman.</p>
        <div class="rem-stage">
          ${ART.reminderArt()}
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
      <div class="crumbs"><a href="/">Beranda</a><span>/</span><span>Tentang</span></div>
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
        <div class="btn-row"><a class="btn primary" href="/skrining/">Mulai skrining</a><a class="btn ghost" href="/ensiklopedi/">Baca ensiklopedi</a></div>
      </div>
      <div class="about-stage">
        ${ART.aboutArt()}
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
          <div class="btn-row"><button class="btn" type="button" id="about-delete">${ART.icon('trash')} Hapus data lokal</button><a class="btn ghost" href="/pengingat/">Kelola data</a></div>
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
          <p class="colophon">Tipografi: Bricolage Grotesque untuk judul, Inter untuk teks, Fraunces italic untuk aksen. Foto: Wikimedia Commons (CC0/domain publik); daftar berkas ada di assets/img/CREDITS.md. Diagram spesimen digambar khusus sebagai SVG. Situs ini adalah aplikasi statis tanpa backend; seluruh interaksi berjalan di browser. Dibuat sebagai media edukasi, bukan produk klinis.</p>
        </section>
      </div>
      <aside class="about-aside">
        <h3>Ringkas</h3>
        <p class="tiny" style="margin:0 0 12px">Media edukasi zoonosis untuk pemilik kucing dan anjing. Tanpa akun. Tanpa pelacakan.</p>
        <div class="stack-sm">
          <a class="btn small primary" href="/skrining/">Skrining risiko</a>
          <a class="btn small" href="/ensiklopedi/">Ensiklopedi</a>
          <a class="btn small ghost" href="/pengingat/">Pengingat</a>
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
  $('.top-nav').innerHTML = NAV.map(([id, label]) => `<a href="${PATHS[id]}" data-nav="${id}">${label}</a>`).join('');
  $('.bottom-nav').innerHTML = NAV.slice(0, 4).map(([id, label]) => `<a href="${PATHS[id]}" data-nav="${id}">${ART.icon(icons[id])}<span>${label}</span></a>`).join('');
  $('.mobile-menu-links').innerHTML = NAV.map(([id, label]) => `<a href="${PATHS[id]}" data-nav="${id}">${ART.icon(icons[id])}<span>${label}</span><span class="mm-arrow" aria-hidden="true">→</span></a>`).join('');
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
  if (page !== 'home') main.focus({ preventScroll: true });
  tick();
}

/* ---------- router: path-based (History API), no hash ---------- */
function parsePath(pathname) {
  const seg = pathname.replace(/index\.html$/, '').split('/').filter(Boolean);
  const [a, b] = seg;
  if (!a) return { page: 'home' };
  if (a === 'ensiklopedi') return b ? (E(b) ? { page: 'entri', slug: b } : { page: 'ensiklopedi', redirect: '/ensiklopedi/' }) : { page: 'ensiklopedi' };
  if (['skrining', 'pengingat', 'tentang'].includes(a)) return { page: a };
  return { page: 'home', redirect: '/' };
}

function route(opts = {}) {
  const r = parsePath(location.pathname);
  if (r.redirect) history.replaceState(null, '', r.redirect);
  renderPage(r.page, r.slug);
  if (opts.scrollTo) {
    const el = document.getElementById(opts.scrollTo);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: motionOff ? 'auto' : 'smooth', block: 'start' }), 60);
  }
}

function navigate(url, { replace = false } = {}) {
  const u = new URL(url, location.origin);
  if (u.pathname === location.pathname && u.search === location.search) { scrollTo({ top: 0, behavior: motionOff ? 'auto' : 'smooth' }); return; }
  history[replace ? 'replaceState' : 'pushState'](null, '', u.pathname + u.search);
  route();
}

function tick() {
  const y = scrollY;
  const h = document.documentElement.scrollHeight - innerHeight;
  const rb = $('#readbar i');
  if (rb) rb.style.transform = `scaleX(${h > 0 ? clamp(y / h, 0, 1) : 0})`;

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

  /* intercept internal links -> client-side navigation */
  document.addEventListener('click', e => {
    const skip = e.target.closest('a.skip');
    if (skip) { e.preventDefault(); $('#main').focus(); $('#main').scrollIntoView(); return; }
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname.startsWith('/assets/')) return;
    if (u.pathname === location.pathname && u.hash) return;
    e.preventDefault();
    navigate(u.pathname + u.search);
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('.rail button[data-b]');
    if (!b) return;
    const el = document.getElementById(b.dataset.b);
    if (el) el.scrollIntoView({ behavior: motionOff ? 'auto' : 'smooth', block: 'start' });
  });
  addEventListener('popstate', () => route());
  /* legacy #hash links -> clean paths */
  const legacy = location.hash.replace(/^#/, '');
  if (legacy) {
    const m = legacy.match(/^entri-(.+)$/);
    const map = { home: '/', ensiklopedi: '/ensiklopedi/', skrining: '/skrining/', pengingat: '/pengingat/', tentang: '/tentang/' };
    const to = m ? '/ensiklopedi/' + m[1] + '/' : map[legacy];
    if (to) history.replaceState(null, '', to);
  }
  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

initChrome();
