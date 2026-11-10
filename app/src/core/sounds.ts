// Sounds for the prayer notifications: the phone's own sound, silence, an adhan that comes with the app,
// or a sound from the phone ("content://…"). Each sound gets its own Android channel (Android fixes a channel's sound).
export type Adhan = { id: string; name: string; sv: string; en: string; fajr?: boolean };

export const ADHANS: Adhan[] = [
  { id: 'raw:adhan_makkah', name: 'Makkah', sv: 'al-Masjid al-Ḥarām', en: 'al-Masjid al-Ḥarām' },
  { id: 'raw:adhan_alafasy', name: 'Mishary al-ʿAfāsī', sv: 'Kuwait', en: 'Kuwait' },
  { id: 'raw:adhan_abdulbasit', name: 'ʿAbd al-Bāsiṭ ʿAbd aṣ-Ṣamad', sv: 'Egypten', en: 'Egypt' },
  { id: 'raw:adhan_minshawi', name: 'Muḥammad Ṣiddīq al-Minshāwī', sv: 'Egypten', en: 'Egypt' },
  { id: 'raw:adhan_qatami', name: 'Nāṣir al-Qaṭāmī', sv: 'Riyadh', en: 'Riyadh' },
];
/** The Fajr adhan (with "aṣ-ṣalātu khayrun min an-nawm"), used at Fajr when an adhan is chosen. */
export const FAJR_ADHAN: Adhan = { id: 'raw:adhan_fajr', name: 'Adhan al-Fajr', sv: 'med “aṣ-ṣalātu khayrun min an-nawm”', en: 'with “aṣ-ṣalātu khayrun min an-nawm”', fajr: true };

export const isAdhan = (s: string) => s.startsWith('raw:adhan_');

/** A short, stable channel id for a sound (and whether it plays as an alarm). */
export function channelId(sound: string, alarm: boolean, prefix = 'prayer-'): string {
  let h = 5381;
  for (const c of `${sound}|${alarm ? 1 : 0}`) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return `${prefix}${h.toString(36)}`;
}

/** The sound for each prayer: the Fajr adhan at Fajr when an adhan is chosen and the option is on. */
export function soundFor(prayer: string, sound: string, fajrAdhan: boolean): string {
  return prayer === 'fajr' && fajrAdhan && isAdhan(sound) ? FAJR_ADHAN.id : sound;
}
