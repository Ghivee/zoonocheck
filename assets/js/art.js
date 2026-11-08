/* ============================================================
   ILLUSTRATION SYSTEM — flat ink + paper, built to feel drawn
   ============================================================ */
const INK = '#2A0F1C', PAPER = '#FFF8EF', PAPER2 = '#FBF6EA', PINK = '#EE5B6C', BLUE = '#2B59D8', LAV = '#7C5CE0', SKY = '#1C9C96', MOSS = '#1C9C96', AMBER = '#B96A0C';
const AMBER2 = '#FFD27A', CREAM = '#FBF6EA', TEAL2 = '#7FD6CF';
const st = (w = 2.4, c = INK) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const fillSt = (f = PAPER, w = 2.4, c = INK) => `fill="${f}" ${st(w, c)}`;
const svg = (vb, label, body, cls = '') => `<svg class="art ${cls}" viewBox="${vb}" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const g = (x, y, s, body) => `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;

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
/* ---------- foto (CC0, lihat assets/img/CREDITS.md) ---------- */
const PHOTO = {
  belang: ['kucing-belang', 'Kucing belang duduk tegak di dalam rumah'],
  rumput: ['kucing-rumput', 'Kucing abu-abu menatap kamera di atas rumput'],
  dielus: ['kucing-dielus', 'Kucing jingga memejamkan mata saat dielus'],
  anjing: ['anjing-labrador', 'Anjing labrador cokelat menengadah di halaman'],
  tangan: ['cuci-tangan', 'Tangan menuang air untuk mencuci tangan di wastafel'],
  tanah: ['tanah-kebun', 'Bedeng tanah kebun yang ditutupi daun kering']
};
const img = (k, cls = '', alt) => `<img class="photo ${cls}" src="/assets/img/${PHOTO[k][0]}.jpg" alt="${esc(alt === undefined ? PHOTO[k][1] : alt)}" loading="lazy" decoding="async">`;
const specimenDisc = (slug, size = 64) => {
  const d = E(slug), c = d.deep;
  const inner = slug === 'dermatofitosis' ? spore(0, 0, d.color, .9) : slug === 'toksokariasis' ? worm(0, 0, d.color, .8) : oocyst(0, 0, d.color, 1);
  return `<svg class="spec" width="${size}" height="${size}" viewBox="-40 -40 80 80" aria-hidden="true"><circle r="38" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><circle r="31" fill="none" stroke="${c}" stroke-width="1" stroke-dasharray="2 4" opacity=".6"/>${inner}</svg>`;
};

const PLATES = [
  { photo: 'rumput', slug: 'toksokariasis', cap: 'Bulu · feses · benda' },
  { photo: 'dielus', slug: 'dermatofitosis', cap: 'Tangan · mulut · makanan' },
  { photo: 'tangan', slug: 'toksoplasmosis', cap: 'Paparan ≠ infeksi' }
];

const ART = {
  hero() {
    return `<div class="hero-collage">
      <figure class="hc hc-main">${img('belang')}<figcaption><b>01</b> Bulu &amp; kulit</figcaption></figure>
      <figure class="hc hc-dog">${img('anjing')}<figcaption><b>02</b> Tanah &amp; feses</figcaption></figure>
      <figure class="hc hc-hands">${img('tangan')}<figcaption><b>03</b> Tangan</figcaption></figure>
      <div class="hc-spec s1">${specimenDisc('dermatofitosis', 58)}</div>
      <div class="hc-spec s2">${specimenDisc('toksoplasmosis', 50)}</div>
    </div>`;
  },

  oneHealth() {
    const node = (id, x, y, c, soft, k, label) => `
      <g class="oh-node" role="button" tabindex="0" aria-pressed="${id === 'hewan'}" aria-label="Baca penjelasan ${label}" data-node="${id}" style="--c:${c};--soft:${soft}">
        <circle class="halo" cx="${x}" cy="${y}" r="98"/>
        <clipPath id="ohc-${id}"><circle cx="${x}" cy="${y}" r="76"/></clipPath>
        <image href="/assets/img/${PHOTO[k][0]}.jpg" x="${x - 76}" y="${y - 76}" width="152" height="152" preserveAspectRatio="xMidYMid slice" clip-path="url(#ohc-${id})"/>
        <circle class="ring" cx="${x}" cy="${y}" r="82"/>
        <text x="${x}" y="${y + 112}" text-anchor="middle">${label}</text>
      </g>`;
    return svg('0 0 600 520', 'Diagram One Health: hewan, manusia, dan lingkungan saling terhubung', `
      <rect width="600" height="520" rx="18" fill="${PAPER2}"/>
      <g fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="4 7" opacity=".45">
        <path d="M150 150Q300 52 450 150"/>
        <path d="M150 150Q108 340 300 390"/>
        <path d="M450 150Q492 340 300 390"/>
      </g>
      <text x="300" y="252" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="2.5" fill="${INK}" opacity=".55">SATU</text>
      <text x="300" y="272" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="2.5" fill="${INK}" opacity=".55">KESEHATAN</text>
      ${node('hewan', 150, 150, PINK, '#FCE7F3', 'rumput', 'Hewan')}
      ${node('manusia', 450, 150, BLUE, '#DCE7FF', 'tangan', 'Manusia')}
      ${node('lingkungan', 300, 390, LAV, '#EDE9FE', 'tanah', 'Lingkungan')}
    `);
  },

  cardArt(slug) {
    const k = { dermatofitosis: 'dielus', toksokariasis: 'anjing', toksoplasmosis: 'belang' }[slug];
    return `${img(k, 'cover', '').replace('class="photo cover"', `class="photo cover" style="object-position:${{ dermatofitosis: '50% 22%', toksokariasis: '50% 40%', toksoplasmosis: '50% 22%' }[slug]}"`)}<span class="card-spec">${specimenDisc(slug, 54)}</span>`;
  },

  stage(i) {
    const s = PLATES[i];
    return `<figure class="plate">${img(s.photo)}<span class="card-spec">${specimenDisc(s.slug, 62)}</span><figcaption>${s.cap}</figcaption></figure>`;
  },

  animalSigns(slug) {
    const k = { dermatofitosis: 'dielus', toksokariasis: 'anjing', toksoplasmosis: 'belang' }[slug];
    return `<figure class="plate sm">${img(k)}</figure>`;
  },

  riskArt() {
    const items = [['anak', 'Anak', 'hand'], ['ibu hamil', 'Ibu hamil', 'shield'], ['imunokompromais', 'Daya tahan rendah', 'vet']];
    return `<div class="risk-icons" role="img" aria-label="Kelompok yang perlu perhatian: anak, ibu hamil, dan orang dengan daya tahan tubuh rendah">${items.map(([,l,ic]) => `<div>${ART.icon(ic)}<span>${l}</span></div>`).join('')}</div>`;
  },

  screenArt() {
    return `<div class="screen-photos">${img('belang')}${img('anjing')}</div>`;
  },

  qArt(kind) {
    const k = { child: 'tanah', pregnant: 'belang', outside: 'rumput', meat: 'anjing', soil: 'tanah', skin: 'dielus', immune: 'tangan' }[kind] || 'tanah';
    return `<figure class="q-photo">${img(k, '', '')}</figure>`;
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
      ${plant(74, 86, .65)}
      <rect x="204" y="58" width="54" height="34" rx="3" fill="${PAPER}" ${st(2)}/>
      <path d="M231 58v34M204 75h54" ${st(1.4)}/>

      ${counter(392, 78, 1)}
      <rect x="502" y="52" width="54" height="72" rx="5" fill="${PAPER}" ${st(2)}/>
      <path d="M516 52v72M542 52v72" ${st(1.4)}/>
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
      <g>${spore(120, 82, PINK, .55)}</g>
      <g>${oocyst(348, 96, LAV, .55)}</g>
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
      <g>${spore(272, 166, PINK, .65)}</g>
      <g>${oocyst(326, 166, LAV, .65)}</g>
      <g>${worm(300, 194, SKY, .45)}</g>
      <path d="M92 302h276" ${st(2.4)}/>
      <text x="230" y="324" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="1.5" fill="${INK}" opacity=".55">CATATAN LAPANGAN · EDISI RUMAH</text>
    `);
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
