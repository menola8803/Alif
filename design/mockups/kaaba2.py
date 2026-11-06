import sys, random, math
D = sys.argv[1]
code = open(D + '/kaaba.py').read()
exec(code.split('def card(')[0], globals())      # hub helpers + lerp/poly/face
random.seed(7)

def kaaba2(uid, w=360, h=270):
    # nearly a cube (≈13 m high, 11–12 m wide), seen from the north-east, slightly above
    F = [(124, 98), (222, 108), (222, 226), (124, 214)]     # front (north-east wall, door + Black Stone)
    S = [(222, 108), (276, 96), (276, 210), (222, 226)]     # side
    T = [(124, 98), (222, 108), (276, 96), (178, 88)]
    g = lambda n: f'{n}{uid}'
    o = [f'<svg width="100%" viewBox="0 0 {w} {h}" style="display:block"><defs>',
         f'<radialGradient id="{g("fade")}" cx="50%" cy="58%" r="58%"><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>',
         f'<mask id="{g("m")}"><rect width="{w}" height="{h}" fill="url(#{g("fade")})"/></mask>',
         f'<linearGradient id="{g("sky")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F1A1C"/><stop offset=".55" stop-color="#1D2A2A"/><stop offset="1" stop-color="#2E2A22"/></linearGradient>',
         f'<radialGradient id="{g("lamp")}" cx="50%" cy="62%" r="60%"><stop offset="0" stop-color="#F3D9A0" stop-opacity=".38"/><stop offset=".6" stop-color="#E8B04A" stop-opacity=".07"/><stop offset="1" stop-color="#E8B04A" stop-opacity="0"/></radialGradient>',
         f'<linearGradient id="{g("kf")}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#2A2A2C"/><stop offset=".5" stop-color="#151516"/><stop offset="1" stop-color="#0A0A0A"/></linearGradient>',
         f'<linearGradient id="{g("ks")}" x1="0" x2="1"><stop offset="0" stop-color="#070707"/><stop offset="1" stop-color="#121213"/></linearGradient>',
         f'<linearGradient id="{g("gd")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE7B0"/><stop offset=".45" stop-color="#E3AE4E"/><stop offset="1" stop-color="#9C6B22"/></linearGradient>',
         f'<linearGradient id="{g("floor")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9CFCB" stop-opacity=".0"/><stop offset=".35" stop-color="#D9DEDA" stop-opacity=".35"/><stop offset="1" stop-color="#E9EDEA" stop-opacity=".55"/></linearGradient>',
         # woven fabric texture for the kiswa
         f'<filter id="{g("cloth")}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.05" numOctaves="2" seed="3" result="n"/>'
         f'<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>',
         # faint jacquard script pattern woven into the black cloth
         f'<pattern id="{g("jac")}" width="14" height="10" patternUnits="userSpaceOnUse"><path d="M1 7c2-3 4-3 6 0s4 3 6 0M3 3h3M9 3h3" stroke="#fff" stroke-opacity=".05" stroke-width=".7" fill="none"/></pattern>',
         f'<filter id="{g("blur")}"><feGaussianBlur stdDeviation="1.2"/></filter>',
         f'<filter id="{g("haze")}"><feGaussianBlur stdDeviation="6"/></filter>',
         f'<filter id="{g("tg")}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
         '</defs>', f'<g mask="url(#{g("m")})">',
         f'<rect width="{w}" height="{h}" fill="url(#{g("sky")})"/>']
    # distant arcades and minarets of al-Masjid al-Ḥarām, soft and warm-lit
    arc = ''
    for k in range(-1, 20):
        x = k * 20
        arc += f'<path d="M{x} 168 v-22 a10 10 0 0 1 20 0 v22" fill="none" stroke="#F3D9A0" stroke-opacity=".22" stroke-width="1"/>'
        arc += f'<circle cx="{x + 10}" cy="150" r="1.4" fill="#FBE7B0" opacity=".55"/>'
    o.append(f'<g filter="url(#{g("blur")})"><rect x="0" y="130" width="{w}" height="40" fill="#2B2A24" opacity=".7"/>{arc}'
             f'<rect x="0" y="128" width="{w}" height="3" fill="#F3D9A0" opacity=".12"/>'
             + ''.join(f'<path d="M{x} 130 V{y} l3 -8 3 8 V130 z" fill="#3A3833" opacity=".8"/><circle cx="{x + 3}" cy="{y + 10}" r="1.5" fill="#FBE7B0" opacity=".7"/>' for x, y in [(40, 52), (70, 60), (300, 56), (330, 48)])
             + '</g>')
    o.append(f'<rect width="{w}" height="{h}" fill="url(#{g("lamp")})"/>')
    # marble mataf floor
    o.append(f'<path d="M0 172 L{w} 172 L{w} {h} L0 {h} Z" fill="url(#{g("floor")})"/>')
    # pilgrims in ṭawāf: rings of small figures (white iḥrām and dark clothes), moving counter-clockwise
    crowd = []
    cx, cy = 200, 214
    for ring in range(9):
        rx = 92 + ring * 12; ry = rx * .24
        n = int(rx * 1.5)
        for i in range(n):
            a = random.uniform(0, 2 * math.pi)
            x = cx + rx * math.cos(a) + random.uniform(-4, 4)
            y = cy + ry * math.sin(a) + random.uniform(-2, 2)
            behind = math.sin(a) < -0.15 and 120 < x < 280
            s = .55 + (y - 170) / 100
            col = random.choice(['#F2F2EE', '#F2F2EE', '#E9E6DE', '#3B3B3B', '#5A4E3C'])
            crowd.append((behind, y, f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{1.2 * s:.2f}" ry="{2.1 * s:.2f}" fill="{col}" opacity=".85"/>'))
    o += [c for b, y, c in sorted(crowd, key=lambda t: t[1]) if b]
    # Ḥijr Ismāʿīl: low curved white wall on the north-west side (left)
    o.append(f'<path d="M124 205 C 96 206 84 216 92 226 C 100 234 118 232 130 226" fill="none" stroke="#EDEDE8" stroke-opacity=".75" stroke-width="2.6"/>')
    # shadow at the base
    o.append(f'<ellipse cx="200" cy="222" rx="96" ry="10" fill="#000" opacity=".5" filter="url(#{g("blur")})"/>')
    # marble base (shādharwān)
    o.append(f'<polygon points="{poly([(120, 214), (224, 227), (280, 211), (280, 215), (224, 232), (120, 219)])}" fill="#D9DCD8" opacity=".85"/>')
    # body with cloth texture
    for Q, fill in [(T, '#1E1E1F'), (F, f'url(#{g("kf")})'), (S, f'url(#{g("ks")})')]:
        o.append(f'<polygon points="{poly(Q)}" fill="{fill}"/>')
    for Q in (F, S):
        o.append(f'<polygon points="{poly(Q)}" fill="url(#{g("jac")})"/>')
        o.append(f'<polygon points="{poly(Q)}" fill="#000" filter="url(#{g("cloth")})"/>')
    # soft fabric folds + light from the left
    for u in [.08, .2, .33, .47, .58, .73, .9]:
        a, b = lerp(F[0], F[1], u), lerp(F[3], F[2], u)
        o.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#fff" stroke-opacity=".03" stroke-width="{random.choice([3, 4, 6])}"/>')
    # gold belt (ḥizām), about a third from the top, with embroidered script panels
    for Q, shade in [(F, 1), (S, .7)]:
        band = face(*Q, .24, .32)
        o.append(f'<polygon points="{poly(band)}" fill="url(#{g("gd")})" opacity="{shade}"/>')
        for k in range(7):
            u0 = .02 + k * .14
            p = face(*Q, .255, .305, u0, u0 + .12)
            o.append(f'<polygon points="{poly(p)}" fill="#141414" opacity=".72"/>')
            for j in range(6):
                q = face(*Q, .262 + (j % 2) * .012, .298 - (j % 3) * .006, u0 + .01 + j * .018, u0 + .02 + j * .018)
                o.append(f'<polygon points="{poly(q)}" fill="#F3D9A0" opacity="{.8 * shade:.2f}"/>')
        # embroidered roundels and lanterns under the belt
        for u in [.18, .5, .82]:
            p = face(*Q, .36, .43, u - .05, u + .05)
            o.append(f'<polygon points="{poly(p)}" fill="none" stroke="#E3AE4E" stroke-opacity="{.6 * shade:.2f}" stroke-width=".7"/>')
            p2 = face(*Q, .375, .415, u - .03, u + .03)
            o.append(f'<polygon points="{poly(p2)}" fill="#E3AE4E" opacity="{.25 * shade:.2f}"/>')
    # golden door, raised about 2 m above the floor, close to the Black Stone corner
    o.append(f'<polygon points="{poly(face(*F, .43, .5, .56, .82))}" fill="#0C0C0C" stroke="#E3AE4E" stroke-width=".7"/>')  # sitāra top
    o.append(f'<polygon points="{poly(face(*F, .5, .84, .6, .78))}" fill="url(#{g("gd")})"/>')
    o.append(f'<polygon points="{poly(face(*F, .53, .81, .62, .688))}" fill="none" stroke="#8B5E1C" stroke-width=".7"/>')
    o.append(f'<polygon points="{poly(face(*F, .53, .81, .692, .76))}" fill="none" stroke="#8B5E1C" stroke-width=".7"/>')
    for t in [.58, .65, .72]:
        o.append(f'<polygon points="{poly(face(*F, t, t + .03, .64, .74))}" fill="#FBE7B0" opacity=".6"/>')
    # Black Stone in its silver frame at the east corner, about 1.5 m up
    bs = lerp(F[3], F[0], .14); bs = (bs[0] + 3, bs[1])
    o.append(f'<ellipse cx="{bs[0]:.1f}" cy="{bs[1]:.1f}" rx="2.6" ry="3.4" fill="#C9D0CE" opacity=".9"/><ellipse cx="{bs[0]:.1f}" cy="{bs[1]:.1f}" rx="1.4" ry="2" fill="#080808"/>')
    # rim light on the corner and roof edge
    o.append(f'<line x1="{F[1][0]}" y1="{F[1][1]}" x2="{F[2][0]}" y2="{F[2][1]}" stroke="#F3D9A0" stroke-opacity=".18" stroke-width="1"/>')
    o.append(f'<polyline points="{poly([T[3], T[0], T[1], T[2]])}" fill="none" stroke="#F3D9A0" stroke-opacity=".28" stroke-width=".8"/>')
    # pilgrims in front
    o += [c for b, y, c in sorted(crowd, key=lambda t: t[1]) if not b and y > 205]
    # warm haze
    o.append(f'<ellipse cx="200" cy="175" rx="170" ry="40" fill="#F3D9A0" opacity=".06" filter="url(#{g("haze")})"/>')
    o.append('</g>')
    o.append('</svg>')
    return ''.join(o)

def art(uid, big=False):
    ts, fs = (30, 40) if big else (15, 21)
    gold = 'background:linear-gradient(180deg,#FBE7B0,#E3AE4E 55%,#9C6B22);-webkit-background-clip:text;color:transparent;'
    return (f'<div style="position:relative">{kaaba2(uid)}'
            f'<div style="position:absolute;left:0;right:0;top:{"5%" if big else "3%"};text-align:center">'
            f'<div style="font-family:Jak;font-weight:700;font-size:{ts}px;letter-spacing:.2px;{gold}filter:drop-shadow(0 0 {ts//4}px rgba(232,176,74,.5))">Allāhumma ṣalli ʿalā sayyidinā Muḥammad</div>'
            f'<div style="font-family:AmiriB;direction:rtl;font-size:{fs}px;line-height:1.55;{gold}filter:drop-shadow(0 0 {fs//6}px rgba(232,176,74,.45))">اللّٰهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّد</div></div></div>')

def card(t, s, gold=False):
    return f'<div class="card" style="padding:10px 14px;{"border-color:var(--gold)" if gold else ""}"><div style="font-size:14px;font-weight:700">{t}</div><div class="hint" style="font-size:11.5px;color:var(--muted);margin-top:2px">{s}</div></div>'

phone = f'''<div class="col"><div class="cap">&nbsp;</div><div class="phone">{status}
{head('Idag', 'Fredag 6 november · 26 Jumādā al-ūlā 1448', True)}
{card('Nästa bön: ʿAṣr 13:22', 'om 17 minuter · alla bönetider ›', True)}
{card('Daily Awrad', '6 av 19 klara · påminnelse 21:00 ›')}
<div style="display:flex;gap:10px"><div style="flex:1">{card('Qibla', '148° sydost ›')}</div><div style="flex:1">{card('Moskéer', 'nära dig ›')}</div></div>
<div style="margin:auto -16px -10px;position:relative">{art('p')}
<div style="position:absolute;left:0;right:0;bottom:0;height:46px;background:linear-gradient(180deg,rgba(15,26,28,0),{BG})"></div></div>
{tabs('Idag')}</div></div>'''

big = f'''<div class="col"><div class="cap">Bilden förstorad</div>
<div style="width:760px;background:{BG};border-radius:28px;border:1px solid #1E3236;overflow:hidden">{art('b', True)}</div>
<div class="card" style="width:760px;margin-top:6px"><div class="label">Mer verklighetstroget</div><div style="font-size:14px;line-height:21px;margin-top:6px">Rätt proportioner (nästan en kub), vävd struktur i kiswan, guldbältet en tredjedel ned, dörren högt upp nära Svarta stenen, Ḥijr Ismāʿīl, marmorgolvet, pilgrimer i ṭawāf, moskéns valv och minareter i fjärran – och kvällsljus. Allt tonar ut i bakgrunden.</div></div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1290px">
<h1 class="top">Remember Allah ʿazza wa jall</h1>

<div class="row">{phone}{big}</div></body></html>'''
open(D + '/kaaba2-mockup.html', 'w').write(html)
