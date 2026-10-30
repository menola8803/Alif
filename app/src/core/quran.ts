// The Qur'an: list of sūras (built in, works offline) and verses with translations from the free AlQuran Cloud API
// (https://alquran.cloud/api). Fetched sūras are cached on the phone by the store, so read sūras work offline.
import { stripHarakat } from './translit';

export const QURAN_API = 'https://api.alquran.cloud/v1';
export const ARABIC_EDITION = 'quran-uthmani';

// [transliterated name, number of verses]
const S: [string, number][] = [
  ['Al-Fātiḥah', 7], ['Al-Baqarah', 286], ['Āl ʿImrān', 200], ['An-Nisāʾ', 176], ['Al-Māʾidah', 120], ['Al-Anʿām', 165], ['Al-Aʿrāf', 206],
  ['Al-Anfāl', 75], ['At-Tawbah', 129], ['Yūnus', 109], ['Hūd', 123], ['Yūsuf', 111], ['Ar-Raʿd', 43], ['Ibrāhīm', 52], ['Al-Ḥijr', 99],
  ['An-Naḥl', 128], ['Al-Isrāʾ', 111], ['Al-Kahf', 110], ['Maryam', 98], ['Ṭā Hā', 135], ['Al-Anbiyāʾ', 112], ['Al-Ḥajj', 78],
  ['Al-Muʾminūn', 118], ['An-Nūr', 64], ['Al-Furqān', 77], ['Ash-Shuʿarāʾ', 227], ['An-Naml', 93], ['Al-Qaṣaṣ', 88], ['Al-ʿAnkabūt', 69],
  ['Ar-Rūm', 60], ['Luqmān', 34], ['As-Sajdah', 30], ['Al-Aḥzāb', 73], ['Sabaʾ', 54], ['Fāṭir', 45], ['Yā Sīn', 83], ['Aṣ-Ṣāffāt', 182],
  ['Ṣād', 88], ['Az-Zumar', 75], ['Ghāfir', 85], ['Fuṣṣilat', 54], ['Ash-Shūrā', 53], ['Az-Zukhruf', 89], ['Ad-Dukhān', 59],
  ['Al-Jāthiyah', 37], ['Al-Aḥqāf', 35], ['Muḥammad', 38], ['Al-Fatḥ', 29], ['Al-Ḥujurāt', 18], ['Qāf', 45], ['Adh-Dhāriyāt', 60],
  ['Aṭ-Ṭūr', 49], ['An-Najm', 62], ['Al-Qamar', 55], ['Ar-Raḥmān', 78], ['Al-Wāqiʿah', 96], ['Al-Ḥadīd', 29], ['Al-Mujādilah', 22],
  ['Al-Ḥashr', 24], ['Al-Mumtaḥanah', 13], ['Aṣ-Ṣaff', 14], ['Al-Jumuʿah', 11], ['Al-Munāfiqūn', 11], ['At-Taghābun', 18], ['Aṭ-Ṭalāq', 12],
  ['At-Taḥrīm', 12], ['Al-Mulk', 30], ['Al-Qalam', 52], ['Al-Ḥāqqah', 52], ['Al-Maʿārij', 44], ['Nūḥ', 28], ['Al-Jinn', 28],
  ['Al-Muzzammil', 20], ['Al-Muddaththir', 56], ['Al-Qiyāmah', 40], ['Al-Insān', 31], ['Al-Mursalāt', 50], ['An-Nabaʾ', 40],
  ['An-Nāziʿāt', 46], ['ʿAbasa', 42], ['At-Takwīr', 29], ['Al-Infiṭār', 19], ['Al-Muṭaffifīn', 36], ['Al-Inshiqāq', 25], ['Al-Burūj', 22],
  ['Aṭ-Ṭāriq', 17], ['Al-Aʿlā', 19], ['Al-Ghāshiyah', 26], ['Al-Fajr', 30], ['Al-Balad', 20], ['Ash-Shams', 15], ['Al-Layl', 21],
  ['Aḍ-Ḍuḥā', 11], ['Ash-Sharḥ', 8], ['At-Tīn', 8], ['Al-ʿAlaq', 19], ['Al-Qadr', 5], ['Al-Bayyinah', 8], ['Az-Zalzalah', 8],
  ['Al-ʿĀdiyāt', 11], ['Al-Qāriʿah', 11], ['At-Takāthur', 8], ['Al-ʿAṣr', 3], ['Al-Humazah', 9], ['Al-Fīl', 5], ['Quraysh', 4],
  ['Al-Māʿūn', 7], ['Al-Kawthar', 3], ['Al-Kāfirūn', 6], ['An-Naṣr', 3], ['Al-Masad', 5], ['Al-Ikhlāṣ', 4], ['Al-Falaq', 5], ['An-Nās', 6],
];

export type SurahInfo = { number: number; name: string; ayahs: number; arabic?: string; meaning?: string };
export const SURAHS: SurahInfo[] = S.map(([name, ayahs], i) => ({ number: i + 1, name, ayahs }));
export const TOTAL_AYAHS = SURAHS.reduce((a, s) => a + s.ayahs, 0);

export type Ayah = { n: number; arabic: string; translation: string };
export type SurahText = { number: number; arabicName: string; meaning: string; edition: string; bismillah: boolean; ayahs: Ayah[] };
export type Edition = { identifier: string; name: string; englishName: string; language: string };

// Preferred translations per app language. The first that the API has is used, unless the person picks another.
export const DEFAULT_EDITIONS: Record<'sv' | 'en', string[]> = {
  sv: ['sv.bernstrom'],
  en: ['en.sahih', 'en.asad', 'en.pickthall'],
};

const BISMILLAH = 'بسم الله الرحمن الرحيم';

/** In the API's Arabic text, verse 1 of every sūra except 1 and 9 starts with the basmala. Returns the verse without it. */
export function splitBismillah(surah: number, text: string): { bismillah: boolean; text: string } {
  if (surah === 1 || surah === 9) return { bismillah: false, text };
  const words = text.trim().split(/\s+/);
  if (words.length >= 4 && stripHarakat(words.slice(0, 4).join(' ')).replace(/[ٱأإآ]/g, 'ا') === BISMILLAH) {
    return { bismillah: true, text: words.slice(4).join(' ') };
  }
  return { bismillah: false, text };
}

async function get(path: string, f: typeof fetch = fetch): Promise<any> {
  const r = await f(`${QURAN_API}${path}`, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  if (j.code !== 200 || !j.data) throw new Error(String(j.data ?? j.status ?? 'error'));
  return j.data;
}

/** Translation editions in a language (e.g. 'sv', 'en'). */
export async function listEditions(lang: string, f: typeof fetch = fetch): Promise<Edition[]> {
  const data = await get(`/edition?format=text&type=translation&language=${encodeURIComponent(lang)}`, f);
  return (data as any[]).map(e => ({ identifier: e.identifier, name: e.name, englishName: e.englishName, language: e.language }));
}

/** A whole sūra: Uthmani Arabic and one translation. */
export async function fetchSurah(n: number, edition: string, f: typeof fetch = fetch): Promise<SurahText> {
  const data = await get(`/surah/${n}/editions/${ARABIC_EDITION},${encodeURIComponent(edition)}`, f);
  const [ar, tr] = data as any[];
  let bism = false;
  const ayahs: Ayah[] = (ar.ayahs as any[]).map((a, i) => {
    let text = String(a.text);
    if (a.numberInSurah === 1) { const s = splitBismillah(n, text); bism = s.bismillah; text = s.text; }
    return { n: a.numberInSurah, arabic: text, translation: String(tr?.ayahs?.[i]?.text ?? '') };
  });
  if (n !== 1 && n !== 9) bism = true;
  return { number: n, arabicName: String(ar.name ?? ''), meaning: String(ar.englishNameTranslation ?? ''), edition: tr?.edition?.identifier ?? edition, bismillah: bism, ayahs };
}

/** One or more verses, e.g. ref "2:255". */
export async function fetchAyahs(surah: number, from: number, to: number, edition: string, f: typeof fetch = fetch): Promise<Ayah[]> {
  const out: Ayah[] = [];
  for (let a = from; a <= to; a++) {
    const data = await get(`/ayah/${surah}:${a}/editions/${ARABIC_EDITION},${encodeURIComponent(edition)}`, f);
    const [ar, tr] = data as any[];
    let text = String(ar.text);
    if (a === 1) text = splitBismillah(surah, text).text || text;
    out.push({ n: a, arabic: text, translation: String(tr?.text ?? '') });
  }
  return out;
}

/** Picks the translation to use: the chosen one, else the first preferred one that exists. */
export function pickEdition(lang: 'sv' | 'en', chosen: string | undefined, available?: Edition[]): string {
  if (chosen) return chosen;
  const pref = DEFAULT_EDITIONS[lang];
  if (available?.length) return pref.find(p => available.some(e => e.identifier === p)) ?? available[0].identifier;
  return pref[0];
}

/** Valid reference? */
export function validRef(surah: number, from: number, to = from): boolean {
  const s = SURAHS[surah - 1];
  return !!s && from >= 1 && to >= from && to <= s.ayahs;
}

/** "2:255" or "2:1-5" → numbers. */
export function parseRef(ref: string): { surah: number; from: number; to: number } | null {
  const m = /^\s*(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?\s*$/.exec(ref);
  if (!m) return null;
  const surah = +m[1], from = +m[2], to = m[3] ? +m[3] : from;
  return validRef(surah, from, to) ? { surah, from, to } : null;
}
