import { aladhanUrl, calcDay, DEFAULT_PLACE, hhmm, nextPrayer, parseAladhan, parseCityMeta, SWEDEN } from '../src/core/prayer';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
// Calculation (Stockholm, 6 Nov 2026, CET = UTC+1): solar noon about 11:32, ordered times
const d = calcDay(new Date(2026, 10, 6), DEFAULT_PLACE, { school: 'hanafi', highLat: 'angle' }, 1);
const t = d.times;
ok(Math.abs(t.dhuhr - (11 * 60 + 32)) <= 3, `dhuhr ${hhmm(t.dhuhr)}`);
ok(t.fajr < t.sunrise && t.sunrise < t.dhuhr && t.dhuhr < t.asr && t.asr < t.maghrib && t.maghrib < t.isha, 'order');
const std = calcDay(new Date(2026, 10, 6), DEFAULT_PLACE, { school: 'standard', highLat: 'angle' }, 1);
ok(std.times.asr < t.asr, 'hanafi asr later than standard');
// Midsummer in Stockholm: Fajr/ʿIshāʾ follow the high-latitude rule and stay in order around the short night
const s = calcDay(new Date(2026, 5, 21), DEFAULT_PLACE, { school: 'hanafi', highLat: 'middle' }, 2).times;
ok(Number.isFinite(s.fajr) && Number.isFinite(s.isha) && s.isha > s.maghrib, 'summer night');
// Kiruna midnight sun: still numbers
const k = calcDay(new Date(2026, 5, 21), SWEDEN.find(p => p.name === 'Kiruna')!, { school: 'hanafi', highLat: 'angle' }, 2).times;
ok(Object.values(k).every(Number.isFinite), 'kiruna');
// Aladhan answer
const json = { data: [{ timings: { Fajr: '05:46 (CET)', Sunrise: '07:22 (CET)', Dhuhr: '11:32 (CET)', Asr: '13:05 (CET)', Maghrib: '15:42 (CET)', Isha: '17:28 (CET)' },
  date: { gregorian: { date: '06-11-2026' }, hijri: { day: '26', month: { number: 5 }, year: '1448' } } }] };
const p = parseAladhan(json);
ok(p.length === 1 && p[0].date === '2026-11-06' && p[0].times.fajr === 346 && p[0].hijri?.d === 26 && p[0].hijri?.m === 5, 'parse');
ok(parseAladhan({ data: [{ timings: { Fajr: 'x' }, date: {} }] }).length === 0, 'bad day skipped');
ok(parseCityMeta({ data: { meta: { latitude: 41.0, longitude: 28.9 } } })?.lat === 41, 'meta');
ok(aladhanUrl(DEFAULT_PLACE, 2026, 11, { school: 'hanafi', highLat: 'angle' }).includes('method=3&school=1&latitudeAdjustmentMethod=3'), 'url');
// next prayer
const now = new Date(2026, 10, 6, 13, 0);
const n = nextPrayer(now, p[0], p[0]);
ok(n?.name === 'asr' && Math.round(n.minutes) === 5, `next ${n?.name} ${n?.minutes}`);
const late = nextPrayer(new Date(2026, 10, 6, 22, 0), p[0], p[0]);
ok(late?.name === 'fajr' && late.at.getDate() === 7, 'after isha → fajr tomorrow');
if (fail) process.exit(1);
console.log('prayer: all ok');
