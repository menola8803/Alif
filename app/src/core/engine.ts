// Reading and translating with Claude (the person's own Anthropic API key).
// Pure functions (prompt, parsing, verse matching) live here so they can be tested without a phone.
import { stripHarakat } from './translit';
import { parseRef, validRef } from './quran';

export type Target = 'sv' | 'en';
export type Direction = 'ar2x' | 'x2ar';
export type Word = { ar: string; tr: string; gloss: string };
export type QuranRef = { surah: number; from: number; to: number };
export type Result = {
  direction: Direction;
  source: string;       // what was read or typed
  arabic: string;       // fully vocalized Arabic
  translit: string;     // the model's transliteration (the app's own engine is used when the Arabic is vocalized)
  translation: string;  // Swedish/English (for x2ar: the text that was typed)
  words: Word[];
  notes: string;
  quran?: QuranRef;
  verses?: { n: number; arabic: string; translation: string }[]; // the verses from the muṣḥaf when the reference was confirmed
  edition?: string;    // translation edition of `verses`
  photo?: string;      // the photo as it was read (camera, phone engine)
};

export const MODELS = [
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5' },
] as const;
export const DEFAULT_MODEL = MODELS[0].id;

const LANG_NAME: Record<Target, string> = { sv: 'Swedish', en: 'English' };

export function systemPrompt(target: Target, scheme: 'academic' | 'simple'): string {
  const L = LANG_NAME[target];
  return [
    'You are an expert in Classical Arabic, the Qurʾān, tajwīd and Arabic grammar (naḥw and ṣarf), helping a learner.',
    'Always answer with ONE JSON object and nothing else (no markdown, no code fence), with exactly these keys:',
    '{"source": string, "arabic": string, "translit": string, "translation": string, "words": [{"ar": string, "tr": string, "gloss": string}], "notes": string, "quran": {"surah": number, "from": number, "to": number} | null}',
    'Rules:',
    '- "arabic": the Arabic text FULLY vocalized (every letter with its ḥaraka, sukūn, shadda, tanwīn, hamzat al-waṣl written as ٱ). For Qurʾān text use the Uthmani (Madani muṣḥaf) spelling and marks exactly.',
    '- "translit": the recited pronunciation in ' + (scheme === 'academic' ? 'ALA-LC style (ā ī ū ḥ ṣ ḍ ṭ ẓ ʿ ʾ, th kh dh sh gh j)' : 'plain letters only (aa ii uu, \' for ʿ and ʾ)') +
      ', applying how words join and end: hamzat al-waṣl dropped inside a phrase (bismi llāhi), sun-letter assimilation (ar-raḥmān), idghām/iqlāb of nūn sākina and tanwīn, and waqf at the end (drop final short vowels and -un/-in, -an → -ā, tāʾ marbūṭa → -h).',
    `- "translation": a faithful, natural ${L} translation. For Qurʾān verses translate the meaning faithfully (it is an interpretation of the meaning).`,
    `- "words": word-by-word, in reading order, up to 60 words: "ar" = the vocalized word, "tr" = its transliteration on its own, "gloss" = a short ${L} meaning (with the root in brackets for nouns and verbs, e.g. "(k-t-b)").`,
    `- "notes": in ${L}, 1-4 short sentences for a learner: grammar of word endings (iʿrāb), how words connect or where to pause, or tajwīd points that matter in this text. Empty string if nothing useful.`,
    '- "quran": if the Arabic text is (part of) a Qurʾān verse, give the sūra number and the first and last verse numbers; otherwise null. Only give it when you are sure.',
    '- If there is no readable Arabic, set "arabic" to "" and explain briefly in "notes".',
  ].join('\n');
}

export function userPromptAr(text: string, target: Target): string {
  return `Read, vocalize, transliterate and translate this Arabic text into ${LANG_NAME[target]}. "source" = the text exactly as given.\n\n${text}`;
}
export function userPromptImage(target: Target): string {
  return `The photo shows Arabic text (often Classical Arabic or the Qurʾān). "source" = the Arabic exactly as written in the photo, line by line, keeping any marks that are printed. Then vocalize, transliterate and translate it into ${LANG_NAME[target]}. Ignore page numbers, headers and decorations.`;
}
export function userPromptToArabic(text: string, target: Target): string {
  return `Translate this ${LANG_NAME[target]} text into Classical Arabic (fuṣḥā), fully vocalized. If it is a known Qurʾān verse or ḥadīth, give the original Arabic. "source" = the text exactly as given, "translation" = the same ${LANG_NAME[target]} text, "arabic" = your Arabic, "words" = the Arabic words with ${LANG_NAME[target]} glosses.\n\n${text}`;
}

/** Finds the JSON object in the model's answer (tolerates code fences or text around it). */
export function parseAnswer(text: string, direction: Direction): Result {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const a = cleaned.indexOf('{'), b = cleaned.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('no JSON in answer');
  const j = JSON.parse(cleaned.slice(a, b + 1));
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const words: Word[] = Array.isArray(j.words)
    ? j.words.filter((w: any) => w && typeof w === 'object').map((w: any) => ({ ar: str(w.ar), tr: str(w.tr), gloss: str(w.gloss) })).filter((w: Word) => w.ar)
    : [];
  let quran: QuranRef | undefined;
  const q = j.quran;
  if (q && typeof q === 'object' && validRef(Number(q.surah), Number(q.from), Number(q.to ?? q.from))) {
    quran = { surah: Number(q.surah), from: Number(q.from), to: Number(q.to ?? q.from) };
  } else if (typeof q === 'string') {
    const r = parseRef(q); if (r) quran = r;
  }
  return { direction, source: str(j.source), arabic: str(j.arabic), translit: str(j.translit), translation: str(j.translation), words, notes: str(j.notes), quran };
}

const norm = (s: string) => stripHarakat(s).replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^ء-ي\s]/g, ' ');

/** How much of the read text is found in the verse text (0..1), by words. Used to confirm the model's verse reference. */
export function verseMatch(read: string, verse: string): number {
  const a = norm(read).split(/\s+/).filter(Boolean);
  const b = new Set(norm(verse).split(/\s+/).filter(Boolean));
  if (!a.length || !b.size) return 0;
  return a.filter(w => b.has(w)).length / a.length;
}

export type ApiError = 'nokey' | 'badkey' | 'busy' | 'network' | 'answer' | 'other';

/** One call to the Messages API. `content` is the user message content (text and/or image blocks). */
export async function askClaude(opts: { apiKey: string; model: string; system: string; content: any[]; maxTokens?: number; f?: typeof fetch; signal?: AbortSignal }): Promise<string> {
  if (!opts.apiKey) throw Object.assign(new Error('nokey'), { kind: 'nokey' as ApiError });
  let r: Response;
  try {
    r = await (opts.f ?? fetch)('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: opts.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': opts.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: opts.model, max_tokens: opts.maxTokens ?? 4096, system: opts.system, messages: [{ role: 'user', content: opts.content }] }),
    });
  } catch (e) {
    throw Object.assign(new Error('network'), { kind: 'network' as ApiError });
  }
  if (r.status === 401 || r.status === 403) throw Object.assign(new Error('badkey'), { kind: 'badkey' as ApiError });
  if (r.status === 429 || r.status === 529) throw Object.assign(new Error('busy'), { kind: 'busy' as ApiError });
  const j: any = await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(j?.error?.message ?? `HTTP ${r.status}`), { kind: 'other' as ApiError });
  const text = (j?.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
  if (!text) throw Object.assign(new Error('empty answer'), { kind: 'answer' as ApiError });
  return text;
}

export const imageBlock = (base64: string, mediaType = 'image/jpeg') => ({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } });
export const textBlock = (text: string) => ({ type: 'text', text });
