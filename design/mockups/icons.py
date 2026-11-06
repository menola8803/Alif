import sys, re
D = sys.argv[1]
src = open(D + '/next-mockup.html').read()
style = src[src.index('<style>'):src.index('</style>') + 8]
G = '#E8B04A'; M = '#B7C6C3'


def icons(c, fill):
    return {
        'Skriv': f'<path d="M17.5 3.5c1.6-.4 3.2 1.2 2.8 2.8L10 16.6 6.5 17.5l.9-3.5z" fill="{fill}" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 6l3 3" stroke="{c}" stroke-width="1.6" stroke-linecap="round"/><path d="M4 21h16" stroke="{c}" stroke-width="1.6" stroke-linecap="round"/>',
        'Koranen': f'<path d="M12 7.5c-2.2-1.6-5.2-2-8.5-1.5v11.5c3.3-.5 6.3 0 8.5 1.5 2.2-1.5 5.2-2 8.5-1.5V6c-3.3-.5-6.3-.1-8.5 1.5z" fill="{fill}" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 7.5V19" stroke="{c}" stroke-width="1.6"/><path d="M5 21.5l7-3 7 3" stroke="{c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M15 10.5l1.2-1.2 1.2 1.2-1.2 1.2z" fill="{c}"/>',
        'Lär dig': f'<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="{fill}" stroke="{c}" stroke-width="1.6"/><path d="M15.5 7.5v8" stroke="{c}" stroke-width="2" stroke-linecap="round"/><path d="M7 13.2c0 1.6 1.2 2.3 3 2.3s3-.7 3-2.3" stroke="{c}" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M9.6 17.6l.6-.6.6.6-.6.6z" fill="{c}"/>',
        'Lyssna': f'<rect x="9" y="3" width="6" height="11" rx="3" fill="{fill}" stroke="{c}" stroke-width="1.6"/><path d="M6 10.5a6 6 0 0 0 12 0M12 16.5V20M9 20.5h6" stroke="{c}" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M3 8v5M21 8v5" stroke="{c}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>',
        'Bild': f'<path d="M4 20V10a8 8 0 0 1 16 0v10z" fill="{fill}" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 20l5-5 3 3 3-4 5 6" stroke="{c}" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M14.6 6.4a2.2 2.2 0 1 0 1.6 3.4 1.7 1.7 0 1 1-1.6-3.4z" fill="{c}"/>',
        'Kamera': f'<rect x="3" y="7" width="18" height="13" rx="3" fill="{fill}" stroke="{c}" stroke-width="1.6"/><path d="M8.5 7l1.3-2.5h4.4L15.5 7" stroke="{c}" stroke-width="1.6" stroke-linejoin="round" fill="none"/><circle cx="12" cy="13.5" r="3.6" stroke="{c}" stroke-width="1.6" fill="none"/><circle cx="12" cy="13.5" r="1.2" fill="{c}"/><circle cx="18" cy="10" r=".9" fill="{c}"/>',
    }


names = ['Skriv', 'Koranen', 'Lär dig', 'Lyssna', 'Bild', 'Kamera']
desc = ['Qalam (penna)', 'Öppen muṣḥaf på bokställ (rahle)', 'Alif och bāʾ i en bricka', 'Mikrofon med ljudvågor', 'Spetsbåge med halvmåne', 'Kamera med lins']


def bar(active, big=1.0):
    h = '<div style="display:flex;gap:4px;background:linear-gradient(180deg,#1A2B2E,#132225);border:1px solid #2A4448;border-radius:26px;padding:6px;box-shadow:0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04)">'
    for n in names:
        on = n == active
        ic = icons(G if on else M, 'rgba(232,176,74,.22)' if on else 'rgba(183,198,195,.08)')[n]
        bg = ('background:radial-gradient(120% 120% at 50% 0%,rgba(232,176,74,.20),rgba(232,176,74,.04));border:1px solid rgba(232,176,74,.55);box-shadow:0 0 18px rgba(232,176,74,.18)'
              if on else 'border:1px solid transparent')
        dot = (f'<div style="width:16px;height:3px;border-radius:2px;background:{G};margin-top:3px;box-shadow:0 0 8px {G}"></div>'
               if on else '<div style="height:6px"></div>')
        h += (f'<div style="flex:1;height:{int(64*big)}px;border-radius:20px;{bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">'
              f'<svg width="{int(25*big)}" height="{int(25*big)}" viewBox="0 0 24 24">{ic}</svg>'
              f'<div style="font-size:{10*big:.1f}px;font-weight:{700 if on else 600};color:{G if on else M};letter-spacing:.2px">{n}</div>{dot}</div>')
    return h + '</div>'


v = open(D + '/v040-mockup.html').read()
i = v.index('<div class="tabs">')
seg = v[i:]; depth = 0; k = 0
for m in re.finditer(r'<div|</div>', seg):
    depth += 1 if m.group(0) == '<div' else -1
    if depth == 0:
        k = m.end(); break
old_html = seg[:k]

big = ''.join(
    f'<div style="display:flex;flex-direction:column;align-items:center;gap:10px">'
    f'<div style="width:96px;height:96px;border-radius:28px;background:radial-gradient(120% 120% at 50% 0%,rgba(232,176,74,.20),#172629);border:1px solid rgba(232,176,74,.5);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(232,176,74,.15)">'
    f'<svg width="54" height="54" viewBox="0 0 24 24">{icons(G, "rgba(232,176,74,.22)")[n]}</svg></div>'
    f'<div style="font-size:14px;font-weight:600;color:#EAF1EF">{n}</div>'
    f'<div style="font-size:11.5px;color:#8FA5A2;text-align:center;width:150px">{d}</div></div>'
    for n, d in zip(names, desc))

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1180px">
<h1 class="top">Nya ikoner i flikraden</h1>
<p class="top">Tvåtonade ikoner i guld med mjuk fyllning och en lysande markering under den valda fliken.</p>
<div style="display:flex;gap:26px;justify-content:space-between;margin:10px 4px 34px">{big}</div>
<div class="label" style="margin:0 0 8px 4px">Nu</div>
<div style="width:420px;height:86px;transform:scale(1.33);transform-origin:left top;margin-bottom:18px">{old_html}</div>
<div class="label" style="margin:14px 0 10px 4px">Nya – Koranen vald</div>
<div style="width:560px;margin-bottom:22px">{bar("Koranen", 1.15)}</div>
<div class="label" style="margin:0 0 10px 4px">Nya – Bild vald</div>
<div style="width:560px">{bar("Bild", 1.15)}</div>
</body></html>'''
open(D + '/icons-mockup.html', 'w').write(html)
