// The pictures for the start screen and the top of Today. "minaret" is the default for both; the 13 Today pictures can
// be chosen too, and a picture of one's own (copied into the app's folder). 'animated' (start screen) and 'none'
// (Today) keep the earlier designs.
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
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
  if (id.startsWith('lib:')) {
    const f = new File(libDir(), id.slice(4));
    return f.exists ? { id, src: { uri: f.uri }, focus: 0.5 } : null;
  }
  if (id.startsWith('own:')) {
    const f = new File(Paths.document, id.slice(4));
    return f.exists ? { id, src: { uri: `${f.uri}?v=${f.modificationTime ?? 0}` }, focus: 0.5 } : null;
  }
  return PICTURES.find(p => p.id === id) ?? null;
}

// ---- Extra pictures: read in from a folder on the phone (Download/Alif/Pictures), copied into Alif's own folder ----

/** Where the folder picker opens first: Download/Alif/Pictures on the phone's own storage. */
export const PHONE_FOLDER = 'content://com.android.externalstorage.documents/document/primary%3ADownload%2FAlif%2FPictures';
/** The kinds of picture that can be read in. */
const IMAGE = /\.(jpe?g|png|bmp)$/i;
export const libDir = () => new Directory(Paths.document, 'pictures');

/** The pictures read in so far, newest first. */
export function libraryPictures(): Pic[] {
  try {
    const d = libDir();
    if (!d.exists) return [];
    return d.list()
      .filter((f): f is File => f instanceof File && /\.jpg$/i.test(f.name))
      .sort((a, b) => (b.modificationTime ?? 0) - (a.modificationTime ?? 0))
      .map(f => ({ id: `lib:${f.name}`, src: { uri: f.uri }, focus: 0.5 }));
  } catch { return []; }
}

/**
 * Lets the person choose the folder (it opens in Pictures/Alif) and reads in every picture there that is not in Alif
 * yet. Each is made at most 1600 points high and saved as JPEG, so large photos do not slow the app. Returns how many
 * were added, or -1 if no folder was chosen.
 */
export async function readInFolder(): Promise<number> {
  let dir: Directory;
  try { dir = await Directory.pickDirectoryAsync(PHONE_FOLDER); } catch { return -1; }
  if (!dir) return -1;
  const lib = libDir();
  if (!lib.exists) lib.create({ intermediates: true });
  let added = 0;
  for (const f of dir.list()) {
    if (!(f instanceof File) || !IMAGE.test(f.name)) continue;
    if (await importPicture(f.uri, f.name)) added++;
  }
  return added;
}

/** Removes a picture that was read in. */
export function removeLibraryPicture(id: string) {
  try { const f = new File(libDir(), id.slice(4)); if (f.exists) f.delete(); } catch {}
}

/** Copies one picture into Alif (made at most 1600 points high, JPEG). Returns its id, or null if it was there already. */
export async function importPicture(uri: string, fileName: string): Promise<string | null> {
  const lib = libDir();
  if (!lib.exists) lib.create({ intermediates: true });
  const name = `${fileName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9._-]/gi, '_').slice(0, 60)}.jpg`;
  const dst = new File(lib, name);
  if (dst.exists) return null;
  try {
    const tmp = new File(Paths.cache, `in-${Date.now()}-${name}`);
    new File(uri).copy(tmp);
    const ref = await ImageManipulator.manipulate(tmp.uri).resize({ height: 1600 }).renderAsync();
    const out = await ref.saveAsync({ compress: 0.85, format: SaveFormat.JPEG });
    new File(out.uri).move(dst);
    try { tmp.delete(); } catch {}
    return `lib:${name}`;
  } catch { return null; }
}

/** A short name for a picture id. File names of read-in pictures are never shown. */
export function pictureName(id: string, names: { minaret: string; picture: string; none: string; animated: string }): string {
  if (id === 'none') return names.none;
  if (id === 'animated') return names.animated;
  if (id === 'minaret') return names.minaret;
  if (id.startsWith('home-')) return `${names.picture} ${id.slice(5)}`;
  return names.picture;
}
