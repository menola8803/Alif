import { requireOptionalNativeModule } from 'expo';

type AlifNative = {
  translate(text: string, from: string, to: string, allowDownload: boolean): Promise<string>;
  downloadedModels(): Promise<string[]>;
  ocr(imageUri: string, dataPath: string, lang: string): Promise<string>;
};

/** The phone's own translation (ML Kit) and text recognition (Tesseract). Null where the native code is not built in (Expo Go, web, tests). */
export const AlifNativeModule = requireOptionalNativeModule<AlifNative>('AlifNative');
