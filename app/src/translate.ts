// Glue between the screens and the engine: builds the request with the person's settings and, when Claude says the
// text is from the Qur'an, fetches those verses from the muṣḥaf and uses them if the words match.
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ApiError, Direction, Result, askClaude, imageBlock, parseAnswer, systemPrompt, textBlock, userPromptAr, userPromptImage, userPromptToArabic, verseMatch } from './core/engine';
import { fetchAyahs, pickEdition } from './core/quran';
import { hasArabic, Mode, Scheme, transliterate, isVocalized } from './core/translit';
import { Lang, Strings } from './i18n';

export type Settings = { apiKey: string; model: string; lang: Lang; scheme: Scheme; mode: Mode; editions: Partial<Record<Lang, string>> };

export const arabicDigits = (n: number) => String(n).replace(/[0-9]/g, d => String.fromCharCode(0x0660 + +d));

export const directionOf = (text: string): Direction => (hasArabic(text) ? 'ar2x' : 'x2ar');

/** Transliteration to show: the app's own rules when the Arabic is vocalized, otherwise Claude's. */
export function translitFor(r: Pick<Result, 'arabic' | 'translit'>, scheme: Scheme, mode: Mode): string {
  if (r.arabic && isVocalized(r.arabic)) return transliterate(r.arabic, { scheme, mode });
  return r.translit || (r.arabic ? transliterate(r.arabic, { scheme, mode }) : '');
}

async function confirmQuran(r: Result, s: Settings): Promise<Result> {
  if (!r.quran) return r;
  try {
    const ed = pickEdition(s.lang, s.editions[s.lang]);
    const { surah, from, to } = r.quran;
    if (to - from > 9) return r; // long passages: keep Claude's text
    const verses = await fetchAyahs(surah, from, to, ed);
    const read = r.source || r.arabic;
    const match = verseMatch(read, verses.map(v => v.arabic).join(' '));
    if (match < 0.6) return { ...r, quran: undefined };
    return { ...r, verses, edition: ed, arabic: verses.map(v => `${v.arabic} ۝${arabicDigits(v.n)}`).join(' ') };
  } catch {
    return r; // offline: keep Claude's answer
  }
}

export async function translateText(text: string, s: Settings, direction = directionOf(text)): Promise<Result> {
  const prompt = direction === 'ar2x' ? userPromptAr(text, s.lang) : userPromptToArabic(text, s.lang);
  const answer = await askClaude({ apiKey: s.apiKey, model: s.model, system: systemPrompt(s.lang, s.scheme), content: [textBlock(prompt)] });
  const r = parseAnswer(answer, direction);
  if (!r.source) r.source = text;
  if (direction === 'x2ar' && !r.translation) r.translation = text;
  return confirmQuran(r, s);
}

/** Shrinks the photo (1600 px wide, JPEG) so it uploads fast, then asks Claude to read it. */
export async function translateImage(uri: string, s: Settings): Promise<Result> {
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: 1600 });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ base64: true, compress: 0.82, format: SaveFormat.JPEG });
  if (!out.base64) throw Object.assign(new Error('image'), { kind: 'other' as ApiError });
  const answer = await askClaude({ apiKey: s.apiKey, model: s.model, system: systemPrompt(s.lang, s.scheme), content: [imageBlock(out.base64), textBlock(userPromptImage(s.lang))] });
  return confirmQuran(parseAnswer(answer, 'ar2x'), s);
}

export function errorText(e: unknown, t: Strings): string {
  const kind = (e as any)?.kind as ApiError | undefined;
  if (kind === 'nokey') return t.errNoKey;
  if (kind === 'badkey') return t.errBadKey;
  if (kind === 'busy') return t.errBusy;
  if (kind === 'network') return t.errNetwork;
  if (kind === 'answer' || e instanceof SyntaxError || (e as Error)?.message === 'no JSON in answer') return t.errAnswer;
  return `${t.errOther}: ${(e as Error)?.message ?? ''}`;
}
