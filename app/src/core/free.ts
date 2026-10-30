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

// ---- checking what the phone's text recognition read ----

const AR_LETTER = /[ء-غف-يٱ]/g;
const normWord = (w: string) => stripHarakat(w).replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^ء-ي]/g, '');

/** All distinct (normalized) words of the Qur'an: a dictionary to tell real Arabic from noise. */
export function vocabulary(q: QuranData): Set<string> {
  const v = new Set<string>();
  for (const s of q.surahs) for (const a of s.ayahs) for (const w of a.split(/\s+/)) {
    const n = normWord(w);
    if (n.length > 1) { v.add(n); if (n.startsWith('ال') && n.length > 3) v.add(n.slice(2)); }
  }
  return v;
}

const known = (w: string, vocab?: Set<string>) => {
  if (!vocab) return true;
  if (vocab.has(w)) return true;
  // common prefixes (wa-, fa-, bi-, li-, ka-, al-) and suffixes (-hu, -hā, -hum, -kum, -nā)
  for (const p of ['و', 'ف', 'ب', 'ل', 'ك', 'ال', 'وال', 'بال', 'فال', 'لل']) if (w.startsWith(p) && vocab.has(w.slice(p.length))) return true;
  for (const x of ['ه', 'ها', 'هم', 'كم', 'نا', 'ي', 'ك']) if (w.endsWith(x) && vocab.has(w.slice(0, -x.length))) return true;
  return false;
};

export type OcrCheck = { text: string; ok: boolean; quality: number };

/**
 * Cleans what Tesseract read and says whether it is real text. Lines that are mostly digits, symbols or loose letters
 * are dropped. The rest is accepted when enough of it is Arabic words and (with a dictionary) enough of those words exist.
 */
export function checkOcr(raw: string, vocab?: Set<string>): OcrCheck {
  const lines: string[] = [];
  let words = 0, good = 0;
  for (const line of raw.split(/\n+/)) {
    const toks = line.split(/\s+/).filter(Boolean);
    if (!toks.length) continue;
    const arabic = toks.map(t => t.replace(/[^؀-ۿ]/g, '')).filter(t => (t.match(AR_LETTER) ?? []).length >= 2 && !/(.)\1\1/.test(t));
    if (arabic.length / toks.length < 0.6) continue;
    lines.push(arabic.join(' '));
    for (const t of arabic) { words++; if (known(normWord(t), vocab)) good++; }
  }
  const text = lines.join('\n').trim();
  const nonSpace = raw.replace(/\s+/g, '').length || 1;
  const letters = (text.match(AR_LETTER) ?? []).length;
  const share = letters / nonSpace;               // how much of what was read survived
  const real = words ? good / words : 0;          // how many words are real words
  const quality = Math.min(1, share * 1.4) * 0.4 + real * 0.6;
  return { text, ok: words >= 2 && share >= 0.45 && (!vocab || real >= 0.5), quality };
}

/** Repeated words or digits in a machine translation of noise ("0 0 0 0 …", "ف ف ف …") are cut down. */
export function collapseRepeats(s: string): string {
  return s.replace(/(\S+)(?:\s+\1){3,}/g, '$1 …');
}
