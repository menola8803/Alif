import { AWRAD, countFor, dayKey, formatTime, isMTF, pastTime, LEVELS } from '../src/core/awrad';
import { transliterate, isVocalized } from '../src/core/translit';
import { validRef } from '../src/core/quran';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
const tue = new Date(2026, 9, 27), fri = new Date(2026, 9, 30);
const sal = AWRAD.find(s => s.id === 'salawat')!;
ok(countFor(sal, 'mubtadi', tue) === 300 && countFor(sal, 'mubtadi', fri) === 500 && countFor(sal, 'murid', fri) === 2000, 'salawat counts');
ok(countFor(AWRAD.find(s => s.id === 'istighfar')!, 'murid') === 70, 'istighfar 70');
ok(isMTF(fri) && !isMTF(tue), 'Mon/Thu/Fri');
ok(formatTime(21, 0, false) === '21:00' && formatTime(21, 0, true) === '9:00 PM' && formatTime(0, 5, true) === '12:05 AM', 'formatTime');
ok(pastTime(21, 0, new Date(2026, 0, 1, 21, 0)) && !pastTime(21, 0, new Date(2026, 0, 1, 20, 59)), 'pastTime');
ok(dayKey(new Date(2026, 0, 5)) === '2026-01-05', 'dayKey');
ok(new Set(AWRAD.map(s => s.id)).size === AWRAD.length, 'unique ids');
for (const s of AWRAD) {
  if (s.quran) ok(validRef(s.quran.surah, s.quran.from, s.quran.to), `ref ${s.id}`);
  if (s.arabic) ok(isVocalized(s.arabic), `vocalized ${s.id}`);
  for (const l of LEVELS) ok(countFor(s, l) >= 1, `count ${s.id}`);
}
const tr = (id: string) => transliterate(AWRAD.find(s => s.id === id)!.arabic!);
ok(tr('istighfar') === 'astaghfiru llāh', 'istighfar translit: ' + tr('istighfar'));
ok(tr('tahlil') === 'lā ilāha illa llāh', 'tahlil translit: ' + tr('tahlil'));
ok(tr('haqq') === 'allāhu llāhu llāhu ḥaqq', 'haqq translit: ' + tr('haqq'));
console.log('salawat:', tr('salawat10'));
console.log('shahada:', tr('shahada'));
console.log('opening:', tr('opening'));
if (fail) { console.log(`${fail} awrad test(s) failed`); process.exit(1); }
console.log('awrad: all ok');
