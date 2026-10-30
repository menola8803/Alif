// Glue between the screens and the translation engines.
//  - Claude (own API key): reads photos, vocalizes, translates classical Arabic, word by word. Best quality.
//  - On the phone (Google ML Kit): free, offline once the language model is downloaded; modern Arabic.
//  - MyMemory: free online service, no key, with a daily limit.
//  - Camera without a key: Tesseract reads the Arabic text on the phone.
// Whatever the engine, text from the Qur'an is recognized against the Qur'an on the phone and shown from the muṣḥaf with
// the chosen translation.
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Directory, File, Paths } from 'expo-file-system';
import { ApiError, Direction, Result, askClaude, imageBlock, parseAnswer, systemPrompt, textBlock, userPromptAr, userPromptImage, userPromptToArabic, verseMatch } from './core/engine';
import { Ayah, QuranData, fetchAyahs, pickEdition } from './core/quran';
import { checkOcr, collapseRepeats, findVerses, myMemory, vocabulary } from './core/free';
import { hasArabic, Mode, Scheme, transliterate, isVocalized } from './core/translit';
import { Lang, Strings } from './i18n';
import { AlifNativeModule } from '../modules/alif-native';

export type Engine = 'auto' | 'claude' | 'device' | 'mymemory';
export type OcrEngine = 'auto' | 'claude' | 'device';
export type Settings = {
  apiKey: string; model: string; lang: Lang; scheme: Scheme; mode: Mode; editions: Partial<Record<Lang, string>>;
  engine: Engine; ocrEngine: OcrEngine;
};
/** Verses from the Qur'an on the phone, if it is there (see library.tsx). */
export type LocalVerses = (surah: number, from: number, to: number) => Ayah[] | null;
export type QuranLib = { ayahs: LocalVerses; arabic: QuranData | null };

export const arabicDigits = (n: number) => String(n).replace(/[0-9]/g, d => String.fromCharCode(0x0660 + +d));
export const directionOf = (text: string): Direction => (hasArabic(text) ? 'ar2x' : 'x2ar');
export const deviceAvailable = () => !!AlifNativeModule;

/** The engine that is actually used for text. */
export function textEngine(s: Pick<Settings, 'engine' | 'apiKey'>): Exclude<Engine, 'auto'> {
  if (s.engine !== 'auto') return s.engine;
  if (s.apiKey) return 'claude';
  return deviceAvailable() ? 'device' : 'mymemory';
}
/** The engine that is actually used to read photos. */
export function ocrEngineFor(s: Pick<Settings, 'ocrEngine' | 'apiKey'>): Exclude<OcrEngine, 'auto'> {
  if (s.ocrEngine !== 'auto') return s.ocrEngine;
  return s.apiKey ? 'claude' : 'device';
}

/** Transliteration to show: the app's own rules when the Arabic is vocalized, otherwise Claude's. */
export function translitFor(r: Pick<Result, 'arabic' | 'translit'>, scheme: Scheme, mode: Mode): string {
  if (r.arabic && isVocalized(r.arabic)) return transliterate(r.arabic, { scheme, mode });
  return r.translit || (r.arabic ? transliterate(r.arabic, { scheme, mode }) : '');
}

const withVerses = (r: Result, verses: Ayah[], ed: string): Result =>
  ({ ...r, verses, edition: ed, arabic: verses.map(v => `${v.arabic} ۝${arabicDigits(v.n)}`).join(' ') });

/** Claude named a verse: check it against the muṣḥaf and use the muṣḥaf text when the words match. */
async function confirmQuran(r: Result, s: Settings, lib?: QuranLib): Promise<Result> {
  if (!r.quran) return findQuran(r, s, lib);
  try {
    const ed = pickEdition(s.lang, s.editions[s.lang]);
    const { surah, from, to } = r.quran;
    if (to - from > 9) return r; // long passages: keep Claude's text
    const here = lib?.ayahs(surah, from, to);
    const verses = here && here.every(v => v.translation) ? here : await fetchAyahs(surah, from, to, ed).catch(() => here ?? Promise.reject(new Error('offline')));
    const match = verseMatch(r.source || r.arabic, verses.map(v => v.arabic).join(' '));
    if (match < 0.6) return { ...r, quran: undefined };
    return withVerses(r, verses, ed);
  } catch {
    return r; // offline: keep Claude's answer
  }
}

/** No engine named a verse: look for the text in the Qur'an on the phone. */
function findQuran(r: Result, s: Settings, lib?: QuranLib): Result {
  const text = r.direction === 'ar2x' ? (r.source || r.arabic) : r.arabic;
  if (!lib?.arabic || !text) return r;
  const hit = findVerses(text, lib.arabic);
  if (!hit) return r;
  const verses = lib.ayahs(hit.surah, hit.from, hit.to);
  if (!verses) return r;
  return withVerses({ ...r, quran: { surah: hit.surah, from: hit.from, to: hit.to } }, verses, pickEdition(s.lang, s.editions[s.lang]));
}

async function freeTranslate(text: string, from: string, to: string, engine: 'device' | 'mymemory'): Promise<string> {
  if (engine === 'device') {
    if (!AlifNativeModule) throw Object.assign(new Error('device'), { kind: 'nodevice' });
    try { return collapseRepeats(await AlifNativeModule.translate(text, from, to, true)); }
    catch (e: any) { throw Object.assign(new Error(e?.message ?? 'device'), { kind: String(e?.code ?? '').includes('MODEL') ? 'model' : 'other' }); }
  }
  return collapseRepeats(await myMemory(text, from, to));
}

export async function translateText(text: string, s: Settings, direction = directionOf(text), lib?: QuranLib): Promise<Result> {
  const engine = textEngine(s);
  if (engine === 'claude') {
    const prompt = direction === 'ar2x' ? userPromptAr(text, s.lang) : userPromptToArabic(text, s.lang);
    const answer = await askClaude({ apiKey: s.apiKey, model: s.model, system: systemPrompt(s.lang, s.scheme), content: [textBlock(prompt)] });
    const r = parseAnswer(answer, direction);
    if (!r.source) r.source = text;
    if (direction === 'x2ar' && !r.translation) r.translation = text;
    return confirmQuran(r, s, lib);
  }
  // Free engines: first see whether the text is from the Qur'an (then the muṣḥaf and its translation are enough).
  const base: Result = { direction, source: text, arabic: direction === 'ar2x' ? text : '', translit: '', translation: direction === 'x2ar' ? text : '', words: [], notes: '' };
  if (direction === 'ar2x') {
    const q = findQuran(base, s, lib);
    if (q.verses?.every(v => v.translation)) return q;
    const out = await freeTranslate(text, 'ar', s.lang, engine);
    return { ...q, translation: out };
  }
  const ar = await freeTranslate(text, s.lang, 'ar', engine);
  return findQuran({ ...base, arabic: ar }, s, lib);
}

export type Photo = { uri: string; width?: number; height?: number; frame?: boolean };

/**
 * Shrinks the photo (1600 px wide, JPEG); Claude reads it, or Tesseract on the phone when there is no key.
 * A camera shot is cut to the frame shown on the screen first, so walls, floor and picture frames are not read as text.
 */
export async function translateImage(photo: Photo | string, s: Settings, lib?: QuranLib): Promise<Result> {
  const p: Photo = typeof photo === 'string' ? { uri: photo } : photo;
  const ctx = ImageManipulator.manipulate(p.uri);
  if (p.frame && p.width && p.height) {
    // The frame on the camera screen: 24 px in from the sides of the preview and 18 % from the top and bottom.
    const x = Math.round(p.width * 0.06), y = Math.round(p.height * 0.18);
    ctx.crop({ originX: x, originY: y, width: p.width - 2 * x, height: p.height - 2 * y });
  }
  ctx.resize({ width: 1600 });
  const img = await ctx.renderAsync();
  const engine = ocrEngineFor(s);
  if (engine === 'claude') {
    const out = await img.saveAsync({ base64: true, compress: 0.82, format: SaveFormat.JPEG });
    if (!out.base64) throw Object.assign(new Error('image'), { kind: 'other' as ApiError });
    const answer = await askClaude({ apiKey: s.apiKey, model: s.model, system: systemPrompt(s.lang, s.scheme), content: [imageBlock(out.base64), textBlock(userPromptImage(s.lang))] });
    return confirmQuran(parseAnswer(answer, 'ar2x'), s, lib);
  }
  const out = await img.saveAsync({ compress: 0.95, format: SaveFormat.JPEG });
  const raw = await readArabic(out.uri);
  const check = checkOcr(raw, vocabFor(lib));
  // Noise (calligraphy, decoration, a bad photo) is never passed on to be "translated".
  if (!check.ok) throw Object.assign(new Error('unreadable'), { kind: 'unreadable', raw: check.text || raw.trim(), image: out.uri });
  return { ...(await translateText(check.text, s, 'ar2x', lib)), photo: out.uri } as Result;
}

let vocabCache: { q: QuranData; v: Set<string> } | null = null;
function vocabFor(lib?: QuranLib): Set<string> | undefined {
  if (!lib?.arabic) return undefined;
  if (vocabCache?.q !== lib.arabic) vocabCache = { q: lib.arabic, v: vocabulary(lib.arabic) };
  return vocabCache.v;
}

// ---- Tesseract on the phone ----

const TESSDATA_URL = 'https://github.com/tesseract-ocr/tessdata_fast/raw/main/ara.traineddata';
const tessDir = () => new Directory(Paths.document, 'tesseract');
const tessFile = () => new File(new Directory(tessDir(), 'tessdata'), 'ara.traineddata');
export const ocrModelReady = () => { try { return tessFile().exists && (tessFile().size ?? 0) > 100000; } catch { return false; } };

/** Downloads the Arabic model for Tesseract once (about 1.4 MB). */
export async function ensureOcrModel(): Promise<void> {
  if (ocrModelReady()) return;
  try {
    const d = new Directory(tessDir(), 'tessdata');
    if (!d.exists) d.create({ intermediates: true });
    const f = tessFile();
    if (f.exists) f.delete();
    await File.downloadFileAsync(TESSDATA_URL, f);
  } catch { throw Object.assign(new Error('ocr model'), { kind: 'ocrmodel' }); }
}

async function readArabic(uri: string): Promise<string> {
  if (!AlifNativeModule) throw Object.assign(new Error('device'), { kind: 'nodevice' });
  await ensureOcrModel();
  const dataPath = decodeURIComponent(tessDir().uri.replace(/^file:\/\//, '').replace(/\/$/, ''));
  return AlifNativeModule.ocr(uri, dataPath, 'ara');
}

export function errorText(e: unknown, t: Strings): string {
  const kind = (e as any)?.kind as string | undefined;
  if (kind === 'nokey') return t.errNoKey;
  if (kind === 'badkey') return t.errBadKey;
  if (kind === 'busy') return t.errBusy;
  if (kind === 'network') return t.errNetwork;
  if (kind === 'quota') return t.errQuota;
  if (kind === 'model') return t.errModel;
  if (kind === 'ocrmodel') return t.errOcrModel;
  if (kind === 'nodevice') return t.errNoDevice;
  if (kind === 'unreadable') return t.errUnreadable;
  if (kind === 'answer' || e instanceof SyntaxError || (e as Error)?.message === 'no JSON in answer') return t.errAnswer;
  return `${t.errOther}: ${(e as Error)?.message ?? ''}`;
}
