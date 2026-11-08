import { fromHijri, monthLength, MONTHS, nextSacredMonth, nextSpecial, offsetFor, toHijri } from '../src/core/hijri';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
const d = new Date(2026, 10, 6);
const h = toHijri(d);
ok(h.y === 1448 && h.m === 5 && (h.d === 25 || h.d === 26), `tabular ${JSON.stringify(h)}`);
const off = offsetFor(d, { y: 1448, m: 5, d: 26 });
ok(toHijri(d, off).d === 26, 'offset to Umm al-Qura');
// round trip
for (let i = 0; i < 400; i += 37) {
  const g = new Date(2026, 0, 1 + i);
  const back = fromHijri(toHijri(g, 1), 1);
  ok(back.toDateString() === g.toDateString(), `round trip ${g.toDateString()}`);
}
ok([29, 30].includes(monthLength(1448, 5)), 'month length');
ok(MONTHS.length === 12 && MONTHS.filter(m => m.sacred).map(m => m.n).join() === '1,7,11,12', 'sacred months');
const s = nextSacredMonth(d, off);
ok(s.month.n === 7 && s.days > 20 && s.days < 40, `next sacred ${s.month.tr} ${s.days}`);
const sp = nextSpecial(d, off);
ok(sp.day.m === 7 && sp.day.d === 27, `next special ${sp.day.tr}`);
if (fail) process.exit(1);
console.log('hijri: all ok');
