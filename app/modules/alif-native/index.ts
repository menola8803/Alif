import { requireNativeView, requireOptionalNativeModule } from 'expo';
import type { ViewProps } from 'react-native';
import type { EventSubscription } from 'expo-modules-core';

export type SpeechEvent = { type: 'ready' | 'partial' | 'final' | 'speechEnd' | 'error' | 'closed'; text: string; error: number };

type AlifNative = {
  translate(text: string, from: string, to: string, allowDownload: boolean): Promise<string>;
  downloadedModels(): Promise<string[]>;
  ocr(imageUri: string, dataPath: string, lang: string): Promise<string>;
  pdfPages(pdfUri: string, outDir: string, maxPages: number): Promise<string[]>;
  captureVolumeKeys(on: boolean): void;
  setWidgetData(json: string): void;
  setPrayerChannels(channels: { id: string; name: string; sound: string; alarm: boolean }[]): void;
  previewSound(sound: string): void;
  stopSound(): void;
  nameAudioChannel(name: string): void;
  screenAwake(on: boolean, brightness: number): void;
  importSound(path: string, title: string): Promise<string | null>;
  pickPhoneSound(current: string | null, title: string): Promise<{ uri: string; title: string } | null>;
  speechInfo(): Promise<{ available: boolean; onDevice: boolean }>;
  startListening(lang: string, onlyOnPhone: boolean): void;
  stopListening(): void;
  addListener(event: 'onSpeech', listener: (e: SpeechEvent) => void): EventSubscription;
  addListener(event: 'onVolumeKey', listener: (e: { dir: number }) => void): EventSubscription;
};

/** The phone's own translation (ML Kit), text recognition (Tesseract), map, speech, widget and volume keys. Null where the native code is not built in (Expo Go, web, tests). */
export const AlifNativeModule = requireOptionalNativeModule<AlifNative>('AlifNative');

export type MapPin = { lat: number; lng: number; title: string; own?: boolean };
export type AlifMapProps = ViewProps & {
  pins: MapPin[]; selected: number; center: number[]; showMe: boolean;
  onMarkerPress?: (e: { nativeEvent: { index: number } }) => void;
  onMapLongPress?: (e: { nativeEvent: { lat: number; lng: number } }) => void;
};
let MapNative: React.ComponentType<AlifMapProps> | null = null;
/** The OpenStreetMap view, or null where it is not built in. */
export function getMapView(): React.ComponentType<AlifMapProps> | null {
  if (!AlifNativeModule) return null;
  if (!MapNative) { try { MapNative = requireNativeView<AlifMapProps>('AlifNative'); } catch { return null; } }
  return MapNative;
}
