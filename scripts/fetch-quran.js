// Puts the Uthmani Arabic text of the Qur'an (Tanzil, via AlQuran Cloud) and the Swedish and English translations into
// app/assets/quran/, so the app has the whole text built in and works offline from the first start. Run by the APK workflows
// before the build; the file in the repository is an empty placeholder (the app then downloads the text itself).
//   node scripts/fetch-quran.js
const fs = require('fs');
const path = require('path');

const COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

// The Arabic text and the two built-in translations (Swedish: Bernström, English: Saheeh International).
const EDITIONS = [
  ['quran-uthmani', 'Tanzil Quran Text (Uthmani), tanzil.net, via api.alquran.cloud'],
  ['sv.bernstrom', 'Knut Bernström, Koranens budskap, via api.alquran.cloud'],
  ['en.sahih', 'Saheeh International, via api.alquran.cloud'],
  ['quran-tajweed', 'Tanzil Uthmani text with tajwīd marks, via api.alquran.cloud'],
];

async function get(edition, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(`https://api.alquran.cloud/v1/quran/${edition}`, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i >= tries) throw e;
      await new Promise(res => setTimeout(res, 3000 * i));
    }
  }
}

(async () => {
  for (const [edition, source] of EDITIONS) {
    const j = await get(edition);
    const surahs = j.data.surahs.map(s => ({ n: s.number, name: s.name, meaning: s.englishNameTranslation, ayahs: s.ayahs.map(a => a.text) }));
    if (surahs.length !== 114 || surahs.some((s, i) => s.ayahs.length !== COUNTS[i])) throw new Error(`incomplete Qur'an text: ${edition}`);
    const out = { edition, source, surahs };
    const file = path.join(__dirname, '..', 'app', 'assets', 'quran', `${edition}.json`);
    fs.writeFileSync(file, JSON.stringify(out));
    console.log(`wrote ${file} (${(fs.statSync(file).size / 1e6).toFixed(2)} MB, ${surahs.reduce((a, s) => a + s.ayahs.length, 0)} verses)`);
  }
})().catch(e => { console.error(e); process.exit(1); });
