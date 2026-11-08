// Word by word: the meaning of each word (English, from quran.com) fetched once per sūra and saved on the phone.
// Quran.com has no Swedish word-by-word translation, so the words are always in English.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Word = { ar: string; tr: string; en: string };
export type WbwSurah = Record<number, Word[]>; // verse number -> words

const KEY = (n: number) => `alif.wbw.v1.${n}`;
const API = 'https://api.quran.com/api/v4';

export function parseWbw(json: any): WbwSurah {
  const out: WbwSurah = {};
  for (const v of (json?.verses ?? []) as any[]) {
    const n = Number(v?.verse_number ?? String(v?.verse_key ?? '').split(':')[1]);
    if (!n) continue;
    out[n] = ((v?.words ?? []) as any[]).filter(w => w?.char_type_name === 'word').map(w => ({
      ar: String(w?.text_uthmani ?? w?.text ?? ''), tr: String(w?.transliteration?.text ?? ''), en: String(w?.translation?.text ?? ''),
    }));
  }
  return out;
}

export async function loadWbw(n: number, ayahs: number, f: typeof fetch = fetch): Promise<WbwSurah> {
  try { const raw = await AsyncStorage.getItem(KEY(n)); if (raw) return JSON.parse(raw); } catch {}
  const all: WbwSurah = {};
  const pages = Math.ceil(ayahs / 50);
  for (let p = 1; p <= pages; p++) {
    const r = await f(`${API}/verses/by_chapter/${n}?words=true&word_fields=text_uthmani&word_translation_language=en&language=en&per_page=50&page=${p}`, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    Object.assign(all, parseWbw(await r.json()));
  }
  if (Object.keys(all).length < ayahs) throw new Error('incomplete');
  AsyncStorage.setItem(KEY(n), JSON.stringify(all)).catch(() => {});
  return all;
}
