import numpy as np, sys
from PIL import Image
D = sys.argv[1]
BG = np.array([15, 26, 28], float) / 255
def ss(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
for i in range(1, 14):
    im = np.asarray(Image.open(f'{D}/bilder/b{i:02d}.jpg').convert('RGB'), float) / 255
    mx, mn = im.max(2), im.min(2)
    L = .2126 * im[..., 0] + .7152 * im[..., 1] + .0722 * im[..., 2]
    S = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    # white / light-grey areas (sky, marble, white walls, iḥrām) – but not gold or coloured parts
    w = ss(.36, .72, L) * (1 - ss(.18, .42, S))
    # light blue / grey-blue sky and haze
    blue = ss(.35, .65, L) * ss(.02, .12, im[..., 2] - im[..., 0])
    w = np.maximum(w, blue)
    w = np.clip(w * 1.1, 0, 1)[..., None]
    # the rest is darkened a little so it sits on the dark theme
    base = im * .82
    out = base * (1 - w) + BG * w
    Image.fromarray((np.clip(out, 0, 1) * 255).astype('uint8')).save(f'{D}/bilder/t{i:02d}.jpg', quality=88)
