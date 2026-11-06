import sys
D = sys.argv[1]
code = open(D + '/hub.py').read()
exec(code.split("status = '")[0], globals())
status = '<div class="status"><span>13:08</span><span>5G ▮▮▮ 71 %</span></div>'
BG = '#0F1A1C'
gold = 'background:linear-gradient(180deg,#FBE7B0,#E3AE4E 55%,#9C6B22);-webkit-background-clip:text;color:transparent;'

def card(t, s, g=False):
    return f'<div class="card" style="padding:10px 14px;{"border-color:var(--gold)" if g else ""}"><div style="font-size:14px;font-weight:700">{t}</div><div class="hint" style="font-size:11.5px;color:var(--muted);margin-top:2px">{s}</div></div>'

def phone(cap, img, pos, n):
    art = (f'<div style="flex:1;margin:0 -16px -6px;position:relative;min-height:0">'
           f'<div style="position:absolute;inset:0;background:url(bilder/{img}) {pos}/cover;'
           f'-webkit-mask-image:radial-gradient(ellipse 75% 70% at 50% 50%,#000 40%,transparent 100%);mask-image:radial-gradient(ellipse 75% 70% at 50% 50%,#000 40%,transparent 100%)"></div>'
           f'<div style="position:absolute;inset:0;background:linear-gradient(180deg,{BG} 0%,rgba(15,26,28,.35) 22%,rgba(15,26,28,0) 45%,rgba(15,26,28,0) 70%,{BG} 100%)"></div>'
           f'<div style="position:absolute;left:0;right:0;top:10px;text-align:center">'
           f'<div style="font-family:Jak;font-weight:700;font-size:15px;{gold}filter:drop-shadow(0 1px 3px rgba(0,0,0,.9))">Allāhumma ṣalli ʿalā sayyidinā Muḥammad</div>'
           f'<div style="font-family:AmiriB;direction:rtl;font-size:22px;line-height:1.55;{gold}filter:drop-shadow(0 1px 3px rgba(0,0,0,.9))">اللّٰهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّد</div></div>'
           f'<div style="position:absolute;right:22px;bottom:16px;font-size:10px;font-weight:700;color:#F3D9A0;background:rgba(15,26,28,.6);border:1px solid rgba(232,176,74,.4);border-radius:9px;padding:3px 8px">{n} / 13</div></div>')
    return f'''<div class="col"><div class="cap">{cap}</div><div class="phone">{status}
{head('Idag', 'Fredag 6 november · 26 Jumādā al-ūlā 1448', True)}
{card('Nästa bön: ʿAṣr 13:22', 'om 17 minuter · alla bönetider ›', True)}
{card('Daily Awrad', '6 av 19 klara · påminnelse 21:00 ›')}
<div style="display:flex;gap:10px"><div style="flex:1">{card('Qibla', '148° sydost ›')}</div><div style="flex:1">{card('Moskéer', 'nära dig ›')}</div></div>
{art}
{tabs('Idag')}</div></div>'''

p1 = phone('Bild 13 – vitt golv borta', 't13.jpg', '50% 45%', 13)
p2 = phone('Bild 4 – ljus himmel borta', 't04.jpg', '50% 55%', 4)
p3 = phone('Bild 1', 't01.jpg', '50% 42%', 1)

thumbs = ''.join(f'<div style="width:74px;height:112px;border-radius:12px;background:url(bilder/t{i:02d}.jpg) center/cover;border:1px solid {"#E8B04A" if i in (1, 4, 13) else "#25393D"};position:relative">'
                 f'<span style="position:absolute;left:5px;bottom:4px;font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 3px #000">{i}</span></div>' for i in range(1, 14))

ba = ''.join(f'<div style="display:flex;gap:6px;align-items:center"><img src="bilder/b{i:02d}.jpg" style="height:190px;border-radius:10px"><span style="color:var(--gold);font-size:20px">→</span><img src="bilder/t{i:02d}.jpg" style="height:190px;border-radius:10px"></div>' for i in (13, 4, 10))
html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1340px">
<h1 class="top">Remember Allah ʿazza wa jall</h1>
<p class="top">Vita och ljusgrå delar (himmel, marmor, väggar) tonas över i bakgrundsfärgen. Svart, guld och grönt behålls.</p><div class="row" style="margin-top:14px">{p1}{p2}{p3}</div>
<div class="card" style="margin-top:22px;width:1284px"><div class="label">Alla 13 efter toningen – en slumpas fram varje gång man trycker på Idag</div>
<div style="display:flex;gap:22px;margin-top:12px;flex-wrap:wrap">{thumbs}</div></div>
<div class="card" style="margin-top:22px;width:1284px"><div class="label">Före och efter</div><div style="display:flex;gap:16px;margin-top:12px">{ba}</div></div></body></html>'''
open(D + '/slump2-mockup.html', 'w').write(html)
