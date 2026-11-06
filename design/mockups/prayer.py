import sys
D = sys.argv[1]
src = open(D + '/next-mockup.html').read()
style = src[src.index('<style>'):src.index('</style>') + 8]
style = style.replace('</style>', '''
.row2{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px}
.row2:last-child{border-bottom:0}
.seg{display:flex;background:var(--chip);border-radius:12px;padding:3px;gap:3px}
.seg div{flex:1;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--muted)}
.seg .on{background:var(--card);border:1px solid var(--gold);color:var(--gold)}
.sw{width:42px;height:24px;border-radius:12px;background:var(--chip);border:1px solid var(--line);position:relative;flex:none}
.sw i{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:8px;background:#6B7F7C}
.sw.on{background:rgba(232,176,74,.3);border-color:var(--gold)}
.sw.on i{left:21px;background:var(--gold)}
.chev{color:var(--muted);font-size:18px}
</style>''')
status = '<div class="status"><span>13:05</span><span>5G ▮▮▮ 66 %</span></div>'
prayers = [('Fajr', 'الفجر', '05:46', 0), ('Shurūq', 'الشروق', '07:39', 0), ('Ẓuhr', 'الظهر', '11:51', 0), ('ʿAṣr', 'العصر', '13:22', 1), ('Maghrib', 'المغرب', '15:58', 0), ('ʿIshāʾ', 'العشاء', '17:44', 0)]

rows = ''
for n, ar, t, on in prayers:
    st = 'color:var(--gold);font-weight:700' if on else ''
    bell = '' if n == 'Shurūq' else ('🔔' if n != 'Ẓuhr' else '<span style="opacity:.35">🔕</span>')
    rows += (f'<div class="row2" style="{st}{";background:rgba(232,176,74,.08);margin:0 -14px;padding:10px 14px" if on else ""}"><span style="width:80px">{n}</span>'
             f'<span class="ar" style="flex:1;font-size:18px;line-height:20px;text-align:left;{"color:var(--gold)" if on else ""}">{ar}</span><span style="font-size:15px">{t}</span><span style="width:26px;text-align:right">{bell}</span></div>')

p1 = f'''<div class="col"><div class="cap">1 · Idag – nästa bön överst</div><div class="phone">{status}
<div class="hdr"><div style="flex:1"><div style="font-size:22px;font-weight:700">Fredag 6 november</div><div class="sub">26 Jumādā al-ūlā 1448 · Stockholm</div></div></div>
<div class="card" style="border-color:var(--gold);background:linear-gradient(180deg,rgba(232,176,74,.14),var(--card));padding:16px">
 <div class="label" style="color:var(--gold)">Nästa bön</div>
 <div style="display:flex;align-items:baseline;gap:10px;margin-top:4px"><div style="font-size:30px;font-weight:700">ʿAṣr</div><div class="ar" style="font-size:26px">العصر</div><div style="margin-left:auto;font-size:30px;font-weight:700;color:var(--gold)">13:22</div></div>
 <div class="sub">om 17 minuter</div></div>
<div class="card" style="padding:4px 14px">{rows}</div>
<div style="font-size:10.5px;color:var(--muted);text-align:center">Aladhan · Muslim World League · ʿaṣr Ḥanafī · sparas för hela månaden</div>
</div></div>'''

p2 = f'''<div class="col"><div class="cap">2 · Inställningar › Bönetider</div><div class="phone" style="gap:10px">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1;font-size:19px;font-weight:700">Bönetider</div></div>
<div class="label">Plats</div>
<div class="card" style="padding:2px 14px">
 <div class="row2"><span style="flex:1">Land</span><b>Sverige</b><span class="chev">›</span></div>
 <div class="row2"><span style="flex:1">Stad</span><b>Stockholm</b><span class="chev">›</span></div>
 <div class="row2"><span style="flex:1">Använd min plats<div style="font-size:11px;color:var(--muted)">av från början</div></span><div class="sw"><i></i></div></div></div>
<div class="label">Beräkning</div>
<div class="card" style="padding:2px 14px">
 <div class="row2"><span style="flex:1">Metod<div style="font-size:11px;color:var(--muted)">Fajr 18° · ʿIshāʾ 17°</div></span><b>Muslim World League</b><span class="chev">›</span></div>
 <div style="padding:10px 0 4px;font-size:14px">ʿAṣr</div>
 <div class="seg" style="margin-bottom:10px"><div>Standard</div><div class="on">Ḥanafī</div></div>
 <div style="padding:4px 0 4px;font-size:14px">Höga breddgrader <span style="font-size:11px;color:var(--muted)">– sommarnätter</span></div>
 <div class="seg" style="margin-bottom:12px"><div class="on">Vinkel</div><div>Mitt i natten</div><div>1/7 natt</div></div></div>
<div class="label">Påminnelser</div>
<div class="card" style="padding:2px 14px">
 <div class="row2"><span style="flex:1">Avisering vid varje bön</span><div class="sw on"><i></i></div></div>
 <div class="row2"><span style="flex:1">Justera minuter</span><b style="color:var(--muted)">0 min</b><span class="chev">›</span></div></div>
</div></div>'''

cities = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Umeå', 'Luleå']
cl = ''.join(f'<div class="row2"><span style="flex:1;{"color:var(--gold);font-weight:700" if c == "Stockholm" else ""}">{c}</span>{"<b style=color:var(--gold)>✓</b>" if c == "Stockholm" else ""}</div>' for c in cities)
p3 = f'''<div class="col"><div class="cap">3 · Välj land och stad</div><div class="phone" style="gap:10px">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1;font-size:19px;font-weight:700">Stad</div></div>
<div class="card" style="padding:10px 14px;display:flex;gap:10px;align-items:center"><span style="color:var(--muted)">⌕</span><span style="color:var(--muted);font-size:14px">Sök stad …</span></div>
<div style="display:flex;gap:8px"><div class="card" style="padding:8px 12px;font-size:13px;border-color:var(--gold);color:var(--gold);font-weight:700">🇸🇪 Sverige ›</div><div class="sub" style="align-self:center">byt land</div></div>
<div class="card" style="padding:2px 14px">{cl}</div>
</div></div>'''

note = '''<div style="width:380px;display:flex;flex-direction:column;gap:14px;padding-top:40px">
<div class="card"><div class="label">Så hämtas tiderna</div><div style="font-size:14px;line-height:21px;margin-top:6px">Från Aladhans bönetids-tjänst med stad och land, metod Muslim World League. En hel månad hämtas och sparas, så tiderna finns utan nät. Utan nät och utan sparad månad räknar telefonen själv med samma metod.</div></div>
<div class="card"><div class="label">Standard</div><div style="font-size:14px;line-height:21px;margin-top:6px">Sverige · Stockholm · MWL. Man kan välja annat land och annan stad, eller slå på "Använd min plats" (av från början).</div></div>
<div class="card" style="border-color:var(--gold)"><div class="label" style="color:var(--gold)">Att bestämma</div><div style="font-size:13.5px;line-height:20px;margin-top:6px">• ʿAṣr: Ḥanafī eller Standard som förval?<br>• Höga breddgrader: på sommaren når solen inte 18° under horisonten i Sverige. Aladhan kan då räkna med vinkel, mitten av natten eller en sjundedel av natten – vilken ska vara förval?</div></div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1760px">
<h1 class="top">Bönetider – Muslim World League</h1>
<p class="top">Hämtas från Aladhan. Förval Stockholm, välj land och stad. Tiderna är exempel för 6 november – bara förslag, inget är byggt.</p>
<div class="row">{p1}{p2}{p3}{note}</div></body></html>'''
open(D + '/prayer-mockup.html', 'w').write(html)
