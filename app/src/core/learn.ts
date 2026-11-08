// "Lär dig läsa" / "Learn to read": the letters in the order of the book Iqraʾa! (Samir Muric), with the book's pictures of
// where each letter is pronounced (makhraj) and of its forms. The descriptions are short summaries in Swedish and English.
// Questions are made from the same data; they are hidden until the person turns them on in the corner menu.

export type Letter = {
  id: string; ar: string; name: string; sound: string;
  sv: string; en: string;
  joins: boolean;           // joins the letter after it
  makhraj: boolean;         // the book has a picture of where it is pronounced
  forms: boolean;           // the book has a table of its forms
};

const L = (id: string, ar: string, name: string, sound: string, joins: boolean, sv: string, en: string, makhraj = true, forms = true): Letter =>
  ({ id, ar, name, sound, joins, sv, en, makhraj, forms });

export const LETTERS: Letter[] = [
  L('alif', 'ا', 'ʾalif', 'ā', false, 'Har inget eget ljud. Förlänger ett a till ā och bär tecknet hamza. Kopplas inte till bokstaven efter.', 'Has no sound of its own. Lengthens an a to ā and carries the hamza. Does not join the letter after it.'),
  L('dal', 'د', 'dāl', 'd', false, 'Som svenskt d, med tungspetsen bakom övre framtänderna. Kopplas inte framåt.', 'Like English d, with the tip of the tongue behind the upper front teeth. Does not join forward.'),
  L('dhal', 'ذ', 'dhāl', 'dh', false, 'Som th i engelska "this": tungspetsen mellan tänderna. Som dāl men med en prick över.', 'Like th in "this": tip of the tongue between the teeth. Like dāl with a dot above.'),
  L('ra', 'ر', 'rāʾ', 'r', false, 'Rullande r med tungspetsen. Går ner under linjen och kopplas inte framåt.', 'A rolled r with the tip of the tongue. Dips below the line and does not join forward.'),
  L('zay', 'ز', 'zāy', 'z', false, 'Ett tonande s, som engelskt z. Som rāʾ med en prick över.', 'A voiced s, like English z. Like rāʾ with a dot above.'),
  L('ba', 'ب', 'bāʾ', 'b', true, 'Som b, med läpparna. En prick under.', 'Like b, with the lips. One dot below.'),
  L('ta', 'ت', 'tāʾ', 't', true, 'Som t. Två prickar över. I slutet av ord ofta tāʾ marbūṭa (ة).', 'Like t. Two dots above. At the end of words often tāʾ marbūṭa (ة).'),
  L('tha', 'ث', 'thāʾ', 'th', true, 'Som th i engelska "think": tungan mellan tänderna, tonlöst. Tre prickar över.', 'Like th in "think": tongue between the teeth, voiceless. Three dots above.'),
  L('waw', 'و', 'wāw', 'w / ū', false, 'Som w, eller långt ū efter ḍamma. Kopplas inte framåt.', 'Like w, or a long ū after a ḍamma. Does not join forward.'),
  L('nun', 'ن', 'nūn', 'n', true, 'Som n. En prick över.', 'Like n. One dot above.'),
  L('ya', 'ي', 'yāʾ', 'y / ī', true, 'Som j i "ja", eller långt ī efter kasra. Två prickar under.', 'Like y in "yes", or a long ī after a kasra. Two dots below.'),
  L('lam', 'ل', 'lām', 'l', true, 'Som l. Uttalas tjockt i namnet Allāh efter a eller u.', 'Like l. Pronounced thick in the name Allāh after a or u.', false, true),
  L('fa', 'ف', 'fāʾ', 'f', true, 'Som f, övre tänderna mot underläppen. En prick över.', 'Like f, upper teeth on the lower lip. One dot above.'),
  L('qaf', 'ق', 'qāf', 'q', true, 'Ett djupt k längst bak vid gomseglet. Två prickar över.', 'A deep k at the very back, at the uvula. Two dots above.'),
  L('mim', 'م', 'mīm', 'm', true, 'Som m, med läpparna.', 'Like m, with the lips.'),
  L('hamza', 'ء', 'hamza', 'ʾ', false, 'Ett stopp i halsen, som mellan "o-oj". Sitter på alif, wāw, yāʾ eller ensam.', 'A stop in the throat, as in "uh-oh". Sits on alif, wāw, yāʾ or on its own.', true, false),
  L('kaf', 'ك', 'kāf', 'k', true, 'Som k.', 'Like k.'),
  L('ha', 'ه', 'hāʾ', 'h', true, 'Ett mjukt h, luft från bröstet.', 'A soft h, breath from the chest.'),
  L('hha', 'ح', 'ḥāʾ', 'ḥ', true, 'Ett kraftigt, hest h från mitten av halsen. Inga prickar.', 'A strong, breathy h from the middle of the throat. No dots.'),
  L('kha', 'خ', 'khāʾ', 'kh', true, 'Som ch i tyska "Bach". En prick över.', 'Like ch in German "Bach" or Scottish "loch". One dot above.'),
  L('jim', 'ج', 'jīm', 'j', true, 'Som dj i "djungel" (engelskt j). En prick inuti.', 'Like j in "jam". One dot inside.'),
  L('sin', 'س', 'sīn', 's', true, 'Som s.', 'Like s.'),
  L('shin', 'ش', 'shīn', 'sh', true, 'Som sj-ljudet (engelskt sh). Tre prickar över.', 'Like sh. Three dots above.'),
  L('sad', 'ص', 'ṣād', 'ṣ', true, 'Ett tjockt s: tungan låg och munnen rundad.', 'A thick s: tongue low and the mouth rounded.'),
  L('dad', 'ض', 'ḍād', 'ḍ', true, 'Ett tjockt d med tungans sida mot kindtänderna. Som ṣād med en prick.', 'A thick d with the side of the tongue against the molars. Like ṣād with a dot.'),
  L('tta', 'ط', 'ṭāʾ', 'ṭ', true, 'Ett tjockt t.', 'A thick t.'),
  L('zza', 'ظ', 'ẓāʾ', 'ẓ', true, 'Ett tjockt dh. Som ṭāʾ med en prick.', 'A thick dh. Like ṭāʾ with a dot.'),
  L('ayn', 'ع', 'ʿayn', 'ʿ', true, 'Ett tonande ljud där mitten av halsen pressas ihop. Finns inte i svenskan.', 'A voiced sound made by tightening the middle of the throat. Not in English.'),
  L('ghayn', 'غ', 'ghayn', 'gh', true, 'Ett skrapande r längst bak, som franskt r. Som ʿayn med en prick.', 'A scraping r at the back, like French r. Like ʿayn with a dot.'),
];

export type Sign = { ar: string; name: string; sv: string; en: string; example: string; ex: string };
/** Vowel signs and other marks (the book's first lessons). */
export const SIGNS: Sign[] = [
  { ar: 'َ', name: 'fatḥa', sv: 'Snett streck över: kort a.', en: 'A slanted stroke above: short a.', example: 'بَ', ex: 'ba' },
  { ar: 'ِ', name: 'kasra', sv: 'Snett streck under: kort i.', en: 'A slanted stroke below: short i.', example: 'بِ', ex: 'bi' },
  { ar: 'ُ', name: 'ḍamma', sv: 'Ett litet wāw över: kort u.', en: 'A small wāw above: short u.', example: 'بُ', ex: 'bu' },
  { ar: 'ْ', name: 'sukūn', sv: 'En liten ring: ingen vokal.', en: 'A small circle: no vowel.', example: 'بْ', ex: 'b' },
  { ar: 'ّ', name: 'shadda', sv: 'Bokstaven uttalas dubbelt.', en: 'The letter is pronounced double.', example: 'بّ', ex: 'bb' },
  { ar: 'ً', name: 'tanwīn fatḥ', sv: 'Två fatḥa: -an.', en: 'Two fatḥas: -an.', example: 'بًا', ex: 'ban' },
  { ar: 'ٍ', name: 'tanwīn kasr', sv: 'Två kasra: -in.', en: 'Two kasras: -in.', example: 'بٍ', ex: 'bin' },
  { ar: 'ٌ', name: 'tanwīn ḍamm', sv: 'Två ḍamma: -un.', en: 'Two ḍammas: -un.', example: 'بٌ', ex: 'bun' },
  { ar: 'ا', name: 'madd ā', sv: 'Fatḥa och alif: långt ā.', en: 'Fatḥa and alif: long ā.', example: 'بَا', ex: 'bā' },
  { ar: 'ي', name: 'madd ī', sv: 'Kasra och yāʾ: långt ī.', en: 'Kasra and yāʾ: long ī.', example: 'بِي', ex: 'bī' },
  { ar: 'و', name: 'madd ū', sv: 'Ḍamma och wāw: långt ū.', en: 'Ḍamma and wāw: long ū.', example: 'بُو', ex: 'bū' },
];

export type Question = { q: string; glyph?: string; options: string[]; answer: number };

// Small deterministic random generator, so a letter always gets the same questions.
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
function pickOthers<T>(all: T[], not: T, n: number, r: () => number): T[] {
  const pool = all.filter(x => x !== not);
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}
function shuffle(options: string[], r: () => number): string[] {
  const o = [...options];
  for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
  return o;
}

/** Three questions about a letter: recognise it, its sound, and whether it joins forward. */
export function questionsFor(l: Letter, lang: 'sv' | 'en'): Question[] {
  const r = rng(l.id);
  const sv = lang === 'sv';
  const known = LETTERS.slice(0, LETTERS.indexOf(l) + 1);
  const others = pickOthers(known.length >= 4 ? known : LETTERS, l, 3, r);
  const q1o = shuffle([l.name, ...others.map(o => o.name)], r);
  const q2o = shuffle([l.sound, ...pickOthers(LETTERS.map(x => x.sound).filter((s, i, a) => a.indexOf(s) === i), l.sound, 3, r)], r);
  const yes = sv ? 'Ja' : 'Yes', no = sv ? 'Nej' : 'No';
  return [
    { q: sv ? 'Vilken bokstav är det här?' : 'Which letter is this?', glyph: l.ar, options: q1o, answer: q1o.indexOf(l.name) },
    { q: sv ? `Hur låter ${l.name}?` : `What does ${l.name} sound like?`, glyph: l.ar, options: q2o, answer: q2o.indexOf(l.sound) },
    { q: sv ? `Kopplas ${l.name} ihop med bokstaven efter?` : `Does ${l.name} join the letter after it?`, glyph: l.ar, options: [yes, no], answer: l.joins ? 0 : 1 },
  ];
}
