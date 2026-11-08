// Recitation: verse-by-verse audio from the Islamic Network CDN (the audio editions of AlQuran Cloud).
// Each verse is one MP3 named after its number in the whole Qur'an (1 … 6236).
import { SURAHS } from './quran';

export type Reciter = { id: string; name: string; ar: string; style: string };
export const RECITERS: Reciter[] = [
  { id: 'ar.husary', name: 'Maḥmūd Khalīl al-Ḥuṣarī', ar: 'محمود خليل الحصري', style: 'murattal' },
  { id: 'ar.husarymujawwad', name: 'al-Ḥuṣarī (mujawwad)', ar: 'الحصري (مجود)', style: 'mujawwad' },
  { id: 'ar.minshawi', name: 'Muḥammad Ṣiddīq al-Minshāwī', ar: 'محمد صديق المنشاوي', style: 'murattal' },
  { id: 'ar.minshawimujawwad', name: 'al-Minshāwī (mujawwad)', ar: 'المنشاوي (مجود)', style: 'mujawwad' },
  { id: 'ar.alafasy', name: 'Mishary Rāshid al-ʿAfāsī', ar: 'مشاري راشد العفاسي', style: 'murattal' },
  { id: 'ar.abdulbasitmurattal', name: 'ʿAbd al-Bāsiṭ ʿAbd aṣ-Ṣamad', ar: 'عبد الباسط عبد الصمد', style: 'murattal' },
  { id: 'ar.abdurrahmaansudais', name: 'ʿAbd ar-Raḥmān as-Sudays', ar: 'عبد الرحمن السديس', style: 'murattal' },
  { id: 'ar.saoodshuraym', name: 'Saʿūd ash-Shuraym', ar: 'سعود الشريم', style: 'murattal' },
  { id: 'ar.mahermuaiqly', name: 'Māhir al-Muʿayqilī', ar: 'ماهر المعيقلي', style: 'murattal' },
  { id: 'ar.hudhaify', name: 'ʿAlī al-Ḥudhayfī', ar: 'علي الحذيفي', style: 'murattal' },
  { id: 'ar.shaatree', name: 'Abū Bakr ash-Shāṭirī', ar: 'أبو بكر الشاطري', style: 'murattal' },
  { id: 'ar.muhammadayyoub', name: 'Muḥammad Ayyūb', ar: 'محمد أيوب', style: 'murattal' },
];
export const DEFAULT_RECITER = 'ar.husary';

const START: number[] = (() => { const s = [0]; for (const x of SURAHS) s.push(s[s.length - 1] + x.ayahs); return s; })();
/** Number of a verse in the whole Qur'an (1 … 6236). */
export const globalAyah = (surah: number, ayah: number) => START[surah - 1] + ayah;

export const AUDIO_CDN = 'https://cdn.islamic.network/quran/audio';
export const audioUrl = (reciter: string, surah: number, ayah: number, bitrate = 128) => `${AUDIO_CDN}/${bitrate}/${reciter}/${globalAyah(surah, ayah)}.mp3`;

/** Rough size of a sūra in MB at 128 kbit/s (about 90 kB per verse on average, longer verses weigh more). */
export function surahMB(surah: number): number {
  const ayahs = SURAHS[surah - 1].ayahs;
  const long = surah <= 9 || [16, 17, 18, 19, 20, 24, 33].includes(surah) ? 1.9 : 1;
  return Math.max(0.3, Math.round(ayahs * 0.09 * long * 10) / 10);
}
