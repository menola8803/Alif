export type Route =
  | { name: 'tabs' }
  | { name: 'surah'; n: number; ayah?: number }
  | { name: 'entry'; id: string }
  | { name: 'language' }
  | { name: 'theme' }
  | { name: 'translit' }
  | { name: 'edition' }
  | { name: 'ai' }
  | { name: 'update' }
  | { name: 'about' };
