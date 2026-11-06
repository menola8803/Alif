import math, cairosvg
C=dict(bg='#0B1416',teal='#17393E',panel='#132225',line='#2A4448',gold='#E8B04A',goldDim='#8A6D2E',goldPale='#F3D9A0',mint='#5FC4B4',ink='#B7C6C3',dim='#8FA5A2')
def star(cx,cy,r):
    s=r/math.sqrt(2); return f"M{cx-s} {cy-s}H{cx+s}V{cy+s}H{cx-s}ZM{cx} {cy-r}L{cx+r} {cy}L{cx} {cy+r}L{cx-r} {cy}Z"
o=[]
o.append(f'<rect width="390" height="844" fill="{C["bg"]}"/><radialGradient id="g" cx="195" cy="292" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{C["teal"]}"/><stop offset="1" stop-color="{C["teal"]}" stop-opacity="0"/></radialGradient><rect width="390" height="844" fill="url(#g)"/>')
o.append(f'<path d="M22 214L24 420L28 612M372 196L366 440L364 620" stroke="{C["mint"]}" stroke-opacity=".12" fill="none"/>')
for x,y,r in [(22,214,7),(372,196,7),(24,420,6),(366,440,6),(28,612,7),(364,620,7)]: o.append(f'<path d="{star(x,y,r)}" stroke="{C["mint"]}" stroke-opacity=".5" fill="none"/>')
# arch
o.append(f'<path d="M64 508V262Q64 214 112 196Q170 176 195 136Q220 176 278 196Q326 214 326 262V508" stroke="{C["goldDim"]}" stroke-width="1.2" fill="none"/><path d="M74 508V266Q74 224 118 208Q172 190 195 154Q218 190 272 208Q316 224 316 266V508" stroke="{C["goldDim"]}" stroke-opacity=".45" stroke-width=".8" fill="none"/><path d="{star(195,124,7)}" stroke="{C["gold"]}" fill="none"/><path d="M56 508H334" stroke="{C["goldDim"]}" stroke-opacity=".5"/>')
# lanterns
for x,ln in [(38,64),(352,84)]:
    o.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{ln}" stroke="{C["goldDim"]}"/><g transform="translate({x-20},{ln})"><circle cx="20" cy="30" r="17" fill="{C["gold"]}" opacity=".15"/><g fill="none" stroke="{C["gold"]}" stroke-width="1.4"><path d="M20 0V4M14 10L20 4L26 10Z"/><path d="M10 10H30V14H10Z"/><path d="M11 14H29V40Q29 48 20 52Q11 48 11 40Z" fill="{C["panel"]}"/><path d="M20 52V58"/></g><path d="M15 19H25V37Q20 43 15 37Z" fill="{C["goldPale"]}" fill-opacity=".85"/><path d="M20 19V40" stroke="{C["goldDim"]}"/><circle cx="20" cy="60" r="2" fill="{C["gold"]}"/></g>')
# words
for ar,tr,gl,x,y in [('عِلْم','ʿilm','KUNSKAP',112,26),('نُور','nūr','LIGHT',196,34),('حِكْمَة','ḥikmah','VISDOM',280,26)]:
    o.append(f'<text x="{x}" y="{y+28}" text-anchor="middle" font-family="Amiri" font-size="24" fill="{C["goldPale"]}">{ar}</text><text x="{x}" y="{y+50}" text-anchor="middle" font-family="Plus Jakarta Sans" font-weight="500" font-size="11" fill="{C["mint"]}">{tr}</text><text x="{x}" y="{y+63}" text-anchor="middle" font-family="Plus Jakarta Sans" font-size="9.5" letter-spacing="1.2" fill="{C["dim"]}">{gl}</text>')
# logo
o.append(f'<path d="{star(195,292,44)}" stroke="{C["goldDim"]}" stroke-width="1.2" fill="none"/><circle cx="195" cy="292" r="27" stroke="{C["goldDim"]}" stroke-opacity=".6" stroke-width=".8" fill="none"/><circle cx="195" cy="292" r="56" stroke="{C["gold"]}" stroke-width="3.5" fill="none"/><text x="195" y="318" text-anchor="middle" font-family="Amiri" font-weight="bold" font-size="72" fill="{C["gold"]}">ا</text>')
for (x,y,c) in [(195,236,C['mint']),(195,348,C['goldPale'])]: o.append(f'<circle cx="{x}" cy="{y}" r="12" fill="{c}" opacity=".18"/><rect x="{x-5}" y="{y-5}" width="10" height="10" fill="{c}" transform="rotate(45 {x} {y})"/>')
o.append(f'<text x="195" y="420" text-anchor="middle" font-family="Cinzel" font-weight="bold" font-size="42" letter-spacing="14" fill="{C["gold"]}">ALIF</text><text x="195" y="458" text-anchor="middle" font-family="Amiri" font-size="22" fill="{C["goldPale"]}">أَلِف</text><text x="195" y="484" text-anchor="middle" font-family="Plus Jakarta Sans" font-weight="bold" font-size="10.5" letter-spacing="2.6" fill="{C["mint"]}">— LÄS · FÖRSTÅ · ÖVERSÄTT —</text>')
for x,l in [(51,'KAMERA'),(159,'TRANSLITTERERA'),(267,'ÖVERSÄTT')]:
    o.append(f'<circle cx="{x+36}" cy="564" r="36" fill="{C["panel"]}" stroke="{C["line"]}"/><text x="{x+36}" y="624" text-anchor="middle" font-family="Plus Jakarta Sans" font-weight="bold" font-size="9.5" letter-spacing="1.6" fill="{C["ink"]}">{l}</text>')
o.append(f'<path d="M123 564H159M231 564H267" stroke="{C["line"]}" stroke-width="1.5"/>')
o.append(f'<text x="195" y="674" text-anchor="middle" font-family="Amiri" font-size="21" fill="{C["gold"]}">اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ ﷺ</text><text x="195" y="696" text-anchor="middle" font-family="Plus Jakarta Sans" font-size="11" fill="{C["mint"]}">allāhumma ṣalli ʿalā sayyidinā muḥammad</text><text x="195" y="712" text-anchor="middle" font-family="Plus Jakarta Sans" font-size="9.5" letter-spacing="1.2" fill="{C["dim"]}">O GUD, VÄLSIGNA VÅR MÄSTARE MUHAMMAD</text>')
# mosque
def cres(cx,cy,r): return f"M{cx+r*0.2} {cy-r}A{r} {r} 0 1 0 {cx+r*0.2} {cy+r}A{r*0.78} {r*0.78} 0 1 1 {cx+r*0.2} {cy-r}Z"
def mina(x,top,w): return f"M{x-w/2} 110V{top}H{x+w/2}V110Z M{x-w/2-2} {top+22}H{x+w/2+2}V{top+25}H{x-w/2-2}Z M{x-w/2} {top}L{x} {top-13}L{x+w/2} {top}Z"
win=''.join(f"M{x-5} 110V100Q{x} 92 {x+5} 100V110Z" for x in [118,146,174,216,244,272])
o.append(f'<g transform="translate(0,734)"><g fill="{C["panel"]}" stroke="{C["goldDim"]}"><path d="{mina(62,26,10)}"/><path d="{mina(328,26,10)}"/><path d="{mina(88,50,8)}"/><path d="{mina(302,50,8)}"/><path d="M98 110V72H292V110Z"/><path d="M104 80Q104 58 125 55Q146 58 146 80Z"/><path d="M244 80Q244 58 265 55Q286 58 286 80Z"/><path d="M156 72V62H234V72Z"/><path d="M150 62Q150 26 195 16Q240 26 240 62Z"/></g><path d="{win}" fill="{C["bg"]}" stroke="{C["goldDim"]}" stroke-width=".8"/><path d="M195 16V6M62 13V4M328 13V4" stroke="{C["gold"]}" stroke-width="1.2"/><g fill="{C["gold"]}"><path d="{cres(195,1,4)}"/><path d="{cres(62,0,3)}"/><path d="{cres(328,0,3)}"/></g><path d="M0 110H390" stroke="{C["goldDim"]}"/></g>')
svg='<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">'+''.join(o)+'</svg>'
cairosvg.svg2png(bytestring=svg.encode(), write_to=__import__('sys').argv[1], output_width=780)
