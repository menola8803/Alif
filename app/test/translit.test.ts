import { transliterate, isVocalized, stripHarakat, hasArabic } from '../src/core/translit';

let fail = 0;
function eq(input: string, want: string, opts: Parameters<typeof transliterate>[1] = {}) {
  const got = transliterate(input, opts);
  if (got !== want) { fail++; console.log(`FAIL ${input}\n  want: ${want}\n  got:  ${got}`); }
}

// Al-Fātiḥa, Uthmani script, recited (tajwid), one verse per call (each verse ends in a pause)
eq('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'bismi llāhi r-raḥmāni r-raḥīm');
eq('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'al-ḥamdu lillāhi rabbi l-ʿālamīn');
eq('ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'ar-raḥmāni r-raḥīm');
eq('مَٰلِكِ يَوْمِ ٱلدِّينِ', 'māliki yawmi d-dīn');
eq('إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'iyyāka naʿbudu wa-iyyāka nastaʿīn');
eq('ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', 'ihdina ṣ-ṣirāṭa l-mustaqīm');
eq('صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', 'ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wala ḍ-ḍāllīn');

// verses joined with verse-end signs pause between them
eq('ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝٣ مَٰلِكِ يَوْمِ ٱلدِّينِ ۝٤', 'ar-raḥmāni r-raḥīm (3) māliki yawmi d-dīn (4)');

// simple scheme
eq('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'bismi llaahi r-rahmaani r-rahiim', { scheme: 'simple' });

// word-by-word (ALA-LC) with full endings
eq('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'bismi allāhi al-raḥmāni al-raḥīmi', { mode: 'words' });

// disjoined letters, tanwīn idghām, waqf on tanwīn and tāʾ marbūṭa
eq('الٓمٓ', 'alif lām mīm');
eq('ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ', 'dhālika l-kitābu lā rayba fīhi hudal-li-l-muttaqīn');
eq('قُلْ هُوَ ٱللَّهُ أَحَدٌ', 'qul huwa llāhu aḥad');
eq('ٱللَّهُ ٱلصَّمَدُ', 'allāhu ṣ-ṣamad');
eq('وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ', 'walam yakul-lahū kufuwan aḥad');
eq('إِنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ', 'inna llāha ʿalā kulli shayʾin qadīr');
eq('فِى ٱلْأَرْضِ', 'fi l-arḍ');
eq('رَحْمَةً', 'raḥmah');
eq('عَلِيمًا', 'ʿalīmā');
eq('مِنۢ بَعْدِ', 'mim baʿd');
eq('قَالُوا۟ ٱلْحَقَّ', 'qālu l-ḥaqq');
eq('عَلَيْهِمُ ٱلْقِتَالُ', 'ʿalayhimu l-qitāl');
eq('مِنَ ٱلنَّاسِ', 'mina n-nās');
eq('ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ', 'iqraʾ bi-smi rabbika lladhī khalaq');
eq('وَٱلْعَصْرِ', 'wa-l-ʿaṣr');
eq('مَن يَعْمَلْ', 'may-yaʿmal');
eq('ٱلصَّلَوٰةَ', 'aṣ-ṣalāh');
eq('يُؤْمِنُونَ بِٱلْغَيْبِ', 'yuʾminūna bi-l-ghayb');

// helpers
if (!isVocalized('بِسْمِ ٱللَّهِ') || isVocalized('بسم الله الرحمن الرحيم')) { fail++; console.log('FAIL isVocalized'); }
if (stripHarakat('بِسْمِ ٱللَّهِ') !== 'بسم الله') { fail++; console.log('FAIL stripHarakat', stripHarakat('بِسْمِ ٱللَّهِ')); }
if (!hasArabic('abc ب') || hasArabic('hej')) { fail++; console.log('FAIL hasArabic'); }
// unvocalized text gives at least something readable
console.log('unvocalized:', transliterate('بسم الله الرحمن الرحيم'));

if (fail) { console.log(`${fail} translit test(s) failed`); process.exit(1); }
console.log('translit: all ok');
