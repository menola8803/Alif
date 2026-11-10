// Abjad: the value of each Arabic letter (the eastern order, abjad hawwaz ḥuṭṭī) and the sum of a word or phrase.
export type AbjadLetter = { ar: string; tr: string; value: number; order: number };

/** In abjad order, in blocks of nine (ones, tens, hundreds) and Ghayn = 1000. "order" is the place in the alphabet (ا ب ت ث …). */
export const ABJAD: AbjadLetter[] = [
  { ar: 'ا', tr: 'Alif', value: 1, order: 1 }, { ar: 'ب', tr: 'Bā', value: 2, order: 2 }, { ar: 'ج', tr: 'Jīm', value: 3, order: 5 },
  { ar: 'د', tr: 'Dāl', value: 4, order: 8 }, { ar: 'ه', tr: 'Hā', value: 5, order: 26 }, { ar: 'و', tr: 'Wāw', value: 6, order: 27 },
  { ar: 'ز', tr: 'Zāy', value: 7, order: 11 }, { ar: 'ح', tr: 'Ḥā', value: 8, order: 6 }, { ar: 'ط', tr: 'Ṭā', value: 9, order: 16 },
  { ar: 'ي', tr: 'Yā', value: 10, order: 28 }, { ar: 'ك', tr: 'Kāf', value: 20, order: 22 }, { ar: 'ل', tr: 'Lām', value: 30, order: 23 },
  { ar: 'م', tr: 'Mīm', value: 40, order: 24 }, { ar: 'ن', tr: 'Nūn', value: 50, order: 25 }, { ar: 'س', tr: 'Sīn', value: 60, order: 12 },
  { ar: 'ع', tr: 'ʿAyn', value: 70, order: 18 }, { ar: 'ف', tr: 'Fā', value: 80, order: 20 }, { ar: 'ص', tr: 'Ṣād', value: 90, order: 14 },
  { ar: 'ق', tr: 'Qāf', value: 100, order: 21 }, { ar: 'ر', tr: 'Rā', value: 200, order: 10 }, { ar: 'ش', tr: 'Shīn', value: 300, order: 13 },
  { ar: 'ت', tr: 'Tā', value: 400, order: 3 }, { ar: 'ث', tr: 'Thā', value: 500, order: 4 }, { ar: 'خ', tr: 'Khā', value: 600, order: 7 },
  { ar: 'ذ', tr: 'Dhāl', value: 700, order: 9 }, { ar: 'ض', tr: 'Ḍād', value: 800, order: 15 }, { ar: 'ظ', tr: 'Ẓā', value: 900, order: 17 },
  { ar: 'غ', tr: 'Ghayn', value: 1000, order: 19 },
];

const BASE: Record<string, string> = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ء': 'ا', 'ؤ': 'و', 'ئ': 'ي', 'ى': 'ي', 'ة': 'ه', 'ـ': '' };
const VAL = new Map(ABJAD.map(l => [l.ar, l]));

/** The letters of a text with their values (vowel signs and other marks are left out). */
export function abjadParts(text: string): AbjadLetter[] {
  const out: AbjadLetter[] = [];
  for (const ch of text.normalize('NFC')) {
    const b = BASE[ch] ?? ch;
    const l = VAL.get(b);
    if (l) out.push(l);
  }
  return out;
}
export const abjadSum = (text: string) => abjadParts(text).reduce((n, l) => n + l.value, 0);
