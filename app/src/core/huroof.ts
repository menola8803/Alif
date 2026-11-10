// Ḥurūf: the disjoined letters (al-ḥurūf al-muqaṭṭaʿāt) that open 29 sūras, after "Secrets of Muqatta'at in Ahadith
// of Prophet (s)" on nurmuhammad.com (Naqshbandi-Haqqani). The explanations are short summaries in Alif's own words.
export const HUROOF_SOURCE = 'https://nurmuhammad.com/secrets-of-muqattaat-in-hadiths-of-prophet-s/';

type T = { sv: string; en: string };
export type HLetter = { ar: string; tr: string; name: string; divine: string; divineAr: string; value: number };
export type Opener = { ar: string; tr: string; surahs: number[] };

/** The 14 letters, each a key to one of Allah's names (Ibn ʿAbbās, Abū l-ʿĀliya). */
export const H_LETTERS: HLetter[] = [
  { ar: 'ا', tr: 'Alif', name: 'أَلِف', divine: 'Allāh', divineAr: 'ٱللَّه', value: 1 },
  { ar: 'ل', tr: 'Lām', name: 'لَام', divine: 'Laṭīf', divineAr: 'لَطِيف', value: 30 },
  { ar: 'م', tr: 'Mīm', name: 'مِيم', divine: 'Malik', divineAr: 'مَلِك', value: 40 },
  { ar: 'ص', tr: 'Ṣād', name: 'صَاد', divine: 'Ṣādiq', divineAr: 'صَادِق', value: 90 },
  { ar: 'ر', tr: 'Rā', name: 'رَاء', divine: 'Rabb', divineAr: 'رَبّ', value: 200 },
  { ar: 'ك', tr: 'Kāf', name: 'كَاف', divine: 'Karīm', divineAr: 'كَرِيم', value: 20 },
  { ar: 'ط', tr: 'Ṭā', name: 'طَاء', divine: 'Ṭayyib', divineAr: 'طَيِّب', value: 9 },
  { ar: 'س', tr: 'Sīn', name: 'سِين', divine: 'Samīʿ', divineAr: 'سَمِيع', value: 60 },
  { ar: 'ح', tr: 'Ḥā', name: 'حَاء', divine: 'Ḥamīd', divineAr: 'حَمِيد', value: 8 },
  { ar: 'ق', tr: 'Qāf', name: 'قَاف', divine: 'Qādir', divineAr: 'قَادِر', value: 100 },
  { ar: 'ن', tr: 'Nūn', name: 'نُون', divine: 'Nūr', divineAr: 'نُور', value: 50 },
  { ar: 'ه', tr: 'Hā', name: 'هَاء', divine: 'Hādī', divineAr: 'هَادِي', value: 5 },
  { ar: 'ع', tr: 'ʿAyn', name: 'عَيْن', divine: 'ʿAlīm', divineAr: 'عَلِيم', value: 70 },
  { ar: 'ي', tr: 'Yā', name: 'يَاء', divine: 'Yaqīn', divineAr: 'يَقِين', value: 10 },
];

/** The 14 openings and the sūras they open (29 in all). */
export const OPENERS: Opener[] = [
  { ar: 'الٓمٓ', tr: 'Alif Lām Mīm', surahs: [2, 3, 29, 30, 31, 32] },
  { ar: 'الٓر', tr: 'Alif Lām Rā', surahs: [10, 11, 12, 14, 15] },
  { ar: 'حمٓ', tr: 'Ḥā Mīm', surahs: [40, 41, 42, 43, 44, 45, 46] },
  { ar: 'طسٓمٓ', tr: 'Ṭā Sīn Mīm', surahs: [26, 28] },
  { ar: 'الٓمٓصٓ', tr: 'Alif Lām Mīm Ṣād', surahs: [7] },
  { ar: 'الٓمٓر', tr: 'Alif Lām Mīm Rā', surahs: [13] },
  { ar: 'كٓهيعٓصٓ', tr: 'Kāf Hā Yā ʿAyn Ṣād', surahs: [19] },
  { ar: 'عٓسٓقٓ', tr: 'ʿAyn Sīn Qāf (after Ḥā Mīm)', surahs: [42] },
  { ar: 'طه', tr: 'Ṭā Hā', surahs: [20] },
  { ar: 'طسٓ', tr: 'Ṭā Sīn', surahs: [27] },
  { ar: 'يسٓ', tr: 'Yā Sīn', surahs: [36] },
  { ar: 'صٓ', tr: 'Ṣād', surahs: [38] },
  { ar: 'قٓ', tr: 'Qāf', surahs: [50] },
  { ar: 'نٓ', tr: 'Nūn', surahs: [68] },
];

/**
 * The seven letters that do not occur in al-Fātiḥa, after al-Yāfiʿī (from Dhū n-Nūn): for each the day, the angel who
 * keeps it and the name. In the order of the source; the source gives no day for Khā.
 */
export const MISSING7: { ar: string; tr: string; day: T | null; angel: string; divine: string; divineAr: string }[] = [
  { ar: 'خ', tr: 'Khā', day: null, angel: 'Rūfāʾīl', divine: 'Khabīr', divineAr: 'خَبِير' },
  { ar: 'ش', tr: 'Shīn', day: { sv: 'måndag', en: 'Monday' }, angel: 'Jibrīl', divine: 'Shākir', divineAr: 'شَاكِر' },
  { ar: 'ز', tr: 'Zāy', day: { sv: 'tisdag', en: 'Tuesday' }, angel: 'Ṣamṣamāʾīl', divine: 'Zakī', divineAr: 'زَكِيّ' },
  { ar: 'ظ', tr: 'Ẓā', day: { sv: 'onsdag', en: 'Wednesday' }, angel: 'Mīkāʾīl', divine: 'Ẓāhir', divineAr: 'ظَاهِر' },
  { ar: 'ث', tr: 'Thā', day: { sv: 'torsdag', en: 'Thursday' }, angel: 'Ṣarfayāʾīl', divine: 'Thābit', divineAr: 'ثَابِت' },
  { ar: 'ج', tr: 'Jīm', day: { sv: 'fredag', en: 'Friday' }, angel: 'ʿAnyāʾīl', divine: 'Jabbār', divineAr: 'جَبَّار' },
  { ar: 'ف', tr: 'Fā', day: { sv: 'lördag', en: 'Saturday' }, angel: 'ʿAzrāʾīl', divine: 'Fāṭir', divineAr: 'فَاطِر' },
];

/** The abjad sums in the ḥadīth of Jābir ibn ʿAbdullāh. */
export const HADITH_SUMS: { ar: string; tr: string; value: number }[] = [
  { ar: 'الٓمٓ', tr: 'Alif Lām Mīm', value: 71 },
  { ar: 'الٓمٓصٓ', tr: 'Alif Lām Mīm Ṣād', value: 161 },
  { ar: 'الٓر', tr: 'Alif Lām Rā', value: 231 },
  { ar: 'الٓمٓر', tr: 'Alif Lām Mīm Rā', value: 271 },
];

export const ABU_BAKR = 'فِي كُلِّ كِتَابٍ سِرٌّ، وَسِرُّهُ فِي ٱلْقُرْآنِ فَوَاتِحُ ٱلسُّوَرِ';

/** The explaining texts, section by section. */
export const H_TEXT: Record<string, T> = {
  intro: {
    sv: 'Ungefär en fjärdedel av Koranens suror – 29 stycken – börjar med bokstäver som läses var för sig, till exempel الٓمٓ (Alif Lām Mīm). De kallas al-ḥurūf al-muqaṭṭaʿāt, ”de avskilda bokstäverna”, eller fawātiḥ, ”öppningarna”. Ingen människa vet säkert vad de betyder; de lärda har sett dem som en hemlighet mellan Allah och Hans Profet ﷺ.',
    en: 'About a quarter of the Qur’an’s sūras – 29 of them – begin with letters that are read one by one, for example الٓمٓ (Alif Lām Mīm). They are called al-ḥurūf al-muqaṭṭaʿāt, “the disjoined letters”, or fawātiḥ, “the openings”. No one knows for certain what they mean; the scholars have seen them as a secret between Allah and His Prophet ﷺ.',
  },
  quote: {
    sv: '”Varje bok har en hemlighet, och Koranens hemlighet finns i surornas öppningar.” Al-Ḥasan sade att Koranen rymmer kunskap om allt, och att den finns samlad i öppningarna.',
    en: '“Every book has a secret, and the secret of the Qur’an is in the openings of the sūras.” Al-Ḥasan said that the Qur’an holds knowledge of everything, and that it is gathered in the openings.',
  },
  tree: {
    sv: 'Bilden visar hur de 29 öppningarna hänger ihop: Alif Lām öppnar 13 suror (med Mīm, Rā, Ṣād), Ṭā 4, Ḥā Mīm 7, och Nūn, Qāf, Yā Sīn, Kāf Hā Yā ʿAyn Ṣād och Ṣād en var. Siffrorna på linjerna är antalet suror.',
    en: 'The picture shows how the 29 openings belong together: Alif Lām opens 13 sūras (with Mīm, Rā, Ṣād), Ṭā 4, Ḥā Mīm 7, and Nūn, Qāf, Yā Sīn, Kāf Hā Yā ʿAyn Ṣād and Ṣād one each. The numbers on the lines are the number of sūras.',
  },
  letters: {
    sv: 'Öppningarna använder 14 olika bokstäver – precis hälften av alfabetet. De har kallats de ljusa bokstäverna. Ibn ʿAbbās sade att öppningarna kommer från Allahs namn, och Abū l-ʿĀliya att varje bokstav är en nyckel till ett av Hans namn. Under varje bokstav står namnet den är nyckel till och bokstavens abjad-värde.',
    en: 'The openings use 14 different letters – exactly half of the alphabet. They have been called the luminous letters. Ibn ʿAbbās said the openings come from Allah’s names, and Abū l-ʿĀliya that every letter is a key to one of His names. Under each letter is the name it is a key to and the letter’s abjad value.',
  },
  openers: {
    sv: 'Det finns 14 olika öppningar. Ḥā Mīm öppnar sju suror i följd (40–46), och sura 42 har en dubbel öppning: Ḥā Mīm och sedan ʿAyn Sīn Qāf. Tryck på en sura för att läsa den.',
    en: 'There are 14 different openings. Ḥā Mīm opens seven sūras in a row (40–46), and sūra 42 has a double opening: Ḥā Mīm and then ʿAyn Sīn Qāf. Tap a sūra to read it.',
  },
  kaf: {
    sv: 'كٓهيعٓصٓ öppnar sūrat Maryam. Imam ʿAlī åkallade Allah med dessa bokstäver. Ibn ʿIyāḍ läste dem som namn: Kāf – al-Kāfī (den som räcker), Hā – al-Hādī (vägledaren), Yā – al-Yaqīn (vissheten), ʿAyn – al-ʿAlīm (den allvetande), Ṣād – aṣ-Ṣādiq (den sanningsenlige).',
    en: 'كٓهيعٓصٓ opens sūrat Maryam. Imam ʿAlī called on Allah with these letters. Ibn ʿIyāḍ read them as names: Kāf – al-Kāfī (the Sufficient), Hā – al-Hādī (the Guide), Yā – al-Yaqīn (Certainty), ʿAyn – al-ʿAlīm (the All-Knowing), Ṣād – aṣ-Ṣādiq (the Truthful).',
  },
  hadith: {
    sv: 'Jābir ibn ʿAbdullāh berättar att Abū Yāsir och Ḥuyayy ibn Akhṭab hörde Profeten ﷺ läsa öppningarna och räknade deras abjad-värden för att gissa hur länge hans umma skulle bestå. De blev förvirrade när fler öppningar kom. Berättelsen visar hur abjad-räkning användes redan då.',
    en: 'Jābir ibn ʿAbdullāh tells that Abū Yāsir and Ḥuyayy ibn Akhṭab heard the Prophet ﷺ recite the openings and added up their abjad values to guess how long his umma would last. They were confused when more openings came. The account shows how abjad counting was used already then.',
  },
  missing: {
    sv: 'Al-Fātiḥa innehåller alla bokstäver utom sju: ث ج خ ز ش ظ ف. Dhū n-Nūn sade att det största namnet har sju bokstäver, och al-Yāfiʿī knöt varje bokstav till en veckodag, en ängel som vakar över den och ett av Guds namn, som i tabellen. Källan anger ingen dag för Khā. Shaykh as-Sanūsī åkallade Allah ”bi-ḥaqq” dessa bokstäver (Manbaʿ uṣūl al-ḥikma).',
    en: 'Al-Fātiḥa contains every letter except seven: ث ج خ ز ش ظ ف. Dhū n-Nūn said that the Greatest Name has seven letters, and al-Yāfiʿī linked each letter to a day of the week, an angel who keeps it and one of Allah’s names, as in the table. The source gives no day for Khā. Shaykh as-Sanūsī called on Allah “bi-ḥaqq” these letters (Manbaʿ uṣūl al-ḥikma).',
  },
  humility: {
    sv: 'Ibn ʿAbbās sade att de lärda inte kan nå deras fulla betydelse, och ash-Shaʿbī att de är Allahs hemlighet. Förklaringarna här är vad lärda och awliyāʾ har sett, var och en efter sin nivå – Allah vet bäst.',
    en: 'Ibn ʿAbbās said that the scholars cannot reach their full meaning, and ash-Shaʿbī that they are Allah’s secret. The explanations here are what scholars and awliyāʾ have seen, each according to their level – Allah knows best.',
  },
};
