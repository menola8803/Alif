import { chunks, myMemory, findVerses } from '../src/core/free';
import { QuranData, SURAHS } from '../src/core/quran';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };

const long = 'Detta är en mening. '.repeat(60);
const cs = chunks(long, 450);
ok(cs.every(c => c.length <= 450) && cs.join(' ').replace(/\s+/g, ' ').trim() === long.replace(/\s+/g, ' ').trim(), 'chunks keep all text');

// a Qur'an with real text in sūras 1 and 112, filler elsewhere
const q: QuranData = { edition: 'quran-uthmani', surahs: SURAHS.map(s => ({ n: s.number, ayahs: Array.from({ length: s.ayahs }, (_, i) => `كلمة${s.number} آية${i + 1}`) })) };
q.surahs[0].ayahs = ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'مَٰلِكِ يَوْمِ ٱلدِّينِ', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ'];
q.surahs[111].ayahs = ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ', 'ٱللَّهُ ٱلصَّمَدُ', 'لَمْ يَلِدْ وَلَمْ يُولَدْ', 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ'];
const h1 = findVerses('قل هو الله احد الله الصمد لم يلد ولم يولد', q);
ok(!!h1 && h1.surah === 112 && h1.from === 1 && h1.to === 3, 'finds 112:1-3 ' + JSON.stringify(h1));
const h2 = findVerses('اياك نعبد واياك نستعين', q);
ok(!!h2 && h2.surah === 1 && h2.from === 5 && h2.to === 5, 'finds 1:5 ' + JSON.stringify(h2));
ok(findVerses('السلام عليكم ورحمة الله وبركاته يا أخي', q) === null, 'no false match');
ok(findVerses('الله', q) === null, 'too short');

(async () => {
  const fake: any = async (url: string) => {
    ok(url.includes('langpair=ar|sv') && url.includes('q='), 'mymemory url');
    return { ok: true, status: 200, json: async () => ({ responseStatus: 200, responseData: { translatedText: 'fred' } }) };
  };
  ok((await myMemory('سلام', 'ar', 'sv', fake)) === 'fred', 'mymemory');
  const quota: any = async () => ({ ok: true, status: 200, json: async () => ({ responseStatus: 429, quotaFinished: true, responseData: { translatedText: 'x' } }) });
  let kind = ''; try { await myMemory('سلام', 'ar', 'sv', quota); } catch (e: any) { kind = e.kind; }
  ok(kind === 'quota', 'quota');
  if (fail) { console.log(`${fail} free test(s) failed`); process.exit(1); }
  console.log('free: all ok');
})();
