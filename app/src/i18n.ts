export type Lang = 'sv' | 'en';

const sv = {
  tagline: 'LÄS · FÖRSTÅ · ÖVERSÄTT',
  splashCamera: 'KAMERA', splashTranslit: 'TRANSLITTERERA', splashTranslate: 'ÖVERSÄTT',
  tabCamera: 'Kamera', tabText: 'Skriv', tabQuran: 'Koranen', tabHistory: 'Historik', tabSettings: 'Inställningar',

  // camera
  cameraTitle: 'Läs med kameran', cameraSub: 'Rikta mot arabisk text och ta en bild',
  allowCam: 'Tillåt kamera', camDenied: 'Kameran är inte tillåten. Slå på den i telefonens inställningar, eller välj en bild.',
  pickImage: 'Välj bild', shoot: 'Ta bild', retake: 'Ny bild', reading: 'Läser texten…', torch: 'Lampa',
  frameHint: 'Håll texten rak och skarp i rutan',

  // text
  textTitle: 'Skriv eller klistra in', textSub: 'Arabiska blir translitteration och översättning. Svenska blir arabiska.',
  inputPh: 'Skriv arabiska eller svenska…',
  translate: 'Översätt', translating: 'Översätter…', paste: 'Klistra in', clear: 'Rensa',
  dirAr: 'Arabiska → Svenska', dirX: 'Svenska → Arabiska',
  instant: 'Direkt på telefonen', instantHint: 'Translitterationen räknas ut direkt, även utan nät. Tryck Översätt för översättning och ord för ord.',
  unvocalized: 'Texten saknar vokaltecken (ḥarakāt), så bara konsonanter och långa vokaler kan visas. Tryck Översätt så vokaliseras texten.',

  // result
  arabic: 'Arabiska', translit: 'Translitteration', translation: 'Översättning', yourText: 'Din text',
  wordByWord: 'Ord för ord', notes: 'Att lägga märke till', copy: 'Kopiera', copied: 'Kopierat',
  fromQuran: 'Koranen', openSurah: 'Öppna suran', quranTranslation: 'Översättning av betydelsen',
  verifiedVerse: 'Texten från muṣḥaf', aiTranslation: 'Claudes översättning',
  save: 'Spara', saved: 'Sparat i historiken',

  // errors
  errNoKey: 'Lägg in din API-nyckel under Inställningar, AI-översättning, för att läsa bilder och översätta.',
  errBadKey: 'API-nyckeln godtogs inte. Kontrollera den under Inställningar.',
  errBusy: 'Tjänsten är upptagen just nu. Försök igen om en stund.',
  errNetwork: 'Ingen kontakt. Kontrollera internet och försök igen.',
  errAnswer: 'Svaret gick inte att läsa. Försök igen.',
  errOther: 'Något gick fel',
  errNoArabic: 'Ingen arabisk text hittades.',
  goSettings: 'Till inställningar',

  // quran
  quranTitle: 'Koranen', quranSub: '114 suror · uthmanisk text med tajwīd-translitteration',
  searchSurah: 'Sök sura (namn eller nummer)', verses: 'verser', loading: 'Hämtar…', loadFail: 'Kunde inte hämta suran. Kontrollera internet.',
  retry: 'Försök igen', offlineCached: 'Sparad för läsning utan nät', explainVerse: 'Förklara ord för ord',
  showTranslit: 'Translitteration', showTranslation: 'Översättning', verseTo: 'Gå till vers',
  bismillahNote: 'Basmala',

  // history
  historyTitle: 'Historik', historySub: 'Det du har läst och översatt, sparat på telefonen', noHistory: 'Inget sparat än.',
  clearHistory: 'Rensa historiken', clearHistoryConfirm: 'Allt i historiken raderas från telefonen.', delete: 'Radera', cancel: 'Avbryt',
  kindCamera: 'Kamera', kindText: 'Text', kindQuran: 'Koranen',

  // settings
  settings: 'Inställningar', settingsSub: 'Språk, utseende, translitteration och uppdateringar',
  language: 'Språk', languageSub: 'Översätt till och visa appen på', swedish: 'Svenska', english: 'English',
  languageHelp: 'Arabiska översätts till det språk du väljer här, och det du skriver på det språket översätts till arabiska. Appen visas också på samma språk.',
  theme: 'Tema', themeSub: 'Utseende', themeDark: 'Mörk', themeBeige: 'Beige', useTheme: 'Använd tema',
  translitSet: 'Translitteration', translitSetSub: 'Uttal och skrivsätt',
  modeTajwid: 'Uttal (tajwīd)', modeTajwidSub: 'Som det reciteras: ord binds ihop (bismi llāhi), solbokstäver assimileras, nūn-regler och paus vid versslut.',
  modeWords: 'Ord för ord', modeWordsSub: 'Varje ord för sig med full böjningsändelse, som i grammatikböcker (ALA-LC: al-raḥmān).',
  schemeAcademic: 'Akademisk', schemeAcademicSub: 'ā ī ū ḥ ṣ ḍ ṭ ẓ ʿ ʾ',
  schemeSimple: 'Enkel', schemeSimpleSub: 'Bara vanliga bokstäver: aa ii uu',
  example: 'Exempel',
  rulesTitle: 'Regler som används', rules: [
    'Hamzat al-waṣl (ٱ) uttalas inte inne i en mening: بِسْمِ ٱللَّهِ → bismi llāhi.',
    'Före ٱ blir en lång vokal kort (fi l-arḍi) och ett ord som slutar på konsonant får en hjälpvokal (mina n-nāsi, ʿalayhimu l-qitālu).',
    'Artikeln al-: solbokstäver assimilerar l (ar-raḥmān), månbokstäver behåller den (al-qamar).',
    'Nūn sākina och tanwīn: idghām i y r m l w n (may-yaʿmal), iqlāb före b blir m (mim baʿdi).',
    'Waqf (paus) vid versslut, stopptecken ۘ ۗ och skiljetecken: korta slutvokaler och -un/-in faller bort, -an blir -ā, tāʾ marbūṭa blir -h.',
    'Uthmaniska tecken: ۡ sukūn, ٰ långt ā, ۥ ۦ små wāw/yāʾ, ۟ tyst bokstav, ۢ iqlāb och de lösa bokstäverna (الٓمٓ → alif lām mīm).',
  ],
  arabicSize: 'Storlek på arabisk text',
  quranEdition: 'Koranöversättning', quranEditionSub: 'Översättning som visas under Koranen',
  editionsFail: 'Kunde inte hämta listan. Kontrollera internet.',
  ai: 'AI-översättning', aiSub: 'Claude läser bilder och översätter',
  apiKey: 'API-nyckel (Anthropic)', apiKeyPh: 'sk-ant-…', apiKeyHelp: 'Kameraläsning och översättning görs av Claude med din egen API-nyckel från console.anthropic.com. Nyckeln sparas krypterad i telefonens säkra lagring och skickas bara till Anthropic. Text och bilder du översätter skickas till Anthropic för att behandlas. Translitteration och Koranläsning fungerar utan nyckel.',
  model: 'Modell', saveKey: 'Spara nyckel', removeKey: 'Ta bort nyckel', keySaved: 'Nyckeln är sparad', keyMissing: 'Ingen nyckel', testKey: 'Testa nyckeln', keyOk: 'Nyckeln fungerar',
  update: 'Uppdateringar', updateSub: 'Söker efter ny version på GitHub', checkUpdate: 'Sök efter uppdatering', upToDate: 'Du har senaste versionen', newVersion: 'Ny version',
  download: 'Öppna releasesidan', installUpdate: 'Ladda ner och installera', downloading: 'Laddar ner…', installAllow: 'Godkänn installationen i Android. Första gången kan du behöva tillåta installation från Alif.',
  installFail: 'Kunde inte installera. Öppna releasesidan och ladda ner APK-filen där.', noRelease: 'Ingen release hittades än.', checking: 'Söker…', updateFail: 'Kunde inte kontrollera uppdatering.', version: 'Version',
  about: 'Om Alif', aboutSub: 'Utvecklare: Claes Sundman S.N.C AB - 2026',
  aboutBody: 'Alif hjälper dig att läsa klassisk arabiska och Koranen: kameran läser texten, appen vokaliserar, translittererar enligt tajwīd och översätter till svenska eller engelska. Du kan också skriva svenska eller engelska och få det på arabiska.',
  aboutQuran: 'Koranens text och översättningar hämtas från AlQuran Cloud (alquran.cloud). En översättning av Koranen är alltid en tolkning av betydelsen.',
  aboutAi: 'Översättningar från Claude kan innehålla fel. Kontrollera viktiga texter mot en lärd källa.',
  back: 'Tillbaka', on: 'På', off: 'Av',
};
export type Strings = typeof sv;

const en: Strings = {
  tagline: 'READ · UNDERSTAND · TRANSLATE',
  splashCamera: 'CAMERA', splashTranslit: 'TRANSLITERATE', splashTranslate: 'TRANSLATE',
  tabCamera: 'Camera', tabText: 'Write', tabQuran: 'Qurʾān', tabHistory: 'History', tabSettings: 'Settings',

  cameraTitle: 'Read with the camera', cameraSub: 'Point at Arabic text and take a photo',
  allowCam: 'Allow camera', camDenied: 'The camera is not allowed. Turn it on in the phone settings, or pick a picture.',
  pickImage: 'Pick picture', shoot: 'Take photo', retake: 'New photo', reading: 'Reading the text…', torch: 'Light',
  frameHint: 'Keep the text straight and sharp inside the frame',

  textTitle: 'Write or paste', textSub: 'Arabic becomes transliteration and translation. English becomes Arabic.',
  inputPh: 'Write Arabic or English…',
  translate: 'Translate', translating: 'Translating…', paste: 'Paste', clear: 'Clear',
  dirAr: 'Arabic → English', dirX: 'English → Arabic',
  instant: 'Right on the phone', instantHint: 'The transliteration is worked out at once, even offline. Tap Translate for the translation and word by word.',
  unvocalized: 'The text has no vowel marks (ḥarakāt), so only consonants and long vowels can be shown. Tap Translate to have it vocalized.',

  arabic: 'Arabic', translit: 'Transliteration', translation: 'Translation', yourText: 'Your text',
  wordByWord: 'Word by word', notes: 'Worth noticing', copy: 'Copy', copied: 'Copied',
  fromQuran: 'Qurʾān', openSurah: 'Open the sūra', quranTranslation: 'Translation of the meaning',
  verifiedVerse: 'Text from the muṣḥaf', aiTranslation: "Claude's translation",
  save: 'Save', saved: 'Saved in history',

  errNoKey: 'Add your API key under Settings, AI translation, to read pictures and translate.',
  errBadKey: 'The API key was not accepted. Check it under Settings.',
  errBusy: 'The service is busy right now. Try again in a moment.',
  errNetwork: 'No connection. Check the internet and try again.',
  errAnswer: 'The answer could not be read. Try again.',
  errOther: 'Something went wrong',
  errNoArabic: 'No Arabic text was found.',
  goSettings: 'To settings',

  quranTitle: 'The Qurʾān', quranSub: '114 sūras · Uthmani text with tajwīd transliteration',
  searchSurah: 'Find a sūra (name or number)', verses: 'verses', loading: 'Loading…', loadFail: 'Could not load the sūra. Check the internet.',
  retry: 'Try again', offlineCached: 'Saved for offline reading', explainVerse: 'Explain word by word',
  showTranslit: 'Transliteration', showTranslation: 'Translation', verseTo: 'Go to verse',
  bismillahNote: 'Basmala',

  historyTitle: 'History', historySub: 'What you have read and translated, kept on the phone', noHistory: 'Nothing saved yet.',
  clearHistory: 'Clear history', clearHistoryConfirm: 'Everything in the history is deleted from the phone.', delete: 'Delete', cancel: 'Cancel',
  kindCamera: 'Camera', kindText: 'Text', kindQuran: 'Qurʾān',

  settings: 'Settings', settingsSub: 'Language, look, transliteration and updates',
  language: 'Language', languageSub: 'Translate into and show the app in', swedish: 'Svenska', english: 'English',
  languageHelp: 'Arabic is translated into the language you choose here, and what you write in that language is translated into Arabic. The app is shown in the same language.',
  theme: 'Theme', themeSub: 'Look', themeDark: 'Dark', themeBeige: 'Beige', useTheme: 'Use theme',
  translitSet: 'Transliteration', translitSetSub: 'Pronunciation and spelling',
  modeTajwid: 'Recited (tajwīd)', modeTajwidSub: 'As it is recited: words join (bismi llāhi), sun letters assimilate, nūn rules and a pause at the end of a verse.',
  modeWords: 'Word by word', modeWordsSub: 'Each word on its own with its full case ending, as in grammar books (ALA-LC: al-raḥmān).',
  schemeAcademic: 'Academic', schemeAcademicSub: 'ā ī ū ḥ ṣ ḍ ṭ ẓ ʿ ʾ',
  schemeSimple: 'Simple', schemeSimpleSub: 'Plain letters only: aa ii uu',
  example: 'Example',
  rulesTitle: 'Rules that are used', rules: [
    'Hamzat al-waṣl (ٱ) is not pronounced inside a phrase: بِسْمِ ٱللَّهِ → bismi llāhi.',
    'Before ٱ a long vowel becomes short (fi l-arḍi) and a word ending in a consonant gets a helping vowel (mina n-nāsi, ʿalayhimu l-qitālu).',
    'The article al-: sun letters absorb the l (ar-raḥmān), moon letters keep it (al-qamar).',
    'Nūn sākina and tanwīn: idghām into y r m l w n (may-yaʿmal), iqlāb before b turns it into m (mim baʿdi).',
    'Waqf (pause) at the end of a verse, at the stop signs ۘ ۗ and at punctuation: final short vowels and -un/-in fall away, -an becomes -ā, tāʾ marbūṭa becomes -h.',
    'Uthmani signs: ۡ sukūn, ٰ long ā, ۥ ۦ small wāw/yāʾ, ۟ silent letter, ۢ iqlāb and the disjoined letters (الٓمٓ → alif lām mīm).',
  ],
  arabicSize: 'Size of Arabic text',
  quranEdition: 'Qurʾān translation', quranEditionSub: 'Translation shown under the Qurʾān',
  editionsFail: 'Could not load the list. Check the internet.',
  ai: 'AI translation', aiSub: 'Claude reads pictures and translates',
  apiKey: 'API key (Anthropic)', apiKeyPh: 'sk-ant-…', apiKeyHelp: 'Camera reading and translation are done by Claude with your own API key from console.anthropic.com. The key is kept encrypted in the phone\'s secure storage and is only sent to Anthropic. Text and pictures you translate are sent to Anthropic to be processed. Transliteration and reading the Qurʾān work without a key.',
  model: 'Model', saveKey: 'Save key', removeKey: 'Remove key', keySaved: 'The key is saved', keyMissing: 'No key', testKey: 'Test the key', keyOk: 'The key works',
  update: 'Updates', updateSub: 'Looks for a new version on GitHub', checkUpdate: 'Check for update', upToDate: 'You have the latest version', newVersion: 'New version',
  download: 'Open the release page', installUpdate: 'Download and install', downloading: 'Downloading…', installAllow: 'Approve the installation in Android. The first time you may need to allow installing from Alif.',
  installFail: 'Could not install. Open the release page and download the APK there.', noRelease: 'No release found yet.', checking: 'Checking…', updateFail: 'Could not check for an update.', version: 'Version',
  about: 'About Alif', aboutSub: 'Developer: Claes Sundman S.N.C AB - 2026',
  aboutBody: 'Alif helps you read Classical Arabic and the Qurʾān: the camera reads the text, the app vocalizes it, transliterates it by the rules of tajwīd and translates it into Swedish or English. You can also write Swedish or English and get it in Arabic.',
  aboutQuran: 'The Qurʾān text and translations come from AlQuran Cloud (alquran.cloud). A translation of the Qurʾān is always an interpretation of its meaning.',
  aboutAi: 'Translations by Claude can contain mistakes. Check important texts against a learned source.',
  back: 'Back', on: 'On', off: 'Off',
};

export const dict: Record<Lang, Strings> = { sv, en };
