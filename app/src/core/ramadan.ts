// Ramadan year by year: when it begins and ends in the Gregorian calendar, and how long the fast is.
// The dates follow the app's Hijri calendar (Umm al-Qurā via Aladhan, the arithmetic calendar offline, ± the person's
// adjustment), so they agree with the month view. The real start follows the new moon and can differ by a day.
import { fromHijri, monthLength, toHijri } from './hijri';
import { calcDay, type Place, type PrayerOpts } from './prayer';

export type Ramadan = { hy: number; start: Date; end: Date; days: number };
export type Season = 'summer' | 'winter' | 'mid';
export type RamadanView = 'ring' | 'grid' | 'clock' | 'spiral' | 'hours';
export const RAMADAN_VIEWS: RamadanView[] = ['ring', 'grid', 'clock', 'spiral', 'hours'];

const DAY = 86400000;
const noon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);

/** Every Ramadan that touches the Gregorian years from…to (both included). */
export function ramadans(from: number, to: number, offset = 0): Ramadan[] {
  const h0 = toHijri(new Date(from, 0, 1, 12)).y - 1, h1 = toHijri(new Date(to, 11, 31, 12)).y + 1;
  const out: Ramadan[] = [];
  for (let hy = h0; hy <= h1; hy++) {
    const days = monthLength(hy, 9);
    const start = noon(fromHijri({ y: hy, m: 9, d: 1 }, offset));
    const end = noon(fromHijri({ y: hy, m: 9, d: days }, offset));
    if (end.getFullYear() >= from && start.getFullYear() <= to) out.push({ hy, start, end, days });
  }
  return out;
}

/** The Ramadan going on now, or else the next one. */
export function currentOrNext(list: Ramadan[], today: Date): Ramadan | undefined {
  const t = noon(today).getTime();
  return list.find(r => r.end.getTime() >= t);
}

/** Whole days from today to the start (0 while it is going on). */
export function daysUntil(r: Ramadan, today: Date): number {
  return Math.max(0, Math.round((r.start.getTime() - noon(today).getTime()) / DAY));
}

/** Days into the year (0 = 1 January) and the length of that year. */
export function dayOfYear(d: Date): number {
  return Math.round((noon(d).getTime() - new Date(d.getFullYear(), 0, 1, 12).getTime()) / DAY);
}
export const yearLength = (y: number) => (new Date(y, 1, 29).getMonth() === 1 ? 366 : 365);

/** The parts of a Ramadan that fall in one Gregorian year, as days into that year (end included). */
export function partIn(r: Ramadan, year: number): { from: number; to: number } | null {
  if (r.end.getFullYear() < year || r.start.getFullYear() > year) return null;
  const from = r.start.getFullYear() < year ? 0 : dayOfYear(r.start);
  const to = r.end.getFullYear() > year ? yearLength(year) - 1 : dayOfYear(r.end);
  return { from, to };
}

/** Years in which Ramadan begins twice. */
export function twiceYears(list: Ramadan[]): number[] {
  const n = new Map<number, number>();
  list.forEach(r => n.set(r.start.getFullYear(), (n.get(r.start.getFullYear()) ?? 0) + 1));
  return [...n].filter(([, c]) => c > 1).map(([y]) => y);
}

/** Minutes of fasting (Fajr to Maghrib) in the middle of that Ramadan at the place. */
export function fastMinutes(r: Ramadan, place: Place, opts: PrayerOpts): number {
  const mid = new Date((r.start.getTime() + r.end.getTime()) / 2);
  const t = calcDay(mid, place, opts).times;
  return t.maghrib - t.fajr;
}

/** Summer, winter or spring/autumn in the middle of that Ramadan (turned around south of the equator). */
export function seasonOf(r: Ramadan, lat: number): Season {
  const m = new Date((r.start.getTime() + r.end.getTime()) / 2).getMonth() + 1;
  const north = [6, 7, 8].includes(m) ? 'summer' : [12, 1, 2].includes(m) ? 'winter' : 'mid';
  if (lat >= 0 || north === 'mid') return north;
  return north === 'summer' ? 'winter' : 'summer';
}
