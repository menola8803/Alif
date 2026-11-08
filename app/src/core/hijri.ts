// Hijri (Islamic) calendar.
// The date shown in the app comes from Aladhan's Umm al-Qurā calendar when it has been fetched (see prayer.ts); the
// arithmetic (tabular) calendar below is the fallback without internet and is shifted to agree with Aladhan whenever
// both are known. The person can move the date ±1 day in Settings to follow the local moon sighting.

export type HDate = { d: number; m: number; y: number };

const JD_EPOCH = 1948440; // 1 Muḥarram 1 AH (civil/tabular), Julian day number

/** Julian day number (noon) of a Gregorian date. */
export function gToJd(y: number, m: number, d: number): number {
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 2440588;
}
export function jdToG(jd: number): { y: number; m: number; d: number } {
  const t = new Date((jd - 2440588) * 86400000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/** Tabular Islamic date for a Julian day number (Kuwaiti algorithm). */
export function jdToH(jd: number): HDate {
  let l = jd - JD_EPOCH + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * l) / 709);
  const d = l - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { d, m, y };
}
export function hToJd(h: HDate): number {
  return Math.floor((11 * h.y + 3) / 30) + 354 * h.y + 30 * h.m - Math.floor((h.m - 1) / 2) + h.d + JD_EPOCH - 385;
}

const localJd = (date: Date) => gToJd(date.getFullYear(), date.getMonth() + 1, date.getDate());

/** Hijri date of a (local) day, shifted by `offset` days (auto offset from Aladhan + the person's ±1). */
export function toHijri(date: Date, offset = 0): HDate {
  return jdToH(localJd(date) + offset);
}
/** Gregorian (local) date of a Hijri date with the same offset. */
export function fromHijri(h: HDate, offset = 0): Date {
  const g = jdToG(hToJd(h) - offset);
  return new Date(g.y, g.m - 1, g.d);
}
/** Days in a Hijri month (29 or 30) with the offset used. */
export function monthLength(y: number, m: number): number {
  const next = m === 12 ? { y: y + 1, m: 1, d: 1 } : { y, m: m + 1, d: 1 };
  return hToJd(next) - hToJd({ y, m, d: 1 });
}

/** Offset that makes the tabular date agree with a known (Umm al-Qurā) date for the same day. */
export function offsetFor(date: Date, known: HDate): number {
  const diff = hToJd(known) - hToJd(toHijri(date));
  return Math.abs(diff) <= 3 ? diff : 0;
}

export type MonthInfo = { n: number; ar: string; tr: string; sv: string; en: string; sacred: boolean };
export const MONTHS: MonthInfo[] = [
  { n: 1, ar: 'مُحَرَّم', tr: 'Muḥarram', sv: 'Den heliga (förbjudna) månaden', en: 'The sacred (forbidden) month', sacred: true },
  { n: 2, ar: 'صَفَر', tr: 'Ṣafar', sv: 'Den tomma månaden', en: 'The empty month', sacred: false },
  { n: 3, ar: 'رَبِيع ٱلْأَوَّل', tr: 'Rabīʿ al-awwal', sv: 'Första våren – Profetens ﷺ födelsemånad', en: 'First spring – month of the Prophet’s ﷺ birth', sacred: false },
  { n: 4, ar: 'رَبِيع ٱلْآخِر', tr: 'Rabīʿ al-ākhir', sv: 'Andra våren', en: 'Second spring', sacred: false },
  { n: 5, ar: 'جُمَادَىٰ ٱلْأُولَىٰ', tr: 'Jumādā al-ūlā', sv: 'Första torra månaden', en: 'First dry month', sacred: false },
  { n: 6, ar: 'جُمَادَىٰ ٱلْآخِرَة', tr: 'Jumādā al-ākhira', sv: 'Andra torra månaden', en: 'Second dry month', sacred: false },
  { n: 7, ar: 'رَجَب', tr: 'Rajab', sv: 'Allahs månad', en: 'The month of Allah', sacred: true },
  { n: 8, ar: 'شَعْبَان', tr: 'Shaʿbān', sv: 'Profetens ﷺ månad', en: 'The month of the Prophet ﷺ', sacred: false },
  { n: 9, ar: 'رَمَضَان', tr: 'Ramaḍān', sv: 'Fastemånaden', en: 'The month of fasting', sacred: false },
  { n: 10, ar: 'شَوَّال', tr: 'Shawwāl', sv: 'ʿĪd al-fiṭr den första', en: 'ʿĪd al-fiṭr on the first', sacred: false },
  { n: 11, ar: 'ذُو ٱلْقَعْدَة', tr: 'Dhū al-qaʿda', sv: 'Vilomånaden', en: 'The month of rest', sacred: true },
  { n: 12, ar: 'ذُو ٱلْحِجَّة', tr: 'Dhū al-ḥijja', sv: 'Hajjmånaden', en: 'The month of Hajj', sacred: true },
];

export type SpecialDay = { m: number; d: number; tr: string; sv: string; en: string };
export const SPECIAL_DAYS: SpecialDay[] = [
  { m: 1, d: 1, tr: 'Raʾs as-sana', sv: 'Islamiska nyåret', en: 'Islamic New Year' },
  { m: 1, d: 10, tr: 'ʿĀshūrāʾ', sv: 'ʿĀshūrāʾ', en: 'ʿĀshūrāʾ' },
  { m: 3, d: 12, tr: 'Mawlid an-Nabī ﷺ', sv: 'Profetens ﷺ födelsedag', en: 'The Prophet’s ﷺ birthday' },
  { m: 7, d: 27, tr: 'al-Isrāʾ wa-l-Miʿrāj', sv: 'Nattresan och himmelsfärden', en: 'The Night Journey and Ascension' },
  { m: 8, d: 15, tr: 'Laylat al-Barāʾa', sv: 'Natten mitt i Shaʿbān', en: 'The night of mid-Shaʿbān' },
  { m: 9, d: 1, tr: 'Ramaḍān', sv: 'Fastan börjar', en: 'The fast begins' },
  { m: 9, d: 27, tr: 'Laylat al-Qadr', sv: 'Maktens natt (sökes de sista tio nätterna)', en: 'The Night of Power (sought in the last ten nights)' },
  { m: 10, d: 1, tr: 'ʿĪd al-fiṭr', sv: 'Högtiden efter fastan', en: 'Feast of breaking the fast' },
  { m: 12, d: 9, tr: 'Yawm ʿArafa', sv: 'ʿArafa-dagen', en: 'The day of ʿArafa' },
  { m: 12, d: 10, tr: 'ʿĪd al-aḍḥā', sv: 'Offerhögtiden', en: 'Feast of the Sacrifice' },
];

/** The next special day (today included) and how many days away it is. */
export function nextSpecial(today: Date, offset = 0): { day: SpecialDay; date: Date; days: number } {
  const jd = localJd(today) + offset;
  const h = jdToH(jd);
  let best: { day: SpecialDay; jd: number } | null = null;
  for (const y of [h.y, h.y + 1]) for (const s of SPECIAL_DAYS) {
    const j = hToJd({ y, m: s.m, d: s.d });
    if (j >= jd && (!best || j < best.jd)) best = { day: s, jd: j };
  }
  const b = best!;
  const g = jdToG(b.jd - offset);
  return { day: b.day, date: new Date(g.y, g.m - 1, g.d), days: b.jd - jd };
}

/** The next sacred month (al-ashhur al-ḥurum) after the current one, with the days until it starts. */
export function nextSacredMonth(today: Date, offset = 0): { month: MonthInfo; date: Date; days: number } {
  const jd = localJd(today) + offset;
  const h = jdToH(jd);
  for (let k = 1; k <= 12; k++) {
    const m = ((h.m - 1 + k) % 12) + 1, y = h.y + Math.floor((h.m - 1 + k) / 12);
    if (MONTHS[m - 1].sacred) {
      const j = hToJd({ y, m, d: 1 });
      const g = jdToG(j - offset);
      return { month: MONTHS[m - 1], date: new Date(g.y, g.m - 1, g.d), days: j - jd };
    }
  }
  throw new Error('unreachable');
}
