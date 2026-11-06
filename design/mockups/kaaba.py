import sys
D = sys.argv[1]
code = open(D + '/hub.py').read()
exec(code.split("status = '")[0], globals())
status = '<div class="status"><span>13:08</span><span>5G ▮▮▮ 71 %</span></div>'
BG = '#0F1A1C'

def lerp(p, q, t): return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)
def poly(pts): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)

def face(tl, tr, br, bl, t0, t1, u0=0, u1=1):
    """sub-quad of a face: t = down (0 top .. 1 bottom), u = across (0 left .. 1 right)"""
    L0, L1 = lerp(tl, bl, t0), lerp(tl, bl, t1)
    R0, R1 = lerp(tr, br, t0), lerp(tr, br, t1)
    return [lerp(L0, R0, u0), lerp(L0, R0, u1), lerp(L1, R1, u1), lerp(L1, R1, u0)]

def kaaba_svg(uid, w=360, h=250):
    # front face and right side, seen slightly from the left and above
    F = [(118, 96), (226, 104), (226, 204), (118, 194)]
    S = [(226, 104), (284, 93), (284, 190), (226, 204)]
    T = [(118, 96), (226, 104), (284, 93), (178, 87)]
    o = [f'<svg width="100%" viewBox="0 0 {w} {h}" style="display:block">',
         '<defs>',
         f'<radialGradient id="fade{uid}" cx="50%" cy="60%" r="55%"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>',
         f'<mask id="m{uid}"><rect width="{w}" height="{h}" fill="url(#fade{uid})"/></mask>',
         f'<radialGradient id="glow{uid}" cx="50%" cy="58%" r="50%"><stop offset="0" stop-color="#E8B04A" stop-opacity=".32"/><stop offset=".5" stop-color="#E8B04A" stop-opacity=".08"/><stop offset="1" stop-color="#E8B04A" stop-opacity="0"/></radialGradient>',
         f'<linearGradient id="kf{uid}" x1="0" x2="1"><stop offset="0" stop-color="#1B1B1D"/><stop offset="1" stop-color="#0B0B0C"/></linearGradient>',
         f'<linearGradient id="ks{uid}" x1="0" x2="1"><stop offset="0" stop-color="#0A0A0B"/><stop offset="1" stop-color="#141416"/></linearGradient>',
         f'<linearGradient id="gd{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DFA4"/><stop offset=".55" stop-color="#E8B04A"/><stop offset="1" stop-color="#B9832C"/></linearGradient>',
         f'<radialGradient id="fl{uid}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#EAF1EF" stop-opacity=".22"/><stop offset=".7" stop-color="#EAF1EF" stop-opacity=".06"/><stop offset="1" stop-color="#EAF1EF" stop-opacity="0"/></radialGradient>',
         f'<filter id="tg{uid}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
         '</defs>',
         f'<g mask="url(#m{uid})">',
         f'<rect width="{w}" height="{h}" fill="url(#glow{uid})"/>',
         # marble mataf rings
         f'<ellipse cx="204" cy="204" rx="176" ry="40" fill="url(#fl{uid})"/>',
         ''.join(f'<ellipse cx="204" cy="204" rx="{r}" ry="{r * .23:.1f}" fill="none" stroke="#EAF1EF" stroke-opacity="{.16 - i * .03:.2f}" stroke-width=".8"/>' for i, r in enumerate([120, 150, 178])),
         f'<ellipse cx="204" cy="204" rx="96" ry="13" fill="#000" opacity=".45"/>',
         # body
         f'<polygon points="{poly(T)}" fill="#202022"/>',
         f'<polygon points="{poly(F)}" fill="url(#kf{uid})"/>',
         f'<polygon points="{poly(S)}" fill="url(#ks{uid})"/>']
    # soft vertical folds of the kiswa
    for u in [.14, .3, .46, .62, .8]:
        a, b = lerp(F[0], F[1], u), lerp(F[3], F[2], u)
        o.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#fff" stroke-opacity=".035" stroke-width="5"/>')
    # gold belt (ḥizām) on both faces, with a hint of script inside
    for Q, shade in [(F, 1), (S, .75)]:
        band = face(*Q, .19, .29)
        o.append(f'<polygon points="{poly(band)}" fill="url(#gd{uid})" opacity="{shade}"/>')
        inner = face(*Q, .215, .265, .03, .97)
        o.append(f'<polygon points="{poly(inner)}" fill="#0E0E0F" opacity=".55"/>')
        for k in range(18):
            u = .05 + k * .05
            p = face(*Q, .222, .258, u, u + .03)
            o.append(f'<polygon points="{poly(p)}" fill="#E8B04A" opacity="{.75 * shade:.2f}"/>')
        # small medallions under the belt
        for u in [.25, .5, .75]:
            p = face(*Q, .33, .4, u - .035, u + .035)
            o.append(f'<polygon points="{poly(p)}" fill="none" stroke="#E8B04A" stroke-opacity="{.55 * shade:.2f}" stroke-width=".8"/>')
    # golden door on the front face, raised above the floor
    door = face(*F, .44, .9, .68, .86)
    o.append(f'<polygon points="{poly(door)}" fill="url(#gd{uid})"/>')
    dk = face(*F, .48, .86, .7, .84)
    o.append(f'<polygon points="{poly(dk)}" fill="none" stroke="#7A5418" stroke-width=".9"/>')
    mid = face(*F, .48, .86, .768, .772)
    o.append(f'<polygon points="{poly(mid)}" fill="#7A5418"/>')
    # door curtain (sitāra) hint above
    cur = face(*F, .38, .45, .65, .89)
    o.append(f'<polygon points="{poly(cur)}" fill="#0E0E0F" stroke="#E8B04A" stroke-opacity=".7" stroke-width=".7"/>')
    # Black Stone corner, silver frame
    bs = lerp(F[0], F[3], .78)
    o.append(f'<ellipse cx="{bs[0] + 4:.1f}" cy="{bs[1]:.1f}" rx="2.2" ry="3" fill="#050505" stroke="#9AA6A4" stroke-opacity=".8" stroke-width=".9"/>')
    # roof edge light
    o.append(f'<polyline points="{poly([T[3], T[0], T[1], T[2]])}" fill="none" stroke="#E8B04A" stroke-opacity=".35" stroke-width=".8"/>')
    o.append('</g>')
    # name of the Prophet ﷺ in gold over the Kaaba
    o.append(f'<text x="200" y="62" text-anchor="middle" font-family="AmiriB" font-size="50" fill="url(#gd{uid})" filter="url(#tg{uid})">محمد</text>')
    o.append('</svg>')
    return ''.join(o)

def card(t, s, gold=False):
    return f'<div class="card" style="padding:10px 14px;{"border-color:var(--gold)" if gold else ""}"><div style="font-size:14px;font-weight:700">{t}</div><div class="hint" style="font-size:11.5px;color:var(--muted);margin-top:2px">{s}</div></div>'

phone = f'''<div class="col"><div class="cap">Idag – Kaʿba ovanför menyraden</div><div class="phone">{status}
{head('Idag', 'Fredag 6 november · 26 Jumādā al-ūlā 1448', True)}
{card('Nästa bön: ʿAṣr 13:22', 'om 17 minuter · alla bönetider ›', True)}
{card('Daily Awrad', '6 av 19 klara · påminnelse 21:00 ›')}
<div style="display:flex;gap:10px"><div style="flex:1">{card('Qibla', '148° sydost ›')}</div><div style="flex:1">{card('Moskéer', 'nära dig ›')}</div></div>
<div style="margin:auto -16px -8px;position:relative">{kaaba_svg('p')}
<div style="position:absolute;left:0;right:0;bottom:0;height:40px;background:linear-gradient(180deg,rgba(15,26,28,0),{BG})"></div></div>
{tabs('Idag')}</div></div>'''

big = f'''<div class="col"><div class="cap">Bilden förstorad</div>
<div style="width:720px;background:{BG};border-radius:28px;border:1px solid #1E3236;overflow:hidden">{kaaba_svg('b')}</div>
<div style="width:720px;display:flex;flex-direction:column;gap:12px;margin-top:6px">
<div class="card"><div class="label">Så skapas den</div><div style="font-size:14px;line-height:21px;margin-top:6px">Ritad som vektorbild (SVG) i appen – inget foto. Svart kiswa med veck, guldbältet (ḥizām) med skrift, den gyllene dörren, Svarta stenen i hörnet och marmorgolvets ringar. Ett varmt guldsken bakom.</div></div>
<div class="card"><div class="label">Övertoningen</div><div style="font-size:14px;line-height:21px;margin-top:6px">En rund mask låter kanterna tona ut i bakgrundsfärgen åt alla håll, så bilden smälter in ovanför menyraden. Fungerar i både mörkt och ljust tema.</div></div>
<div class="card"><div class="label">Namnet</div><div style="font-size:14px;line-height:21px;margin-top:6px"><span class="ar" style="font-size:20px">محمد</span> i guld (Amiri) med mjukt sken, ovanför Kaʿba.</div></div></div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1260px">
<h1 class="top">Idag med Kaʿba</h1>
<p class="top">Kaʿba ovanför menyraden, tonar ut i bakgrunden, med Muḥammads ﷺ namn i guld. Bara förslag – inget är byggt.</p>
<div class="row">{phone}{big}</div></body></html>'''
open(D + '/kaaba-mockup.html', 'w').write(html)
