// Translation and verse recognition without an API key.
// - MyMemory (api.mymemory.translated.net): free online translation, no key, a daily limit per phone.
// - Finding Qur'an verses in a text by comparing words with the Qur'an on the phone (works offline).
import { QuranData } from './quran';
import { stripHarakat } from './translit';

/** Splits text into pieces of at most `max` characters, at sentence or word boundaries. */
export function chunks(text: string, max = 450): string[] {
  const out: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    const part = rest.slice(0, max);
    let cut = Math.max(part.lastIndexOf('. '), part.lastIndexOf('۔'), part.lastIndexOf('؟'), part.lastIndexOf('\n'), part.lastIndexOf('،'));
    if (cut < max * 0.4) cut = part.lastIndexOf(' ');
    if (cut <= 0) cut = max - 1;
    out.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) out.push(rest);
  return out;
}

export async function myMemory(text: string, from: string, to: string, f: typeof fetch = fetch): Promise<string> {
  const parts: string[] = [];
  for (const piece of chunks(text)) {
    let r: Response;
    try {
      r = await f(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(piece)}&langpair=${from}|${to}`, { headers: { Accept: 'application/json' } });
    } catch { throw Object.assign(new Error('network'), { kind: 'network' }); }
    if (r.status === 429) throw Object.assign(new Error('busy'), { kind: 'busy' });
    const j: any = await r.json().catch(() => null);
    if (!r.ok || !j) throw Object.assign(new Error(`HTTP ${r.status}`), { kind: 'other' });
    if (j.quotaFinished || Number(j.responseStatus) === 429) throw Object.assign(new Error('quota'), { kind: 'quota' });
    const t = String(j.responseData?.translatedText ?? '');
    if (Number(j.responseStatus) !== 200 || !t) throw Object.assign(new Error(String(j.responseDetails ?? 'error')), { kind: 'other' });
    parts.push(t);
  }
  return parts.join(' ');
}

// ---- verse recognition ----

const norm = (s: string) => stripHarakat(s).replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[^ء-ي\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);

export type VerseHit = { surah: number; from: number; to: number; score: number };

/**
 * Finds the passage of the Qur'an that a text comes from: the run of up to 10 consecutive verses whose words cover the
 * text best. Needs at least 3 Arabic words; returns null when fewer than 70 % of the words are found.
 */
export function findVerses(text: string, q: QuranData): VerseHit | null {
  const words = norm(text);
  if (words.length < 3) return null;
  const want = new Set(words);
  let best: VerseHit | null = null;
  q.surahs.forEach((s, si) => {
    const vw = s.ayahs.map(a => new Set(norm(a)));
    for (let i = 0; i < vw.length; i++) {
      // quick filter: the verse must share at least two words (or be very short)
      let shared = 0; vw[i].forEach(w => { if (want.has(w)) shared++; });
      if (shared < Math.min(2, vw[i].size)) continue;
      const seen = new Set<string>();
      for (let j = i; j < Math.min(i + 10, vw.length); j++) {
        vw[j].forEach(w => seen.add(w));
        const covered = words.filter(w => seen.has(w)).length / words.length;
        // penalize passages much longer than the text
        let size = 0; for (let k = i; k <= j; k++) size += vw[k].size;
        const score = covered - Math.max(0, size - words.length * 1.3) * 0.004;
        if (!best || score > best.score + 1e-9) best = { surah: si + 1, from: i + 1, to: j + 1, score };
        if (covered >= 0.999) break;
      }
    }
  });
  const hit = best as VerseHit | null;
  return hit && hit.score >= 0.7 ? hit : null;
}
