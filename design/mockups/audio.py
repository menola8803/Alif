import sys
D = sys.argv[1]
code = open(D + '/hub.py').read()
exec(code.split("status = '")[0], globals())
status = '<div class="status"><span>13:08</span><span>5G ▮▮▮ 71 %</span></div>'
G = '#E8B04A'

DL = f'<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" stroke="{G}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
OK = '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="rgba(95,196,180,.15)" stroke="#5FC4B4" stroke-width="1.6"/><path d="M8 12.3l2.6 2.6L16 9.5" stroke="#5FC4B4" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'
def ring(p): return (f'<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#25393D" stroke-width="2.4"/>'
                     f'<circle cx="12" cy="12" r="9" fill="none" stroke="{G}" stroke-width="2.4" stroke-dasharray="{56.5 * p:.1f} 60" transform="rotate(-90 12 12)" stroke-linecap="round"/></svg>')
hl = 'box-shadow:0 0 0 3px rgba(232,176,74,.35),0 0 18px rgba(232,176,74,.45);border-radius:12px'

def tap(n): return f'<div style="position:absolute;top:-14px;left:-22px;width:24px;height:24px;border-radius:12px;background:#E86A5A;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.6);z-index:5">{n}</div>'

rows = [(1, 'al-Fātiḥa', 'الفاتحة', '7 verser', 'ok', '0,6 MB'), (2, 'al-Baqara', 'البقرة', '286 verser', 'ring', '48 / 112 MB'),
        (3, 'Āl ʿImrān', 'آل عمران', '200 verser', 'dl', '64 MB'), (18, 'al-Kahf', 'الكهف', '110 verser', 'ok', '22 MB'),
        (36, 'Yā-Sīn', 'يس', '83 verser', 'dl', '14 MB'), (67, 'al-Mulk', 'الملك', '30 verser', 'dl', '6 MB')]
lst = ''
for i, (n, tr, ar, v, st, mb) in enumerate(rows):
    icn = {'ok': OK, 'ring': ring(.43), 'dl': DL}[st]
    mark = f'<div style="position:relative">{tap(1) if i == 2 else ""}<div style="{hl + ";padding:6px" if i == 2 else "padding:6px"}">{icn}</div></div>'
    lst += (f'<div class="card" style="padding:9px 12px;display:flex;align-items:center;gap:10px"><div style="width:26px;font-size:12px;font-weight:700;color:var(--muted);text-align:center">{n}</div>'
            f'<div style="flex:1"><div style="font-size:14px;font-weight:700">{tr}</div><div style="font-size:11px;color:var(--muted)">{v} · {mb}</div></div>'
            f'<div class="ar" style="font-size:20px">{ar}</div>{mark}</div>')

p1 = f'''<div class="col"><div class="cap">1 · Koranen – nedladdning per sura</div><div class="phone">{status}
{head('Koranen', '114 suror · al-Ḥuṣarī')}
{lst}
<div style="display:flex;gap:12px;font-size:11px;color:var(--muted);padding:0 4px;align-items:center"><span style="display:flex;gap:4px;align-items:center">{OK} nedladdad</span><span style="display:flex;gap:4px;align-items:center">{ring(.43)} laddar</span><span style="display:flex;gap:4px;align-items:center">{DL} ladda ner</span></div>
{tabs('Koranen')}</div></div>'''

verse = lambda n, ar, tr, sv, on=False: (f'<div class="card" style="padding:10px 12px;{"border-color:var(--gold);background:var(--chip)" if on else ""}"><div class="ar" style="font-size:24px;line-height:44px;text-align:right">{ar} <span style="font-size:15px;color:var(--gold)">﴿{n}﴾</span></div>'
                                         f'<div style="font-size:13px;color:var(--mint);margin-top:2px">{tr}</div><div style="font-size:12.5px;margin-top:3px">{sv}</div></div>')
player = (f'<div style="margin-top:auto;background:linear-gradient(180deg,#1A2B2E,#132225);border:1px solid #2A4448;border-radius:22px;padding:10px 12px;display:flex;align-items:center;gap:10px">'
          f'<div style="width:44px;height:44px;border-radius:22px;background:{G};display:flex;align-items:center;justify-content:center;color:#0F1A1C;font-size:16px">❚❚</div>'
          f'<div style="flex:1"><div style="font-size:13px;font-weight:700">Yā-Sīn · vers 2 av 83</div><div style="font-size:11px;color:var(--muted)">al-Ḥuṣarī · strömmas</div>'
          f'<div style="height:4px;border-radius:2px;background:var(--chip);margin-top:6px"><div style="width:6%;height:4px;border-radius:2px;background:{G}"></div></div></div>'
          f'<div style="position:relative">{tap(2)}<div style="{hl};padding:8px;background:var(--card);border:1px solid var(--gold)">{DL}</div></div></div>')
p2 = f'''<div class="col"><div class="cap">2 · Inne i suran – spelaren nertill</div><div class="phone">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">Yā-Sīn</div><div class="sub">36 · 83 verser</div></div><div class="ar" style="font-size:26px;line-height:34px">يس</div></div>
{verse(1, 'يسٓ', 'yā-sīn', 'Yā Sīn.')}
{verse(2, 'وَٱلْقُرْءَانِ ٱلْحَكِيمِ', 'wa-l-qurʾāni l-ḥakīm', 'Vid Koranen, full av visdom!', True)}
{verse(3, 'إِنَّكَ لَمِنَ ٱلْمُرْسَلِينَ', 'innaka la-mina l-mursalīn', 'Du är förvisso en av sändebuden')}
{player}
</div></div>'''

st = f'''<div class="col"><div class="cap">3 · Inställningar › Recitation</div><div class="phone" style="gap:10px">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1;font-size:19px;font-weight:700">Recitation</div></div>
<div class="card" style="padding:4px 14px">
''' + ''.join(f'<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px;{"color:var(--gold);font-weight:700" if i == 0 else ""}"><span style="flex:1">{n}</span>{"✓" if i == 0 else ""}</div>' for i, n in enumerate(['Maḥmūd Khalīl al-Ḥuṣarī', 'Muḥammad Ṣiddīq al-Minshāwī', 'Mishary Rāshid al-ʿAfāsī', 'ʿAbd al-Bāsiṭ ʿAbd aṣ-Ṣamad', 'ʿAbd ar-Raḥmān as-Sudays', 'fler …'])) + f'''</div>
<div class="label">Nedladdat</div>
<div class="card" style="padding:12px 14px"><div style="display:flex"><span style="flex:1;font-size:14px">3 suror</span><b>70 MB</b></div>
<div style="height:6px;border-radius:3px;background:var(--chip);margin-top:8px"><div style="width:7%;height:6px;border-radius:3px;background:{G}"></div></div>
<div style="font-size:11px;color:var(--muted);margin-top:6px">Hela Koranen ≈ 1 GB</div></div>
<div class="card" style="padding:2px 14px">
 <div style="display:flex;align-items:center;padding:11px 0;border-bottom:1px solid var(--line);font-size:14px"><span style="flex:1">Ladda ner bara på wifi</span><div style="width:42px;height:24px;border-radius:12px;background:rgba(232,176,74,.3);border:1px solid var(--gold);position:relative"><i style="position:absolute;top:3px;left:21px;width:16px;height:16px;border-radius:8px;background:{G}"></i></div></div>
 <div style="display:flex;align-items:center;padding:11px 0;font-size:14px;color:#E86A5A"><span style="flex:1">Ta bort nedladdat ljud</span>›</div></div>
</div></div>'''

note = f'''<div style="width:330px;display:flex;flex-direction:column;gap:14px;padding-top:40px">
<div class="card"><div style="display:flex;gap:10px;align-items:flex-start">{tap(1).replace("position:absolute;top:-14px;left:-22px;", "position:relative;flex:none;")}<div style="font-size:14px;line-height:21px">I suralistan: tryck på pilen till höger om suran. En ring visar hur långt det har kommit, sedan en grön bock.</div></div></div>
<div class="card"><div style="display:flex;gap:10px;align-items:flex-start">{tap(2).replace("position:absolute;top:-14px;left:-22px;", "position:relative;flex:none;")}<div style="font-size:14px;line-height:21px">Inne i suran: pilen i spelaren nertill laddar ner suran man lyssnar på.</div></div></div>
<div class="card"><div style="font-size:14px;line-height:21px">Utan nedladdning strömmas ljudet. Byt recitatör och ta bort nedladdat ljud under Inställningar › Recitation.</div></div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1700px">
<h1 class="top">Ladda ner recitation</h1>
<p class="top">Röda siffror visar var man trycker. Bara förslag – inget är byggt.</p>
<div class="row">{p1}{p2}{st}{note}</div></body></html>'''
open(D + '/audio-mockup.html', 'w').write(html)
