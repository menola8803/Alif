import sys, re, math
D = sys.argv[1]
exec(open(D + '/hub.py').read().split("status = '<div")[0].replace("D = sys.argv[1]", "D = sys.argv[1]"), globals())
status = '<div class="status"><span>13:10</span><span>5G ▮▮▮ 70 %</span></div>'

# --- a simplified outline of Sweden (lon, lat), drawn by hand: only for the picture ---
outline = [(20.6, 69.06), (21.6, 68.8), (23.2, 68.6), (23.6, 67.9), (23.5, 67.0), (24.0, 66.4), (24.15, 65.83), (23.0, 65.75), (22.15, 65.58),
           (21.5, 65.3), (21.2, 64.75), (20.3, 63.8), (18.7, 63.3), (17.95, 62.6), (17.4, 62.4), (17.1, 61.7), (17.25, 61.1), (17.15, 60.7),
           (18.45, 60.35), (18.7, 59.75), (18.95, 59.35), (17.95, 58.9), (16.9, 58.5), (16.65, 57.75), (16.5, 57.1), (16.35, 56.65),
           (15.6, 56.15), (14.7, 56.15), (14.3, 55.9), (14.2, 55.4), (13.8, 55.4), (13.15, 55.35), (12.95, 55.55), (13.0, 55.75), (12.7, 56.05),
           (12.6, 56.3), (12.85, 56.65), (12.25, 57.1), (11.95, 57.7), (11.6, 58.2), (11.2, 58.6), (11.17, 58.93), (11.45, 59.1), (11.8, 59.4),
           (12.4, 60.1), (12.55, 60.6), (12.2, 61.0), (12.85, 61.35), (12.1, 62.0), (12.2, 63.5), (13.0, 64.0), (14.1, 64.5), (14.5, 65.3),
           (15.7, 66.1), (16.5, 67.0), (17.9, 67.95), (18.4, 68.5), (19.9, 68.35), (20.6, 69.06)]
gotland = [(18.1, 57.25), (18.75, 57.55), (19.1, 57.9), (18.9, 57.95), (18.35, 57.85), (18.1, 57.5)]
oland = [(16.4, 56.2), (16.55, 56.25), (17.1, 57.35), (16.95, 57.35), (16.45, 56.6)]
W, H = 366, 600
LON0, LAT1 = 10.7, 69.4
K = H / 14.3
def P(lon, lat):
    return ((lon - LON0) * K * 0.47 + 42, (LAT1 - lat) * K)
def poly(pts):
    return 'M' + ' L'.join(f'{P(*p)[0]:.1f} {P(*p)[1]:.1f}' for p in pts) + 'Z'

# Example places (positions of towns; the numbers are only examples – the app counts the real ones from OpenStreetMap)
places = [('Stockholm', 18.07, 59.33, 24), ('Göteborg', 11.97, 57.71, 14), ('Malmö', 13.0, 55.6, 12), ('Uppsala', 17.64, 59.86, 4),
          ('Västerås', 16.55, 59.61, 3), ('Örebro', 15.21, 59.27, 4), ('Norrköping', 16.18, 58.59, 3), ('Linköping', 15.62, 58.41, 3),
          ('Jönköping', 14.16, 57.78, 3), ('Borås', 12.94, 57.72, 3), ('Helsingborg', 12.69, 56.05, 4), ('Växjö', 14.81, 56.88, 2),
          ('Karlstad', 13.5, 59.38, 2), ('Eskilstuna', 16.51, 59.37, 3), ('Gävle', 17.14, 60.67, 2), ('Sundsvall', 17.31, 62.39, 2),
          ('Umeå', 20.26, 63.83, 2), ('Luleå', 22.15, 65.58, 1), ('Kristianstad', 14.16, 56.03, 2), ('Halmstad', 12.86, 56.67, 2),
          ('Trollhättan', 12.29, 58.28, 2), ('Falun', 15.63, 60.6, 1), ('Kiruna', 20.22, 67.86, 1), ('Östersund', 14.64, 63.18, 1),
          ('Kalmar', 16.36, 56.66, 1), ('Karlskrona', 15.59, 56.16, 1), ('Skövde', 13.85, 58.39, 1), ('Visby', 18.29, 57.64, 1)]

def pin(x, y, n=None, big=False):
    s = 1.25 if big else 1.0
    if n and n > 1:
        r = 9 + min(n, 30) * 0.35
        return (f'<g><circle cx="{x}" cy="{y}" r="{r+4}" fill="rgba(232,176,74,.18)"/><circle cx="{x}" cy="{y}" r="{r}" fill="#132225" stroke="#E8B04A" stroke-width="1.6"/>'
                f'<text x="{x}" y="{y+4}" text-anchor="middle" font-family="Jak" font-weight="700" font-size="{10 if n < 10 else 10.5}" fill="#E8B04A">{n}</text></g>')
    # teardrop pin with a small dome and minaret
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 C-7 -8 -9 -12 -9 -16 a9 9 0 0 1 18 0 c0 4 -2 8 -9 16z" fill="#E8B04A" stroke="#0F1A1C" stroke-width="1.2"/>'
            f'<path d="M-4.6 -12 a4.6 4.6 0 0 1 9.2 0z M-5.2 -12 h10.4 v2.4 h-10.4z" fill="#0F1A1C"/><path d="M5.4 -9.6 V-19 M5.4 -19.6 l-.9 1.4 h1.8z" stroke="#0F1A1C" stroke-width="1.1"/>'
            f'<path d="M0 -21 a1.4 1.4 0 1 0 1.2 2 1.1 1.1 0 1 1 -1.2 -2z" fill="#0F1A1C"/></g>')

svg = [f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
       f'<rect width="{W}" height="{H}" fill="#0E2226"/>',
       ''.join(f'<path d="M0 {y} H{W}" stroke="#123035" stroke-width="1"/>' for y in range(0, H, 30)),
       f'<path d="{poly(outline)}" fill="#1B2F31" stroke="#3B5A5E" stroke-width="1.2" stroke-linejoin="round"/>',
       f'<path d="{poly(gotland)}" fill="#1B2F31" stroke="#3B5A5E" stroke-width="1"/><path d="{poly(oland)}" fill="#1B2F31" stroke="#3B5A5E" stroke-width="1"/>']
for name, lon, lat, n in places:
    x, y = P(lon, lat)
    svg.append(pin(round(x, 1), round(y, 1) + (0 if n > 1 else 8), n))
    if n >= 4 or name in ('Umeå', 'Luleå', 'Kiruna', 'Sundsvall'):
        svg.append(f'<text x="{x + (14 if name != "Göteborg" else -14):.1f}" y="{y + 4:.1f}" text-anchor="{"start" if name != "Göteborg" else "end"}" font-family="Jak" font-size="10" font-weight="600" fill="#B7C6C3">{name}</text>')
svg.append('</svg>')
sweden = ''.join(svg)

# --- a stylised city map (not real streets) with single mosque pins ---
cw, ch = 366, 610
city = [f'<svg width="{cw}" height="{ch}" viewBox="0 0 {cw} {ch}"><rect width="{cw}" height="{ch}" fill="#1B2F31"/>',
        '<path d="M0 250 C60 230 120 270 180 255 C240 240 300 262 366 250 V300 C300 312 240 290 180 305 C120 320 60 280 0 300Z" fill="#0E2226"/>',
        '<path d="M250 0 C240 60 270 120 262 170 L300 170 C310 120 285 60 292 0Z" fill="#0E2226"/>',
        '<rect x="30" y="360" width="90" height="70" rx="12" fill="#1F3A31"/><rect x="230" y="420" width="110" height="80" rx="14" fill="#1F3A31"/>']
for x in range(-40, cw, 46):
    city.append(f'<path d="M{x} 0 L{x+60} {ch}" stroke="#25393D" stroke-width="3"/>')
for y in range(20, ch, 52):
    city.append(f'<path d="M0 {y} L{cw} {y+18}" stroke="#25393D" stroke-width="3"/>')
city.append('<path d="M0 520 C120 500 220 540 366 470" stroke="#3B5A5E" stroke-width="7" fill="none"/>')
city.append('<circle cx="150" cy="420" r="26" fill="rgba(95,196,180,.15)"/><circle cx="150" cy="420" r="7" fill="#5FC4B4" stroke="#0F1A1C" stroke-width="2"/>')
for x, y, big in [(196, 352, True), (88, 190, False), (300, 560, False), (56, 470, False), (330, 330, False)]:
    city.append(pin(x, y, None, big))
city.append('</svg>')
citymap = ''.join(city)

attr = '<div style="position:absolute;right:8px;bottom:6px;font-size:9px;color:#B7C6C3;background:rgba(11,20,22,.7);padding:2px 6px;border-radius:6px">© OpenStreetMap-bidragsgivare</div>'

s1 = f'''<div class="col"><div class="cap">1 · Idag – närmaste moské</div><div class="phone">{status}
<div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1">
  <div class="ar" style="font-size:22px;line-height:34px;color:var(--gold);text-align:left">٢٦ جُمَادَىٰ ٱلْأُولَىٰ ١٤٤٨</div>
  <div style="font-size:20px;font-weight:700">Fredag 6 november</div><div class="sub">26 Jumādā al-ūlā 1448 · Stockholm</div></div>
  <div class="gear">{GEAR}</div></div>
<div class="card" style="padding:12px 14px"><div class="label">Nästa bön</div><div style="display:flex;align-items:baseline;gap:10px;margin-top:2px"><div style="font-size:26px;font-weight:700">ʿAṣr</div><div style="font-size:15px;color:var(--gold);font-weight:700">om 12 min</div><div class="ar" style="margin-left:auto;font-size:22px;line-height:30px">ٱلْعَصْر</div></div></div>
<div class="card" style="padding:0;overflow:hidden;border-color:rgba(232,176,74,.55)">
  <div style="position:relative;height:150px;overflow:hidden">{citymap.replace(f'width="{cw}" height="{ch}"', f'width="{cw}" height="{ch}" style="position:absolute;left:-20px;top:-260px"')}{attr}</div>
  <div style="padding:12px 14px;display:flex;align-items:center;gap:12px">
    <div style="flex:1"><div class="label">Närmaste moské</div><div style="font-size:15px;font-weight:700;margin-top:2px">Stockholms moské</div><div class="hint">1,2 km · 15 min promenad</div></div>
    <div class="pill" style="background:var(--gold);color:#0F1A1C">Karta</div></div>
</div>
<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px 14px"><div style="flex:1"><div style="font-size:15px;font-weight:700">Daily Awrad</div><div class="hint">6 av 19 · påminnelse 21:00</div></div><div class="pill">Fortsätt</div></div>
{tabs('Idag')}</div></div>'''

s2 = f'''<div class="col"><div class="cap">2 · Alla moskéer i Sverige</div><div class="phone" style="padding-bottom:14px">{status}
<div class="hdr"><div class="back">‹</div><div style="flex:1"><div style="font-size:19px;font-weight:700">Moskéer</div><div class="sub">Hela Sverige · från OpenStreetMap</div></div></div>
<div style="height:40px;border-radius:13px;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;padding:0 12px;gap:8px;font-size:13.5px;color:var(--muted)">🔍 Sök stad eller moské</div>
<div style="position:relative;border-radius:20px;overflow:hidden;border:1px solid var(--line);flex:1">{sweden}{attr}
  <div style="position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px"><div class="btn2" style="width:40px;height:40px;padding:0">＋</div><div class="btn2" style="width:40px;height:40px;padding:0">－</div><div class="btn2" style="width:40px;height:40px;padding:0;color:var(--mint)">◎</div></div>
  <div style="position:absolute;left:10px;top:10px;background:rgba(11,20,22,.78);border:1px solid var(--line);border-radius:12px;padding:8px 10px;font-size:11.5px;line-height:17px;color:var(--ink)"><span style="color:var(--gold);font-weight:700">●</span> siffra = flera moskéer<br>Zooma in för att se var och en</div>
</div>
</div></div>'''

s3 = f'''<div class="col"><div class="cap">3 · Inzoomat – en ikon per moské</div><div class="phone" style="padding:0;gap:0">
<div style="position:absolute;inset:0">{citymap}</div>
<div style="position:relative;padding:22px 16px 0">{status}
 <div class="hdr" style="margin-top:6px"><div class="back">‹</div><div style="flex:1;height:40px;border-radius:13px;background:rgba(23,38,41,.92);border:1px solid var(--line);display:flex;align-items:center;padding:0 12px;font-size:13.5px;color:var(--muted)">🔍 Stockholm</div></div>
</div>
<div style="position:absolute;left:12px;right:12px;bottom:12px;background:var(--card);border:1px solid var(--gold);border-radius:22px;padding:14px;box-shadow:0 -10px 30px rgba(0,0,0,.45)">
  <div style="width:40px;height:4px;border-radius:2px;background:var(--line);margin:0 auto 10px"></div>
  <div style="display:flex;gap:12px;align-items:flex-start"><div style="flex:1"><div style="font-size:18px;font-weight:700">Stockholms moské</div><div class="hint" style="font-size:13px;margin-top:2px">Kapellgränd 10, Södermalm · 1,2 km</div></div>
    <svg width="34" height="40" viewBox="-12 -24 24 26">{pin(0, 0)[pin(0,0).index('<path'):-4]}</svg></div>
  <div style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:18px">Öppettider, webbplats och telefon visas när de finns i OpenStreetMap.</div>
  <div style="display:flex;gap:8px;margin-top:12px"><div class="btn" style="flex:1.3;height:42px">Vägbeskrivning</div><div class="btn2" style="flex:1">☆ Spara</div><div class="btn2" style="width:48px">↗</div></div>
</div>
<div style="position:absolute;right:8px;top:118px;font-size:9px;color:#B7C6C3;background:rgba(11,20,22,.7);padding:2px 6px;border-radius:6px">© OpenStreetMap-bidragsgivare</div>
</div></div>'''

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">{style}</head><body style="width:1340px">
<h1 class="top">Moskéer på kartan · OpenStreetMap</h1>
<p class="top">Närmaste moské på Idag-fliken, alla moskéer i Sverige på kartan och en egen ikon för varje moské. Siffrorna och kartan här är bara exempel.</p>
<div class="row">{s1}{s2}{s3}</div></body></html>'''
open(D + '/map-mockup.html', 'w').write(html)
