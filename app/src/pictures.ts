// The pictures for the start screen and the top of Today. "minaret" is the default for both; the 13 Today pictures can
// be chosen too, and a picture of one's own (copied into the app's folder). 'animated' (start screen) and 'none'
// (Today) keep the earlier designs.
import { File, Paths } from 'expo-file-system';
import { ImageSourcePropType } from 'react-native';
import { HOME_FOCUS, HOME_IMAGES } from './homeImages';

/* eslint-disable @typescript-eslint/no-var-requires */
const MINARET = require('../assets/start/minaret.jpg');

export type Pic = { id: string; src: ImageSourcePropType; focus: number };
export const PICTURES: Pic[] = [
  { id: 'minaret', src: MINARET, focus: 0.45 },
  ...HOME_IMAGES.map((src, i) => ({ id: `home-${i + 1}`, src, focus: HOME_FOCUS[i] ?? 0.5 })),
];
export const OWN_START = 'own-start.jpg';
export const OWN_TODAY = 'own-today.jpg';

/** The picture for a setting value, or null for 'animated' / 'none' or a missing own picture. */
export function pictureFor(id: string): Pic | null {
  if (id.startsWith('own:')) {
    const f = new File(Paths.document, id.slice(4));
    return f.exists ? { id, src: { uri: `${f.uri}?v=${f.modificationTime ?? 0}` }, focus: 0.5 } : null;
  }
  return PICTURES.find(p => p.id === id) ?? null;
}
