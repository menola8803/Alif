import { audioUrl, globalAyah, RECITERS, DEFAULT_RECITER } from '../src/core/recite';
import { dropBasmala, parseTajweed, plainOf, rulesIn } from '../src/core/tajweed';
import { parseWbw } from '../src/wbw';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
ok(globalAyah(1, 1) === 1 && globalAyah(2, 1) === 8 && globalAyah(114, 6) === 6236, 'global ayah numbers');
ok(audioUrl('ar.husary', 1, 1) === 'https://cdn.islamic.network/quran/audio/128/ar.husary/1.mp3', 'audio url');
ok(DEFAULT_RECITER === 'ar.husary' && RECITERS[0].id === 'ar.husary', 'al-Ḥuṣarī is the default');
// tajwīd markup as in the quran-tajweed edition
const src = 'بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ [h:3[ٱ][l[ل]رَّحِيمِ ذَ[n[ٰ]لِكَ';
const p = parseTajweed(src);
ok(plainOf(p) === 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ذَٰلِكَ', `plain: ${plainOf(p)}`);
ok(p.some(x => x.rule === 'hamza_wasl' && x.text === 'ٱ') && p.some(x => x.rule === 'madd_normal'), 'rules found');
ok(rulesIn(p).includes('lam_shamsiyya'), 'lam shamsiyya');
ok(plainOf(dropBasmala(p)) === 'ذَٰلِكَ', `basmala dropped: ${plainOf(dropBasmala(p))}`);
ok(plainOf(parseTajweed('قُلْ هُوَ')) === 'قُلْ هُوَ', 'no markup');
// word by word (quran.com answer)
const w = parseWbw({ verses: [{ verse_number: 1, words: [
  { char_type_name: 'word', text_uthmani: 'بِسْمِ', transliteration: { text: 'bismi' }, translation: { text: 'In (the) name' } },
  { char_type_name: 'end', text_uthmani: '١' }] }] });
ok(w[1]?.length === 1 && w[1][0].en === 'In (the) name' && w[1][0].tr === 'bismi', 'wbw parse');
if (fail) process.exit(1);
console.log('recite: all ok');
