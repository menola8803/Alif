// Download the new Alif and open Android's installer – with progress. Afterwards Alif opens again by itself
// (or, if Android stops that, a notification "Alif is updated – tap to open" comes).
import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { File, Paths } from 'expo-file-system';
import { createDownloadResumable } from 'expo-file-system/legacy';
import { AlifNativeModule } from '../modules/alif-native';
import type { Release } from './update';

export async function downloadAndInstall(rel: Release, note: { title: string; body: string; channel: string }, onProgress: (part: number) => void): Promise<void> {
  if (!rel.apk || Platform.OS !== 'android') throw new Error('no apk');
  const dst = new File(Paths.cache, 'alif-update.apk');
  try { if (dst.exists) dst.delete(); } catch {}
  const dl = createDownloadResumable(rel.apk, dst.uri, {}, p => {
    if (p.totalBytesExpectedToWrite > 0) onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
  });
  const res = await dl.downloadAsync();
  if (!res || res.status !== 200) throw new Error(`HTTP ${res?.status}`);
  onProgress(1);
  try { AlifNativeModule?.markUpdatePending(note.title, note.body, note.channel); } catch {}
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: new File(res.uri).contentUri, flags: 1, type: 'application/vnd.android.package-archive' });
}
