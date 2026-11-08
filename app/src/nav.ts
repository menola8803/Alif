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
  | { name: 'hijri' }
  | { name: 'letter'; id: string }
  | { name: 'signs' }
  | { name: 'recitation' }
  | { name: 'backup' }
  | { name: 'cards' };
