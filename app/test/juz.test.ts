import { JUZ, SAJDA, isSajda, juzOf, juzRange, juzStartingAt, withoutSajdaSign } from '../src/core/juz';
import { SURAHS } from '../src/core/quran';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
ok(JUZ.length === 30 && SAJDA.length === 15, 'counts');
const total = JUZ.reduce((n, z) => n + juzRange(z.n).reduce((m, [, a, b]) => m + b - a + 1, 0), 0);
ok(total === 6236, `all 6236 verses in exactly one part (${total})`);
ok(juzOf(1, 1) === 1 && juzOf(2, 141) === 1 && juzOf(2, 142) === 2 && juzOf(114, 6) === 30 && juzOf(67, 1) === 29, 'juzOf');
ok(juzStartingAt(15, 1)?.n === 14 && !juzStartingAt(15, 2), 'start');
ok(JSON.stringify(juzRange(30)[0]) === '[78,1,40]' && juzRange(30).length === 37, 'juz 30');
ok(SAJDA.every(([s, a]) => a <= SURAHS[s - 1].ayahs) && isSajda(96, 19) && !isSajda(96, 18), 'sajda');
ok(withoutSajdaSign('وَلَهُۥ يَسْجُدُونَ ۩') === 'وَلَهُۥ يَسْجُدُونَ', 'strip sign');
if (fail) process.exit(1);
console.log('juz: all ok');
// sounds
import { channelId, soundFor, ADHANS, FAJR_ADHAN } from '../src/core/sounds';
{
  let f = 0; const ok2 = (c: boolean, m: string) => { if (!c) { f++; console.log('FAIL', m); } };
  ok2(ADHANS.length === 5, 'five adhans');
  ok2(channelId('default', false) === channelId('default', false) && channelId('default', false) !== channelId('default', true), 'channel ids');
  ok2(channelId('raw:adhan_makkah', false).startsWith('prayer-'), 'prefix');
  ok2(soundFor('fajr', ADHANS[0].id, true) === FAJR_ADHAN.id && soundFor('dhuhr', ADHANS[0].id, true) === ADHANS[0].id && soundFor('fajr', 'default', true) === 'default' && soundFor('fajr', ADHANS[0].id, false) === ADHANS[0].id, 'fajr adhan');
  if (f) process.exit(1);
  console.log('sounds: all ok');
}
// ḥurūf
import { H_LETTERS, OPENERS, MISSING7 } from '../src/core/huroof';
{
  let f = 0; const ok3 = (c: boolean, m: string) => { if (!c) { f++; console.log('FAIL', m); } };
  const surahs = new Set(OPENERS.flatMap(o => o.surahs));
  ok3(surahs.size === 29, `29 sūras (${surahs.size})`);
  ok3(H_LETTERS.length === 14 && new Set(H_LETTERS.map(l => l.ar)).size === 14, '14 letters');
  const used = new Set(OPENERS.flatMap(o => [...o.ar.replace(/[ٓ\s]/g, '').replace('ه', 'ه')]));
  ok3([...used].every(c => H_LETTERS.some(l => l.ar === c)), `opener letters are the 14 (${[...used].join('')})`);
  ok3(MISSING7.every(m => !H_LETTERS.some(l => l.ar === m.ar)), 'the seven are not among the 14');
  if (f) process.exit(1);
  console.log('huroof: all ok');
}
// abjad
import { ABJAD, abjadSum } from '../src/core/abjad';
{
  let f = 0; const ok4 = (c: boolean, m: string) => { if (!c) { f++; console.log('FAIL', m); } };
  ok4(ABJAD.length === 28 && new Set(ABJAD.map(l => l.order)).size === 28, '28 letters, each place once');
  ok4(abjadSum('الله') === 66 && abjadSum('مُحَمَّد') === 92, 'Allāh 66, Muḥammad 92');
  ok4(abjadSum('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ') === 786, `basmala 786 (${abjadSum('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ')})`);
  ok4(abjadSum('الم') === 71 && abjadSum('المص') === 161 && abjadSum('الر') === 231 && abjadSum('المر') === 271, 'the ḥadīth sums');
  if (f) process.exit(1);
  console.log('abjad: all ok');
}
