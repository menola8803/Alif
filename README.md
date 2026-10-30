# Alif · أَلِف

**Version 0.1.0** (se `CHANGELOG.md`)

En app för att läsa klassisk arabiska och Koranen. Kameran läser arabisk text, appen vokaliserar den, translittererar den
enligt reglerna för hur ord börjar och slutar (tajwīd) och översätter till svenska eller engelska. Skriver du svenska eller
engelska får du det på arabiska.

## Funktioner
- **Kamera:** fotografera en sida (eller välj en bild). Claude läser texten, sätter ut alla vokaltecken, översätter och ger
  ord för ord med rötter. Känns texten igen som en koranvers hämtas versen ur muṣḥaf (uthmanisk text) och den valda
  översättningen, och man kan öppna suran direkt.
- **Skriv:** arabiska blir translitteration direkt på telefonen (även utan nät) och sedan översättning; svenska/engelska
  blir arabiska med vokaltecken och translitteration.
- **Koranen i appen:** alla 114 suror med klassisk arabiska (Tanzils uthmaniska text), translitteration enligt tajwīd och
  översättning till svenska eller engelska efter språket i Inställningar. Den arabiska texten byggs in i APK:n
  (`scripts/fetch-quran.js` körs i Actions); översättningen hämtas en gång och sparas, så hela Koranen kan läsas utan nät.
  Byter man språk eller översättning hämtas den nya. Varje vers kan förklaras ord för ord.
- **Historik:** allt du läst och översatt sparas på telefonen.
- **Inställningar:** språk (svenska eller engelska – både appens språk och översättningsspråket), translitteration
  (uttal enligt tajwīd eller ord för ord, akademisk eller enkel stavning), storlek på arabisk text, koranöversättning,
  AI-nyckel och modell, tema (Mörk/Beige), **uppdatering från GitHub Releases** (laddar ner och installerar APK) och Om.
- **Startbild:** animerad, mörk, med en gyllene alif i en åttauddig stjärna (khātam), svävande arabiska ord med
  translitteration och engelsk/svensk betydelse, och de tre funktionerna Kamera · Translitterera · Översätt.

## Translitterationen (offline)
`app/src/core/translit.ts` läser vokaliserad text som sammanhängande tal:
- hamzat al-waṣl (ٱ) faller bort inne i en fras: بِسْمِ ٱللَّهِ → *bismi llāhi*; lång vokal före den blir kort (*fi l-arḍi*),
  konsonant får hjälpvokal (*mina n-nāsi*, *ʿalayhimu l-qitālu*)
- artikeln: solbokstäver assimileras (*ar-raḥmān*), månbokstäver behåller l (*al-ḥamdu*); prefix *wa- fa- bi- ka- li-*
- nūn sākina/tanwīn: idghām (*may-yaʿmal*, *hudal-li-l-muttaqīn*), iqlāb (*mim baʿdi*)
- waqf vid versslut, stopptecken ۘ ۗ och skiljetecken: *-un/-in* faller bort, *-an → -ā*, tāʾ marbūṭa → *-h*
- uthmaniska tecken: ۡ ٰ ۥ ۦ ۟ ۢ, öppen tanwīn, ـٔ, versnummer ۝ och de lösa bokstäverna (الٓمٓ → *alif lām mīm*)

Ovokaliserad text kan bara ge konsonanter och långa vokaler; då vokaliserar Claude texten först.

## AI
Kameraläsning och översättning görs av Claude via Anthropics API med användarens egen nyckel (Inställningar → AI-översättning).
Nyckeln sparas i telefonens säkra lagring. Translitteration och Koranläsning fungerar utan nyckel.

## Tema
Färger och typsnitt delas med Direct (mörk petrol med guld och mint, Plus Jakarta Sans, Cinzel) plus Amiri för arabiska.
Allt ligger i `app/src/theme.ts` – byt värdena där för att använda en annan palett.

## Köra och bygga
```
cd app && npm install && npx expo start
npm run typecheck && npm test
```
Kameran kräver en utvecklingsbuild eller APK. Varje push till `main` bygger en APK (Actions → körningen → Artifacts).
En tagg `vX.Y.Z` skapar en release med `Alif.apk`, som appens uppdateringsfunktion hittar.
Egen signeringsnyckel: lägg in hemligheterna `ALIF_KEYSTORE_BASE64`, `ALIF_KEYSTORE_PASSWORD`, `ALIF_KEY_ALIAS`, `ALIF_KEY_PASSWORD`;
utan dem signeras APK:n med den publika debug-nyckeln.

## Källor
Koranens text och översättningar: [AlQuran Cloud](https://alquran.cloud/api). En översättning av Koranen är alltid en tolkning av betydelsen.

## Utvecklare
Claes Sundman S.N.C AB - 2026
