import { notesFor } from '../src/update';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
const body = '<!-- lang:sv -->\n- **Ihdāʾ** i Daily Awrad\n\n<!-- lang:en -->\n- **Ihdāʾ** in the Daily Awrad\n';
ok(notesFor(body, 'en') === '- Ihdāʾ in the Daily Awrad', 'en: ' + notesFor(body, 'en'));
ok(notesFor(body, 'sv') === '- Ihdāʾ i Daily Awrad', 'sv: ' + notesFor(body, 'sv'));
ok(notesFor('**Full Changelog**: https://x', 'en') === '', 'old body hidden');
if (fail) process.exit(1);
console.log('update: all ok');
