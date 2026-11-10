// The Daily Awrad (al-awrād al-yawmiyya) of the Naqshbandi ṭarīqa, in the order and with the counts of the booklet
// "Daily Awrad (Practice) of Naqshbandi Tariqa" (nurmuhammad.com, 15 Sept 2021): part one (13 steps), then part two
// (rābiṭa, Allāhu Ḥaqq, the dhikr of the Name, ṣalawāt, Qur'an, Dalāʾil al-Khayrāt). A murīd follows the counts their
// own shaykh gives. Qur'an parts are taken from the Uthmani text on the phone (see library.tsx).

export type Level = 'mubtadi' | 'mustaid' | 'murid';
export const LEVELS: Level[] = ['mubtadi', 'mustaid', 'murid'];

type L = { sv: string; en: string };
export type AwradStep = {
  id: string;
  title: L;
  arabic?: string;                       // fixed text (dhikr formulas)
  quran?: { surah: number; from: number; to: number };
  count: number | Record<Level, number>;  // repetitions
  countMTF?: Record<Level, number>;      // on Mondays, Thursdays and Fridays, when different
  meaning?: L;
  note?: L;
  optional?: boolean;
  part: 1 | 2;                           // part one or part two of the awrad
};

const per = (mubtadi: number, mustaid: number, murid: number): Record<Level, number> => ({ mubtadi, mustaid, murid });

export const SALAWAT = 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ وَسَلِّمْ';
export const SALAWAT_SAYYIDINA = 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ';
/** The ṣalawāt of the awrad booklet: upon Sayyidinā Muḥammad and the family of Sayyidinā Muḥammad. */
export const SALAWAT_AWRAD = 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ وَسَلِّمْ';
export const SALAWAT_AWRAD2 = 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ';
const SALAWAT_MEANING: L = { sv: 'O Gud, sänd frid och välsignelse över vår mästare Muhammad ﷺ och över vår mästare Muhammads familj.', en: 'O Allah, send peace and blessings upon our master Muhammad ﷺ and upon the family of our master Muhammad.' };

export const AWRAD: AwradStep[] = [
  // ---- Part one ----
  {
    id: 'shahada', count: 3, part: 1,
    title: { sv: 'Trosbekännelsen (shahāda)', en: 'Testimony of faith (shahāda)' },
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    meaning: { sv: 'Jag vittnar att det inte finns någon gud utom Allah, och jag vittnar att Muhammad ﷺ är Hans tjänare och sändebud.', en: 'I bear witness that there is no god but Allah, and I bear witness that Muhammad ﷺ is His servant and Messenger.' },
    note: { sv: 'Lyft höger hands pekfinger medan du läser.', en: 'Raise the index finger of the right hand while reciting.' },
  },
  {
    id: 'istighfar', count: 70, part: 1,
    title: { sv: 'Be om förlåtelse (istighfār)', en: 'Seeking forgiveness (istighfār)' },
    arabic: 'أَسْتَغْفِرُ ٱللَّهَ',
    meaning: { sv: 'Jag ber Allah om förlåtelse.', en: 'I seek forgiveness from Allah.' },
  },
  {
    id: 'fatiha1', count: 1, part: 1, quran: { surah: 1, from: 1, to: 7 },
    title: { sv: 'al-Fātiḥa', en: 'al-Fātiḥa' },
    note: { sv: 'Med avsikten att klädas i de uppenbarelser och välsignelser som sändes ner med suran när den uppenbarades i Mecka.', en: 'With the intention of being dressed with the manifestations and blessings that were sent down with this sūra when it was revealed in Makkah.' },
  },
  { id: 'amana', count: 1, part: 1, quran: { surah: 2, from: 285, to: 286 }, title: { sv: 'Āmana r-rasūlu (2:285–286)', en: 'Āmana r-rasūlu (2:285–286)' } },
  { id: 'sharh', count: 7, part: 1, quran: { surah: 94, from: 1, to: 8 }, title: { sv: 'ash-Sharḥ (94)', en: 'ash-Sharḥ (94)' } },
  { id: 'ikhlas', count: 11, part: 1, quran: { surah: 112, from: 1, to: 4 }, title: { sv: 'al-Ikhlāṣ (112)', en: 'al-Ikhlāṣ (112)' } },
  { id: 'falaq', count: 1, part: 1, quran: { surah: 113, from: 1, to: 5 }, title: { sv: 'al-Falaq (113)', en: 'al-Falaq (113)' } },
  { id: 'nas', count: 1, part: 1, quran: { surah: 114, from: 1, to: 6 }, title: { sv: 'an-Nās (114)', en: 'an-Nās (114)' } },
  {
    id: 'tahlil', count: 9, part: 1,
    title: { sv: 'Lā ilāha illā llāh', en: 'Lā ilāha illā llāh' },
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ',
    meaning: { sv: 'Det finns ingen gud utom Allah.', en: 'There is no god but Allah.' },
  },
  {
    id: 'tahlil1', count: 1, part: 1,
    title: { sv: 'Lā ilāha illā llāh, Muḥammadun rasūlu llāh', en: 'Lā ilāha illā llāh, Muḥammadun rasūlu llāh' },
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ مُحَمَّدٌ رَسُولُ ٱللَّهِ',
    meaning: { sv: 'Det finns ingen gud utom Allah, Muhammad ﷺ är Allahs sändebud.', en: 'There is no god but Allah, Muhammad ﷺ is the Messenger of Allah.' },
  },
  { id: 'salawat10', count: 10, part: 1, title: { sv: 'Ṣalawāt', en: 'Ṣalawāt' }, arabic: SALAWAT_AWRAD, meaning: SALAWAT_MEANING },
  {
    id: 'ihda', count: 1, part: 1,
    title: { sv: 'Ihdāʾ (tillägnan)', en: 'Ihdāʾ (dedication)' },
    note: { sv: 'Belöningen av det som lästs ges som gåva till Profeten ﷺ och till mästarna i den naqshbandiska ṭarīqan. Avslutas med al-Fātiḥa.', en: 'The reward of what was recited is given as a gift to the Prophet ﷺ and to the shaykhs of the Naqshbandi order. It closes with al-Fātiḥa.' },
  },
  {
    id: 'fatiha2', count: 1, part: 1, quran: { surah: 1, from: 1, to: 7 },
    title: { sv: 'al-Fātiḥa', en: 'al-Fātiḥa' },
    note: { sv: 'Med avsikten att klädas i de uppenbarelser (tajallī) som kommer ner över Madīna al-Munawwara, Profetens ﷺ upplysta stad.', en: 'With the intention of being dressed with the manifestations (tajallī) that come down to Madīna al-Munawwara, the illuminated city of the Prophet ﷺ.' },
  },
  // ---- Part two ----
  {
    id: 'rabita', count: 1, part: 2,
    title: { sv: 'Rābiṭa', en: 'Rābiṭa' },
    note: { sv: 'Sitt på knä, meditera och försök hålla förbindelsen (rābiṭa) till din shaykh, från shaykhen till Profeten ﷺ och från Profeten ﷺ till den gudomliga närvaron, medan du läser det som följer.', en: 'Sit on the knees, meditate and try to keep the connection (rābiṭa) to your shaykh, from your shaykh to the Prophet ﷺ and from the Prophet ﷺ to the Divine Presence, while reciting what follows.' },
  },
  {
    id: 'haqq', count: 3, part: 2,
    title: { sv: 'Allāhu Allāhu Allāhu Ḥaqq', en: 'Allāhu Allāhu Allāhu Ḥaqq' },
    arabic: 'ٱللَّهُ ٱللَّهُ ٱللَّهُ حَقّ',
    meaning: { sv: 'Allah, den absoluta Sanningen.', en: 'Allah, the Absolute Truth.' },
  },
  {
    id: 'ismdhat', count: per(1500, 2500, 5000), part: 2,
    title: { sv: 'Dhikr av det härliga Namnet: Allāh (med tungan)', en: 'Dhikr of the Glorious Name: Allāh (by tongue)' },
    arabic: 'ٱللَّهُ ٱللَّهُ',
    note: { sv: 'Minst 1500 gånger; kan ökas till 2500 eller 5000.', en: 'At least 1500 times; it can be increased to 2500 or 5000.' },
  },
  {
    id: 'ismqalb', count: per(1500, 2500, 5000), part: 2,
    title: { sv: 'Dhikr av det härliga Namnet: Allāh (i hjärtat)', en: 'Dhikr of the Glorious Name: Allāh (by heart)' },
    arabic: 'ٱللَّهُ ٱللَّهُ',
    note: { sv: 'Tyst, i hjärtat, lika många gånger som med tungan.', en: 'Silently, by heart, as many times as by tongue.' },
  },
  {
    id: 'salawat', count: per(100, 300, 1000), countMTF: per(300, 500, 2000), part: 2,
    title: { sv: 'Ṣalawāt över Profeten ﷺ', en: 'Ṣalawāt upon the Prophet ﷺ' },
    arabic: SALAWAT_AWRAD2,
    meaning: SALAWAT_MEANING,
    note: { sv: 'Fler på måndagar, torsdagar och fredagar. Kan ökas till 500 dagligen och 1000 på mån-, tors- och fredagar.', en: 'More on Mondays, Thursdays and Fridays. It can be increased to 500 daily and 1000 on Mon, Thu and Fri.' },
  },
  {
    id: 'quran', count: 1, part: 2,
    title: { sv: 'En juzʾ av Koranen', en: 'One juzʾ of the Qurʾān' },
    note: { sv: 'Eller al-Ikhlāṣ 100 gånger, om man inte kan läsa en juzʾ.', en: 'Or al-Ikhlāṣ 100 times, if one is not able to read one juzʾ.' },
  },
  {
    id: 'dalail', count: 1, part: 2,
    title: { sv: 'Ett kapitel av Dalāʾil al-Khayrāt', en: 'One chapter of Dalāʾil al-Khayrāt' },
    note: { sv: 'Eller ṣalawāt 100 gånger, om man inte kan läsa ett kapitel av Dalāʾil al-Khayrāt.', en: 'Or ṣalawāt 100 times, if one is not able to read one chapter of Dalāʾil al-Khayrāt.' },
  },
];

/** Monday, Thursday and Friday (local day). */
export const isMTF = (d = new Date()) => [1, 4, 5].includes(d.getDay());

export function countFor(step: AwradStep, level: Level, d = new Date()): number {
  if (step.countMTF && isMTF(d)) return step.countMTF[level];
  return typeof step.count === 'number' ? step.count : step.count[level];
}

/** Local date as YYYY-MM-DD (progress is kept per day). */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 21:00 shown as "21:00" or "9:00 PM" depending on the language/region. */
export function formatTime(hour: number, minute: number, h12: boolean): string {
  const mm = String(minute).padStart(2, '0');
  if (!h12) return `${String(hour).padStart(2, '0')}:${mm}`;
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${mm} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** Is it past the reminder time today (local time)? */
export const pastTime = (hour: number, minute: number, d = new Date()) => d.getHours() * 60 + d.getMinutes() >= hour * 60 + minute;

// ---- Ihdāʾ (dedication) ----
// The wording of the awrad booklet (nurmuhammad.com, 15 Sept 2021). The older choice of one living shaykh is kept as a
// type so saved settings still load, but the booklet's full text is always used.

export type IhdaShaykh = 'none' | 'hisham' | 'adil';
export const IHDA_SHAYKHS: IhdaShaykh[] = ['none', 'hisham', 'adil'];

const IHDA_PARTS = {
  open: 'اللَّهُمَّ بَلِّغْ ثَوَابَ مَا قَرَأْنَاهُ وَنُورَ مَا تَلَوْنَاهُ هَدِيَّةً وَاصِلَةً مِنَّا إِلَىٰ رُوحِ نَبِيِّنَا سَيِّدِنَا مُحَمَّدٍ ﷺ،',
  prophets: 'وَإِلَىٰ أَرْوَاحِ إِخْوَانِهِ مِنَ ٱلْأَنْبِيَاءِ وَٱلْمُرْسَلِينَ وَخُدَمَاءِ شَرَائِعِهِمْ،',
  imams: 'وَإِلَىٰ أَرْوَاحِ ٱلْأَئِمَّةِ ٱلْأَرْبَعَةِ،',
  masters: 'وَإِلَىٰ أَرْوَاحِ مَشَايِخِنَا فِي ٱلطَّرِيقَةِ ٱلنَّقْشْبَنْدِيَّةِ ٱلْعَالِيَةِ،',
  bahauddin: 'خَاصَّةً إِلَىٰ رُوحِ إِمَامِ ٱلطَّرِيقَةِ وَغَوْثِ ٱلْخَلِيقَةِ خْوَاجَهْ بَهَاءِ ٱلدِّينِ ٱلنَّقْشْبَنْدِ مُحَمَّدٍ ٱلْأُوَيْسِيِّ ٱلْبُخَارِيِّ،',
  abdullah: 'وَإِلَىٰ سُلْطَانِ ٱلْأَوْلِيَاءِ مَوْلَانَا ٱلشَّيْخِ عَبْدِ ٱللَّهِ ٱلْفَائِزِ ٱلدَّاغِسْتَانِيِّ،',
  nazim: 'وَإِلَىٰ سُلْطَانِ ٱلْأَوْلِيَاءِ مَوْلَانَا ٱلشَّيْخِ مُحَمَّدٍ نَاظِمٍ ٱلْحَقَّانِيِّ،',
  adil: 'وَمَوْلَانَا ٱلشَّيْخِ مُحَمَّدٍ عَادِلٍ ٱلرَّبَّانِيِّ،',
  hisham: 'وَمَوْلَانَا ٱلشَّيْخِ مُحَمَّدٍ هِشَامٍ ٱلْقَبَّانِيِّ،',
  adnan: 'وَمَوْلَانَا ٱلشَّيْخِ عَدْنَانَ ٱلْقَبَّانِيِّ.',
  mahdi: 'صَاحِبِ ٱلزَّمَانِ سَيِّدِنَا مُحَمَّدٍ ٱلْمَهْدِيِّ عَلَيْهِ ٱلسَّلَامُ، وَرُوحِ ٱللَّهِ سَيِّدِنَا عِيسَىٰ عَلَيْهِ ٱلسَّلَامُ، وَسَيْفِ ٱللَّهِ سَيِّدِنَا عَلِيٍّ عَلَيْهِ ٱلسَّلَامُ،',
  close: 'وَإِلَىٰ سَائِرِ سَادَاتِنَا وَٱلصِّدِّيقِينَ. ٱلْفَاتِحَة.',
};

const IHDA_MEANING = {
  sv: {
    open: 'O Allah, låt belöningen av det vi har läst och ljuset av det vi har reciterat nå fram som en gåva från oss till vår profets själ, vår mästare Muhammad ﷺ,',
    prophets: 'och till själarna hos hans bröder bland profeterna och sändebuden och dem som tjänade deras lagar,',
    imams: 'och till de fyra imamernas själar,',
    masters: 'och till våra mästares själar i den upphöjda naqshbandiska ṭarīqan,',
    bahauddin: 'särskilt till själen hos vägens imam och skapelsens hjälpare, Khwāja Bahāʾuddīn an-Naqshband Muhammad al-Uwaysī al-Bukhārī,',
    abdullah: 'och till helgonens sultan, Mawlānā Shaykh ʿAbdullāh al-Fāʾiz ad-Dāghistānī,',
    nazim: 'och till helgonens sultan, Mawlānā Shaykh Muhammad Nāẓim al-Ḥaqqānī,',
    adil: 'och Mawlānā Shaykh Muhammad ʿĀdil ar-Rabbānī,',
    hisham: 'och Mawlānā Shaykh Muhammad Hishām Kabbānī,',
    adnan: 'och Mawlānā Shaykh ʿAdnān Kabbānī.',
    mahdi: 'Tidens herre, vår mästare Muhammad al-Mahdī (frid över honom), Allahs ande, vår mästare ʿĪsā (frid över honom), och Allahs svärd, vår mästare ʿAlī (frid över honom),',
    close: 'och till alla våra mästare och de sannfärdiga. Al-Fātiḥa.',
  },
  en: {
    open: 'O Allah, grant that the merit of what we have read and the light of what we have recited reach, as an offering and gift from us, the soul of our Prophet, our master Muhammad ﷺ,',
    prophets: 'and the souls of his brothers, all the prophets and messengers, and of those who served their laws,',
    imams: 'and the souls of the four imams,',
    masters: 'and the souls of our shaykhs in the exalted Naqshbandi order,',
    bahauddin: 'especially the leader of the Way and arch-intercessor of the created world, Khwāja Bahāʾuddīn an-Naqshband Muhammad al-Uwaysī al-Bukhārī,',
    abdullah: 'and the Sultan of the Saints, Mawlānā Shaykh ʿAbdullāh al-Fāʾiz ad-Dāghistānī,',
    nazim: 'and the Sultan of the Saints, Mawlānā Shaykh Muhammad Nāẓim al-Ḥaqqānī,',
    adil: 'and Mawlānā Shaykh Muhammad ʿĀdil ar-Rabbānī,',
    hisham: 'and Mawlānā Shaykh Muhammad Hishām Kabbānī,',
    adnan: 'and Mawlānā Shaykh ʿAdnān Kabbānī.',
    mahdi: 'The Master of the Time, our master Muhammad al-Mahdī (peace be upon him), the Spirit of Allah, our master ʿĪsā (peace be upon him), and the Sword of Allah, our master ʿAlī (peace be upon him),',
    close: 'and all our masters and the truthful ones. Al-Fātiḥa.',
  },
};

const IHDA_KEYS = ['open', 'prophets', 'imams', 'masters', 'bahauddin', 'abdullah', 'nazim', 'adil', 'hisham', 'adnan', 'mahdi', 'close'] as (keyof typeof IHDA_PARTS)[];

/** The dedication in Arabic, one clause per line (the argument is no longer used). */
export const ihdaArabic = (_shaykh?: IhdaShaykh) => IHDA_KEYS.map(k => IHDA_PARTS[k]).join('\n');
/** Its meaning in Swedish or English. */
export const ihdaMeaning = (_shaykh: IhdaShaykh | undefined, lang: 'sv' | 'en') => IHDA_KEYS.map(k => IHDA_MEANING[lang][k]).join(' ');
