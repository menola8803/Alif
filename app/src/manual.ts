// The manual inside the app, in Swedish and English. Update it with EVERY release (see AGENTS.md):
// set MANUAL_VERSION to the new version in package.json – the tests fail otherwise.
export const MANUAL_VERSION = '0.5.0';

export type ManualSection = { title: string; items: string[] };

export const MANUAL: Record<'sv' | 'en', ManualSection[]> = {
  sv: [
    { title: 'Menyn', items: [
      'Fem flikar längst ner: Idag, Koranen, Översätt, Lär dig och Dhikr. Menyn svävar över sidan och är lite genomskinlig, så långa sidor syns svagt bakom den.',
      'Kugghjulet uppe till höger öppnar Inställningar. När en ny version finns lyser en guldring runt kugghjulet.',
      'Tillbaka-knappen på telefonen går tillbaka ett steg, och från en annan flik till Idag.',
    ] },
    { title: 'Idag', items: [
      'Datum och hijri-datum överst.',
      'Bönetidsklockan: en 24-timmarsklocka med midnatt nertill och middag överst. Varje bön är en prick på ringen, solen går runt i realtid och nästa bön lyser i guld med nedräkning i mitten. Tryck på klockan för alla tider och inställningar.',
      'Raden med tider: tryck på en bön för att slå av eller på dess avisering (● på, ○ av).',
      'Korten för Daily Awrad, Qibla, månaden och nästa särskilda dag öppnar respektive sida.',
      'Längst ner en av bilderna från Mecka, Medina och Hagia Sofia med Allāhumma ṣalli ʿalā sayyidinā Muḥammad i guld. En ny bild väljs varje gång du trycker på Idag.',
    ] },
    { title: 'Bönetider', items: [
      'Hämtas från Aladhan för vald plats med metoden Muslim World League (Fajr 18°, ʿIshāʾ 17°). En hel månad sparas, så tiderna finns utan nät. Utan nät och utan sparad månad räknar telefonen själv med samma metod.',
      'Förval: Stockholm, ʿaṣr enligt Ḥanafī och "vinkel" för korta sommarnätter. Allt kan ändras under Inställningar › Bönetider.',
      'Plats: välj en svensk ort i listan, sök en ort i hela världen, eller slå på "Använd min plats" (av från början).',
      'Aviseringar för de fem bönerna läggs in sex dagar framåt och förnyas varje gång appen öppnas. Om de kommer sent: tillåt "Alarm och påminnelser" och undanta Alif från batterisparläget (knappar finns på sidan).',
    ] },
    { title: 'Hijri-kalendern', items: [
      'Visar månaden med hijri-datum stort och svenskt datum litet under. Prickar = måndag och torsdag (sunnafasta); guldkant = särskild dag.',
      'De tolv månaderna med arabiskt namn, translitteration och förklaring. De fyra heliga månaderna är märkta.',
      'Datumet följer Umm al-Qurā (från Aladhan). Följer din moské månskådning kan du flytta det ±1 dag i Inställningar.',
    ] },
    { title: 'Qibla', items: [
      'Riktningen mot Kaʿba räknas ut från vald plats. Håll telefonen plant: appen säger hur många grader du ska vrida, och telefonen vibrerar kort när du står rätt.',
      'Ta av magnetiska skal. Visar kompassen fel – rör telefonen i en åtta några gånger.',
    ] },
    { title: 'Koranen', items: [
      'Alla 114 suror med arabisk text, svensk (Bernström) och engelsk (Saheeh International) översättning finns i appen från början och fungerar utan nät. Translitterationen räknas ut på telefonen enligt tajwīd.',
      '"Fortsätt läsa" tar dig dit du slutade. Tryck "Bokmärke" vid en vers för att spara den; bokmärkena visas överst på Koranen.',
      'Daily Awrad med Ihdāʾ öppnas från Idag, Koranen eller Dhikr.',
      'Recitation: spelaren längst ner i en sura spelar vers för vers (▶). Tryck på versens nummer eller "▶" vid en vers för att börja där. Versen som läses markeras och följs.',
      'Ladda ner: pilen ⤓ till höger i suralistan eller i spelaren. En ring visar hur långt det kommit, en grön bock när suran finns på telefonen och spelas utan nät. Tryck på ringen för att avbryta.',
      'Recitatör (förval al-Ḥuṣarī), "bara wifi" och borttagning av ljud finns under Inställningar › Recitation. Ljudet spelas bara medan Alif är öppen.',
      'Överst i en sura: Tajwīd-färger (reglerna i färg med förklaring), Ord för ord (varje ords betydelse på engelska) och Ḥifẓ: texten döljs tills du trycker och varje vers upprepas 1, 3, 5 eller 10 gånger.',
    ] },
    { title: 'Översätt', items: [
      'Välj överst: Skriv, Bild, Kamera eller Fil.',
      'Skriv: skriv eller klistra in arabiska (blir translitteration och svenska/engelska) eller svenska/engelska (blir arabiska).',
      'Bild: öppna en bild (png, jpeg, jpg, bmp), dra med fingret runt texten och tryck "Översätt markerat" – eller översätt hela bilden.',
      'Kamera: rikta mot texten och ta en bild.',
      'Fil: öppna .docx, .odt, .pdf, en bild eller en textfil. Texten hamnar i en vit ruta – markera det du vill ha och tryck "Översätt markerat". PDF-sidor och bilder läses med textigenkänning på telefonen.',
      'Översättningsmotor väljs under Inställningar › Översättning.',
    ] },
    { title: 'Lär dig läsa', items: [
      'Bokstäverna i samma ordning som boken Iqraʾa! (Samir Muric), med bokens bilder av var bokstaven uttalas och hur den skrivs: ensam, i början, i mitten och i slutet, i fyra rutor två och två, numrerade 1–4 från höger.',
      'Tryck ▶ Lyssna för att höra bokstaven (telefonens talsyntes). "Vokaltecken" visar fatḥa, kasra, ḍamma, sukūn, shadda, tanwīn och långa vokaler.',
      'Frågor slås på och av i menyn ⋮ uppe till höger (av från början).',
      '"Öppna boken" visar hela boken i telefonens PDF-läsare.',
      'Repetitionskort: se bokstaven, tryck för svaret och välj "Kunde" eller "Igen". Kända kort kommer tillbaka efter 1, 2, 4, 8 och 16 dagar.',
    ] },
    { title: 'Dhikr', items: [
      'Välj dhikr överst och tryck på cirkeln för att räkna. Telefonen vibrerar kort vid varje tryck och längre när målet är nått. Välj mål med knapparna under.',
      'Här finns också Daily Awrad (med Ihdāʾ) och ṣalawāt.',
    ] },
    { title: 'Inställningar', items: [
      'Språk (svenska/engelska), tema, translitteration, översättning, Koranöversättning, bönetider, Daily Awrad-påminnelse (21:00), hijri ±1 dag, historik, manual, integritet, uppdatering och Om.',
      'Uppdatering: när en ny version finns lyser kugghjulet. Tryck "Ladda ner och installera".',
      'Säkerhetskopia: spara allt (utom API-nyckeln) i en fil och läs in den igen, till exempel på en ny telefon.',
    ] },
    { title: 'Integritet', items: [
      'Plats är av från början. Mikrofonen används inte av Alif.',
      'Kameran och textigenkänningen arbetar på telefonen. Bilder och text skickas bara iväg om du själv väljer Claude, MyMemory eller Google Lens.',
    ] },
  ],
  en: [
    { title: 'The menu', items: [
      'Five tabs at the bottom: Today, Qur’an, Translate, Learn and Dhikr. The menu floats over the page and is slightly see-through, so long pages show faintly behind it.',
      'The gear in the top right corner opens Settings. When a new version is out, a gold ring glows around the gear.',
      'The phone’s back button goes back one step, and from another tab to Today.',
    ] },
    { title: 'Today', items: [
      'The date and the Hijri date at the top.',
      'The prayer clock: a 24-hour clock with midnight at the bottom and noon at the top. Each prayer is a dot on the ring, the sun moves round in real time and the next prayer glows in gold with a countdown in the middle. Tap the clock for all times and settings.',
      'The row of times: tap a prayer to turn its notification on or off (● on, ○ off).',
      'The cards for Daily Awrad, Qibla, the month and the next special day open their pages.',
      'At the bottom one of the pictures of Mecca, Medina and Hagia Sophia with Allāhumma ṣalli ʿalā sayyidinā Muḥammad in gold. A new picture is chosen every time you tap Today.',
    ] },
    { title: 'Prayer times', items: [
      'Fetched from Aladhan for the chosen place with the Muslim World League method (Fajr 18°, ʿIshāʾ 17°). A whole month is saved, so the times are there without internet. Without internet and nothing saved, the phone calculates them with the same method.',
      'Defaults: Stockholm, ʿaṣr Ḥanafī and "angle" for short summer nights. All of it can be changed in Settings › Prayer times.',
      'Place: pick a Swedish town from the list, look up a place anywhere in the world, or turn on "Use my location" (off by default).',
      'Notifications for the five prayers are set six days ahead and renewed every time the app is opened. If they come late: allow "Alarms & reminders" and exempt Alif from battery saving (buttons on the page).',
    ] },
    { title: 'Hijri calendar', items: [
      'Shows the month with the Hijri date large and the Gregorian date small under it. Dots = Monday and Thursday (sunna fasts); gold edge = special day.',
      'The twelve months with Arabic name, transliteration and meaning. The four sacred months are marked.',
      'The date follows Umm al-Qurā (from Aladhan). If your mosque follows the moon sighting, move it ±1 day in Settings.',
    ] },
    { title: 'Qibla', items: [
      'The direction of the Kaʿba is worked out from the chosen place. Hold the phone flat: the app tells you how many degrees to turn, and the phone gives a short buzz when you face it.',
      'Remove magnetic cases. If the compass is off, move the phone in a figure eight a few times.',
    ] },
    { title: 'Qur’an', items: [
      'All 114 sūras with the Arabic text and the Swedish (Bernström) and English (Saheeh International) translations are in the app from the start and work offline. The transliteration is worked out on the phone with the tajwīd rules.',
      '"Continue reading" takes you to where you stopped. Tap "Bookmark" at a verse to save it; bookmarks are shown at the top of the Qur’an page.',
      'Daily Awrad with the Ihdāʾ opens from Today, the Qur’an or Dhikr.',
      'Recitation: the player at the bottom of a sūra plays verse by verse (▶). Tap a verse number or "▶" at a verse to start there. The verse being recited is highlighted and followed.',
      'Download: the ⤓ arrow on the right in the sūra list or in the player. A ring shows the progress, a green tick when the sūra is on the phone and plays offline. Tap the ring to cancel.',
      'Reciter (default al-Ḥuṣarī), "wifi only" and removing audio are in Settings › Recitation. Audio only plays while Alif is open.',
      'At the top of a sūra: Tajwīd colours (the rules in colour with a legend), Word by word (each word’s meaning in English) and Ḥifẓ: the text is hidden until you tap it and each verse is repeated 1, 3, 5 or 10 times.',
    ] },
    { title: 'Translate', items: [
      'Choose at the top: Write, Picture, Camera or File.',
      'Write: type or paste Arabic (gives transliteration and English/Swedish) or English/Swedish (gives Arabic).',
      'Picture: open a picture (png, jpeg, jpg, bmp), draw round the text with a finger and tap "Translate marked" – or translate the whole picture.',
      'Camera: point at the text and take a picture.',
      'File: open a .docx, .odt, .pdf, a picture or a text file. The text goes into a white box – mark the part you want and tap "Translate marked". PDF pages and pictures are read with text recognition on the phone.',
      'The translation engine is chosen in Settings › Translation.',
    ] },
    { title: 'Learn to read', items: [
      'The letters in the same order as the book Iqraʾa! (Samir Muric), with the book’s pictures of where each letter is pronounced and how it is written: alone, at the start, in the middle and at the end, in four boxes two by two, numbered 1–4 from the right.',
      'Tap ▶ Listen to hear the letter (the phone’s speech). "Vowel signs" shows fatḥa, kasra, ḍamma, sukūn, shadda, tanwīn and the long vowels.',
      'Questions are switched on and off in the ⋮ menu in the top right corner (off by default).',
      '"Open the book" shows the whole book in the phone’s PDF viewer.',
      'Repetition cards: see the letter, tap for the answer and choose "Knew it" or "Again". Known cards come back after 1, 2, 4, 8 and 16 days.',
    ] },
    { title: 'Dhikr', items: [
      'Choose the dhikr at the top and tap the circle to count. The phone gives a short buzz at every tap and a longer one at the goal. Choose the goal with the buttons below.',
      'Daily Awrad (with the Ihdāʾ) and ṣalawāt are here too.',
    ] },
    { title: 'Settings', items: [
      'Language (Swedish/English), theme, transliteration, translation, Qur’an translation, prayer times, Daily Awrad reminder (9:00 PM), Hijri ±1 day, history, manual, privacy, update and About.',
      'Update: when a new version is out the gear glows. Tap "Download and install".',
      'Backup: save everything (except the API key) in a file and restore it, for example on a new phone.',
    ] },
    { title: 'Privacy', items: [
      'Location is off by default. Alif does not use the microphone.',
      'The camera and text recognition work on the phone. Pictures and text are only sent anywhere if you choose Claude, MyMemory or Google Lens yourself.',
    ] },
  ],
};
