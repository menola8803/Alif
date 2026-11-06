import sys, datetime as dt
D = sys.argv[1]
src = open(D + '/next-mockup.html').read()
style = src[src.index('<style>'):src.index('</style>') + 8]
style = style.replace('</style>', '''
.mrow{display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:14px;background:var(--card);border:1px solid var(--line)}
.mrow .n{width:22px;font-size:12px;font-weight:700;color:var(--muted);text-align:center}
.mrow .ar{font-size:20px;width:108px;text-align:right;line-height:24px}
.mrow .t{flex:1;min-width:0}
.mrow .t b{font-size:13px;display:block}
.mrow .t span{font-size:10.5px;color:var(--muted);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.badge{font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:8px;white-space:nowrap}
.gb{background:rgba(232,176,74,.16);color:var(--gold);border:1px solid rgba(232,176,74,.5)}
.mb{background:rgba(95,196,180,.12);color:var(--mint);border:1px solid rgba(95,196,180,.45)}
.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.wd{font-size:10.5px;font-weight:700;color:var(--muted);text-align:center;padding-bottom:2px}
.day{height:50px;border-radius:12px;background:var(--card);border:1px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}
.day b{font-size:16px}
.day span{font-size:9.5px;color:var(--muted)}
.day.today{background:var(--gold);border-color:var(--gold)}
.day.today b,.day.today span{color:#0F1A1C}
.day i{position:absolute;top:5px;right:6px;width:5px;height:5px;border-radius:3px;background:var(--mint)}
.dk{display:flex;align-items:center;gap:8px;padding:5px 10px;border-radius:14px;background:var(--card);border:1px solid var(--line)}
.dk .ar{font-size:17px;line-height:22px}
.dk .t{flex:1;min-width:0}
.dk .t b{font-size:12.5px;display:block}
.dk .t span{font-size:10px;color:var(--muted);display:block;white-space:nowrap}
.cnt{font-size:12px;font-weight:700;color:var(--gold);background:var(--chip);border-radius:10px;padding:4px 8px;white-space:nowrap}
.btn{flex:1;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
</style>''')
status = '<div class="status"><span>15:40</span><span>5G ▮▮▮ 66 %</span></div>'

# ---------- phone 1: month view ----------
start = dt.date(2026, 10, 12)       # 1 Jumādā al-ūlā 1448 (Monday)
today = 26
days = 29
cells = '<div class="wd">Mån</div><div class="wd">Tis</div><div class="wd">Ons</div><div class="wd">Tor</div><div class="wd">Fre</div><div class="wd">Lör</div><div class="wd">Sön</div>'
for h in range(1, days + 1):
    g = start + dt.timedelta(days=h - 1)
    cls = 'day today' if h == today else 'day'
    dot = '<i></i>' if g.weekday() in (0, 3) and h != today else ''
    gl = f'{g.day} {"okt" if g.month == 10 else "nov"}' if g.day == 1 or h == 1 else str(g.day)
    cells += f'<div class="{cls}">{dot}<b>{h}</b><span>{gl}</span></div>'

p1 = f'''<div class="col"><div class="cap">1 · Månaden – hijri först, svenskt datum under</div><div class="phone">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">Hijri-kalender</div><div class="sub">Fredag 6 november 2026</div></div>
<div class="back" style="font-size:15px">☰</div></div>
<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 4px">
 <div class="back">‹</div>
 <div style="text-align:center"><div class="ar" style="font-size:34px;line-height:44px">جُمَادَىٰ ٱلْأُولَىٰ ١٤٤٨</div>
 <div style="font-size:14px;font-weight:700">Jumādā al-ūlā 1448</div><div class="hint" style="font-size:11.5px;color:var(--muted)">5:e månaden · 12 okt – 9 nov</div></div>
 <div class="back">›</div></div>
<div class="grid">{cells}</div>
<div style="display:flex;gap:12px;font-size:10.5px;color:var(--muted);padding:0 4px"><span><b style="color:var(--mint)">●</b> mån/tor – sunnafasta</span><span><b style="color:var(--gold)">■</b> idag</span></div>
<div class="card" style="padding:12px 14px"><div class="label">Denna månad</div>
 <div style="font-size:13.5px;line-height:19px;margin-top:5px">Inga extra övningar i källorna för Jumādā – fortsätt med <b style="color:var(--gold)">Daily Awrad</b>.</div></div>
<div class="card" style="padding:12px 14px;border-color:var(--gold);background:linear-gradient(180deg,rgba(232,176,74,.12),var(--card))">
 <div style="display:flex;align-items:center;gap:10px"><div style="flex:1"><div class="label" style="color:var(--gold)">Kommande helig månad</div>
 <div style="font-size:15px;font-weight:700;margin-top:3px">Rajab <span class="ar" style="font-size:20px">رَجَب</span></div>
 <div style="font-size:11.5px;color:var(--muted)">≈ 10 december · om 34 dagar</div></div><div class="chev" style="font-size:22px;color:var(--gold)">›</div></div></div>
</div></div>'''

# ---------- phone 2: the 12 months ----------
months = [
    (1, 'مُحَرَّم', 'Muḥarram', 'ʿĀshūrāʾ 10:e · Ikhlāṣ ×1000 · Ḥasbuna-llāh ×70', 'h p'),
    (2, 'صَفَر', 'Ṣafar', 'Ḥizb al-wiqāya · sista onsdagen: ṣadaqa, 2+4 rakʿa', 'p'),
    (3, 'رَبِيع ٱلْأَوَّل', 'Rabīʿ al-awwal', 'Mawlid · ṣalawāt 100–1000 · 12:e natten', 'p'),
    (4, 'رَبِيع ٱلْآخِر', 'Rabīʿ al-ākhir', 'Daily Awrad', ''),
    (5, 'جُمَادَىٰ ٱلْأُولَىٰ', 'Jumādā al-ūlā', 'Daily Awrad', 'now'),
    (6, 'جُمَادَىٰ ٱلْآخِرَة', 'Jumādā al-ākhira', 'Daily Awrad', ''),
    (7, 'رَجَب', 'Rajab', 'Allahs månad · istighfār, tasbīḥ, Miʿrāj 27:e', 'h p'),
    (8, 'شَعْبَان', 'Shaʿbān', 'Profetens ﷺ månad · 15:e natten: Yā-Sīn ×3', 'p'),
    (9, 'رَمَضَان', 'Ramaḍān', 'Fasta · tarāwīḥ · Laylat al-qadr', 'p'),
    (10, 'شَوَّال', 'Shawwāl', 'ʿĪd al-fiṭr 1:a', ''),
    (11, 'ذُو ٱلْقَعْدَة', 'Dhū al-qaʿda', 'Daily Awrad', 'h'),
    (12, 'ذُو ٱلْحِجَّة', 'Dhū al-ḥijja', 'Fasta 1–9 · ʿArafa 9:e · qurbān', 'h p'),
]
rows = ''
for n, ar, tr, note, f in months:
    b = ''
    if 'p' in f: b += '<b style="color:var(--gold);display:inline">★ </b>'
    tag = ' <span class="badge mb" style="display:inline;font-size:9px">helig</span>' if 'h' in f else ''
    if f == 'now': tag = ' <span class="badge" style="display:inline;background:var(--gold);color:#0F1A1C;font-size:9px">nu</span>'
    st = 'border-color:var(--gold);background:var(--chip)' if f == 'now' else ''
    rows += (f'<div class="mrow" style="{st}"><div class="n">{n}</div><div class="t"><b>{b}{tr}{tag}</b><span>{note}</span></div>'
             f'<div class="ar">{ar}</div></div>')

p2 = f'''<div class="col"><div class="cap">2 · Årets tolv månader</div><div class="phone" style="gap:7px">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">Månaderna 1448</div><div class="sub">Tryck på en månad för dess dhikr och ṣalawāt</div></div></div>
{rows}
<div style="font-size:10.5px;color:var(--muted);text-align:center;margin-top:2px">★ = extra övningar · helig = de fyra heliga månaderna (al-ashhur al-ḥurum)</div>
</div></div>'''

# ---------- phone 3: Rajab detail ----------
def dk(ar, title, sub, cnt, on=False):
    st = 'border-color:var(--gold)' if on else ''
    return (f'<div class="dk" style="{st}"><div class="t"><b>{title}</b><span>{sub}</span></div>'
            f'<div class="ar">{ar}</div><div class="cnt">{cnt}</div></div>')

p3 = f'''<div class="col"><div class="cap">3 · En månad öppnad: Rajab</div><div class="phone" style="gap:6px">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">Rajab <span class="ar" style="font-size:22px">رَجَبٌ شَهْرُ ٱللّٰه</span></div>
<div class="sub">7:e månaden · helig · ≈ 10 dec – 8 jan</div></div></div>
<div class="label" style="margin-top:2px">Varje dag</div>
{dk('أَسْتَغْفِرُ ٱللّٰه', 'Istighfār', 'Astaghfiru-llāh', '100–1000')}
{dk('لَا إِلٰهَ إِلَّا ٱللّٰه', 'Tahlīl', 'Lā ilāha illā-llāh', '100–1000')}
{dk('اللّٰهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّد', 'Ṣalawāt', 'Allāhumma ṣalli…', '100–1000')}
{dk('يَا لَطِيف', 'Yā Laṭīf', 'O Du Milde', '100–500')}
{dk('', 'Rajab-helgonets duʿāʾ', 'enligt Shaykh Nāẓim · text i appen', '×3')}
<div class="label" style="margin-top:2px">Tasbīḥ efter tiodel</div>
{dk('سُبْحَانَ ٱللّٰهِ ٱلْحَيِّ ٱلْقَيُّوم', 'Dag 1–10', '…l-Ḥayyi l-Qayyūm', '×100', True)}
{dk('سُبْحَانَ ٱللّٰهِ ٱلْأَحَدِ ٱلصَّمَد', 'Dag 11–20', '…l-Aḥadi ṣ-Ṣamad', '×100')}
{dk('سُبْحَانَ ٱللّٰهِ ٱلرَّؤُوف', 'Dag 21–30', '…r-Raʾūf', '×100')}
<div class="label" style="margin-top:2px">Särskilda dagar</div>
<div class="card" style="padding:9px 12px;font-size:12px;line-height:18px">
<b style="color:var(--gold)">Laylat ar-Raghāʾib</b> – natten till första fredagen<br>
<b style="color:var(--gold)">8 Rajab</b> – ʿUrs, Shaykh Nāẓim al-Ḥaqqānī<br>
<b style="color:var(--gold)">27 Rajab</b> – Isrāʾ & Miʿrāj · fasta mån & tor</div>
<div style="display:flex;gap:8px;margin-top:auto"><div class="btn" style="background:var(--gold);color:#0F1A1C">Räkna i dhikr-räknaren</div><div class="btn" style="background:var(--card);border:1px solid var(--line);color:var(--ink)">Påminn mig</div></div>
<div style="font-size:9.5px;color:var(--muted);text-align:center">Källa: naqshbandi.org · sufihub.com</div>
</div></div>'''

note = '''<div style="width:380px;display:flex;flex-direction:column;gap:14px;padding-top:40px">
<div class="card"><div class="label">Var den finns</div><div style="font-size:14px;line-height:21px;margin-top:6px">Hijri-datumet står överst på Idag/Koranen. Tryck på det → kalendern. Förstasidan visar också ett kort när en helig månad eller särskild natt närmar sig.</div></div>
<div class="card"><div class="label">Varje månad</div><div style="font-size:14px;line-height:21px;margin-top:6px">Arabiskt namn, translitteration och svensk/engelsk förklaring (efter inställningen). Månader med extra övningar har ★; de fyra heliga är märkta. Varje dhikr kan skickas till dhikr-räknaren.</div></div>
<div class="card" style="border-color:var(--gold)"><div class="label" style="color:var(--gold)">Att kolla med dig</div><div style="font-size:13.5px;line-height:20px;margin-top:6px">
• Källorna ger ofta intervall (100–1000). Appen visar intervallet – vilket mål vill du ha?<br>
• Rabīʿ al-ākhir, båda Jumādā, Shawwāl och Dhū al-qaʿda har inget extra i källorna → visar Daily Awrad.<br>
• Ramaḍān och Dhū al-ḥijja: källorna ger inga Naqshbandi-antal, bara fasta, ʿArafa och takbīr.<br>
• Datum räknas ut (Umm al-Qurā) och kan skilja ±1 dag från månskådning → justering ±1 i inställningar.<br>
• Rajab-helgonets duʿāʾ och Nisf Shaʿbān-duʿāʾ: vill du ge mig texten ur din Awrad-bok?</div></div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1700px">
<h1 class="top">Hijri-kalender med månadernas dhikr och ṣalawāt</h1>
<p class="top">Islamiska månadsnamn och Naqshbandi-övningar för varje månad. Bara förslag – inget är byggt.</p>
<div class="row">{p1}{p2}{p3}{note}</div></body></html>'''
open(D + '/hijri-mockup.html', 'w').write(html)
