// The Daily Awrad (al-awrād al-yawmiyya) of the Naqshbandi ṭarīqa, in the order taught by Shaykh Nāẓim al-Ḥaqqānī and
// Shaykh Hishām Kabbānī (naqshbandi.org, sufihub.com). Counts follow those booklets; a murīd follows the counts their
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
};

const per = (mubtadi: number, mustaid: number, murid: number): Record<Level, number> => ({ mubtadi, mustaid, murid });

export const SALAWAT = 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ وَسَلِّمْ';
export const SALAWAT_SAYYIDINA = 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ';

export const AWRAD: AwradStep[] = [
  {
    id: 'opening', count: 1,
    title: { sv: 'Inledning', en: 'Opening' },
    arabic: 'أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَٰنِ ٱلرَّجِيمِ ۝ بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    meaning: { sv: 'Jag söker skydd hos Gud mot den förbannade Satan. I Guds namn, den Nåderike, den Barmhärtige.', en: 'I seek refuge in God from the accursed Satan. In the name of God, the All-Merciful, the Most Merciful.' },
  },
  {
    id: 'shahada', count: 3,
    title: { sv: 'Trosbekännelsen (shahāda)', en: 'Testimony of faith (shahāda)' },
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    meaning: { sv: 'Jag vittnar att det inte finns någon gud utom Gud, Han är En och har ingen like, och jag vittnar att Muhammad är Hans tjänare och sändebud.', en: 'I bear witness that there is no god but God, alone without partner, and I bear witness that Muhammad is His servant and messenger.' },
  },
  {
    id: 'istighfar', count: 70,
    title: { sv: 'Be om förlåtelse (istighfār)', en: 'Seeking forgiveness (istighfār)' },
    arabic: 'أَسْتَغْفِرُ ٱللَّهَ',
    meaning: { sv: 'Jag ber Gud om förlåtelse.', en: 'I ask God for forgiveness.' },
  },
  {
    id: 'rabita', count: 1,
    title: { sv: 'Rābiṭa', en: 'Rābiṭa' },
    note: { sv: 'Sitt stilla och föreställ dig förbindelsen från dig till din shaykh, från shaykhen till Profeten ﷺ och från Profeten ﷺ till den gudomliga närvaron.', en: 'Sit still and picture the connection from yourself to your shaykh, from the shaykh to the Prophet ﷺ, and from the Prophet ﷺ to the Divine Presence.' },
  },
  {
    id: 'fatiha1', count: 1, quran: { surah: 1, from: 1, to: 7 },
    title: { sv: 'al-Fātiḥa', en: 'al-Fātiḥa' },
    note: { sv: 'Med avsikten att få del av välsignelsen som kom med den i Mecka.', en: 'With the intention of sharing in the blessing that came with it in Makkah.' },
  },
  {
    id: 'amana', count: 1, quran: { surah: 2, from: 285, to: 286 },
    title: { sv: 'Āmana r-rasūlu (2:285–286)', en: 'Āmana r-rasūlu (2:285–286)' },
  },
  { id: 'sharh', count: 7, quran: { surah: 94, from: 1, to: 8 }, title: { sv: 'ash-Sharḥ (94)', en: 'ash-Sharḥ (94)' } },
  { id: 'ikhlas', count: 11, quran: { surah: 112, from: 1, to: 4 }, title: { sv: 'al-Ikhlāṣ (112)', en: 'al-Ikhlāṣ (112)' } },
  { id: 'falaq', count: 1, quran: { surah: 113, from: 1, to: 5 }, title: { sv: 'al-Falaq (113)', en: 'al-Falaq (113)' } },
  { id: 'nas', count: 1, quran: { surah: 114, from: 1, to: 6 }, title: { sv: 'an-Nās (114)', en: 'an-Nās (114)' } },
  {
    id: 'tahlil', count: 10,
    title: { sv: 'Lā ilāha illā llāh', en: 'Lā ilāha illā llāh' },
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ',
    meaning: { sv: 'Det finns ingen gud utom Gud.', en: 'There is no god but God.' },
    note: { sv: 'Avsluta efter den tionde med: مُحَمَّدٌ رَسُولُ ٱللَّهِ ﷺ (Muhammad är Guds sändebud).', en: 'After the tenth, close with: مُحَمَّدٌ رَسُولُ ٱللَّهِ ﷺ (Muhammad is the Messenger of God).' },
  },
  {
    id: 'salawat10', count: 10,
    title: { sv: 'Ṣalawāt över Profeten ﷺ', en: 'Ṣalawāt upon the Prophet ﷺ' },
    arabic: SALAWAT,
    meaning: { sv: 'O Gud, sänd Din välsignelse över Muhammad och Muhammads familj, och ge dem frid.', en: 'O God, send Your blessings upon Muhammad and the family of Muhammad, and grant them peace.' },
  },
  {
    id: 'ihda', count: 1,
    title: { sv: 'Ihdāʾ (tillägnan)', en: 'Ihdāʾ (dedication)' },
    note: { sv: 'Belöningen av det som lästs tillägnas Profeten ﷺ och mästarna i den naqshbandiska kedjan. Avslutas med al-Fātiḥa.', en: 'The reward of what was recited is dedicated to the Prophet ﷺ and the masters of the Naqshbandi chain. It closes with al-Fātiḥa.' },
  },
  {
    id: 'fatiha2', count: 1, quran: { surah: 1, from: 1, to: 7 },
    title: { sv: 'al-Fātiḥa', en: 'al-Fātiḥa' },
    note: { sv: 'Med avsikten att få del av välsignelsen som kom med den i Medina.', en: 'With the intention of sharing in the blessing that came with it in Madinah.' },
  },
  {
    id: 'haqq', count: 3,
    title: { sv: 'Allāhu Allāhu Allāhu Ḥaqq', en: 'Allāhu Allāhu Allāhu Ḥaqq' },
    arabic: 'ٱللَّهُ ٱللَّهُ ٱللَّهُ حَقّ',
    meaning: { sv: 'Gud, Gud, Gud – den Sanne.', en: 'God, God, God – the Real.' },
  },
  {
    id: 'ismdhat', count: per(1500, 2500, 5000),
    title: { sv: 'Dhikr: Allāh (med tungan)', en: 'Dhikr: Allāh (with the tongue)' },
    arabic: 'ٱللَّهُ',
  },
  {
    id: 'ismqalb', count: per(1500, 2500, 5000),
    title: { sv: 'Dhikr: Allāh (i hjärtat)', en: 'Dhikr: Allāh (in the heart)' },
    arabic: 'ٱللَّهُ',
    note: { sv: 'Tyst, med tungan mot gommen och uppmärksamheten i hjärtat.', en: 'Silently, the tongue against the palate and the attention in the heart.' },
  },
  {
    id: 'tahlil2', count: per(100, 500, 1000),
    title: { sv: 'Lā ilāha illā llāh Muḥammadun rasūlu llāh', en: 'Lā ilāha illā llāh Muḥammadun rasūlu llāh' },
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ مُحَمَّدٌ رَسُولُ ٱللَّهِ',
    meaning: { sv: 'Det finns ingen gud utom Gud, Muhammad är Guds sändebud.', en: 'There is no god but God, Muhammad is the Messenger of God.' },
  },
  {
    id: 'salawat', count: per(300, 500, 1000), countMTF: per(500, 1000, 2000),
    title: { sv: 'Ṣalawāt', en: 'Ṣalawāt' },
    arabic: SALAWAT,
    meaning: { sv: 'O Gud, sänd Din välsignelse över Muhammad och Muhammads familj, och ge dem frid.', en: 'O God, send Your blessings upon Muhammad and the family of Muhammad, and grant them peace.' },
    note: { sv: 'Fler på måndagar, torsdagar och fredagar.', en: 'More on Mondays, Thursdays and Fridays.' },
  },
  {
    id: 'quran', count: 1, optional: true,
    title: { sv: 'En juzʾ av Koranen', en: 'One juzʾ of the Qurʾān' },
    note: { sv: 'Eller al-Ikhlāṣ 100 gånger.', en: 'Or al-Ikhlāṣ 100 times.' },
  },
  {
    id: 'dalail', count: 1, optional: true,
    title: { sv: 'Dalāʾil al-Khayrāt', en: 'Dalāʾil al-Khayrāt' },
    note: { sv: 'Dagens del (ḥizb) av Dalāʾil al-Khayrāt, eller ṣalawāt 100 gånger.', en: "The day's part (ḥizb) of Dalāʾil al-Khayrāt, or ṣalawāt 100 times." },
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
// The wording used in the Naqshbandi-Haqqani awrād (naqshbandi.org, Shaykh Nāẓim's booklet). The last line names the
// living shaykh of the murīd's own line; the person chooses it (or none) on the Awrad screen.

export type IhdaShaykh = 'none' | 'hisham' | 'adil';
export const IHDA_SHAYKHS: IhdaShaykh[] = ['none', 'hisham', 'adil'];

const IHDA_PARTS = {
  open: 'اللَّهُمَّ بَلِّغْ ثَوَابَ مَا قَرَأْنَاهُ وَنُورَ مَا تَلَوْنَاهُ هَدِيَّةً وَاصِلَةً مِنَّا إِلَىٰ رُوحِ نَبِيِّنَا سَيِّدِنَا وَمَوْلَانَا مُحَمَّدٍ ﷺ،',
  prophets: 'وَإِلَىٰ أَرْوَاحِ إِخْوَانِهِ مِنَ ٱلْأَنْبِيَاءِ وَٱلْمُرْسَلِينَ وَخُدَمَاءِ شَرَائِعِهِمْ،',
  imams: 'وَإِلَىٰ أَرْوَاحِ ٱلْأَئِمَّةِ ٱلْأَرْبَعَةِ،',
  masters: 'وَإِلَىٰ أَرْوَاحِ مَشَايِخِنَا فِي ٱلطَّرِيقَةِ ٱلنَّقْشْبَنْدِيَّةِ ٱلْعَلِيَّةِ،',
  bahauddin: 'خَاصَّةً إِلَىٰ رُوحِ إِمَامِ ٱلطَّرِيقَةِ وَغَوْثِ ٱلْخَلِيقَةِ خْوَاجَهْ بَهَاءِ ٱلدِّينِ ٱلنَّقْشْبَنْدِ مُحَمَّدٍ ٱلْأُوَيْسِيِّ ٱلْبُخَارِيِّ،',
  abdullah: 'وَإِلَىٰ حَضْرَةِ مَوْلَانَا سُلْطَانِ ٱلْأَوْلِيَاءِ ٱلشَّيْخِ عَبْدِ ٱللَّهِ ٱلْفَائِزِ ٱلدَّاغِسْتَانِيِّ،',
  nazim: 'وَإِلَىٰ حَضْرَةِ مَوْلَانَا سُلْطَانِ ٱلْأَوْلِيَاءِ ٱلشَّيْخِ مُحَمَّدٍ نَاظِمٍ ٱلْحَقَّانِيِّ،',
  hisham: 'وَإِلَىٰ حَضْرَةِ مَوْلَانَا ٱلشَّيْخِ مُحَمَّدٍ هِشَامٍ قَبَّانِي،',
  adil: 'وَإِلَىٰ حَضْرَةِ مَوْلَانَا ٱلشَّيْخِ مُحَمَّدٍ عَادِلٍ ٱلرَّبَّانِيِّ،',
  close: 'وَسَائِرِ سَادَاتِنَا وَٱلصِّدِّيقِينَ. ٱلْفَاتِحَة.',
};

const IHDA_MEANING = {
  sv: {
    open: 'O Gud, låt belöningen av det vi har läst och ljuset av det vi har reciterat nå fram som en gåva från oss till vår profets själ, vår mästare och herre Muhammad ﷺ,',
    prophets: 'och till själarna hos hans bröder bland profeterna och sändebuden och dem som tjänade deras lagar,',
    imams: 'och till de fyra imamernas själar,',
    masters: 'och till våra mästares själar i den upphöjda naqshbandiska ṭarīqan,',
    bahauddin: 'särskilt till själen hos vägens imam och skapelsens hjälpare, Khwāja Bahāʾuddīn an-Naqshband Muhammad al-Uwaysī al-Bukhārī,',
    abdullah: 'och till vår mästare, helgonens sultan, Shaykh ʿAbdullāh al-Fāʾiz ad-Dāghistānī,',
    nazim: 'och till vår mästare, helgonens sultan, Shaykh Muhammad Nāẓim al-Ḥaqqānī,',
    hisham: 'och till vår mästare Shaykh Muhammad Hishām Kabbānī,',
    adil: 'och till vår mästare Shaykh Muhammad ʿĀdil ar-Rabbānī,',
    close: 'och alla våra mästare och de sannfärdiga. Al-Fātiḥa.',
  },
  en: {
    open: 'O God, let the reward of what we have read and the light of what we have recited reach, as a gift from us, the soul of our Prophet, our master and liege Muhammad ﷺ,',
    prophets: 'and the souls of his brothers among the prophets and messengers, and of those who served their laws,',
    imams: 'and the souls of the four imams,',
    masters: 'and the souls of our masters in the exalted Naqshbandi ṭarīqa,',
    bahauddin: 'especially the soul of the imam of the path and helper of creation, Khwāja Bahāʾuddīn an-Naqshband Muhammad al-Uwaysī al-Bukhārī,',
    abdullah: 'and our master, the sultan of the saints, Shaykh ʿAbdullāh al-Fāʾiz ad-Dāghistānī,',
    nazim: 'and our master, the sultan of the saints, Shaykh Muhammad Nāẓim al-Ḥaqqānī,',
    hisham: 'and our master Shaykh Muhammad Hishām Kabbānī,',
    adil: 'and our master Shaykh Muhammad ʿĀdil ar-Rabbānī,',
    close: 'and all our masters and the truthful ones. Al-Fātiḥa.',
  },
};

const ihdaKeys = (shaykh: IhdaShaykh) =>
  (['open', 'prophets', 'imams', 'masters', 'bahauddin', 'abdullah', 'nazim', ...(shaykh === 'none' ? [] : [shaykh]), 'close'] as (keyof typeof IHDA_PARTS)[]);

/** The dedication in Arabic, one clause per line. */
export const ihdaArabic = (shaykh: IhdaShaykh) => ihdaKeys(shaykh).map(k => IHDA_PARTS[k]).join('\n');
/** Its meaning in Swedish or English. */
export const ihdaMeaning = (shaykh: IhdaShaykh, lang: 'sv' | 'en') => ihdaKeys(shaykh).map(k => IHDA_MEANING[lang][k]).join(' ');
