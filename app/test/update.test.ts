import { notesFor } from '../src/update';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
const body = '<!-- lang:sv -->\n- **Ihdāʾ** i Daily Awrad\n\n<!-- lang:en -->\n- **Ihdāʾ** in the Daily Awrad\n';
ok(notesFor(body, 'en') === '- Ihdāʾ in the Daily Awrad', 'en: ' + notesFor(body, 'en'));
ok(notesFor(body, 'sv') === '- Ihdāʾ i Daily Awrad', 'sv: ' + notesFor(body, 'sv'));
ok(notesFor('**Full Changelog**: https://x', 'en') === '', 'old body hidden');
if (fail) process.exit(1);
console.log('update: all ok');

// "What's new" as a list, in the app's language
import { notesList } from '../src/update';
{
  const body = '<!-- lang:sv -->\n- **Frågerutor i Alifs tema:** rutor i appens färger.\n- **Rullningsstav:** dra för att hoppa.\n\n<!-- lang:en -->\n- **Question boxes:** in the app’s colours.\n';
  const sv = notesList(body, 'sv'), en = notesList(body, 'en');
  if (sv.length !== 2 || sv[0] !== 'Frågerutor i Alifs tema: rutor i appens färger.' || en[0] !== 'Question boxes: in the app’s colours.') { console.error('FAIL notesList', sv, en); process.exit(1); }
  if (notesList('Bara en mening om versionen.', 'sv')[0] !== 'Bara en mening om versionen.') { console.error('FAIL notesList plain'); process.exit(1); }
  console.log('notesList: ok');
}
