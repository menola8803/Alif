import { readFileSync, existsSync } from 'fs';
import { checkOcr, collapseRepeats, vocabulary } from '../src/core/free';
import { QuranData, SURAHS } from '../src/core/quran';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };

// A small dictionary standing in for the whole Qur'an (al-Fātiḥa, al-Ikhlāṣ and a few common words).
const q: QuranData = { edition: 'x', surahs: SURAHS.map(s => ({ n: s.number, ayahs: [] as string[] })) };
q.surahs[0].ayahs = ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'مَٰلِكِ يَوْمِ ٱلدِّينِ', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'مِنَ ٱلْمُؤْمِنِينَ رِجَالٌ صَدَقُوا۟ مَا عَٰهَدُوا۟ ٱللَّهَ عَلَيْهِ', 'مُّحَمَّدٌ رَّسُولُ ٱللَّهِ', 'وَٱلشَّيْخُ'];
const vocab = vocabulary(q);

// What Tesseract read from the calligraphy photo (before 0.3.2): must be rejected.
const garbage = `1 ف 1
ا 7 يذ دون #» 0 ١
0 4 07 2 ْ
١ 0 لكان من المخرت فونهاة دك جادرعننين 5 ا
52052552 حا كرحس ص 0 2
ار ا ا ا
0 ا ار 0 _ اليك 0 20
3 ال ) ليه له له ل 0 ل ايد
د7وردب 7ب || فق )| ف فا ا 0 :`;
const g = checkOcr(garbage, vocab);
ok(!g.ok, 'garbage rejected ' + JSON.stringify(g));
const g2 = existsSync('/tmp/claude-0/garbage.txt') ? checkOcr(readFileSync('/tmp/claude-0/garbage.txt', 'utf8'), vocab) : { ok: false };
ok(!g2.ok, 'real garbage rejected');

// Clean printed text: accepted.
const good = checkOcr('بسم الله الرحمن الرحيم\nالحمد لله رب العالمين', vocab);
ok(good.ok && good.text === 'بسم الله الرحمن الرحيم\nالحمد لله رب العالمين', 'clean text accepted ' + JSON.stringify(good));
// A few stray symbols around real text: the text survives.
const mixed = checkOcr('« 12 »\nمحمد رسول الله ؛\n0 0', vocab);
ok(mixed.ok && mixed.text === 'محمد رسول الله', 'stray symbols dropped ' + JSON.stringify(mixed));
// Without a dictionary only the shape is checked.
ok(checkOcr('كتاب جميل جدا').ok, 'no dictionary');

ok(collapseRepeats('0 0 0 0 0 0 ف ف ف ف ف Fa') === '0 … ف … Fa', 'collapse: ' + collapseRepeats('0 0 0 0 0 0 ف ف ف ف ف Fa'));
ok(collapseRepeats('Gud är stor stor') === 'Gud är stor stor', 'no collapse');

if (fail) { console.log(`${fail} ocr test(s) failed`); process.exit(1); }
console.log('ocr: all ok');
