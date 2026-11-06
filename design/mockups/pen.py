import sys
sys.path.insert(0, sys.argv[1])
D = sys.argv[1]
src = open(D + '/next-mockup.html').read()
style = src[src.index('<style>'):src.index('</style>') + 8]
G = '#E8B04A'; M = '#B7C6C3'

# A classic dip-pen nib (steel nib with slit and breather hole) held at an angle, writing toward the lower left.
def nib(c, fill):
    # The whole old dip pen: a long tapered holder with a grip, a metal ferrule and a small steel nib with slit and
    # breather hole. Drawn upright with the tip at (12, 26), turned 45 degrees so the tip rests on the line at (5.6, 19).
    return (f'<g transform="translate(5.6 19) rotate(45) scale(.9) translate(-12 -26)">'
            f'<path d="M10.25 17 L9.75 11 L10.75 1.4 Q12 0 13.25 1.4 L14.25 11 L13.75 17 Z" fill="{fill}" stroke="{c}" stroke-width="1.35" stroke-linejoin="round"/>'
            f'<path d="M10 12.6 H14 M10.1 14.4 H13.9" stroke="{c}" stroke-width=".9" stroke-linecap="round" opacity=".75"/>'
            f'<rect x="9.9" y="17" width="4.2" height="2.1" rx=".5" fill="{c}"/>'
            f'<path d="M12 26 L10 21.2 Q9.8 19.7 10.3 19.1 H13.7 Q14.2 19.7 14 21.2 Z" fill="{fill}" stroke="{c}" stroke-width="1.2" stroke-linejoin="round"/>'
            f'<path d="M12 25.5 V21.7" stroke="{c}" stroke-width=".9" stroke-linecap="round"/>'
            f'<circle cx="12" cy="21" r=".6" fill="{c}"/>'
            f'</g>')

def wave(c):
    return f'<path d="M6.6 20.2 q1.15 -1.4 2.3 0 t2.3 0 t2.3 0 t2.3 0 t2.3 0" fill="none" stroke="{c}" stroke-width="1.2" stroke-linecap="round"/>'

def arabic(c):
    # a thin naskh-like stroke written from the right and ending at the nib: a long kashida, a tooth and a dot below
    return (f'<path d="M22.2 16.2 c.3 1.6 -.6 2.9 -2.4 3.2 c-2.6 .5 -7.2 .6 -14 -.5" fill="none" stroke="{c}" stroke-width="1.1" stroke-linecap="round"/>'
            f'<path d="M15 19.7 c.1 -.9 -.1 -1.6 -.5 -2.1" fill="none" stroke="{c}" stroke-width="1" stroke-linecap="round"/>'
            f'<path d="M13.2 21.9 l.6 -.6 .6 .6 -.6 .6 z" fill="{c}"/>')

def drop(c):
    return f'<path d="M5.2 20.3 c-.7 .9 -1.05 1.5 -1.05 2 a1.05 1.05 0 0 0 2.1 0 c0 -.5 -.35 -1.1 -1.05 -2 z" fill="{c}"/>'

variants = [
    ('B', 'Hela bläckpennan + tunn arabisk skrift', lambda c, f: nib(c, f) + arabic(c)),
]

def tile(svg, size=54):
    return (f'<div style="width:110px;height:110px;border-radius:30px;background:radial-gradient(120% 120% at 50% 0%,rgba(232,176,74,.20),#172629);'
            f'border:1px solid rgba(232,176,74,.5);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(232,176,74,.15)">'
            f'<svg width="{size}" height="{size}" viewBox="0 0 24 24">{svg}</svg></div>')

def tabbar(svg_on, svg_off_name='Skriv'):
    others = ['Koranen', 'Lär dig', 'Lyssna', 'Bild', 'Kamera']
    off = {
        'Koranen': f'<path d="M12 7.5c-2.2-1.6-5.2-2-8.5-1.5v11.5c3.3-.5 6.3 0 8.5 1.5 2.2-1.5 5.2-2 8.5-1.5V6c-3.3-.5-6.3-.1-8.5 1.5z" fill="rgba(183,198,195,.08)" stroke="{M}" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 7.5V19" stroke="{M}" stroke-width="1.6"/><path d="M5 21.5l7-3 7 3" stroke="{M}" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
        'Lär dig': f'<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="rgba(183,198,195,.08)" stroke="{M}" stroke-width="1.6"/><path d="M15.5 7.5v8" stroke="{M}" stroke-width="2" stroke-linecap="round"/><path d="M7 13.2c0 1.6 1.2 2.3 3 2.3s3-.7 3-2.3" stroke="{M}" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
        'Lyssna': f'<rect x="9" y="3" width="6" height="11" rx="3" fill="rgba(183,198,195,.08)" stroke="{M}" stroke-width="1.6"/><path d="M6 10.5a6 6 0 0 0 12 0M12 16.5V20M9 20.5h6" stroke="{M}" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
        'Bild': f'<path d="M4 20V10a8 8 0 0 1 16 0v10z" fill="rgba(183,198,195,.08)" stroke="{M}" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 20l5-5 3 3 3-4 5 6" stroke="{M}" stroke-width="1.6" fill="none"/>',
        'Kamera': f'<rect x="3" y="7" width="18" height="13" rx="3" fill="rgba(183,198,195,.08)" stroke="{M}" stroke-width="1.6"/><circle cx="12" cy="13.5" r="3.6" stroke="{M}" stroke-width="1.6" fill="none"/>',
    }
    h = ('<div style="display:flex;gap:4px;background:linear-gradient(180deg,#1A2B2E,#132225);border:1px solid #2A4448;border-radius:26px;padding:6px;width:560px">'
         '<div style="flex:1;height:74px;border-radius:20px;background:radial-gradient(120% 120% at 50% 0%,rgba(232,176,74,.20),rgba(232,176,74,.04));border:1px solid rgba(232,176,74,.55);box-shadow:0 0 18px rgba(232,176,74,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">'
         f'<svg width="29" height="29" viewBox="0 0 24 24">{svg_on}</svg><div style="font-size:11.5px;font-weight:700;color:{G}">Skriv</div>'
         f'<div style="width:16px;height:3px;border-radius:2px;background:{G};margin-top:3px;box-shadow:0 0 8px {G}"></div></div>')
    for n in others:
        h += (f'<div style="flex:1;height:74px;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">'
              f'<svg width="29" height="29" viewBox="0 0 24 24">{off[n]}</svg><div style="font-size:11.5px;font-weight:600;color:{M}">{n}</div><div style="height:6px"></div></div>')
    return h + '</div>'

cols = ''
for key, name, fn in variants:
    on = fn(G, 'rgba(232,176,74,.22)')
    offv = fn(M, 'rgba(183,198,195,.08)')
    cols += (f'<div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:560px">'
             f'<div style="display:flex;gap:22px;align-items:center">{tile(on, 64)}<div style="display:flex;flex-direction:column;gap:10px;align-items:center">'
             f'<div style="width:56px;height:56px;border-radius:18px;background:#172629;border:1px solid #2A4448;display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 24 24">{offv}</svg></div>'
             f'<div style="font-size:11px;color:#8FA5A2">ej vald</div></div></div>'
             f'<div style="font-size:17px;font-weight:700;color:#F3D9A0">{key} · {name}</div>'
             f'{tabbar(on)}</div>')

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1780px">
<h1 class="top">Skriv-ikonen: gammal bläckpenna</h1>
<p class="top">Hela pennan: skaft med grepp, metallring och stålspets – och ett tunt arabiskt drag.</p>
<div style="display:flex;gap:30px;margin-top:20px">{cols}</div>
</body></html>'''
open(D + '/pen-mockup.html', 'w').write(html)
