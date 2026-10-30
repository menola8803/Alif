import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { getLocales } from 'expo-localization';
import { Theme, ThemeName, themes } from './theme';
import { dict, Lang, Strings } from './i18n';
import { Mode, Scheme } from './core/translit';
import { DEFAULT_MODEL, Result } from './core/engine';
import { SurahText } from './core/quran';
import { Level } from './core/awrad';

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
});

type Prefs = Omit<Saved, 'history'>;
type Ctx = Saved & {
  ready: boolean; theme: Theme; t: Strings;
  apiKey: string; setApiKey: (k: string) => Promise<void>;
  setPrefs: (p: Partial<Prefs>) => void;
  addHistory: (kind: EntryKind, r: Result) => Entry;
  removeHistory: (id: string) => void; clearHistory: () => void;
  loadSurah: (n: number, ed: string) => Promise<SurahText | null>;
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

  const value = useMemo<Ctx>(() => ({
    ...s, ready, theme: themes[s.themeName], t: dict[s.lang], apiKey, setApiKey, setPrefs, addHistory, removeHistory, clearHistory, loadSurah, saveSurah,
  }), [s, ready, apiKey, setApiKey, setPrefs, addHistory, removeHistory, clearHistory, loadSurah, saveSurah]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
