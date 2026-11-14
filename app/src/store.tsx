import type { Mosque } from './core/mosques';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { getLocales } from 'expo-localization';
import { Theme, ThemeName, themes } from './theme';
import { dict, Lang, Strings } from './i18n';
import { Mode, Scheme } from './core/translit';
import { DEFAULT_MODEL, Result } from './core/engine';
import { SurahText } from './core/quran';
import { IhdaShaykh, Level } from './core/awrad';
import type { Engine, OcrEngine } from './translate';
import { DEFAULT_PLACE, HighLat, Place, PrayerName, School } from './core/prayer';

export type Bookmark = { n: number; ayah: number; at: number };

export type EntryKind = 'camera' | 'text' | 'quran';
export type Entry = { id: string; at: number; kind: EntryKind; result: Result };

type Saved = {
  themeName: ThemeName;
  lang: Lang;                          // app language = the language Arabic is translated into
  scheme: Scheme;                      // transliteration letters
  mode: Mode;                          // recited (tajwid) or word by word
  model: string;                       // Claude model
  editions: Partial<Record<Lang, string>>; // chosen Qur'an translation per language
  arabicSize: number;                  // font size for Arabic text
  showTranslit: boolean; showTranslation: boolean; // in the Qur'an reader
  history: Entry[];
  // Daily Awrad
  awradLevel: Level;
  reminderOn: boolean; reminderHour: number; reminderMinute: number; // local time on the phone (default 21:00 = 9:00 PM)
  awradDay: string; awradCounts: Record<string, number>; // today's progress
  popupDay: string;                    // the day the reminder popup was last closed
  engine: Engine; ocrEngine: OcrEngine; // translation engine and photo reading (auto: Claude with a key, else free on the phone)
  live: boolean;                       // translate while typing (free engines)
  ihdaShaykh: IhdaShaykh;              // the living shaykh named at the end of the dedication
  // Prayer times, Hijri and Qibla
  place: Place;                        // chosen town (default Stockholm)
  useLocation: boolean;                // use the phone's position instead (off until the person turns it on)
  school: School; highLat: HighLat;    // ʿaṣr Ḥanafī by default, angle-based rule for short summer nights
  prayerNotify: Record<PrayerName, boolean>;
  hijriAdjust: number;                 // the person's ±1 day (moon sighting)
  hijriAuto: number;                   // shift that makes the arithmetic calendar agree with Umm al-Qurā (from Aladhan)
  // Qur'an
  lastRead: { n: number; ayah: number } | null;
  bookmarks: Bookmark[];
  // Learn to read
  learnQuiz: boolean;                  // questions shown (off by default, switched in the corner menu)
  learnDone: string[];                 // letters marked as learned
  // Dhikr counter
  dhikrSel: string; dhikrCounts: Record<string, number>; dhikrTargets: Record<string, number>;
  // Other
  updateTag: string; updateChecked: number; // newest version found (the gear glows)
  homeImg: number;                     // picture last shown on Today
  notifV2: boolean;                    // old notifications cleared once after the update to 0.4.0
  // Recitation and reading aids (0.5.0)
  reciter: string; wifiOnly: boolean;   // al-Ḥuṣarī by default; downloads only on wifi
  tajweed: boolean; wbw: boolean;       // tajwīd colours, word by word
  hifz: boolean; hifzRepeat: number;    // memorising: text hidden until tapped, each verse repeated
  learnCards: Record<string, { box: number; due: number }>; // repetition cards (Leitner boxes)
  // 0.5.1
  micOn: boolean;                      // the microphone may be used by Listen (OFF until the person turns it on)
  micOnlyPhone: boolean;               // recognise speech only on the phone (nothing sent to Google)
  listenTranslit: boolean;             // show the transliteration box under Listen
  dhikrVolume: boolean;                // count dhikr with the volume buttons on the Dhikr page
  prayerSound: string;                 // 'default' | 'silent' | 'raw:adhan_…' | 'content://…' (see core/sounds)
  prayerSoundName: string;             // the name of a sound from the phone
  fajrAdhan: boolean;                  // the Fajr adhan at Fajr when an adhan is chosen
  prayerAlarm: boolean;                // play at alarm volume
  awradSound: string;                  // the Daily Awrad reminder's sound (same kinds as prayerSound)
  awradSoundName: string;
  awradAlarm: boolean;
  startImg: string;                    // start screen picture: a PICTURES id, 'own:<file>' or 'animated'
  todayImg: string;
  picFolderMade: boolean;
  ramadanView: import('./core/ramadan').RamadanView;
  ramFrom: number; ramTo: number; ramFromH: number; ramToH: number; ramEra: 'greg' | 'hijri'; // …and in Hijri years      // Hijri › Ramadan: the years shown (0 = from 2026) // Hijri › Ramadan: the picture chosen last              // Download/Alif/Pictures has been created
  awradImg: string;                    // picture under the Daily Awrad title: a picture id or 'none'                    // picture at the top of Today: a PICTURES id, 'own:<file>' or 'none'
  quranView: 'surah' | 'juz';         // the Qur'an tab lists the sūras or the 30 parts
  widgetStyle: 'full' | 'times';
  lockPrayer: boolean;                 // the prayer times as a quiet notification that stays on the lock screen      // home screen widget: everything, or only the five prayers with their times
  myMosques: Mosque[];                 // mosques the person has added on the map
  hiddenMosques: string[];             // built-in mosques the person has removed (mosqueKey)
};

const KEY = 'alif.state.v1';
const API_KEY = 'alif.apikey.v1';
const SURAH_KEY = (n: number, ed: string) => `alif.surah.${n}.${ed}`;
const MAX_HISTORY = 200;

const phoneLang = (): Lang => { try { return getLocales()[0]?.languageCode === 'sv' ? 'sv' : 'en'; } catch { return 'en'; } };
const empty = (): Saved => ({
  themeName: 'dark', lang: phoneLang(), scheme: 'academic', mode: 'tajwid', model: DEFAULT_MODEL, editions: {},
  arabicSize: 30, showTranslit: true, showTranslation: true, history: [],
  awradLevel: 'mubtadi', reminderOn: true, reminderHour: 21, reminderMinute: 0, awradDay: '', awradCounts: {}, popupDay: '',
  engine: 'auto', ocrEngine: 'auto', live: true, ihdaShaykh: 'none',
  place: DEFAULT_PLACE, useLocation: false, school: 'hanafi', highLat: 'angle',
  prayerNotify: { fajr: true, sunrise: false, dhuhr: true, asr: true, maghrib: true, isha: true },
  hijriAdjust: 0, hijriAuto: 0,
  lastRead: null, bookmarks: [],
  learnQuiz: false, learnDone: [],
  dhikrSel: 'subhan', dhikrCounts: {}, dhikrTargets: {},
  updateTag: '', updateChecked: 0, homeImg: -1, notifV2: false,
  reciter: 'ar.husary', wifiOnly: true, tajweed: false, wbw: false, hifz: false, hifzRepeat: 1, learnCards: {},
  micOn: false, micOnlyPhone: true, listenTranslit: true, dhikrVolume: false, myMosques: [], hiddenMosques: [], widgetStyle: 'full', lockPrayer: false, quranView: 'surah', startImg: 'minaret', todayImg: 'minaret', awradImg: 'none', picFolderMade: false, ramadanView: 'ring', ramFrom: 0, ramTo: 2050, ramFromH: 0, ramToH: 0, ramEra: 'greg', prayerSound: 'default', prayerSoundName: '', fajrAdhan: true, prayerAlarm: false, awradSound: 'default', awradSoundName: '', awradAlarm: false,
});

type Prefs = Omit<Saved, 'history'>;
type Ctx = Saved & {
  ready: boolean; theme: Theme; t: Strings;
  apiKey: string; setApiKey: (k: string) => Promise<void>;
  setPrefs: (p: Partial<Prefs>) => void;
  addHistory: (kind: EntryKind, r: Result) => Entry;
  removeHistory: (id: string) => void; clearHistory: () => void;
  loadSurah: (n: number, ed: string) => Promise<SurahText | null>;
  backup: () => object;
  restore: (data: any) => boolean;
  saveSurah: (s: SurahText) => void;
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(C);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Saved>(empty);
  const [apiKey, setKey] = useState('');
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const merged = { ...empty(), ...saved };
          if (!themes[merged.themeName as ThemeName]) merged.themeName = 'dark';
          if (merged.lang !== 'sv' && merged.lang !== 'en') merged.lang = phoneLang();
          setS(merged);
        }
      } catch {}
      try { setKey((await SecureStore.getItemAsync(API_KEY)) ?? ''); } catch {}
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  // Save after every change (only once the saved state has been read, so nothing is overwritten by the defaults).
  useEffect(() => {
    if (!loaded.current) return;
    const id = setTimeout(() => { AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); }, 250);
    return () => clearTimeout(id);
  }, [s]);

  const setApiKey = useCallback(async (k: string) => {
    const v = k.trim();
    if (v) await SecureStore.setItemAsync(API_KEY, v); else await SecureStore.deleteItemAsync(API_KEY);
    setKey(v);
  }, []);

  const setPrefs = useCallback((p: Partial<Prefs>) => setS(o => ({ ...o, ...p })), []);
  const addHistory = useCallback((kind: EntryKind, result: Result) => {
    const e: Entry = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, at: Date.now(), kind, result };
    setS(o => ({ ...o, history: [e, ...o.history].slice(0, MAX_HISTORY) }));
    return e;
  }, []);
  const removeHistory = useCallback((id: string) => setS(o => ({ ...o, history: o.history.filter(h => h.id !== id) })), []);
  const clearHistory = useCallback(() => setS(o => ({ ...o, history: [] })), []);

  const loadSurah = useCallback(async (n: number, ed: string) => {
    try { const raw = await AsyncStorage.getItem(SURAH_KEY(n, ed)); return raw ? (JSON.parse(raw) as SurahText) : null; } catch { return null; }
  }, []);
  const saveSurah = useCallback((st: SurahText) => { AsyncStorage.setItem(SURAH_KEY(st.number, st.edition), JSON.stringify(st)).catch(() => {}); }, []);

  // Backup: everything saved in the app except the API key (that stays in the phone's secure store).
  const backup = useCallback(() => ({ app: 'Alif', format: 1, at: new Date().toISOString(), data: s }), [s]);
  const restore = useCallback((j: any) => {
    const data = j?.app === 'Alif' && j?.data && typeof j.data === 'object' ? j.data : null;
    if (!data) return false;
    const merged = { ...empty(), ...data };
    if (!themes[merged.themeName as ThemeName]) merged.themeName = 'dark';
    if (merged.lang !== 'sv' && merged.lang !== 'en') merged.lang = phoneLang();
    if (!Array.isArray(merged.history)) merged.history = [];
    setS(merged);
    return true;
  }, []);

  const value = useMemo<Ctx>(() => ({
    ...s, ready, theme: themes[s.themeName], t: dict[s.lang], apiKey, setApiKey, setPrefs, addHistory, removeHistory, clearHistory, loadSurah, saveSurah, backup, restore,
  }), [s, ready, apiKey, setApiKey, setPrefs, addHistory, removeHistory, clearHistory, loadSurah, saveSurah, backup, restore]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
