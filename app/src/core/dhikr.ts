// Dhikr for the counter. The target can be changed per dhikr; the count is kept on the phone.
export type Dhikr = { id: string; ar: string; tr: string; sv: string; en: string; target: number };

export const DHIKR: Dhikr[] = [
  { id: 'subhan', ar: 'سُبْحَانَ ٱللّٰهِ', tr: 'Subḥāna llāh', sv: 'Ära vare Allah', en: 'Glory be to Allah', target: 33 },
  { id: 'hamd', ar: 'ٱلْحَمْدُ لِلّٰهِ', tr: 'al-ḥamdu li-llāh', sv: 'All lov tillkommer Allah', en: 'All praise belongs to Allah', target: 33 },
  { id: 'akbar', ar: 'ٱللّٰهُ أَكْبَرُ', tr: 'Allāhu akbar', sv: 'Allah är större', en: 'Allah is greater', target: 34 },
  { id: 'tahlil', ar: 'لَا إِلٰهَ إِلَّا ٱللّٰهُ', tr: 'Lā ilāha illā llāh', sv: 'Det finns ingen gud utom Allah', en: 'There is no god but Allah', target: 100 },
  { id: 'istighfar', ar: 'أَسْتَغْفِرُ ٱللّٰهَ', tr: 'Astaghfiru llāh', sv: 'Jag ber Allah om förlåtelse', en: 'I ask Allah for forgiveness', target: 100 },
  { id: 'salawat', ar: 'اللّٰهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ', tr: 'Allāhumma ṣalli ʿalā sayyidinā Muḥammad', sv: 'O Allah, välsigna vår mästare Muhammad', en: 'O Allah, bless our master Muhammad', target: 100 },
  { id: 'allah', ar: 'ٱللّٰه', tr: 'Allāh', sv: 'Allah (ism adh-dhāt)', en: 'Allah (ism adh-dhāt)', target: 1500 },
  { id: 'hasbuna', ar: 'حَسْبُنَا ٱللّٰهُ وَنِعْمَ ٱلْوَكِيلُ', tr: 'Ḥasbunā llāhu wa niʿma l-wakīl', sv: 'Allah räcker för oss, och Han är den bäste att lita på', en: 'Allah is enough for us, and He is the best Guardian', target: 70 },
  { id: 'latif', ar: 'يَا لَطِيفُ', tr: 'Yā Laṭīf', sv: 'O Du Milde', en: 'O Most Gentle', target: 129 },
];

export const targetOf = (d: Dhikr, custom: Record<string, number>) => (custom[d.id] && custom[d.id] > 0 ? custom[d.id] : d.target);
