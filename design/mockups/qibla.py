import sys, math
D = sys.argv[1]
src = open(D + '/next-mockup.html').read()
style = src[src.index('<style>'):src.index('</style>') + 8]
status = '<div class="status"><span>15:40</span><span>5G ▮▮▮ 66 %</span></div>'
QIBLA = 148

def kaaba(x, y, s, glow):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            + (f'<circle r="30" fill="#E8B04A" opacity=".35" filter="url(#bl)"/>' if glow else '')
            + '<path d="M-14 -6 L0 -13 L14 -6 L14 12 L0 18 L-14 12 Z" fill="#111" stroke="#E8B04A" stroke-width="1.6" stroke-linejoin="round"/>'
              '<path d="M-14 -6 L0 1 L14 -6 M0 1 V18" fill="none" stroke="#E8B04A" stroke-width="1.2"/>'
              '<path d="M-14 -1.5 L0 5.5 L14 -1.5" fill="none" stroke="#E8B04A" stroke-width="2.4"/></g>')

def compass(heading, aligned):
    R = 140; C = 160
    rot = -heading            # the dial turns so north stays north
    out = [f'<svg width="320" height="320" viewBox="0 0 320 320"><defs><filter id="bl"><feGaussianBlur stdDeviation="8"/></filter>'
           f'<radialGradient id="dg" cx="50%" cy="40%"><stop offset="0" stop-color="#1E3236"/><stop offset="1" stop-color="#132225"/></radialGradient></defs>']
    if aligned:
        out.append(f'<circle cx="{C}" cy="{C}" r="{R+10}" fill="none" stroke="#E8B04A" stroke-width="10" opacity=".35" filter="url(#bl)"/>')
    out.append(f'<circle cx="{C}" cy="{C}" r="{R}" fill="url(#dg)" stroke="{"#E8B04A" if aligned else "#2A4448"}" stroke-width="2"/>')
    out.append(f'<g transform="rotate({rot} {C} {C})">')
    for d in range(0, 360, 5):
        a = math.radians(d); l = 14 if d % 30 == 0 else 7
        x1, y1 = C + (R - 6) * math.sin(a), C - (R - 6) * math.cos(a)
        x2, y2 = C + (R - 6 - l) * math.sin(a), C - (R - 6 - l) * math.cos(a)
        out.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#4E6B6F" stroke-width="{1.6 if d % 30 == 0 else .8}"/>')
    for d, t in [(0, 'N'), (90, 'Ö'), (180, 'S'), (270, 'V')]:
        a = math.radians(d); x, y = C + (R - 36) * math.sin(a), C - (R - 36) * math.cos(a)
        out.append(f'<text x="{x:.1f}" y="{y + 6:.1f}" text-anchor="middle" font-family="Jak" font-weight="700" font-size="17" fill="{"#E86A5A" if t == "N" else "#B7C6C3"}" transform="rotate({-rot} {x:.1f} {y:.1f})">{t}</text>')
    # qibla line and Kaaba on the dial
    a = math.radians(QIBLA)
    kx, ky = C + (R - 2) * math.sin(a), C - (R - 2) * math.cos(a)
    out.append(f'<line x1="{C}" y1="{C}" x2="{C + (R - 30) * math.sin(a):.1f}" y2="{C - (R - 30) * math.cos(a):.1f}" stroke="#E8B04A" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 7"/>')
    out.append(f'<g transform="rotate({-rot} {kx:.1f} {ky:.1f})">{kaaba(round(kx, 1), round(ky, 1), .9, aligned)}</g>')
    out.append('</g>')
    # fixed pointer = where the phone points
    out.append(f'<path d="M{C} 6 l-9 16 h18 z" fill="{"#E8B04A" if aligned else "#EAF1EF"}"/>')
    out.append(f'<circle cx="{C}" cy="{C}" r="44" fill="#0F1A1C" stroke="#25393D"/>')
    out.append(f'<text x="{C}" y="{C + 4}" text-anchor="middle" font-family="Jak" font-weight="700" font-size="26" fill="{"#E8B04A" if aligned else "#EAF1EF"}">{heading}°</text>'
               f'<text x="{C}" y="{C + 22}" text-anchor="middle" font-family="Jak" font-size="10.5" fill="#B7C6C3">telefonen</text>')
    out.append('</svg>')
    return ''.join(out)

def phone(cap, heading, aligned):
    diff = QIBLA - heading
    if aligned:
        msg = '<div style="font-size:20px;font-weight:700;color:var(--gold)">Du står mot Qibla</div><div class="sub">Telefonen vibrerar kort när du träffar rätt</div>'
    else:
        msg = f'<div style="font-size:20px;font-weight:700">Vrid {abs(diff)}° åt {"höger" if diff > 0 else "vänster"}</div><div class="sub">Håll telefonen plant</div>'
    return f'''<div class="col"><div class="cap">{cap}</div><div class="phone">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">Qibla</div><div class="sub">Riktning mot Kaʿba</div></div><div class="ar" style="font-size:24px;line-height:32px">ٱلْقِبْلَة</div></div>
<div class="card" style="display:flex;align-items:center;gap:10px;padding:10px 14px"><div style="flex:1"><div class="label">Plats</div><div style="font-size:14px;font-weight:700;margin-top:2px">Stockholm</div><div class="hint" style="font-size:11.5px;color:var(--muted)">vald i listan · plats-delning av</div></div>
<div style="text-align:right"><div style="font-size:22px;font-weight:700;color:var(--gold)">{QIBLA}°</div><div style="font-size:11px;color:var(--muted)">SO · 4 554 km</div></div></div>
<div style="display:flex;justify-content:center;margin-top:8px">{compass(heading, aligned)}</div>
<div style="text-align:center;margin-top:4px">{msg}</div>
<div class="card" style="padding:10px 14px;margin-top:auto;font-size:12px;line-height:18px;color:var(--muted)">Ta av magnetiskt skal. Visar kompassen fel – rör telefonen i en åtta några gånger.</div>
</div></div>'''

note = '''<div style="width:380px;display:flex;flex-direction:column;gap:14px;padding-top:40px">
<div class="card"><div class="label">Var den finns</div><div style="font-size:14px;line-height:21px;margin-top:6px">Ett Qibla-kort på Idag, och en knapp i moskékartan.</div></div>
<div class="card"><div class="label">Så fungerar det</div><div style="font-size:14px;line-height:21px;margin-top:6px">Riktningen hämtas från Aladhans Qibla-tjänst och sparas. Utan nät räknas den ut på telefonen – det blir samma gradtal. Telefonens kompass visar åt vilket håll du håller den.</div></div>
<div class="card" style="border-color:var(--gold)"><div class="label" style="color:var(--gold)">Trygghet</div><div style="font-size:14px;line-height:21px;margin-top:6px">Plats-delning är <b>av</b> från början, som mikrofonen. Då väljer man stad i en lista. Slår man på den används GPS bara när Qibla-sidan är öppen. Av/på i Inställningar.</div></div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1340px">
<h1 class="top">Qibla-kompass</h1>
<p class="top">Exempel från Stockholm: Qibla ligger 148° (sydost). Bara förslag – inget är byggt.</p>
<div class="row">{phone('1 · Fel håll – appen säger hur du ska vrida', 120, False)}{phone('2 · Rätt håll – Kaʿba lyser', 148, True)}{note}</div></body></html>'''
open(D + '/qibla-mockup.html', 'w').write(html)
