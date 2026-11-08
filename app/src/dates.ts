// Dates written out in Swedish or English (own tables, so they look the same on every phone).
import type { Lang } from './i18n';
import { HDate, MONTHS } from './core/hijri';

const WD: Record<Lang, string[]> = {
  sv: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const MO: Record<Lang, string[]> = {
  sv: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
export const WEEK_SHORT: Record<Lang, string[]> = { sv: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const weekday = (d: Date, lang: Lang) => WD[lang][d.getDay()];
export const longDate = (d: Date, lang: Lang) => (lang === 'sv' ? `${cap(weekday(d, lang))} ${d.getDate()} ${MO.sv[d.getMonth()]}` : `${weekday(d, lang)} ${d.getDate()} ${MO.en[d.getMonth()]}`);
export const shortDate = (d: Date, lang: Lang) => `${d.getDate()} ${MO[lang][d.getMonth()].slice(0, 3)}`;
export const hijriText = (h: HDate) => `${h.d} ${MONTHS[h.m - 1].tr} ${h.y}`;
