// The 30 parts (ajzāʾ) of the Qur'an and the 15 places of prostration (sajdat at-tilāwa), as marked with ۩ in the
// Madīna muṣḥaf. (In the Ḥanafī school 22:77 is not a place of prostration; the muṣḥaf still marks it.)
import { SURAHS } from './quran';

export type Juz = { n: number; surah: number; ayah: number; ar: string };

export const JUZ: Juz[] = [
  [1, 1, 'الٓمٓ'], [2, 142, 'سَيَقُولُ'], [2, 253, 'تِلْكَ ٱلرُّسُلُ'], [3, 93, 'لَن تَنَالُوا۟'], [4, 24, 'وَٱلْمُحْصَنَٰتُ'],
  [4, 148, 'لَا يُحِبُّ ٱللَّهُ'], [5, 82, 'وَإِذَا سَمِعُوا۟'], [6, 111, 'وَلَوْ أَنَّنَا'], [7, 88, 'قَالَ ٱلْمَلَأُ'], [8, 41, 'وَٱعْلَمُوٓا۟'],
  [9, 93, 'يَعْتَذِرُونَ'], [11, 6, 'وَمَا مِن دَآبَّةٍ'], [12, 53, 'وَمَآ أُبَرِّئُ'], [15, 1, 'رُبَمَا'], [17, 1, 'سُبْحَٰنَ ٱلَّذِىٓ'],
  [18, 75, 'قَالَ أَلَمْ'], [21, 1, 'ٱقْتَرَبَ لِلنَّاسِ'], [23, 1, 'قَدْ أَفْلَحَ'], [25, 21, 'وَقَالَ ٱلَّذِينَ'], [27, 56, 'أَمَّنْ خَلَقَ'],
  [29, 46, 'ٱتْلُ مَآ أُوحِىَ'], [33, 31, 'وَمَن يَقْنُتْ'], [36, 28, 'وَمَا لِىَ'], [39, 32, 'فَمَنْ أَظْلَمُ'], [41, 47, 'إِلَيْهِ يُرَدُّ'],
  [46, 1, 'حمٓ'], [51, 31, 'قَالَ فَمَا خَطْبُكُمْ'], [58, 1, 'قَدْ سَمِعَ ٱللَّهُ'], [67, 1, 'تَبَٰرَكَ ٱلَّذِى'], [78, 1, 'عَمَّ'],
].map(([surah, ayah, ar], i) => ({ n: i + 1, surah: surah as number, ayah: ayah as number, ar: ar as string }));

export const SAJDA: [number, number][] = [
  [7, 206], [13, 15], [16, 50], [17, 109], [19, 58], [22, 18], [22, 77], [25, 60], [27, 26], [32, 15], [38, 24], [41, 38], [53, 62], [84, 21], [96, 19],
];
const SAJDA_SET = new Set(SAJDA.map(([s, a]) => `${s}:${a}`));
export const isSajda = (surah: number, ayah: number) => SAJDA_SET.has(`${surah}:${ayah}`);
export const SAJDA_SIGN = '۩';
/** The text without the ۩ that some editions carry, so the app can draw the sign itself (always, in gold). */
export const withoutSajdaSign = (s: string) => s.replace(/\s*۩\s*/g, ' ').trim();

const key = (s: number, a: number) => s * 1000 + a;
/** The part a verse belongs to. */
export function juzOf(surah: number, ayah: number): number {
  let j = 1;
  for (const z of JUZ) if (key(z.surah, z.ayah) <= key(surah, ayah)) j = z.n;
  return j;
}
/** The part that starts at this verse, if any. */
export const juzStartingAt = (surah: number, ayah: number) => JUZ.find(z => z.surah === surah && z.ayah === ayah);
/** The verses of a part, as [sura, first verse, last verse] for each sūra in it. */
export function juzRange(n: number): [number, number, number][] {
  const a = JUZ[n - 1], b = JUZ[n];
  const out: [number, number, number][] = [];
  for (let s = a.surah; s <= (b ? b.surah : 114); s++) {
    const from = s === a.surah ? a.ayah : 1;
    const to = b && s === b.surah ? b.ayah - 1 : SURAHS[s - 1].ayahs;
    if (to >= from) out.push([s, from, to]);
  }
  return out;
}
