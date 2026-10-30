import { parseAnswer, verseMatch, askClaude, systemPrompt } from '../src/core/engine';
import { SURAHS, TOTAL_AYAHS, parseRef, splitBismillah, fetchSurah, pickEdition, compactQuran, completeQuran, localSurah, localAyahs, fetchWholeQuran } from '../src/core/quran';

let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };

ok(SURAHS.length === 114, '114 suras');
ok(TOTAL_AYAHS === 6236, `6236 verses, got ${TOTAL_AYAHS}`);
ok(JSON.stringify(parseRef('2:255')) === '{"surah":2,"from":255,"to":255}', 'parseRef');
ok(parseRef('1:8') === null && parseRef('115:1') === null, 'parseRef rejects');
ok(JSON.stringify(parseRef('112:1-4')) === '{"surah":112,"from":1,"to":4}', 'parseRef range');

const b = splitBismillah(112, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ');
ok(b.bismillah && b.text === 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', 'split bismillah');
ok(!splitBismillah(1, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ').bismillah, 'Fatiha keeps it');

const ans = 'Here:\n```json\n{"source":"قل هو الله احد","arabic":"قُلْ هُوَ ٱللَّهُ أَحَدٌ","translit":"qul huwa llāhu aḥad","translation":"Säg: Han är Gud, En","words":[{"ar":"قُلْ","tr":"qul","gloss":"säg (q-w-l)"},{"bad":1}],"notes":"","quran":{"surah":112,"from":1,"to":1}}\n```';
const r = parseAnswer(ans, 'ar2x');
ok(r.arabic === 'قُلْ هُوَ ٱللَّهُ أَحَدٌ' && r.words.length === 1 && r.quran?.surah === 112, 'parseAnswer');
ok(parseAnswer('{"arabic":"x","quran":{"surah":200,"from":1}}', 'ar2x').quran === undefined, 'bad ref dropped');
ok(parseAnswer('{"arabic":"x","quran":"2:255"}', 'ar2x').quran?.from === 255, 'string ref');
let threw = false; try { parseAnswer('nothing', 'ar2x'); } catch { threw = true; } ok(threw, 'no JSON throws');

ok(verseMatch('قل هو الله احد', 'قُلْ هُوَ ٱللَّهُ أَحَدٌ') === 1, 'verseMatch full');
ok(verseMatch('السلام عليكم', 'قُلْ هُوَ ٱللَّهُ أَحَدٌ') === 0, 'verseMatch none');
ok(systemPrompt('sv', 'academic').includes('Swedish'), 'prompt language');
ok(pickEdition('sv', undefined, [{ identifier: 'sv.bernstrom', name: '', englishName: '', language: 'sv' }]) === 'sv.bernstrom', 'pickEdition');
ok(pickEdition('en', undefined, [{ identifier: 'en.x', name: '', englishName: '', language: 'en' }]) === 'en.x', 'pickEdition fallback');

(async () => {
  // fake API
  const fakeClaude: any = async (url: string, init: any) => {
    const body = JSON.parse(init.body);
    ok(init.headers['x-api-key'] === 'k' && body.model === 'm' && url.endsWith('/v1/messages'), 'request shape');
    return { ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text: '{"arabic":"a"}' }] }) };
  };
  ok((await askClaude({ apiKey: 'k', model: 'm', system: 's', content: [], f: fakeClaude })) === '{"arabic":"a"}', 'askClaude');
  const bad: any = async () => ({ ok: false, status: 401, json: async () => ({}) });
  let kind = ''; try { await askClaude({ apiKey: 'k', model: 'm', system: 's', content: [], f: bad }); } catch (e: any) { kind = e.kind; }
  ok(kind === 'badkey', 'badkey');
  try { await askClaude({ apiKey: '', model: 'm', system: 's', content: [] }); } catch (e: any) { kind = e.kind; }
  ok(kind === 'nokey', 'nokey');

  const fakeQuran: any = async (url: string) => {
    ok(url.includes('/surah/112/editions/quran-uthmani,sv.bernstrom'), 'surah url ' + url);
    return { ok: true, json: async () => ({ code: 200, data: [
      { name: 'سورة الإخلاص', englishNameTranslation: 'Sincerity', ayahs: [{ numberInSurah: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ' }, { numberInSurah: 2, text: 'ٱللَّهُ ٱلصَّمَدُ' }] },
      { edition: { identifier: 'sv.bernstrom' }, ayahs: [{ text: 'Säg...' }, { text: 'Gud...' }] },
    ] }) };
  };
  const s = await fetchSurah(112, 'sv.bernstrom', fakeQuran);
  ok(s.bismillah && s.ayahs[0].arabic === 'قُلْ هُوَ ٱللَّهُ أَحَدٌ' && s.ayahs[1].translation === 'Gud...', 'fetchSurah');

  // whole Qur'an on the phone
  const api = (edition: string, text: (s: number, a: number) => string) => ({ surahs: SURAHS.map(s => ({ number: s.number, name: `name${s.number}`, englishNameTranslation: 'm', ayahs: Array.from({ length: s.ayahs }, (_, i) => ({ text: text(s.number, i + 1) })) })) });
  const ar = compactQuran('quran-uthmani', api('quran-uthmani', (s, a) => s === 112 && a === 1 ? 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ' : `ar ${s}:${a}`));
  const sv = compactQuran('sv.bernstrom', api('sv', (s, a) => `sv ${s}:${a}`));
  ok(completeQuran(ar) && completeQuran(sv) && !completeQuran({ edition: 'x', surahs: ar.surahs.slice(1) }), 'completeQuran');
  const ls = localSurah(112, ar, sv)!;
  ok(ls.bismillah && ls.ayahs[0].arabic === 'قُلْ هُوَ ٱللَّهُ أَحَدٌ' && ls.ayahs[0].translation === 'sv 112:1' && ls.edition === 'sv.bernstrom', 'localSurah');
  ok(!localSurah(1, ar, null)!.bismillah && localSurah(1, ar, null)!.ayahs[0].translation === '', 'localSurah Fatiha without translation');
  ok(JSON.stringify(localAyahs(ar, sv, 2, 255, 256)!.map(a => a.n)) === '[255,256]', 'localAyahs');
  const whole: any = async (url: string) => ({ ok: true, json: async () => ({ code: 200, data: api('x', (s, a) => url.includes('/quran/en.sahih') ? `en ${s}:${a}` : '') }) });
  ok((await fetchWholeQuran('en.sahih', whole)).surahs[1].ayahs[254] === 'en 2:255', 'fetchWholeQuran');

  if (fail) { console.log(`${fail} engine test(s) failed`); process.exit(1); }
  console.log('engine: all ok');
})();
