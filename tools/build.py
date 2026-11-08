"""Generate real route directories (no #hash) from tools/template.html.

Run from anywhere:  python3 tools/build.py
Each route gets its own index.html so any static host serves clean URLs.
"""
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://zoonocheck.example'  # ganti dengan domain produksi
tpl = (ROOT / 'tools/template.html').read_text(encoding='utf-8')
core = (ROOT / 'assets/js/core.js').read_text(encoding='utf-8')

entries = re.findall(r"slug: '([^']+)', name: '([^']+)'.*?\n.*?\n\s*tagline: '([^']+)'", core)

routes = {
    '': ('ZoonoCheck — Ensiklopedi zoonosis untuk rumah yang hidup',
         'ZoonoCheck memetakan jalur zoonosis pada kucing, anjing, manusia, dan lingkungan rumah. Ensiklopedi, skrining risiko, dan pengingat kebersihan yang tersimpan di perangkatmu.'),
    'ensiklopedi': ('Ensiklopedi — ZoonoCheck', 'Cari dan filter entri zoonosis berdasarkan hewan, kelompok risiko, dan jalur penularan.'),
    'skrining': ('Skrining risiko keluarga — ZoonoCheck', 'Tujuh pertanyaan singkat untuk menemukan entri edukasi yang relevan. Jawaban tidak disimpan.'),
    'pengingat': ('Pengingat kebersihan — ZoonoCheck', 'Pengingat rutinitas kebersihan rumah yang tersimpan di perangkatmu.'),
    'tentang': ('Tentang — ZoonoCheck', 'Prinsip editorial, batas produk, privasi, dan status penelaahan ZoonoCheck.'),
}
for slug, name, tag in entries:
    routes[f'ensiklopedi/{slug}'] = (f'{name} — ZoonoCheck', tag)

def render(path, title, desc):
    url = f'{BASE}/{path}/' if path else f'{BASE}/'
    return (tpl.replace('__TITLE__', escape(title)).replace('__DESC__', escape(desc, quote=True))
               .replace('__CANON__', url))

for path, (title, desc) in routes.items():
    out = ROOT / path / 'index.html' if path else ROOT / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render(path, title, desc), encoding='utf-8')
(ROOT / '404.html').write_text(render('', *routes['']), encoding='utf-8')

sitemap = ''.join(f'<url><loc>{BASE}/{p + "/" if p else ""}</loc></url>' for p in routes)
(ROOT / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sitemap}</urlset>', encoding='utf-8')
(ROOT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n', encoding='utf-8')
print('routes:', ', '.join('/' + p for p in routes))
