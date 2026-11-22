from pathlib import Path
import re

root = Path('.')
head = (root / '_head.html').read_text(encoding='utf-8')
body = (root / '_body.html').read_text(encoding='utf-8')
js = ''.join((root / f'_js{i}.html').read_text(encoding='utf-8') for i in range(1, 5))
fraunces = (root / 'fraunces.b64').read_text().strip()
inter = (root / 'inter.b64').read_text().strip()
bricolage = (root / 'bricolage.b64').read_text().strip()
head = (head.replace('__FRAUNCES__', fraunces)
            .replace('__INTER__', inter)
            .replace('__BRICOLAGE__', bricolage))
html = head + body + js
(root / 'index.html').write_text(html, encoding='utf-8')
print('wrote index.html', len(html), 'chars')
# extract JS for syntax checking
m = re.search(r'<script>\n(.*)\n</script>', js, re.S)
if m:
    (root / '_check.js').write_text(m.group(1), encoding='utf-8')
    print('js chars', len(m.group(1)))
