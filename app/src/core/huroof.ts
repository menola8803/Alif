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

export type HSection = { id: string; title: T; text: T; more?: T };

/**
 * The nine parts of the article, in its order, as summaries in Alif's own words (no text is copied). "more" is the
 * rest of a long part, shown after "Show more".
 */
export const H_SECTIONS: HSection[] = [
  { id: 'intro', title: { sv: 'Inledning', en: 'Introduction' },
    text: { sv: 'Ungefär en fjärdedel av Koranens suror – 29 stycken – börjar med bokstäver som läses var för sig, till exempel الٓمٓ (Alif Lām Mīm). De kallas al-ḥurūf al-muqaṭṭaʿāt, ”de avskilda bokstäverna”, eller fawātiḥ, ”öppningarna”. Ingen människa vet säkert vad de betyder; de lärda har sett dem som en hemlighet mellan Allah och Hans Profet ﷺ.',
      en: 'About a quarter of the Qur’an’s sūras – 29 of them – begin with letters that are read one by one, for example الٓمٓ (Alif Lām Mīm). They are called al-ḥurūf al-muqaṭṭaʿāt, “the disjoined letters”, or fawātiḥ, “the openings”. No one knows for certain what they mean; the scholars have seen them as a secret between Allah and His Prophet ﷺ.' },
    more: { sv: 'Abū Bakr aṣ-Ṣiddīq sade att varje bok har en hemlighet och att Koranens hemlighet ligger i öppningarna. Al-Ḥasan sade att Koranen rymmer kunskap om allt och att den finns samlad i öppningarna. Ibn ʿAbbās sade att öppningarna är hämtade ur Allahs namn – och att de är Hans största namn.',
      en: 'Abū Bakr aṣ-Ṣiddīq said that every book has a secret and that the secret of the Qur’an lies in the openings. Al-Ḥasan said that the Qur’an holds knowledge of everything and that it is gathered in the openings. Ibn ʿAbbās said that the openings are taken from Allah’s names – and that they are His Greatest Name.' } },
  { id: 'keys', title: { sv: 'Bokstäverna som nycklar till Guds namn', en: 'The letters as keys to Allah’s names' },
    text: { sv: 'Öppningarna använder 14 olika bokstäver – precis hälften av alfabetet – och de har kallats de ljusa bokstäverna. Abū l-ʿĀliya sade att varje bokstav är en nyckel till ett av Allahs namn. Under varje bokstav står namnet den är nyckel till och bokstavens abjad-värde.',
      en: 'The openings use 14 different letters – exactly half of the alphabet – and they have been called the luminous letters. Abū l-ʿĀliya said that every letter is a key to one of Allah’s names. Under each letter is the name it is a key to and the letter’s abjad value.' } },
  { id: 'awliya', title: { sv: 'Awliyāʾ och det största namnet', en: 'The awliyāʾ and the Greatest Name' },
    text: { sv: 'As-Sadhy beskriver hur Allah lär en walī kunskap direkt från Sig, ʿilm ladunnī: de 99 namnen och deras inre betydelser. De 14 ljusa bokstäverna öppnas för honom, och Nūn knyts till sūrat al-Qalam, ”Nūn, vid pennan och det de skriver” (68:1).',
      en: 'As-Sadhy describes how Allah teaches a walī knowledge straight from Him, ʿilm ladunnī: the 99 names and their inner meanings. The 14 luminous letters are opened to him, and Nūn is tied to sūrat al-Qalam, “Nūn, by the pen and what they write” (68:1).' },
    more: { sv: 'Till sist lärs han det största namnet, genom vilket duʿā besvaras. Kunskapen ges som en gåva, inte genom studier, och den visar sig i hans liv och tjänst.',
      en: 'At last he is taught the Greatest Name, through which supplication is answered. The knowledge is given as a gift, not through study, and it shows in his life and service.' } },
  { id: 'yafii', title: { sv: 'Al-Yāfiʿī: de sju bokstäverna', en: 'Al-Yāfiʿī: the seven letters' },
    text: { sv: 'Dhū n-Nūn sade att det största namnet har sju bokstäver. Al-Fātiḥas sju verser innehåller alla bokstäver utom sju: ث ج خ ز ش ظ ف. Al-Yāfiʿī knöt varje sådan bokstav till en veckodag, en ängel som vakar över den och ett av Guds namn, som i tabellen. Källan anger ingen dag för Khā.',
      en: 'Dhū n-Nūn said that the Greatest Name has seven letters. The seven verses of al-Fātiḥa contain every letter except seven: ث ج خ ز ش ظ ف. Al-Yāfiʿī linked each of these letters to a day of the week, an angel who keeps it and one of Allah’s names, as in the table. The source gives no day for Khā.' },
    more: { sv: 'Shaykh as-Sanūsī åkallade Allah ”bi-ḥaqq” – i kraft av – dessa bokstäver, i ordningen Ẓā, Khā, Zāy, Thā, Shīn, Jīm, Fā. Källan hänvisar till boken Manbaʿ uṣūl al-ḥikma.',
      en: 'Shaykh as-Sanūsī called on Allah “bi-ḥaqq” – by the right of – these letters, in the order Ẓā, Khā, Zāy, Thā, Shīn, Jīm, Fā. The source refers to the book Manbaʿ uṣūl al-ḥikma.' } },
  { id: 'openers', title: { sv: 'Öppningarna i Koranen', en: 'The openings in the Qur’an' },
    text: { sv: 'Det finns 14 olika öppningar i 29 suror. Bilden visar hur de hänger ihop: Alif Lām öppnar 13 suror (med Mīm, Rā eller Ṣād), Ṭā 4, Ḥā Mīm 7, och Nūn, Qāf, Yā Sīn, Kāf Hā Yā ʿAyn Ṣād och Ṣād en var. Siffrorna på linjerna är antalet suror. Tryck på en sura i listan för att läsa den.',
      en: 'There are 14 different openings in 29 sūras. The picture shows how they belong together: Alif Lām opens 13 sūras (with Mīm, Rā or Ṣād), Ṭā 4, Ḥā Mīm 7, and Nūn, Qāf, Yā Sīn, Kāf Hā Yā ʿAyn Ṣād and Ṣād one each. The numbers on the lines are the number of sūras. Tap a sūra in the list to read it.' } },
  { id: 'scholars', title: { sv: 'De lärdas åsikter', en: 'What the scholars said' },
    text: { sv: 'Ibn ʿAbbās sade att de lärda inte förmår nå deras betydelse. Ash-Shaʿbī sade att de är Allahs hemlighet och att man inte ska söka den – om inte Allah själv ger förståelse.',
      en: 'Ibn ʿAbbās said that the scholars are not able to reach their meaning. Ash-Shaʿbī said that they are Allah’s secret and that one should not seek it – unless Allah Himself gives understanding.' } },
  { id: 'kaf', title: { sv: 'Hemligheten i كٓهيعٓصٓ', en: 'The secret of كٓهيعٓصٓ' },
    text: { sv: 'Kāf Hā Yā ʿAyn Ṣād öppnar sūrat Maryam. Imam ʿAlī åkallade Allah med dessa bokstäver och sökte skydd mot synder som drar på sig vrede, vänder välsignelser och håller tillbaka regnet. Ibn ʿIyāḍ läste dem som namn: Kāf – al-Kāfī (den som räcker), Hā – al-Hādī (vägledaren), Yā – al-Yaqīn (vissheten), ʿAyn – al-ʿAlīm (den allvetande), Ṣād – aṣ-Ṣādiq (den sanningsenlige).',
      en: 'Kāf Hā Yā ʿAyn Ṣād opens sūrat Maryam. Imam ʿAlī called on Allah with these letters, seeking refuge from sins that bring down anger, turn blessings away and hold back the rain. Ibn ʿIyāḍ read them as names: Kāf – al-Kāfī (the Sufficient), Hā – al-Hādī (the Guide), Yā – al-Yaqīn (Certainty), ʿAyn – al-ʿAlīm (the All-Knowing), Ṣād – aṣ-Ṣādiq (the Truthful).' },
    more: { sv: 'Az-Zubaydī sade att de är Guds namn, men att de lärda är oeniga om vilka. Al-Watajīnī och at-Tirmidhī såg dem som tecken som bara de rabbāniyyūn, ummans vise, förstår. Ibn al-ʿArabī sade att bokstäverna är namn på änglar som svarar när man kallar dem, och kallade dem sina shaykher. Abū l-Ḥasan knöt حم till hemligheter mellan Profeten ﷺ och Allah. En stor shaykh i Shādhilī-ordern fick i en dröm bokstäverna tolkade som Profetens ﷺ egenskaper: tillflykten för allt som finns, livet och källan, han som bär Guds egenskaper och vars lydnad är lydnad mot Allah. Ibn Sulṭān konstaterade att de lärda är oeniga, och tolkningarna följer var och ens nivå av avtäckning (kashf).',
      en: 'Az-Zubaydī said that they are Allah’s names, but that the scholars disagree on which. Al-Watajīnī and at-Tirmidhī saw them as signs that only the rabbāniyyūn, the wise of the umma, understand. Ibn al-ʿArabī said the letters are names of angels who answer when called, and called them his shaykhs. Abū l-Ḥasan linked حم to secrets between the Prophet ﷺ and Allah. A great shaykh of the Shādhilī order had the letters explained in a dream as qualities of the Prophet ﷺ: the refuge of all that exists, the life and the source, the one who bears Allah’s attributes and whose obedience is obedience to Allah. Ibn Sulṭān noted that the scholars disagree, and each reading follows its scholar’s level of unveiling (kashf).' } },
  { id: 'hadith', title: { sv: 'Profeten ﷺ och abjad-räkningen', en: 'The Prophet ﷺ and the abjad count' },
    text: { sv: 'Jābir ibn ʿAbdullāh berättar att Abū Yāsir ibn Akhṭab och hans bror Ḥuyayy hörde Profeten ﷺ läsa öppningarna. De räknade bokstävernas abjad-värden för att gissa hur länge hans umma skulle bestå: الم blev 71 år. När fler öppningar kom – المص, الر, المر – växte summan, och de blev förvirrade.',
      en: 'Jābir ibn ʿAbdullāh tells that Abū Yāsir ibn Akhṭab and his brother Ḥuyayy heard the Prophet ﷺ recite the openings. They added up the letters’ abjad values to guess how long his umma would last: الم came to 71 years. When more openings came – المص, الر, المر – the sum grew and they were confused.' },
    more: { sv: 'Abū Yāsir lade ihop de fyra summorna till 734. Berättelsen visar att abjad-räkning användes redan på Profetens ﷺ tid – och att öppningarnas hemlighet inte låter sig räknas ut.',
      en: 'Abū Yāsir added the four sums up to 734. The account shows that abjad counting was used already in the Prophet’s ﷺ time – and that the secret of the openings cannot be worked out by counting.' } },
  { id: 'spread', title: { sv: 'Hur öppningarna fördelas', en: 'How the openings are spread' },
    text: { sv: 'En bokstav: Ṣād (38), Qāf (50), Nūn (68). Två bokstäver en gång var: Ṭā Hā (20), Ṭā Sīn (27), Yā Sīn (36). Ḥā Mīm öppnar sju suror i följd (40–46). Alif Lām Mīm öppnar sex (2, 3, 29–32), Alif Lām Rā fem (10, 11, 12, 14, 15) och Ṭā Sīn Mīm två (26, 28). Fyra bokstäver: Alif Lām Mīm Ṣād (7) och Alif Lām Mīm Rā (13). Fem bokstäver: Kāf Hā Yā ʿAyn Ṣād (19) och Ḥā Mīm ʿAyn Sīn Qāf (42) – sura 42 har alltså en dubbel öppning.',
      en: 'One letter: Ṣād (38), Qāf (50), Nūn (68). Two letters, once each: Ṭā Hā (20), Ṭā Sīn (27), Yā Sīn (36). Ḥā Mīm opens seven sūras in a row (40–46). Alif Lām Mīm opens six (2, 3, 29–32), Alif Lām Rā five (10, 11, 12, 14, 15) and Ṭā Sīn Mīm two (26, 28). Four letters: Alif Lām Mīm Ṣād (7) and Alif Lām Mīm Rā (13). Five letters: Kāf Hā Yā ʿAyn Ṣād (19) and Ḥā Mīm ʿAyn Sīn Qāf (42) – so sūra 42 has a double opening.' } },
];

/** Closing words. */
export const H_HUMILITY: T = {
  sv: 'Förklaringarna här är vad lärda och awliyāʾ har sett, var och en efter sin nivå – Allah vet bäst.',
  en: 'The explanations here are what scholars and awliyāʾ have seen, each according to their level – Allah knows best.',
};
