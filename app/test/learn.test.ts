import { LETTERS, SIGNS, questionsFor } from '../src/core/learn';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
ok(LETTERS.length === 29, 'letters incl. hamza');
ok(new Set(LETTERS.map(l => l.id)).size === 29, 'unique ids');
ok(LETTERS.filter(l => !l.makhraj).map(l => l.id).join() === 'lam', 'only lām lacks a makhraj picture');
ok(LETTERS.filter(l => !l.forms).map(l => l.id).join() === 'hamza', 'only hamza lacks a forms table');
ok(LETTERS.filter(l => !l.joins).map(l => l.id).sort().join() === 'alif,dal,dhal,hamza,ra,waw,zay', 'non-joining letters');
for (const l of LETTERS) for (const lang of ['sv', 'en'] as const) {
  const qs = questionsFor(l, lang);
  ok(qs.length === 3 && qs.every(q => q.answer >= 0 && q.answer < q.options.length && new Set(q.options).size === q.options.length), `questions ${l.id} ${lang}`);
  ok(qs[0].options[qs[0].answer] === l.name && qs[1].options[qs[1].answer] === l.sound, `right answers ${l.id}`);
}
ok(JSON.stringify(questionsFor(LETTERS[5], 'sv')) === JSON.stringify(questionsFor(LETTERS[5], 'sv')), 'stable');
ok(SIGNS.length >= 8, 'signs');
if (fail) process.exit(1);
console.log('learn: all ok');
