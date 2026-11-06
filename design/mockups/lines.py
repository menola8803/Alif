import sys, json
D = sys.argv[1]
code = open(D + '/map.py').read()
exec(code.split('svg = [f\'<svg')[0], globals())   # style, tabs, outline, projection P, pin(), places
status = '<div class="status"><span>15:40</span><span>5G ▮▮▮ 66 %</span></div>'

def hhmm(t):
    h = int(t); m = int(round((t - h) * 60))
    if m == 60: h, m = h + 1, 0
    return f'{h}:{m:02d}'

def lerp(a, b, f): return tuple(int(a[i] + (b[i] - a[i]) * f) for i in range(3))

def mapsvg(lines, now, tmin, tmax, title):
    W, H = 366, 600
    clip = f'<clipPath id="sv{title}"><path d="{poly(outline)}"/><path d="{poly(gotland)}"/><path d="{poly(oland)}"/></clipPath>'
    out = [f'<svg width="100%" height="100%" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" style="display:block"><defs>{clip}<filter id="gl{title}"><feGaussianBlur stdDeviation="3"/></filter></defs>',
           f'<rect width="{W}" height="{H}" fill="#0E2226"/>',
           f'<path d="{poly(outline)}" fill="#1B2F31" stroke="#3B5A5E" stroke-width="1.2" stroke-linejoin="round"/>',
           f'<path d="{poly(gotland)}" fill="#1B2F31" stroke="#3B5A5E"/><path d="{poly(oland)}" fill="#1B2F31" stroke="#3B5A5E"/>',
           f'<g clip-path="url(#sv{title})">']
    labels = []
    for ln in lines:
        t = ln['t']
        pts = [P(lo, la) for lo, la in ln['pts']]
        d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
        f = (t - tmin) / (tmax - tmin)
        col = lerp((95, 196, 180), (232, 176, 74), max(0, min(1, f)))
        is_now = abs(t - now) < 1e-6
        passed = t < now
        if is_now:
            out.append(f'<path d="{d}" stroke="#E8B04A" stroke-width="9" opacity=".45" fill="none" filter="url(#gl{title})"/>')
            out.append(f'<path d="{d}" stroke="#F3D9A0" stroke-width="2.6" fill="none"/>')
        else:
            on_hour = abs((t * 60) % 30) < 1e-6
            out.append(f'<path d="{d}" stroke="rgb{col}" stroke-width="{1.5 if on_hour else 0.9}" stroke-dasharray="{"" if on_hour else "3 3"}" opacity="{0.35 if passed else 0.9}" fill="none"/>')
        if abs((t * 60) % 30) < 1e-6 or is_now:
            # label at the point that is furthest east inside the map (lines run roughly north-south)
            inside = [p for p in pts if p[0] < 290] or pts
            x, y = max(inside, key=lambda p: p[0] - abs(p[1] - 330) * 0.3)
            labels.append((x, y, hhmm(t), is_now, col))
    out.append('</g>')
    for x, y, txt, is_now, col in labels:
        bg = '#E8B04A' if is_now else '#132225'
        fg = '#0F1A1C' if is_now else f'rgb{col}'
        x = min(x + 4, 366 - (74 if is_now else 40))
        out.append(f'<rect x="{x-1}" y="{y-9}" width="{36 if not is_now else 70}" height="16" rx="8" fill="{bg}" stroke="rgb{col}" stroke-width=".8"/>'
                   f'<text x="{x+ (17 if not is_now else 34)}" y="{y+3}" text-anchor="middle" font-family="Jak" font-weight="700" font-size="9.5" fill="{fg}">{txt if not is_now else "nu " + txt}</text>')
    # a few towns for orientation
    for name, lon, lat in [('Malmö', 13.0, 55.6), ('Göteborg', 11.97, 57.71), ('Stockholm', 18.07, 59.33), ('Umeå', 20.26, 63.83), ('Kiruna', 20.22, 67.86)]:
        x, y = P(lon, lat)
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="#EAF1EF"/><text x="{x - 6:.1f}" y="{y + 4:.1f}" text-anchor="end" font-family="Jak" font-weight="600" font-size="10" fill="#EAF1EF">{name}</text>')
    out.append('</svg>')
    return ''.join(out)

maghrib = json.load(open(D + '/maghrib.json'))
fajr = json.load(open(D + '/fajr.json'))
chips = lambda on: ''.join(f'<div style="flex:1;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;{"background:var(--card);border:1px solid var(--gold);color:var(--gold)" if n == on else "color:var(--muted)"}">{n}</div>' for n in ['Fajr', 'Ẓuhr', 'ʿAṣr', 'Maghrib', 'ʿIshāʾ'])

def phone(cap, prayer, lines, now, tmin, tmax, sheet, slider_label, slider_pos):
    return f'''<div class="col"><div class="cap">{cap}</div><div class="phone" style="padding-bottom:14px">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">Bönetider på kartan</div><div class="sub">Fredag 6 november · 26 Jumādā al-ūlā 1448</div></div></div>
<div style="display:flex;background:var(--chip);border-radius:13px;padding:3px;gap:3px">{chips(prayer)}</div>
<div style="position:relative;border-radius:20px;overflow:hidden;border:1px solid var(--line);flex:1">{mapsvg(lines, now, tmin, tmax, prayer)}
  <div style="position:absolute;left:10px;top:10px;background:rgba(11,20,22,.8);border:1px solid var(--line);border-radius:12px;padding:8px 10px;font-size:11px;line-height:16px;color:var(--ink);max-width:170px">
   <b style="color:var(--gold)">Varje linje</b> = samma tid för {prayer}.<br>Linje var 10:e minut,<br>hel linje varje halvtimme.</div>
  <div style="position:absolute;right:8px;bottom:6px;font-size:9px;color:#B7C6C3;background:rgba(11,20,22,.7);padding:2px 6px;border-radius:6px">© OpenStreetMap-bidragsgivare</div>
</div>
{sheet}
<div style="display:flex;align-items:center;gap:10px"><span class="hint">▶</span><div style="flex:1;height:6px;border-radius:3px;background:var(--chip);position:relative"><div style="position:absolute;left:0;top:0;height:6px;width:{slider_pos}%;border-radius:3px;background:var(--gold)"></div><div style="position:absolute;left:calc({slider_pos}% - 9px);top:-6px;width:18px;height:18px;border-radius:9px;background:#F3D9A0;border:2px solid var(--gold)"></div></div><span style="font-size:12px;font-weight:700;color:var(--gold)">{slider_label}</span></div>
</div></div>'''

sheet1 = '''<div style="background:var(--card);border:1px solid var(--gold);border-radius:16px;padding:10px 12px;display:flex;gap:10px;align-items:center">
 <div style="flex:1"><div style="font-size:13.5px;font-weight:700">Maghrib-linjen är vid Stockholm nu</div><div class="hint">Når Göteborg 16:16 och Malmö 16:20 · Kiruna hade den 14:37</div></div></div>'''
sheet2 = '''<div style="background:var(--card);border:1px solid var(--line);border-radius:16px;padding:10px 12px">
 <div style="font-size:13.5px;font-weight:700">Fajr i morgon bitti</div><div class="hint">Kiruna 4:48 · Stockholm 4:57 · Malmö 5:17 (MWL, 18°)</div></div>'''

p1 = phone('1 · Maghrib – solnedgången sveper över Sverige', 'Maghrib', maghrib, 15 + 40/60, 14 + 30/60, 16 + 20/60, sheet1, 'nu 15:40', 62)
p2 = phone('2 · Byt bön: Fajr', 'Fajr', fajr, -1, 4 + 40/60, 5 + 20/60, sheet2, '5:00', 35)

note = '''<div style="width:390px;display:flex;flex-direction:column;gap:14px;padding-top:40px">
<div class="card"><div class="label">Så fungerar det</div><div style="font-size:14px;line-height:21px;margin-top:6px">Bönetiden räknas ut på telefonen för varje punkt i Sverige ur solens läge. Punkter med samma tid binds ihop till en linje – som höjdkurvor på en karta, fast för tid.</div></div>
<div class="card"><div class="label">Det smarta</div><div style="font-size:14px;line-height:21px;margin-top:6px">• Den <b style="color:var(--gold)">lysande linjen</b> är där bönen är just nu – den flyttar sig av sig själv.<br>• Linjer som redan har passerat är dämpade.<br>• Tryck på en plats för exakt tid där.<br>• Dra i reglaget för att se hur linjen rör sig under dagen.</div></div>
<div class="card"><div class="label">Exemplet</div><div style="font-size:14px;line-height:21px;margin-top:6px">Linjerna är verkligen uträknade för 6 november 2026 (svensk tid). I november går solnedgången först i norr och sist i sydväst.</div></div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1340px">
<h1 class="top">Bönetider som linjer över Sverige</h1>
<p class="top">Linjer med samma bönetid, uträknade för fredag 6 november 2026. Välj bön överst.</p>
<div class="row">{p1}{p2}{note}</div></body></html>'''
open(D + '/lines-mockup.html', 'w').write(html)
