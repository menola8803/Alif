# Alif · أَلِف

**Version 0.3.2** (se `CHANGELOG.md`)

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
- **Daily Awrad (naqshbandi):** dagens awrād i rätt ordning med arabiska, translitteration enligt tajwīd och betydelse,
  tre nivåer, räknare och påminnelse varje dag på vald tid (standard 21:00 / 9:00 PM) på låsskärmen och i appen.
- **Historik:** allt du läst och översatt sparas på telefonen.
- **Inställningar:** språk (svenska eller engelska – både appens språk och översättningsspråket), translitteration
  (uttal enligt tajwīd eller ord för ord, akademisk eller enkel stavning), storlek på arabisk text, koranöversättning,
  AI-nyckel och modell, tema (Mörk/Beige), **uppdatering från GitHub Releases** (laddar ner och installerar APK) och Om.
- **Startbild:** animerad, mörk, med en gyllene alif i en åttauddig stjärna (khātam) under en spetsbåge, hängande lyktor,
  en moské vid horisonten, svävande arabiska ord med translitteration och engelsk/svensk betydelse, de tre funktionerna
  Kamera · Translitterera · Översätt och ṣalawāt över Profeten ﷺ.

## Translitterationen (offline)
`app/src/core/translit.ts` läser vokaliserad text som sammanhängande tal:
- hamzat al-waṣl (ٱ) faller bort inne i en fras: بِسْمِ ٱللَّهِ → *bismi llāhi*; lång vokal före den blir kort (*fi l-arḍi*),
  konsonant får hjälpvokal (*mina n-nāsi*, *ʿalayhimu l-qitālu*)
- artikeln: solbokstäver assimileras (*ar-raḥmān*), månbokstäver behåller l (*al-ḥamdu*); prefix *wa- fa- bi- ka- li-*
- nūn sākina/tanwīn: idghām (*may-yaʿmal*, *hudal-li-l-muttaqīn*), iqlāb (*mim baʿdi*)
- waqf vid versslut, stopptecken ۘ ۗ och skiljetecken: *-un/-in* faller bort, *-an → -ā*, tāʾ marbūṭa → *-h*
- uthmaniska tecken: ۡ ٰ ۥ ۦ ۟ ۢ, öppen tanwīn, ـٔ, versnummer ۝ och de lösa bokstäverna (الٓمٓ → *alif lām mīm*)

Ovokaliserad text kan bara ge konsonanter och långa vokaler; då vokaliserar Claude texten först.

## Översättning
Inställningar → Översättning:
- **Automatiskt:** Claude om en nyckel finns, annars gratis på telefonen.
- **Claude:** bäst på klassisk arabiska, vokaltecken, ord för ord och kalligrafi (egen API-nyckel, sparas i telefonens säkra lagring).
- **På telefonen:** Google ML Kit, gratis, utan nät när språkmodellen är nedladdad; översätter medan du skriver.
- **MyMemory:** gratis onlinetjänst utan nyckel, med daglig gräns.
- **Kameran:** Claude, eller Tesseract på telefonen (tryckt text, gratis, utan nät).
Koranverser känns igen mot Koranen i appen oavsett motor. Native-koden finns i `app/modules/alif-native` (Kotlin).

## Tema
Färger och typsnitt delas med Direct (mörk petrol med guld och mint, Plus Jakarta Sans, Cinzel) plus Amiri för arabiska.
Allt ligger i `app/src/theme.ts` – byt värdena där för att använda en annan palett.

## Köra och bygga
```
cd app && npm install && npx expo start
npm run typecheck && npm test
```
Kameran kräver en utvecklingsbuild eller APK. Varje push till `main` bygger en APK (Actions → körningen → Artifacts).
När versionen i `app/package.json` höjs på `main` (eller en tagg `vX.Y.Z` pushas) byggs och signeras APK:n, och först därefter publiceras releasen med `Alif.apk`, `Alif-vX.Y.Z.apk` och källkoden som zip. En release finns alltså aldrig utan APK, och appens uppdateringsfunktion hittar den.
Egen signeringsnyckel: lägg in hemligheterna `ALIF_KEYSTORE_BASE64`, `ALIF_KEYSTORE_PASSWORD`, `ALIF_KEY_ALIAS`, `ALIF_KEY_PASSWORD`;
utan dem signeras APK:n med den publika debug-nyckeln.

## Källor
Koranens text och översättningar: [AlQuran Cloud](https://alquran.cloud/api). En översättning av Koranen är alltid en tolkning av betydelsen.

## Utvecklare
Claes Sundman S.N.C AB - 2026
