// Prayer times.
//  - From Aladhan (api.aladhan.com, free, no key): a whole month for the chosen place, method Muslim World League
//    (Fajr 18°, ʿIshāʾ 17°), ʿaṣr Ḥanafī or standard, and a rule for the short summer nights at high latitudes.
//    The month is saved on the phone, so the times are there without internet.
//  - Without internet and nothing saved: the same method is calculated on the phone from the sun's position.
import { HDate } from './hijri';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const PRAYERS: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
/** The five prayers that get a notification (sunrise is shown but is not a prayer). */
export const SALAH: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const PRAYER_AR: Record<PrayerName, string> = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
export const PRAYER_TR: Record<PrayerName, string> = { fajr: 'Fajr', sunrise: 'Shurūq', dhuhr: 'Ẓuhr', asr: 'ʿAṣr', maghrib: 'Maghrib', isha: 'ʿIshāʾ' };

export type School = 'hanafi' | 'standard';
export type HighLat = 'angle' | 'middle' | 'seventh';
export type Place = { name: string; country: string; lat: number; lng: number };
export type PrayerOpts = { school: School; highLat: HighLat };

/** One day: times as minutes after local midnight, plus the Umm al-Qurā date when it came from Aladhan. */
export type PrayerDay = { date: string; times: Record<PrayerName, number>; hijri?: HDate };

export const MWL = { fajr: 18, isha: 17 };
const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hhmm = (min: number) => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };

// ---- Aladhan ----

export const ALADHAN = 'https://api.aladhan.com/v1';
const latMethod: Record<HighLat, number> = { middle: 1, seventh: 2, angle: 3 };

export function aladhanUrl(p: Place, year: number, month: number, o: PrayerOpts): string {
  const q = `latitude=${p.lat.toFixed(4)}&longitude=${p.lng.toFixed(4)}&method=3&school=${o.school === 'hanafi' ? 1 : 0}&latitudeAdjustmentMethod=${latMethod[o.highLat]}&calendarMethod=UAQ`;
  return `${ALADHAN}/calendar/${year}/${month}?${q}`;
}
export function aladhanCityUrl(city: string, country: string): string {
  return `${ALADHAN}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3`;
}

const toMin = (s: unknown): number => {
  const m = /(\d{1,2}):(\d{2})/.exec(String(s ?? ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

/** Turns Aladhan's month answer into prayer days. Days with a missing time are left out. */
export function parseAladhan(json: any): PrayerDay[] {
  const out: PrayerDay[] = [];
  for (const day of (json?.data ?? []) as any[]) {
    const t = day?.timings ?? {};
    const times: Record<PrayerName, number> = {
      fajr: toMin(t.Fajr), sunrise: toMin(t.Sunrise), dhuhr: toMin(t.Dhuhr), asr: toMin(t.Asr), maghrib: toMin(t.Maghrib), isha: toMin(t.Isha),
    };
    if (PRAYERS.some(k => !Number.isFinite(times[k]))) continue;
    const g = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(day?.date?.gregorian?.date ?? ''));
    if (!g) continue;
    const h = day?.date?.hijri;
    const hijri = h && Number(h.day) && Number(h.month?.number) && Number(h.year) ? { d: Number(h.day), m: Number(h.month.number), y: Number(h.year) } : undefined;
    out.push({ date: `${g[3]}-${g[2]}-${g[1]}`, times, hijri });
  }
  return out;
}

/** Coordinates of a city looked up through Aladhan (for places outside the built-in list). */
export function parseCityMeta(json: any): { lat: number; lng: number } | null {
  const m = json?.data?.meta;
  const lat = Number(m?.latitude), lng = Number(m?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) ? { lat, lng } : null;
}

export async function fetchMonth(p: Place, year: number, month: number, o: PrayerOpts, f: typeof fetch = fetch): Promise<PrayerDay[]> {
  const r = await f(aladhanUrl(p, year, month, o), { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const days = parseAladhan(await r.json());
  if (days.length < 28) throw new Error('incomplete month');
  return days;
}

// ---- Calculation on the phone (same method, used without internet) ----

const rad = (d: number) => (d * Math.PI) / 180, deg = (r: number) => (r * 180) / Math.PI;
const fixAngle = (a: number) => a - 360 * Math.floor(a / 360);
const fixHour = (h: number) => h - 24 * Math.floor(h / 24);

function sun(jd: number) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g)));
  const e = 23.439 - 0.00000036 * D;
  const RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15;
  const decl = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L))));
  const eqt = q / 15 - fixHour(RA);
  return { decl, eqt };
}

/** Prayer times for one local day, in minutes after midnight. tz = hours from UTC on that day. */
export function calcDay(date: Date, p: Place, o: PrayerOpts, tz = -new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTimezoneOffset() / 60): PrayerDay {
  const jd0 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000 + 2440587.5;
  const lat = p.lat;
  const at = (hour: number) => sun(jd0 + (hour - tz) / 24);
  const noonOf = (hour: number) => { const s = at(hour); return 12 + tz - p.lng / 15 - s.eqt; };
  const dhuhr = noonOf(12);
  const ha = (angle: number, hour: number) => {
    const s = at(hour);
    const v = (-Math.sin(rad(angle)) - Math.sin(rad(s.decl)) * Math.sin(rad(lat))) / (Math.cos(rad(s.decl)) * Math.cos(rad(lat)));
    return v < -1 || v > 1 ? NaN : deg(Math.acos(v)) / 15;
  };
  const sunrise = dhuhr - ha(0.833, 6), sunset = dhuhr + ha(0.833, 18);
  // Midnight sun or polar night (far north): calculate as at 65° (the nearest latitude where the sun rises and sets).
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset)) {
    if (Math.abs(lat) > 65) return calcDay(date, { ...p, lat: Math.sign(lat) * 65 }, o, tz);
  }
  let fajr = dhuhr - ha(MWL.fajr, 5), isha = dhuhr + ha(MWL.isha, 19);
  const s = at(15);
  const factor = o.school === 'hanafi' ? 2 : 1;
  const asrAlt = -deg(Math.atan(1 / (factor + Math.tan(rad(Math.abs(lat - s.decl))))));
  const asr = dhuhr + ha(asrAlt, 15);
  // Short nights: Fajr and ʿIshāʾ no later/earlier than a portion of the night from sunrise/sunset.
  const night = 24 - (sunset - sunrise);
  const portion = (a: number) => (o.highLat === 'middle' ? night / 2 : o.highLat === 'seventh' ? night / 7 : (a / 60) * night);
  if (!Number.isFinite(fajr) || sunrise - fajr > portion(MWL.fajr)) fajr = sunrise - portion(MWL.fajr);
  if (!Number.isFinite(isha) || isha - sunset > portion(MWL.isha)) isha = sunset + portion(MWL.isha);
  const m = (h: number) => Math.round(h * 60);
  return { date: ymd(date), times: { fajr: m(fajr), sunrise: m(sunrise), dhuhr: m(dhuhr), asr: m(asr), maghrib: m(sunset), isha: m(isha) } };
}

// ---- Next prayer ----

/** The next of the five prayers from `now` (looks into tomorrow after ʿIshāʾ). */
export function nextPrayer(now: Date, today: PrayerDay | undefined, tomorrow: PrayerDay | undefined): { name: PrayerName; at: Date; minutes: number } | null {
  const mins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  if (today) for (const k of SALAH) if (today.times[k] > mins) {
    const at = new Date(now); at.setHours(0, today.times[k], 0, 0);
    return { name: k, at, minutes: today.times[k] - mins };
  }
  if (tomorrow) {
    const at = new Date(now); at.setDate(at.getDate() + 1); at.setHours(0, tomorrow.times.fajr, 0, 0);
    return { name: 'fajr', at, minutes: 1440 - mins + tomorrow.times.fajr };
  }
  return null;
}

// ---- Places ----

/** Swedish towns with coordinates (prayer times, Qibla). Other places are looked up by name. */
export const SWEDEN: Place[] = ([
  ['Stockholm', 59.3293, 18.0686], ['Göteborg', 57.7089, 11.9746], ['Malmö', 55.605, 13.0038], ['Uppsala', 59.8586, 17.6389],
  ['Västerås', 59.6099, 16.5448], ['Örebro', 59.2741, 15.2066], ['Linköping', 58.4108, 15.6214], ['Helsingborg', 56.0465, 12.6945],
  ['Jönköping', 57.7826, 14.1618], ['Norrköping', 58.5877, 16.1924], ['Lund', 55.7047, 13.191], ['Umeå', 63.8258, 20.263],
  ['Gävle', 60.6749, 17.1413], ['Borås', 57.721, 12.9401], ['Södertälje', 59.1955, 17.6253], ['Eskilstuna', 59.3666, 16.5077],
  ['Halmstad', 56.6745, 12.8578], ['Växjö', 56.8777, 14.8091], ['Karlstad', 59.4022, 13.5115], ['Sundsvall', 62.3908, 17.3069],
  ['Luleå', 65.5848, 22.1547], ['Trollhättan', 58.2837, 12.2886], ['Östersund', 63.1792, 14.6357], ['Borlänge', 60.4858, 15.4371],
  ['Falun', 60.6065, 15.6355], ['Kalmar', 56.6634, 16.3566], ['Kristianstad', 56.0294, 14.1567], ['Karlskrona', 56.1612, 15.5869],
  ['Skövde', 58.3903, 13.8461], ['Uddevalla', 58.3498, 11.9356], ['Landskrona', 55.8708, 12.8302], ['Motala', 58.5371, 15.0365],
  ['Nyköping', 58.753, 17.0079], ['Skellefteå', 64.7507, 20.9528], ['Örnsköldsvik', 63.2909, 18.7153], ['Kiruna', 67.8558, 20.2253],
  ['Visby', 57.6348, 18.2948], ['Botkyrka', 59.2, 17.83], ['Järfälla', 59.4233, 17.8337], ['Huddinge', 59.2367, 17.9819],
] as [string, number, number][]).map(([name, lat, lng]) => ({ name, country: 'Sverige', lat, lng }));
export const DEFAULT_PLACE: Place = SWEDEN[0];
