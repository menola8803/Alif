import sys, re
D = sys.argv[1]
src = open(D + '/next-mockup.html').read()
style = src[src.index('<style>'):src.index('</style>') + 8]
GEAR = re.search(r'(<svg width="22" height="22".*?</svg>)', src).group(1)
G = '#E8B04A'; M = '#B7C6C3'; MINT = '#5FC4B4'

exec(open(D + '/pen.py').read().split('variants = [')[0].split("G = '#E8B04A'; M = '#B7C6C3'")[1], globals())


def ic(name, c, fill):
    return {
        'Idag': f'<path d="M15.6 4.2a8 8 0 1 0 4.2 11.6 6.4 6.4 0 1 1-4.2-11.6z" fill="{fill}" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M17.6 7.2l.7-1.5.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7z" fill="{c}"/>',
        'Koranen': f'<path d="M12 7.5c-2.2-1.6-5.2-2-8.5-1.5v11.5c3.3-.5 6.3 0 8.5 1.5 2.2-1.5 5.2-2 8.5-1.5V6c-3.3-.5-6.3-.1-8.5 1.5z" fill="{fill}" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 7.5V19" stroke="{c}" stroke-width="1.6"/><path d="M5 21.5l7-3 7 3" stroke="{c}" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M15 10.5l1.2-1.2 1.2 1.2-1.2 1.2z" fill="{c}"/>',
        'Översätt': nib(c, fill) + arabic(c),
        'Lär dig': f'<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="{fill}" stroke="{c}" stroke-width="1.6"/><path d="M15.5 7.5v8" stroke="{c}" stroke-width="2" stroke-linecap="round"/><path d="M7 13.2c0 1.6 1.2 2.3 3 2.3s3-.7 3-2.3" stroke="{c}" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M9.6 17.6l.6-.6.6.6-.6.6z" fill="{c}"/>',
        'Dhikr': ''.join(f'<circle cx="{12 + 7.2 * __import__("math").cos(a)}" cy="{11 + 7.2 * __import__("math").sin(a)}" r="1.55" fill="{fill}" stroke="{c}" stroke-width="1.2"/>' for a in [i * 0.5236 - 1.05 for i in range(10)]) + f'<path d="M12 18.2v2.6M10.6 22h2.8" stroke="{c}" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="11" r="1.8" fill="{c}"/>',
    }[name]


TABS = ['Idag', 'Koranen', 'Översätt', 'Lär dig', 'Dhikr']


def tabs(active):
    h = '<div style="margin-top:auto;display:flex;gap:3px;background:linear-gradient(180deg,#1A2B2E,#132225);border:1px solid #2A4448;border-radius:24px;padding:5px">'
    for n in TABS:
        on = n == active
        bg = ('background:radial-gradient(120% 120% at 50% 0%,rgba(232,176,74,.20),rgba(232,176,74,.04));border:1px solid rgba(232,176,74,.55);box-shadow:0 0 16px rgba(232,176,74,.16)' if on else 'border:1px solid transparent')
        dot = f'<div style="width:14px;height:3px;border-radius:2px;background:{G};margin-top:2px;box-shadow:0 0 8px {G}"></div>' if on else '<div style="height:5px"></div>'
        h += (f'<div style="flex:1;height:58px;border-radius:19px;{bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px">'
              f'<svg width="23" height="23" viewBox="0 0 24 24">{ic(n, G if on else M, "rgba(232,176,74,.22)" if on else "rgba(183,198,195,.08)")}</svg>'
              f'<div style="font-size:9.5px;font-weight:{700 if on else 600};color:{G if on else M}">{n}</div>{dot}</div>')
    return h + '</div>'


def head(title, sub, glow=False):
    g = 'gear glow' if glow else 'gear'
    dot = '<div class="dot"></div>' if glow else ''
    return f'<div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1"><div class="h1">{title}</div><div class="sub">{sub}</div></div><div class="{g}">{GEAR}{dot}</div></div>'


status = '<div class="status"><span>13:08</span><span>5G ▮▮▮ 71 %</span></div>'

prayers = [('Fajr', '05:46', False), ('Shurūq', '07:39', False), ('Ẓuhr', '11:51', False), ('ʿAṣr', '13:22', True), ('Maghrib', '15:58', False), ('ʿIshāʾ', '17:44', False)]
prow = ''.join(f'<div style="flex:1;text-align:center;padding:6px 0;border-radius:11px;{"background:rgba(232,176,74,.14);border:1px solid rgba(232,176,74,.6)" if on else "background:var(--chip)"}"><div style="font-size:10px;color:{G if on else M};font-weight:700">{n}</div><div style="font-size:12.5px;font-weight:700;color:var(--ink)">{t}</div></div>' for n, t, on in prayers)

s1 = f'''<div class="col"><div class="cap">1 · Idag – allt det dagliga på ett ställe</div><div class="phone">{status}
<div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1">
  <div class="ar" style="font-size:22px;line-height:34px;color:var(--gold);text-align:left">٢٦ جُمَادَىٰ ٱلْأُولَىٰ ١٤٤٨</div>
  <div style="font-size:20px;font-weight:700">Fredag 6 november</div><div class="sub">26 Jumādā al-ūlā 1448 · Stockholm</div></div>
  <div class="gear glow">{GEAR}<div class="dot"></div></div></div>
<div class="card" style="padding:12px 14px">
  <div style="display:flex;align-items:baseline;gap:8px"><div class="label">Nästa bön</div><div style="margin-left:auto;font-size:12px;color:var(--muted)">Hanafī · MWL</div></div>
  <div style="display:flex;align-items:baseline;gap:10px;margin:2px 0 8px"><div style="font-size:26px;font-weight:700">ʿAṣr</div><div style="font-size:15px;color:var(--gold);font-weight:700">om 14 min</div><div class="ar" style="margin-left:auto;font-size:22px;line-height:30px">ٱلْعَصْر</div></div>
  <div style="display:flex;gap:4px">{prow}</div>
</div>
<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px 14px;border-color:rgba(232,176,74,.55)">
  <svg width="54" height="54" viewBox="0 0 54 54"><circle cx="27" cy="27" r="22" stroke="#25393D" stroke-width="6" fill="none"/><circle cx="27" cy="27" r="22" stroke="#E8B04A" stroke-width="6" fill="none" stroke-dasharray="58 138" stroke-linecap="round" transform="rotate(-90 27 27)"/><text x="27" y="31" text-anchor="middle" font-size="12" font-weight="700" fill="#EAF1EF" font-family="Jak">6/19</text></svg>
  <div style="flex:1"><div style="font-size:15px;font-weight:700">Daily Awrad</div><div class="hint">Fredag: 500 ṣalawāt · påminnelse 21:00</div></div><div class="pill" style="background:var(--gold);color:#0F1A1C">Fortsätt</div>
</div>
<div style="display:flex;gap:8px">
  <div class="card" style="flex:1;padding:11px 12px"><div class="label">Fortsätt läsa</div><div style="font-size:14px;font-weight:700;margin-top:3px">Al-Kahf 18:10</div><div class="hint">▶ Mishary al-ʿAfāsī</div></div>
  <div class="card" style="flex:1;padding:11px 12px"><div class="label">Repetera</div><div style="font-size:14px;font-weight:700;margin-top:3px">12 kort idag</div><div class="hint">bokstäver · ord · verser</div></div>
</div>
<div class="card" style="padding:11px 14px;display:flex;align-items:center;gap:10px"><div style="font-size:20px">📿</div><div style="flex:1"><div style="font-size:14px;font-weight:700">Snabb dhikr</div><div class="hint">Volymknappen räknar · 33/99</div></div><div style="font-size:22px;font-weight:700;color:var(--gold)">21</div></div>
<div class="hint" style="text-align:center">Kugghjulet lyser: en ny version finns</div>
{tabs('Idag')}</div></div>'''

tj = lambda t, col: f'<span style="color:{col}">{t}</span>'
verse = ('إِنَّا جَعَلْنَا مَا عَلَى ٱلْأَرْضِ زِينَةً لَّهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًا')
s2 = f'''<div class="col"><div class="cap">2 · Koranen – ljud, tajwīd, ord för ord</div><div class="phone">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">18. Al-Kahf</div><div class="sub">110 verser · Mekka</div></div><div style="font-size:22px;color:var(--gold)">🔖</div></div>
<div style="display:flex;gap:6px;flex-wrap:wrap"><div class="pill" style="border:1px solid var(--gold);color:var(--gold)">Tajwīd-färger</div><div class="pill">Ord för ord</div><div class="pill">Memorera</div></div>
<div class="card" style="padding:12px 14px;border-color:rgba(232,176,74,.55);background:linear-gradient(180deg,rgba(232,176,74,.08),var(--card))">
  <div class="ar" style="font-size:27px;line-height:56px;text-align:right">{tj("إِنَّا","#5FC4B4")} جَعَلْنَا مَا عَلَى ٱلْأَرْضِ زِينَةً {tj("لَّهَا","#E8776D")} لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ {tj("عَمَلًا","#C9A0FF")} <span style="color:var(--gold);font-size:18px">۝٧</span></div>
  <div style="font-size:14px;line-height:21px;color:var(--mint);margin-top:2px">innā jaʿalnā mā ʿala l-arḍi zīnatal-lahā linabluwahum ayyuhum aḥsanu ʿamalā</div>
  <div style="font-size:13.5px;line-height:20px;margin-top:6px">Vi har gjort allt det som finns på jorden till dess prydnad för att pröva dem, vem av dem som handlar bäst.</div>
  <div style="display:flex;gap:10px;margin-top:8px;font-size:11px;color:var(--muted)"><span><b style="color:#5FC4B4">●</b> ghunna</span><span><b style="color:#E8776D">●</b> idghām</span><span><b style="color:#C9A0FF">●</b> madd</span></div>
</div>
<div class="card" style="padding:12px 14px;margin-left:30px;border-color:var(--gold)">
  <div style="display:flex;align-items:center;gap:10px"><div class="ar" style="font-size:30px;line-height:44px">زِينَةً</div><div><div style="font-size:15px;font-weight:700">zīnatan</div><div class="hint">prydnad · substantiv</div></div><div style="margin-left:auto;text-align:right"><div class="label">Rot</div><div class="ar" style="font-size:20px;line-height:28px">ز ي ن</div></div></div>
</div>
<div class="card" style="padding:10px 12px;display:flex;align-items:center;gap:12px">
  <div style="width:42px;height:42px;border-radius:21px;background:var(--gold);display:flex;align-items:center;justify-content:center;color:#0F1A1C;font-size:16px">❚❚</div>
  <div style="flex:1"><div style="font-size:13.5px;font-weight:700">Mishary al-ʿAfāsī · vers 7</div><div style="height:4px;border-radius:2px;background:var(--chip);margin-top:6px"><div style="width:40%;height:4px;border-radius:2px;background:var(--gold)"></div></div></div>
  <div class="hint">1×</div><div class="hint">⬇</div>
</div>
{tabs('Koranen')}</div></div>'''

s3 = f'''<div class="col"><div class="cap">3 · Översätt – fyra sätt i en flik</div><div class="phone">{status}
{head('Översätt', 'Arabiska ⇄ svenska')}
<div style="display:flex;background:var(--chip);border-radius:14px;padding:4px;gap:4px">
''' + ''.join(f'<div style="flex:1;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;gap:5px;font-size:12.5px;font-weight:700;{"background:var(--card);border:1px solid var(--gold);color:var(--gold)" if n == "Skriv" else "color:var(--muted)"}">{e} {n}</div>' for e, n in [('✒︎', 'Skriv'), ('🎙', 'Lyssna'), ('🖼', 'Bild'), ('📷', 'Kamera')]) + f'''
</div>
<div style="display:flex;gap:8px"><div class="pill">📄 Öppna fil</div><div class="pill">📋 Klistra in</div></div>
<div class="paper" style="min-height:110px"><div style="font-size:11px;font-weight:700;letter-spacing:1.2px;color:#7A5C2B">ARABISKA</div><div class="ar" style="font-size:28px;line-height:52px;text-align:right">رَبِّ ٱشْرَحْ لِي صَدْرِي</div></div>
<div class="card"><div class="label">Translitteration</div><div style="font-size:16px;color:var(--mint);font-weight:500;margin-top:4px">rabbi shraḥ lī ṣadrī</div></div>
<div class="card"><div class="label">Svenska</div><div style="font-size:15px;margin-top:4px">Herre, öppna mitt bröst.</div><div class="hint" style="margin-top:4px">Koranen 20:25 · Ṭā Hā · <span style="color:var(--gold)">Lägg till i repetition +</span></div></div>
<div class="hint" style="text-align:center">Bild och Kamera ligger bredvid varandra</div>
{tabs('Översätt')}</div></div>'''

s4 = f'''<div class="col"><div class="cap">4 · Dhikr – räknare och Daily Awrad</div><div class="phone">{status}
{head('Dhikr', 'Tasbīḥ och Daily Awrad')}
<div style="display:flex;gap:6px;flex-wrap:wrap"><div class="pill" style="border:1px solid var(--gold);color:var(--gold)">Subḥāna llāh</div><div class="pill">Alḥamdu lillāh</div><div class="pill">Allāhu akbar</div><div class="pill">Ṣalawāt</div></div>
<div style="display:flex;justify-content:center;margin:8px 0">
 <div style="width:230px;height:230px;border-radius:115px;background:radial-gradient(circle at 50% 35%,#24393c,#132225);border:2px solid rgba(232,176,74,.6);box-shadow:0 0 0 10px rgba(232,176,74,.06),0 0 40px rgba(232,176,74,.18);display:flex;flex-direction:column;align-items:center;justify-content:center">
  <div class="ar" style="font-size:24px;line-height:36px">سُبْحَانَ ٱللَّهِ</div>
  <div style="font-size:64px;font-weight:700;color:var(--gold);line-height:70px">21</div>
  <div class="hint">av 33 · tryck var som helst</div></div></div>
<div class="card" style="padding:4px 14px">
  <div class="row2"><div style="flex:1"><b>Räkna med volymknappen</b><span>Telefonen kan ligga i fickan</span></div><div class="tog"><i></i></div></div>
  <div class="row2"><div style="flex:1"><b>Vibrera var 33:e</b><span>Och vid målet</span></div><div class="tog"><i></i></div></div>
</div>
<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px 14px"><div style="flex:1"><div style="font-size:15px;font-weight:700">Daily Awrad</div><div class="hint">6 av 19 · ihdāʾ · påminnelse 21:00</div></div><div class="ar" style="font-size:20px;line-height:30px">أَوْرَاد</div><span class="chev">›</span></div>
{tabs('Dhikr')}</div></div>'''

# calendar
days = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']
cells = ''
start = 0  # 12 Oct 2026 is a Monday = 1 Jumādā al-ūlā (approx.)
for i in range(35):
    h = i + 1
    g = 12 + i if i < 20 else i - 19
    sel = h == 26
    mtf = (i % 7) in (0, 3, 4)
    cells += (f'<div style="height:44px;border-radius:10px;{"background:rgba(232,176,74,.16);border:1px solid var(--gold)" if sel else "background:var(--chip)"};display:flex;flex-direction:column;align-items:center;justify-content:center">'
              f'<div style="font-size:13px;font-weight:700;color:{G if sel else "var(--ink)"}">{h if h <= 30 else h - 30}</div><div style="font-size:9px;color:var(--muted)">{g}</div>'
              f'{"<div style=" + chr(34) + "width:4px;height:4px;border-radius:2px;background:#5FC4B4;margin-top:1px" + chr(34) + "></div>" if mtf else ""}</div>')
s5 = f'''<div class="col"><div class="cap">5 · Hijri-kalender och bönetider</div><div class="phone">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">Jumādā al-ūlā 1448</div><div class="sub">okt – nov 2026</div></div><div class="ar" style="font-size:20px;line-height:30px">جُمَادَىٰ ٱلْأُولَىٰ</div></div>
<div class="card" style="padding:10px">
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:10px;color:var(--muted);text-align:center;margin-bottom:4px">{''.join(f'<span>{d}</span>' for d in days)}</div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">{cells}</div>
  <div class="hint" style="margin-top:6px"><b style="color:#5FC4B4">●</b> måndag, torsdag, fredag – fler ṣalawāt</div>
</div>
<div class="card" style="padding:12px 14px"><div style="display:flex"><div class="label">Fredag 6 nov · bönetider</div><div class="hint" style="margin-left:auto">📍 Stockholm</div></div>
''' + ''.join(f'<div style="display:flex;padding:5px 0;border-bottom:1px solid var(--line);font-size:14px;{"color:var(--gold);font-weight:700" if on else ""}"><span style="flex:1">{n}</span><span>{t}</span><span style="width:26px;text-align:right">{"🔔" if n not in ("Shurūq",) else ""}</span></div>' for n, t, on in prayers) + f'''
  <div class="hint" style="margin-top:6px">Beräknas på telefonen · metod och ʿaṣr-skola i Inställningar</div></div>
<div class="card" style="padding:10px 12px;display:flex;align-items:center;gap:10px"><div style="width:70px;height:70px;border-radius:18px;background:#172629;border:1px solid var(--gold);padding:6px;font-size:9px;color:var(--muted)"><div style="color:var(--gold);font-weight:700;font-size:10px">ʿAṣr 13:22</div><div class="ar" style="font-size:12px;line-height:18px;text-align:left">٢٦ جُمَادَى</div><div>Awrad 6/19</div></div><div style="flex:1"><div style="font-size:14px;font-weight:700">Widget på hemskärmen</div><div class="hint">Nästa bön, hijri-datum och dagens awrād</div></div></div>
</div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:2230px">
<h1 class="top">Alif – smartast åtkomligt</h1>
<p class="top">Fem flikar efter vad du gör: <b style="color:var(--ink)">Idag</b> (det dagliga) · <b style="color:var(--ink)">Koranen</b> (läsa och lyssna) · <b style="color:var(--ink)">Översätt</b> (Skriv, Lyssna, Bild, Kamera) · <b style="color:var(--ink)">Lär dig</b> · <b style="color:var(--ink)">Dhikr</b>. Inställningar, historik, manual och säkerhetskopia under kugghjulet.</p>
<div class="row" style="gap:30px">{s1}{s2}{s3}{s4}{s5}</div></body></html>'''
open(D + '/hub-mockup.html', 'w').write(html)
