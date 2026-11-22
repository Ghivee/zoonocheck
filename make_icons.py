from PIL import Image, ImageDraw
import math, base64, os

os.makedirs('icons', exist_ok=True)
S = 1024
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
r = int(S * 0.22)
d.rounded_rectangle([0, 0, S - 1, S - 1], radius=r, fill='#1D4ED8')
cx = cy = S // 2
d.ellipse([cx - 300, cy - 300, cx + 300, cy + 300], fill='#F6F0E4')
d.ellipse([cx - 176, cy - 176, cx + 176, cy + 176], outline='#1D4ED8', width=46)
d.ellipse([cx - 62, cy - 62, cx + 62, cy + 62], fill='#EC4899')
for a in (-90, 30, 150):
    x1 = cx + math.cos(math.radians(a)) * 214
    y1 = cy + math.sin(math.radians(a)) * 214
    x2 = cx + math.cos(math.radians(a)) * 258
    y2 = cy + math.sin(math.radians(a)) * 258
    d.line([x1, y1, x2, y2], fill='#12211D', width=24)
img.resize((512, 512), Image.LANCZOS).save('icons/icon-512.png')
img.resize((192, 192), Image.LANCZOS).save('icons/icon-192.png')

m = Image.new('RGBA', (S, S), '#1D4ED8')
md = ImageDraw.Draw(m)
md.ellipse([cx - 236, cy - 236, cx + 236, cy + 236], fill='#F6F0E4')
md.ellipse([cx - 140, cy - 140, cx + 140, cy + 140], outline='#1D4ED8', width=38)
md.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], fill='#EC4899')
for a in (-90, 30, 150):
    x1 = cx + math.cos(math.radians(a)) * 170
    y1 = cy + math.sin(math.radians(a)) * 170
    x2 = cx + math.cos(math.radians(a)) * 204
    y2 = cy + math.sin(math.radians(a)) * 204
    md.line([x1, y1, x2, y2], fill='#12211D', width=20)
m.resize((512, 512), Image.LANCZOS).save('icons/icon-maskable-512.png')

for n in ['fraunces', 'inter']:
    b = open(n + '.woff2', 'rb').read()
    open(n + '.b64', 'w').write(base64.b64encode(b).decode())
    print(n, len(b), len(base64.b64encode(b)))
print('icons ok')
