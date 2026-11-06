import sys
D = sys.argv[1]
code = open(D + '/hub.py').read()
exec(code.split("status = '")[0], globals())
status = '<div class="status"><span>13:08</span><span>5G ▮▮▮ 71 %</span></div>'

six_icons = {
    'Skriv': lambda c, f: nib(c, f) + arabic(c),
    'Koranen': lambda c, f: ic('Koranen', c, f),
    'Lär dig': lambda c, f: ic('Lär dig', c, f),
    'Lyssna': lambda c, f: f'<rect x="9" y="3" width="6" height="11" rx="3" fill="{f}" stroke="{c}" stroke-width="1.6"/><path d="M6 10.5a6 6 0 0 0 12 0M12 16.5V20M9 20.5h6" stroke="{c}" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
    'Bild': lambda c, f: f'<path d="M4 20V10a8 8 0 0 1 16 0v10z" fill="{f}" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 20l5-5 3 3 3-4 5 6" stroke="{c}" stroke-width="1.6" fill="none"/>',
    'Kamera': lambda c, f: f'<rect x="3" y="7" width="18" height="13" rx="3" fill="{f}" stroke="{c}" stroke-width="1.6"/><path d="M8.5 7l1.3-2.5h4.4L15.5 7" stroke="{c}" stroke-width="1.6" fill="none"/><circle cx="12" cy="13.5" r="3.6" stroke="{c}" stroke-width="1.6" fill="none"/>',
}

def tabs6(active):
    h = '<div style="margin-top:auto;display:flex;gap:2px;background:linear-gradient(180deg,#1A2B2E,#132225);border:1px solid #2A4448;border-radius:24px;padding:5px">'
    for n, fn in six_icons.items():
        on = n == active
        bg = ('background:radial-gradient(120% 120% at 50% 0%,rgba(232,176,74,.20),rgba(232,176,74,.04));border:1px solid rgba(232,176,74,.55)' if on else 'border:1px solid transparent')
        h += (f'<div style="flex:1;height:58px;border-radius:19px;{bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px">'
              f'<svg width="21" height="21" viewBox="0 0 24 24">{fn(G if on else M, "rgba(232,176,74,.22)" if on else "rgba(183,198,195,.08)")}</svg>'
              f'<div style="font-size:9px;font-weight:{700 if on else 600};color:{G if on else M}">{n}</div></div>')
    return h + '</div>'

def card(t, s, gold=False):
    return f'<div class="card" style="padding:10px 14px;{"border-color:var(--gold)" if gold else ""}"><div style="font-size:14px;font-weight:700">{t}</div><div class="hint" style="font-size:11.5px;color:var(--muted);margin-top:2px">{s}</div></div>'

segA = ''.join(f'<div style="flex:1;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;{"background:var(--card);border:1px solid var(--gold);color:var(--gold)" if n == "Bild" else "color:var(--muted)"}">{n}</div>' for n in ['Skriv', 'Lyssna', 'Bild', 'Kamera', 'Fil'])

pA = f'''<div class="col"><div class="cap">A · Fem flikar (förslag)</div><div class="phone">{status}
{head('Idag', 'Fredag 6 november · 26 Jumādā al-ūlā 1448', True)}
{card('Nästa bön: ʿAṣr 13:22', 'om 17 minuter · alla bönetider ›', True)}
{card('Daily Awrad', '6 av 19 klara · påminnelse 21:00 ›')}
<div style="display:flex;gap:10px"><div style="flex:1">{card('Qibla', '148° sydost ›')}</div><div style="flex:1">{card('Moskéer', 'nära dig ›')}</div></div>
{card('Kommande', 'Rajab ≈ 10 dec · om 34 dagar ›')}
<div class="label" style="margin-top:6px">Fliken Översätt – fem sätt överst</div>
<div style="display:flex;background:var(--chip);border-radius:14px;padding:4px;gap:4px">{segA}</div>
{tabs('Idag')}</div></div>'''

pB = f'''<div class="col"><div class="cap">B · Sex flikar som nu, Bild bredvid Kamera</div><div class="phone">{status}
{head('Koranen', '114 suror', True)}
{card('Nästa bön: ʿAṣr 13:22', 'måste ligga här eller under kugghjulet', True)}
{card('Daily Awrad', 'kort på Koranen, som idag')}
<div style="display:flex;gap:10px"><div style="flex:1">{card('Qibla', 'kort här')}</div><div style="flex:1">{card('Dhikr', 'kort här')}</div></div>
{card('Al-Fātiḥa', '1 · 7 verser')}
{card('Al-Baqara', '2 · 286 verser')}
<div class="hint" style="text-align:center;font-size:11.5px;color:var(--muted)">Ingen egen plats för det dagliga – allt hamnar som kort på Koranen</div>
{tabs6('Bild')}</div></div>'''

def lst(title, rows, gold):
    r = ''.join(f'<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--line);font-size:13px"><b style="width:96px;color:{"var(--gold)" if gold else "var(--ink)"}">{a}</b><span style="flex:1;color:var(--muted)">{b}</span></div>' for a, b in rows)
    return f'<div class="card" style="{"border-color:var(--gold)" if gold else ""}"><div class="label" style="{"color:var(--gold)" if gold else ""}">{title}</div><div style="margin-top:4px">{r}</div></div>'

note = '<div style="width:420px;display:flex;flex-direction:column;gap:14px;padding-top:40px">' + lst('A · var allt finns', [
    ('Idag', 'datum, bönetider, Awrad, Qibla, moskéer, heliga dagar'),
    ('Koranen', 'suror, recitation, bokmärken, ḥifẓ'),
    ('Översätt', 'Skriv · Lyssna · Bild · Kamera · Fil'),
    ('Lär dig', 'Iqraʾa, repetitionskort'),
    ('Dhikr', 'räknare, Awrad, Ihdāʾ, ṣalawāt'),
    ('⚙︎', 'inställningar, historik, manual, uppdatering')], True) + lst('B · var allt finns', [
    ('4 flikar', 'Skriv · Lyssna · Bild · Kamera'),
    ('Koranen', 'suror + kort för bön, Awrad, Qibla, Dhikr'),
    ('Lär dig', 'Iqraʾa'),
    ('⚙︎', 'inställningar, historik, manual, uppdatering')], False) + '''
<div class="card"><div class="label">Skillnaden</div><div style="font-size:14px;line-height:21px;margin-top:6px">A ger det dagliga (bön, Awrad, dhikr) egna platser och samlar översättningen i en flik. B behåller dagens flikar men fyra av sex blir översättning, och resten trängs på Koranen.</div></div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1340px">
<h1 class="top">Flikarna: fem eller sex?</h1>
<p class="top">Samma innehåll, två sätt att ordna det. Bara förslag – inget är byggt.</p>
<div class="row">{pA}{pB}{note}</div></body></html>'''
open(D + '/compare-mockup.html', 'w').write(html)
