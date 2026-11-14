export type Route =
  | { name: 'tabs' }
  | { name: 'surah'; n: number; ayah?: number }
  | { name: 'entry'; id: string }
  | { name: 'settings' }
  | { name: 'history' }
  | { name: 'manual' }
  | { name: 'privacy' }
  | { name: 'language' }
  | { name: 'theme' }
  | { name: 'translit' }
  | { name: 'edition' }
  | { name: 'ai' }
  | { name: 'update' }
  | { name: 'about' }
  | { name: 'awrad' }
  | { name: 'reminder' }
  | { name: 'prayer' }
  | { name: 'city' }
  | { name: 'qibla' }
  | { name: 'hijri'; tab?: 'month' | 'ramadan' }
  | { name: 'letter'; id: string }
  | { name: 'signs' }
  | { name: 'recitation' }
  | { name: 'backup' }
  | { name: 'cards' }
  | { name: 'mosques' }
  | { name: 'mosqueList' }
  | { name: 'micSettings' }
  | { name: 'widgetSettings' }
  | { name: 'nightClock' }
  | { name: 'huroof' }
  | { name: 'pictures' }
  | { name: 'article'; url?: string; title?: string }
  | { name: 'prayerSound'; target?: 'prayer' | 'awrad' }
  | { name: 'juz'; n: number; ayah?: { surah: number; n: number } };
