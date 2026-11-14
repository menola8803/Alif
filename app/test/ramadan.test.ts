import { currentOrNext, daysUntil, fastMinutes, partIn, ramadans, seasonOf, twiceYears } from '../src/core/ramadan';
const ok = (c: unknown, m: string) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const list = ramadans(2020, 2033);
const r1447 = list.find(r => r.hy === 1447)!;
// Umm al-Qurā: 1 Ramadan 1447 = 18 Feb 2026 – the arithmetic calendar may be a day off
ok(Math.abs(new Date(iso(r1447.start)).getTime() - new Date('2026-02-18').getTime()) <= 86400000, `1447 starts ${iso(r1447.start)}`);
ok(list.every(r => r.days === 29 || r.days === 30), 'Ramadan is 29 or 30 days');
ok(twiceYears(list).includes(2030), `two in 2030: ${twiceYears(list)}`);
const n = currentOrNext(list, new Date(2026, 10, 14))!;
ok(n.hy === 1448, `next after 14 Nov 2026 is 1448, got ${n.hy}`);
ok(Math.abs(daysUntil(n, new Date(2026, 10, 14)) - 86) <= 1, 'about 86 days to 1448');
const cross = list.find(r => r.start.getFullYear() !== r.end.getFullYear())!;
ok(partIn(cross, cross.start.getFullYear())!.to >= 364 && partIn(cross, cross.end.getFullYear())!.from === 0, 'a Ramadan over New Year is split');
const sthlm = { name: 'Stockholm', country: 'SE', lat: 59.33, lng: 18.07 };
const o = { school: 'hanafi' as const, highLat: 'angle' as const };
const summer = ramadans(2015, 2015).find(r => r.start.getFullYear() === 2015)!;
const winter = list.find(r => r.hy === 1452)!;
ok(fastMinutes(summer, sthlm, o) > 18 * 60, `summer fast in Stockholm > 18 h: ${fastMinutes(summer, sthlm, o) / 60}`);
ok(fastMinutes(winter, sthlm, o) < 10 * 60, `winter fast in Stockholm < 10 h: ${fastMinutes(winter, sthlm, o) / 60}`);
ok(seasonOf(summer, 59) === 'summer' && seasonOf(summer, -33) === 'winter', 'seasons turn south of the equator');
// Fasting hours must be a real number everywhere – far north (midnight sun), at the equator and in the south.
for (const pl of [{ lat: 67.86, lng: 20.23 }, { lat: 69.65, lng: 18.96 }, { lat: -0.18, lng: -78.47 }, { lat: -33.87, lng: 151.2 }, { lat: 21.42, lng: 39.83 }]) {
  for (const r of ramadans(2026, 2050)) {
    const m = fastMinutes(r, { name: 'x', country: 'x', ...pl }, o);
    ok(Number.isFinite(m) && m > 0 && m < 24 * 60, `fast hours at ${pl.lat} in ${r.hy}: ${m}`);
  }
}
console.log('ramadan: all ok');
// Own minutes per prayer
import { adjustDay } from '../src/core/prayer';
{
  const d = { date: '2026-11-14', times: { fajr: 313, sunrise: 459, dhuhr: 692, asr: 782, maghrib: 924, isha: 1062 } };
  const a = adjustDay(d, { dhuhr: 4, asr: 2, maghrib: 9, isha: 72 });
  ok(a.times.dhuhr === 696 && a.times.asr === 784 && a.times.maghrib === 933 && a.times.isha === 1134 && a.times.fajr === 313, 'adjustDay adds minutes');
  ok(adjustDay(d, {}) === d && d.times.dhuhr === 692, 'no adjustment leaves the day as it is');
  console.log('adjust: ok');
}
