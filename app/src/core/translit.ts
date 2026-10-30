// Offline transliteration of classical (Qur'anic) Arabic.
//
// The text is read as connected speech, the way it is recited, with the rules for how words begin and end:
//  - hamzat al-waṣl (ٱ) is dropped inside a phrase: بِسْمِ ٱللَّهِ → bismi llāhi
//      a long vowel before it is shortened (فِى ٱلْأَرْضِ → fi l-arḍi) and a final consonant gets a helping vowel
//      (i by default, u after the plural -hum/-kum/-tum, a after مِنْ): مِنَ ٱلنَّاسِ / عَلَيْهِمُ ٱلْقِتَالُ
//  - the article al-: sun letters assimilate (ٱلرَّحْمَٰنِ → ar-raḥmāni / … r-raḥmāni), moon letters keep l- (al-ḥamdu)
//  - prefixes wa-, fa-, bi-, ka-, li- before the article or a word (وَٱلْكِتَٰبِ → wa-l-kitābi, لِلَّهِ → lillāhi)
//  - nūn sākina and tanwīn: idghām into y r m l w n across words (مَن يَعْمَلْ → may-yaʿmal, هُدًى لِّلْمُتَّقِينَ → hudal-li-l-muttaqīn),
//      iqlāb before b (مِنۢ بَعْدِ → mim baʿdi, also inside a word: أَنۢبِئْهُم → ambiʾhum)
//  - other assimilations that the Uthmani script marks with a shadda on the next word (قُل رَّبِّ → qur-rabbi)
//  - waqf (pause) at the end of a verse, at the stop marks ۘ ۗ, at punctuation and at the end of the text:
//      a final short vowel and -un/-in are dropped, -an becomes -ā, tāʾ marbūṭa becomes -h (رَحْمَةً → raḥmah)
//  - Uthmani signs: ٱ (waṣl), ۡ (sukūn), ٰ (dagger alif), ۥ ۦ (small wāw/yāʾ), ۟ (silent letter), ۢ ۭ (iqlāb),
//      open tanwīn, ـٔ (hamza on a tatweel), the disjoined letters (الٓمٓ → alif lām mīm) and verse numbers ۝
//
// Mode 'tajwid' gives the recited form (default). Mode 'words' gives each word on its own with full endings,
// in ALA-LC style (al-raḥmān, wa-al-kitāb), as used in grammar books.
// Scheme 'academic' uses ā ī ū ḥ ṣ ḍ ṭ ẓ ʿ ʾ th kh dh sh gh j; scheme 'simple' only plain letters (aa ii uu, ' for ʿ and ʾ).
//
// Unvocalized text has no short vowels written, so only the consonants and long vowels can be given: `isVocalized`
// tells the screens when the result is approximate.

export type Scheme = 'academic' | 'simple';
export type Mode = 'tajwid' | 'words';
export type TranslitOptions = { scheme?: Scheme; mode?: Mode };

// ---- characters ----
const FATHA = 'َ', DAMMA = 'ُ', KASRA = 'ِ';
const FATHATAN = 'ً', DAMMATAN = 'ٌ', KASRATAN = 'ٍ';
const SHADDA = 'ّ', SUKUN = 'ْ', DAGGER = 'ٰ';
const MADDA = 'ٓ', HAMZA_ABOVE = 'ٔ', HAMZA_BELOW = 'ٕ';
const TATWEEL = 'ـ';
const U_SUKUN = 'ۡ';            // ۡ Uthmani sukūn
const U_SILENT = ['۟', '۠']; // ۟ ۠ letter not pronounced
const U_IQLAB = ['ۢ', 'ۭ']; // ۢ ۭ small mīm (iqlāb)
const OPEN_TANWIN: Record<string, string> = { 'ࣰ': FATHATAN, 'ࣱ': DAMMATAN, 'ࣲ': KASRATAN };
const SMALL_WAW = 'ۥ', SMALL_YA = 'ۦ', SMALL_HIGH_YA = 'ۧ';
const WASLA = 'ٱ';
const VERSE_END = '۝';
const STOP_MARKS = new Set(['ۗ', 'ۘ']); // ۗ (better to stop) ۘ (must stop)
const OTHER_PAUSE_SIGNS = new Set(['ۖ', 'ۙ', 'ۚ', 'ۛ', 'ۜ', '۞', '۩']); // ۖ ۙ ۚ ۛ ۜ ۞ ۩: no stop

const VOWEL_MARKS = new Set([FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN]);
const isMark = (c: string) => /[ً-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ࣓-ࣿ]/.test(c);
const isLetter = (c: string) => /[ء-غف-يٱ-ۓۥۦ]/.test(c);
const isArabicChar = (c: string) => /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(c);

type Sym = { academic: string; simple: string };
const sym = (academic: string, simple = academic): Sym => ({ academic, simple });
const CONS: Record<string, Sym> = {
  'ب': sym('b'), 'ت': sym('t'), 'ث': sym('th'), 'ج': sym('j'), 'ح': sym('ḥ', 'h'), 'خ': sym('kh'), 'د': sym('d'), 'ذ': sym('dh'),
  'ر': sym('r'), 'ز': sym('z'), 'س': sym('s'), 'ش': sym('sh'), 'ص': sym('ṣ', 's'), 'ض': sym('ḍ', 'd'), 'ط': sym('ṭ', 't'), 'ظ': sym('ẓ', 'z'),
  'ع': sym('ʿ', "'"), 'غ': sym('gh'), 'ف': sym('f'), 'ق': sym('q'), 'ك': sym('k'), 'ل': sym('l'), 'م': sym('m'), 'ن': sym('n'), 'ه': sym('h'),
  'و': sym('w'), 'ي': sym('y'), 'ء': sym('ʾ', "'"), 'ة': sym('t'),
  'پ': sym('p'), 'چ': sym('ch'), 'ژ': sym('zh'), 'گ': sym('g'), 'ک': sym('k'), 'ی': sym('y'),
};
const HAMZA_SEATS = new Set(['ء', 'أ', 'إ', 'ؤ', 'ئ']);
const SUN = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']);
const IDGHAM = new Set(['ي', 'ر', 'م', 'ل', 'و', 'ن']);
const PUNCT: Record<string, string> = { '،': ',', '؛': ';', '؟': '?', '٪': '%', '«': '"', '»': '"', '۔': '.', '﴾': '', '﴿': '' };
const PAUSE_PUNCT = new Set(['.', '!', '?', ';', ':', ',', '،', '؛', '؟', '۔']);
const LETTER_NAMES: Record<string, Sym> = {
  'ا': sym('alif'), 'ل': sym('lām', 'laam'), 'م': sym('mīm', 'miim'), 'ص': sym('ṣād', 'saad'), 'ر': sym('rā', 'raa'),
  'ك': sym('kāf', 'kaaf'), 'ه': sym('hā', 'haa'), 'ي': sym('yā', 'yaa'), 'ع': sym('ʿayn', "'ayn"), 'ط': sym('ṭā', 'taa'),
  'س': sym('sīn', 'siin'), 'ح': sym('ḥā', 'haa'), 'ق': sym('qāf', 'qaaf'), 'ن': sym('nūn', 'nuun'),
};
// The disjoined letters (al-muqaṭṭaʿāt) that open 29 sūras, as skeletons without marks.
const MUQATTAAT = new Set(['الم', 'المص', 'الر', 'المر', 'كهيعص', 'طه', 'طسم', 'طس', 'يس', 'ص', 'حم', 'عسق', 'ق', 'ن']);

/** True if the text contains Arabic script. */
export const hasArabic = (text: string) => /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text);

/** Share of letters that carry a vowel mark or sukūn; from 0.3 the text is treated as vocalized. */
export function vowelDensity(text: string): number {
  const chars = Array.from(text.normalize('NFC'));
  let letters = 0, marked = 0;
  for (let i = 0; i < chars.length; i++) {
    if (!isLetter(chars[i]) || chars[i] === 'ا' || chars[i] === WASLA) continue;
    letters++;
    for (let j = i + 1; j < chars.length && (isMark(chars[j]) || chars[j] === TATWEEL); j++) {
      if (VOWEL_MARKS.has(chars[j]) || chars[j] === SUKUN || chars[j] === U_SUKUN || chars[j] === SHADDA || OPEN_TANWIN[chars[j]]) { marked++; break; }
    }
  }
  return letters ? marked / letters : 0;
}
export const isVocalized = (text: string) => vowelDensity(text) >= 0.3;

/** Removes harakat and Qur'anic signs (for display without vowels or for comparing texts). */
export function stripHarakat(text: string): string {
  return Array.from(text.normalize('NFC')).filter(c => !isMark(c) && c !== TATWEEL && c !== SMALL_WAW && c !== SMALL_YA).join('').replace(/ٱ/g, 'ا');
}

// ---- parsing a word into sounds ----

type V = '' | 'a' | 'i' | 'u' | 'A' | 'I' | 'U';
type Seg = {
  c: string | null; // consonant letter (key of CONS), null for a bare vowel
  g: boolean;       // geminated (shadda)
  v: V;
  tan: boolean;     // tanwīn: the vowel is followed by n
  tm: boolean;      // tāʾ marbūṭa
  help?: V;         // helping vowel added before a waṣl
};
type Letter = { ch: string; m: Set<string> };
type Word = {
  raw: string; skel: string;
  muq?: string[];          // disjoined letters
  prefix?: Seg;            // wa / fa / bi / ka / li
  prefixHamza?: boolean;   // wa- + a word that starts with hamzat al-qaṭʿ (wa-iyyāka)
  wasl?: V;                // the word starts with hamzat al-waṣl; the vowel it gets at the start of speech
  article?: 'moon' | 'sun' | 'allah';
  body: Seg[];
  // filled while reading the phrase
  dropWasl?: boolean;      // the waṣl vowel is not pronounced (a word comes before it)
  joinNext?: boolean;      // idghām: written together with the next word
  assim?: string;          // the consonant this word's final n/consonant turned into (idghām)
};

function letters(word: string): Letter[] {
  const out: Letter[] = [];
  for (const c of Array.from(word)) {
    if (isMark(c)) {
      const mark = OPEN_TANWIN[c] ?? (c === U_SUKUN ? SUKUN : c);
      if (out.length) out[out.length - 1].m.add(mark);
      continue;
    }
    out.push({ ch: c === 'ی' ? 'ي' : c, m: new Set() });
  }
  // Tatweel carries marks in the Uthmani script: ـٔ is a hamza, ـٰ a long ā; otherwise its marks belong to the letter before.
  const res: Letter[] = [];
  for (const l of out) {
    if (l.ch === TATWEEL) {
      if (l.m.has(HAMZA_ABOVE) || l.m.has(HAMZA_BELOW)) { l.ch = 'ء'; l.m.delete(HAMZA_ABOVE); l.m.delete(HAMZA_BELOW); res.push(l); continue; }
      if (res.length) l.m.forEach(x => res[res.length - 1].m.add(x));
      continue;
    }
    if (l.m.has(HAMZA_ABOVE)) { l.m.delete(HAMZA_ABOVE); l.ch = l.ch === 'ا' ? 'أ' : l.ch === 'و' ? 'ؤ' : (l.ch === 'ي' || l.ch === 'ى') ? 'ئ' : l.ch; }
    if (l.m.has(HAMZA_BELOW)) { l.m.delete(HAMZA_BELOW); l.ch = 'إ'; }
    if (l.ch === 'ا' && l.m.has(MADDA)) l.ch = 'آ';
    if (l.ch === 'ى' && (l.m.has(SUKUN) || l.m.has(SHADDA) || hasVowelMark(l.m))) l.ch = 'ي'; // شَىْءٍ
    res.push(l);
  }
  return res;
}

const shortOf = (m: Set<string>): V => (m.has(FATHA) || m.has(FATHATAN) ? 'a' : m.has(KASRA) || m.has(KASRATAN) ? 'i' : m.has(DAMMA) || m.has(DAMMATAN) ? 'u' : '');
const hasTanwin = (m: Set<string>) => m.has(FATHATAN) || m.has(KASRATAN) || m.has(DAMMATAN);
const hasVowelMark = (m: Set<string>) => [...m].some(x => VOWEL_MARKS.has(x));
const lengthen = (v: V): V => (v === 'a' ? 'A' : v === 'i' ? 'I' : v === 'u' ? 'U' : v);
const shorten = (v: V): V => (v === 'A' ? 'a' : v === 'I' ? 'i' : v === 'U' ? 'u' : v);
const seg = (c: string | null, v: V = '', g = false): Seg => ({ c, g, v, tan: false, tm: false });

function parseWord(raw: string, vocalized: boolean): Word {
  const L = letters(raw);
  const skel = L.map(l => (l.ch === WASLA ? 'ا' : l.ch)).join('');
  const w: Word = { raw, skel, body: [] };

  if (MUQATTAAT.has(skel) && !L.some(l => hasVowelMark(l.m)) && (L.some(l => l.m.has(MADDA)) || skel.length > 1 || !vocalized)) {
    w.muq = Array.from(skel);
    return w;
  }

  const segs: Seg[] = [];
  let waslAt = -1; // index in segs of the waṣl vowel
  let hamzaStart = false;
  for (let i = 0; i < L.length; i++) {
    const { ch, m } = L[i];
    const prev = segs[segs.length - 1];
    if (m.has(U_SILENT[0]) || m.has(U_SILENT[1])) continue; // written, not said (قَالُوا۟)
    if (ch === SMALL_WAW || ch === SMALL_HIGH_YA || ch === SMALL_YA) { if (prev) prev.v = lengthen(prev.v || (ch === SMALL_WAW ? 'u' : 'i')); continue; }

    const first = segs.length === 0;
    if (ch === WASLA || (ch === 'ا' && first && !hasVowelMark(m) && !m.has(SHADDA))) {
      if (first || (segs.length === 1 && segs[0].c && ['و', 'ف', 'ب', 'ك', 'ل'].includes(segs[0].c) && segs[0].v && !segs[0].g)) {
        // helping vowel at the start of speech: a before the article, u if the third letter has ḍamma, else i
        const next = L[i + 1], third = L[i + 2];
        const v: V = next?.ch === 'ل' ? 'a' : third && third.m.has(DAMMA) ? 'u' : 'i';
        waslAt = segs.length;
        segs.push(seg(null, v));
        continue;
      }
      if (prev) prev.v = prev.v === 'a' || !prev.v ? 'A' : prev.v; // alif inside a word in an odd position
      continue;
    }
    if (ch === 'ا') {
      // long ā after fatḥa (or in unvocalized text); silent after -ū at the end (wāw al-jamāʿa) and after tanwīn fatḥ
      if (prev && prev.tan && prev.v === 'a') continue;
      if (prev && prev.v === 'U' && i === L.length - 1) continue;
      if (prev && hasVowelMark(m)) { segs.push(seg('ء', shortOf(m))); continue; } // rare: alif carrying a vowel = hamza
      if (prev) prev.v = prev.v === 'a' || prev.v === '' ? 'A' : prev.v;
      else segs.push(seg(null, 'A'));
      continue;
    }
    if (ch === 'ى' && !m.has(SHADDA) && !m.has(SUKUN) && !hasVowelMark(m)) {
      if (prev && prev.tan) continue;                 // هُدًى: the tanwīn is the ending
      if (prev && (prev.v === 'a' || prev.v === '' || m.has(DAGGER))) prev.v = 'A';
      else if (prev && prev.v === 'i') prev.v = 'I';    // Uthmani: فِى = fī
      continue;
    }
    if (ch === 'آ') {
      // Uthmani writes the long madd (ٱلضَّآلِّينَ) as alif + madda after a fatḥa: only a long ā
      if (prev && prev.v === 'a') { prev.v = 'A'; continue; }
      segs.push(seg('ء', 'A')); if (first) hamzaStart = true; continue;
    }
    if ((ch === 'و' || ch === 'ي') && prev && !hasVowelMark(m) && !m.has(SHADDA)) {
      if (m.has(DAGGER)) { prev.v = 'A'; continue; } // صَلَوٰة
      const pv = prev.v;
      if (!vocalized && !m.has(SUKUN)) { if (!prev.v) prev.v = ch === 'و' ? 'U' : 'I'; else segs.push(seg(ch)); continue; }
      if ((ch === 'و' && pv === 'u') || (ch === 'ي' && pv === 'i')) { prev.v = lengthen(pv); continue; }
      segs.push(seg(ch)); // diphthong (aw, ay) or a consonant with sukūn
      continue;
    }

    // a consonant
    let c = ch;
    if (HAMZA_SEATS.has(ch)) { c = 'ء'; if (first) hamzaStart = true; }
    if (!CONS[c]) { segs.push({ ...seg(null), c: null, v: '' }); continue; }
    const s = seg(c, shortOf(m), m.has(SHADDA));
    if (ch === 'إ' && !s.v) s.v = 'i';
    if (ch === 'أ' && first && !s.v && vocalized) s.v = 'a';
    if (hasTanwin(m)) s.tan = true;
    if (ch === 'ة') s.tm = true;
    if (m.has(DAGGER)) s.v = 'A';
    // nūn sākina before b inside the word: iqlāb
    if (c === 'ن' && !s.v && (m.has(U_IQLAB[0]) || m.has(U_IQLAB[1]) || L[i + 1]?.ch === 'ب')) s.c = 'م';
    segs.push(s);
  }

  // Structure: prefix, waṣl, article
  let k = 0;
  const P = segs[0];
  if (P && P.c && ['و', 'ف', 'ب', 'ك', 'ل'].includes(P.c) && P.v && (!P.g || P.c === 'ل') && segs.length > 2) {
    if (waslAt === 1) { w.prefix = P; k = 1; }
    else if (P.c === 'ل' && P.v === 'i' && segs[1]?.c === 'ل' && segs.length > 2) {
      // لِلْ… = li + al- (the alif is not written)
      w.prefix = P; k = 1;
      w.wasl = 'a';
      const lam = segs[1];
      if (lam.g) { w.article = 'allah'; w.body = segs.slice(1); return w; } // لِلَّهِ
      const next = segs[2];
      if (!lam.v && next.c && SUN.has(next.c) && (next.g || !vocalized)) { w.article = 'sun'; next.g = true; w.body = segs.slice(2); return w; }
      if (!lam.v) { w.article = 'moon'; w.body = segs.slice(2); return w; }
      w.prefix = undefined; k = 0; w.wasl = undefined;
    } else if ((P.c === 'و' || P.c === 'ف') && segs[1]?.c === 'ء' && L[1] && HAMZA_SEATS.has(L[1].ch) && L[1].ch !== 'ء') {
      w.prefix = P; w.prefixHamza = true; w.body = segs.slice(2); w.body.unshift(seg(null, segs[1].v, false)); return w;
    }
  }
  if (waslAt === k) {
    w.wasl = segs[k].v;
    const lam = segs[k + 1], next = segs[k + 2];
    if (lam && lam.c === 'ل' && !lam.v && next) {
      if (next.c === 'ل' && next.g) { w.article = 'allah'; w.body = segs.slice(k + 2); return w; }
      if (next.c && SUN.has(next.c) && (next.g || !vocalized)) { w.article = 'sun'; next.g = true; w.body = segs.slice(k + 2); return w; }
      w.article = 'moon'; w.body = segs.slice(k + 2); return w;
    }
    if (lam && lam.c === 'ل' && lam.g) { w.article = 'allah'; w.body = segs.slice(k + 1); return w; } // ٱللَّه with the l's merged
    w.body = segs.slice(k + 1);
    return w;
  }
  void hamzaStart;
  w.body = segs.slice(k);
  return w;
}

// The name Allāh (and allāhumma) is said with a long ā even when no dagger alif is written.
function fixAllah(w: Word) {
  if (w.article === 'allah' && w.body[0]?.c === 'ل' && w.body[0].v === 'a' && w.body[1]?.c === 'ه' && w.body.length <= 3) w.body[0].v = 'A';
}

// ---- rendering ----

function vowel(v: V, sc: Scheme): string {
  if (v === 'A') return sc === 'academic' ? 'ā' : 'aa';
  if (v === 'I') return sc === 'academic' ? 'ī' : 'ii';
  if (v === 'U') return sc === 'academic' ? 'ū' : 'uu';
  return v;
}
function cons(c: string | null, sc: Scheme): string { return c ? CONS[c]?.[sc] ?? '' : ''; }

function renderSegs(segs: Seg[], sc: Scheme, opts: { dropFirstG?: boolean; initialHamzaSilent?: boolean } = {}): string {
  let out = '';
  segs.forEach((s, i) => {
    let c = cons(s.c, sc);
    if (i === 0 && s.c === 'ء' && opts.initialHamzaSilent) c = ''; // ALA-LC: no ʾ at the start of a word
    if (s.g && !(i === 0 && opts.dropFirstG)) c = c + c;
    out += c + vowel(s.v, sc) + (s.tan && s.v ? 'n' : '') + (s.help ?? '');
  });
  return out;
}

function renderWord(w: Word, sc: Scheme, mode: Mode, startOfSpeech: boolean): string {
  if (w.muq) return w.muq.map(ch => LETTER_NAMES[ch]?.[sc] ?? '').join(' ');
  const body = (dropG = false) => renderSegs(w.body, sc, { dropFirstG: dropG, initialHamzaSilent: !w.prefix || w.prefixHamza });
  const pre = w.prefix ? cons(w.prefix.c, sc) + vowel(w.prefix.v, sc) : '';

  if (w.prefixHamza) return pre + '-' + body();

  if (mode === 'words') {
    // ALA-LC: al- is always written, no assimilation; waṣl vowels are shown; prefixes are joined with a hyphen.
    if (w.article === 'allah') return (w.prefix?.c === 'ل' ? pre : pre ? pre + '-a' : 'a') + body();
    if (w.article) return (pre ? pre + '-' : '') + 'al-' + body(true);
    if (w.wasl !== undefined) return (pre ? pre + '-' : '') + vowel(w.wasl, sc) + body();
    return body();
  }

  // tajwid: the waṣl vowel is only said at the start of speech, never after a prefix or another word
  const sayWasl = startOfSpeech && !w.prefix && !w.dropWasl;
  if (w.article === 'allah') return (w.prefix?.c === 'ل' ? pre : pre ? pre + '-' : sayWasl ? 'a' : '') + body();
  if (w.article === 'sun') return (pre ? pre + '-' : sayWasl ? 'a' : '') + cons(w.body[0].c, sc) + '-' + body(true);
  if (w.article === 'moon') return (pre ? pre + '-' : sayWasl ? 'a' : '') + 'l-' + body();
  if (w.wasl !== undefined) return (pre ? pre + '-' : sayWasl ? vowel(w.wasl, sc) : '') + body();
  return (pre ? pre : '') + body();
}

// Reads one breath group (words between two pauses) with the joining rules, and applies waqf to its last word.
function readGroup(words: Word[], mode: Mode, pauseAtEnd: boolean): void {
  if (mode !== 'tajwid') return;
  for (let i = 1; i < words.length; i++) {
    const p = words[i - 1], w = words[i];
    if (p.muq || w.muq || !p.body.length) continue;
    const last = p.body[p.body.length - 1];
    if (w.wasl !== undefined && !w.prefix && !w.prefixHamza) {
      w.dropWasl = true;
      if (last.tan) last.help = 'i';                                    // nūḥuni bnahu
      else if (last.v === 'A' || last.v === 'I' || last.v === 'U') last.v = shorten(last.v); // fi l-arḍi
      else if (!last.v) {
        const before = p.body[p.body.length - 2];
        const helper: V = p.skel === 'من' ? 'a'
          : last.c === 'م' && before && (before.v === 'u' || before.v === 'U' || (before.c === 'ه' || before.c === 'ك' || before.c === 'ت')) && /(هم|كم|تم)$/.test(p.skel) ? 'u'
          : last.c === 'و' && before?.v === 'a' ? 'u' : 'i';
        last.v = helper;
      }
      continue;
    }
    const first = w.prefix ?? w.body[0];
    if (!first || !first.c || w.prefixHamza) continue;
    const nunSakin = (last.c === 'ن' && !last.v) || (last.tan && !last.tm) || (last.tan && last.tm);
    if (nunSakin && IDGHAM.has(first.c) && first !== w.prefix) {
      // idghām: the n disappears into the next consonant; written as one joined unit
      if (last.tan) { last.tan = false; } else { p.body.pop(); }
      p.assim = first.c; p.joinNext = true;
      if (w.body[0] === first) first.g = false;
      continue;
    }
    if (nunSakin && IDGHAM.has(first.c) && first === w.prefix) {
      if (last.tan) last.tan = false; else p.body.pop();
      p.assim = first.c; p.joinNext = true;
      continue;
    }
    if (nunSakin && first.c === 'ب') {
      // iqlāb: n → m
      if (last.tan) { last.tan = false; p.assim = 'م'; } else last.c = 'م';
      continue;
    }
    if (!last.v && !last.tan && last.c && w.body[0] === first && first.g && first.c !== last.c && SUN.has(last.c) && (SUN.has(first.c) || first.c === 'ر')) {
      // assimilation shown by the shadda on the next word (قُل رَّبِّ, قَد تَّبَيَّنَ)
      p.body.pop(); p.assim = first.c; p.joinNext = true; first.g = false;
    }
  }
  if (pauseAtEnd) waqf(words[words.length - 1]);
}

function waqf(w: Word | undefined) {
  if (!w || w.muq || !w.body.length) return;
  const s = w.body[w.body.length - 1];
  if (s.tm) { s.c = 'ه'; s.v = ''; s.tan = false; s.g = false; return; }
  if (s.tan && s.v === 'a') { s.tan = false; s.v = 'A'; return; }
  if (s.tan) { s.tan = false; s.v = ''; return; }
  if (s.v === 'a' || s.v === 'i' || s.v === 'u') s.v = '';
}

type Tok = { t: 'word'; w: Word } | { t: 'pause'; text: string } | { t: 'text'; text: string };

function tokenize(text: string, vocalized: boolean): Tok[] {
  const toks: Tok[] = [];
  const chars = Array.from(text);
  let buf = '';
  const flush = () => { if (buf) { const w = parseWord(buf, vocalized); fixAllah(w); toks.push({ t: 'word', w }); buf = ''; } };
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === VERSE_END) {
      flush();
      let num = '';
      while (i + 1 < chars.length && /[0-9٠-٩۰-۹]/.test(chars[i + 1])) num += chars[++i];
      toks.push({ t: 'pause', text: num ? ` (${toLatinDigits(num)})` : '' });
      continue;
    }
    if (STOP_MARKS.has(c)) { flush(); toks.push({ t: 'pause', text: '' }); continue; }
    if (OTHER_PAUSE_SIGNS.has(c)) { flush(); continue; }
    if (c === '﴿' || c === '﴾') {
      // verse number in ornate brackets ﴿١﴾
      flush();
      if (c === '﴾') { let num = ''; while (i + 1 < chars.length && /[0-9٠-٩۰-۹]/.test(chars[i + 1])) num += chars[++i]; if (chars[i + 1] === '﴿') i++; toks.push({ t: 'pause', text: num ? ` (${toLatinDigits(num)})` : '' }); }
      continue;
    }
    if ((isArabicChar(c) || c === TATWEEL) && !PUNCT[c] && !/[٠-٩۰-۹]/.test(c)) {
      // a mark after a space belongs to nothing; skip it
      if (!buf && isMark(c)) continue;
      buf += c; continue;
    }
    flush();
    const p = PUNCT[c] ?? c;
    if (PAUSE_PUNCT.has(c) || c === '\n') toks.push({ t: 'pause', text: p });
    else if (/[٠-٩۰-۹]/.test(c)) toks.push({ t: 'text', text: toLatinDigits(c) });
    else toks.push({ t: 'text', text: p });
  }
  flush();
  return toks;
}

function toLatinDigits(s: string) {
  return s.replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0));
}

/**
 * Transliterates Arabic text. Spaces, digits and punctuation are kept; non-Arabic text passes through unchanged.
 * Each line is treated as ending in a pause.
 */
export function transliterate(text: string, options: TranslitOptions | Scheme = {}): string {
  const opt: TranslitOptions = typeof options === 'string' ? { scheme: options } : options;
  const sc = opt.scheme ?? 'academic';
  const norm = text.normalize('NFC');
  const vocalized = isVocalized(norm);
  const mode: Mode = vocalized ? opt.mode ?? 'tajwid' : 'words';
  const toks = tokenize(norm, vocalized);

  // breath groups: words between pauses (a disjoined-letter word also ends one)
  let group: Word[] = [];
  const close = (pause: boolean) => { if (group.length) readGroup(group, mode, pause); group = []; };
  toks.forEach(t => {
    if (t.t === 'word') { if (t.w.muq) { close(true); group.push(t.w); close(true); } else group.push(t.w); }
    else if (t.t === 'pause') close(true);
  });
  close(true);

  let out = '';
  let start = true;
  let joined = false;
  for (const t of toks) {
    if (t.t === 'word') {
      const s = renderWord(t.w, sc, mode, start);
      if (!joined && out && !/[\s(]$/.test(out)) out += ' ';
      out += s;
      if (t.w.assim) out += cons(t.w.assim, sc) + (t.w.joinNext ? '-' : '');
      joined = !!t.w.joinNext;
      start = !!t.w.muq;
    } else if (t.t === 'pause') {
      out += t.text; start = true; joined = false;
    } else {
      if (t.text === ' ' || t.text === '\t') { if (!joined && !/\s$/.test(out)) out += ' '; continue; }
      out += t.text;
    }
  }
  return out.replace(/ +/g, ' ').replace(/ ([,.;:?!])/g, '$1').trim();
}
