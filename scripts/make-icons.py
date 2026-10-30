# Draws the Alif app icons into app/assets (needs Pillow and numpy; fonts come from the app's font packages).
#   python3 scripts/make-icons.py
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', 'app')
OUT = os.path.join(ROOT, 'assets')
AMIRI = os.path.join(ROOT, 'node_modules/@expo-google-fonts/amiri/700Bold/Amiri_700Bold.ttf')
GOLD, GOLD_DIM, GOLD_PALE, MINT, BG = (232, 176, 74), (138, 109, 46), (243, 217, 160), (95, 196, 180), (11, 20, 22)
S = 4  # supersampling

def background(size):
    y, x = np.mgrid[0:size, 0:size]
    d = np.sqrt((x - size / 2) ** 2 + (y - size * 0.45) ** 2) / (size * 0.65)
    c0, c1, c2 = np.array([29, 74, 80]), np.array([17, 37, 40]), np.array(BG)
    t = np.clip(d, 0, 1)[..., None]
    col = np.where(t < 0.62, c0 + (c1 - c0) * (t / 0.62), c1 + (c2 - c1) * ((t - 0.62) / 0.38))
    img = Image.fromarray(col.astype('uint8'), 'RGB').convert('RGBA')
    # faint gold halo around the ring
    halo = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    r = size * 0.43
    hd.ellipse([size / 2 - r, size / 2 - r, size / 2 + r, size / 2 + r], outline=GOLD + (70,), width=int(size * 0.05))
    return Image.alpha_composite(img, halo.filter(ImageFilter.GaussianBlur(size * 0.03)))

def star(d, cx, cy, r, color, w):
    s = r / math.sqrt(2)
    d.polygon([(cx - s, cy - s), (cx + s, cy - s), (cx + s, cy + s), (cx - s, cy + s)], outline=color, width=w)
    d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], outline=color, width=w)

def rhombus(d, cx, cy, r, color):
    d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=color)

def mark(size, k, mono=False):
    n = size * S
    img = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = n / 2
    R = 300 * S * k * size / 1024
    g = (255, 255, 255, 255) if mono else GOLD + (255,)
    gd = (255, 255, 255, 140) if mono else GOLD_DIM + (255,)
    d.ellipse([c - R, c - R, c + R, c + R], outline=g, width=int(34 * S * k * size / 1024))
    star(d, c, c, R * 0.74, gd, int(10 * S * k * size / 1024))
    font = ImageFont.truetype(AMIRI, int(560 * S * k * size / 1024))
    d.text((c, c + R * 0.08), 'ا', font=font, fill=g, anchor='mm')
    o = R * math.cos(math.pi / 4)
    rr = 42 * S * k * size / 1024
    rhombus(d, c - o, c - o, rr * 1.3, (255, 255, 255, 255) if mono else MINT + (255,))
    rhombus(d, c + o, c + o, rr * 1.3, (255, 255, 255, 255) if mono else GOLD_PALE + (255,))
    return img.resize((size, size), Image.LANCZOS)

def save(img, name):
    img.save(os.path.join(OUT, name)); print('wrote', name)

os.makedirs(OUT, exist_ok=True)
bg = background(1024)
save(Image.alpha_composite(bg, mark(1024, 1)).convert('RGB'), 'icon.png')
save(bg.convert('RGB'), 'android-icon-background.png')
save(mark(1024, 0.62), 'android-icon-foreground.png')
save(mark(1024, 0.62, mono=True), 'android-icon-monochrome.png')
save(Image.new('RGBA', (200, 200), (0, 0, 0, 0)), 'splash-blank.png')
save(Image.alpha_composite(background(192), mark(192, 1)).resize((48, 48), Image.LANCZOS), 'favicon.png')
