// Recitation: plays a sūra verse by verse (from the phone when downloaded, otherwise streamed) and downloads sūras.
// Only plays while Alif is open (no background service). The microphone is never used.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Network from 'expo-network';
import { Directory, File, Paths } from 'expo-file-system';
import { useApp } from './store';
import { SURAHS } from './core/quran';
import { RECITERS, audioUrl } from './core/recite';

export type Now = { surah: number; ayah: number; playing: boolean; loading: boolean; rep: number } | null;
type Progress = Record<number, { done: number; total: number; error?: boolean }>;
type Ctx = {
  now: Now;
  play: (surah: number, ayah?: number) => void;
  toggle: () => void; stop: () => void; step: (k: 1 | -1) => void;
  downloaded: (surah: number) => boolean;
  progress: Progress;
  download: (surah: number) => Promise<'ok' | 'wifi' | 'error' | 'cancelled'>;
  cancel: (surah: number) => void;
  removeAll: () => void;
  stats: () => { surahs: number; mb: number };
  version: number;          // changes when downloads change (for re-rendering lists)
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useRecitation = () => useContext(C);

const root = () => new Directory(Paths.document, 'audio');
const surahDir = (reciter: string, n: number) => new Directory(root(), reciter.replace(/[^a-z0-9.]/gi, '_'), String(n));
const ayahFile = (reciter: string, n: number, a: number) => new File(surahDir(reciter, n), `${a}.mp3`);

export function RecitationProvider({ children }: { children: React.ReactNode }) {
  const { reciter, wifiOnly, hifz, hifzRepeat } = useApp();
  const [now, setNow] = useState<Now>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [version, setVersion] = useState(0);
  const player = useRef<AudioPlayer | null>(null);
  const cur = useRef<Now>(null);
  const cancelled = useRef<Set<number>>(new Set());
  const settings = useRef({ reciter, repeat: hifz ? hifzRepeat : 1 });
  settings.current = { reciter, repeat: hifz ? Math.max(1, hifzRepeat) : 1 };

  const set = (n: Now) => { cur.current = n; setNow(n); };
  const lockScreen = useRef(false);

  const sourceFor = (surah: number, ayah: number, bitrate = 128) => {
    const f = ayahFile(settings.current.reciter, surah, ayah);
    try { if (f.exists && (f.size ?? 0) > 1000) return { uri: f.uri }; } catch {}
    return { uri: audioUrl(settings.current.reciter, surah, ayah, bitrate) };
  };

  const load = useCallback((surah: number, ayah: number, rep = 1) => {
    if (!player.current) {
      // Keeps playing when the screen is turned off or Alif is in the background, with controls on the lock screen.
      setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' } as any).catch(() => {});
      player.current = createAudioPlayer(null, { updateInterval: 250 } as any);
      player.current.addListener('playbackStatusUpdate', st => {
        const c = cur.current;
        if (!c) return;
        if (st.didJustFinish) {
          if (c.rep < settings.current.repeat) { load(c.surah, c.ayah, c.rep + 1); return; }
          const max = SURAHS[c.surah - 1].ayahs;
          if (c.ayah < max) load(c.surah, c.ayah + 1, 1);
          else set({ ...c, playing: false, loading: false });
          return;
        }
        if (c.loading && st.isLoaded && st.playing) set({ ...c, loading: false });
        // Paused or started again from the lock screen.
        else if (!c.loading && st.isLoaded && st.playing !== c.playing) set({ ...c, playing: st.playing });
      });
    }
    set({ surah, ayah, playing: true, loading: true, rep });
    player.current.replace(sourceFor(surah, ayah));
    player.current.play();
    const meta = { title: `${SURAHS[surah - 1].name} ${surah}:${ayah}`, artist: RECITERS.find(r => r.id === settings.current.reciter)?.name ?? '', albumTitle: 'Alif' };
    try {
      if (!lockScreen.current) { player.current.setActiveForLockScreen(true, meta, { showSeekForward: false, showSeekBackward: false }); lockScreen.current = true; }
      else player.current.updateLockScreenMetadata(meta);
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const play = useCallback((surah: number, ayah = 1) => load(surah, ayah, 1), [load]);
  const toggle = useCallback(() => {
    const c = cur.current, p = player.current;
    if (!c || !p) return;
    if (c.playing) { p.pause(); set({ ...c, playing: false }); } else { p.play(); set({ ...c, playing: true }); }
  }, []);
  const stop = useCallback(() => {
    player.current?.pause();
    try { if (lockScreen.current) player.current?.setActiveForLockScreen(false); } catch {}
    lockScreen.current = false;
    set(null);
  }, []);
  const step = useCallback((k: 1 | -1) => {
    const c = cur.current; if (!c) return;
    const a = Math.min(SURAHS[c.surah - 1].ayahs, Math.max(1, c.ayah + k));
    load(c.surah, a, 1);
  }, [load]);

  // Playing goes on in the background; when Alif comes back, the screen catches up with what was played meanwhile.
  useEffect(() => {
    const s = AppState.addEventListener('change', st => { if (st === 'active' && cur.current) set({ ...cur.current, playing: !!player.current?.playing }); });
    return () => s.remove();
  }, []);
  useEffect(() => () => { player.current?.remove(); player.current = null; }, []);
  // A new reciter: stop what is playing.
  useEffect(() => { if (cur.current) stop(); setVersion(v => v + 1); }, [reciter]); // eslint-disable-line react-hooks/exhaustive-deps

  const downloaded = useCallback((n: number) => {
    try {
      const d = surahDir(reciter, n);
      if (!d.exists) return false;
      return d.list().filter(x => x instanceof File && x.name.endsWith('.mp3')).length >= SURAHS[n - 1].ayahs;
    } catch { return false; }
  }, [reciter, version]); // eslint-disable-line react-hooks/exhaustive-deps

  const download = useCallback(async (n: number): Promise<'ok' | 'wifi' | 'error' | 'cancelled'> => {
    if (wifiOnly) {
      try { const st = await Network.getNetworkStateAsync(); if (st.type !== Network.NetworkStateType.WIFI && st.type !== Network.NetworkStateType.ETHERNET) return 'wifi'; } catch {}
    }
    const total = SURAHS[n - 1].ayahs, rec = reciter;
    cancelled.current.delete(n);
    try { const d = surahDir(rec, n); if (!d.exists) d.create({ intermediates: true }); } catch { return 'error'; }
    let done = 0;
    setProgress(p => ({ ...p, [n]: { done, total } }));
    for (let a = 1; a <= total; a++) {
      if (cancelled.current.has(n)) { setProgress(p => { const q = { ...p }; delete q[n]; return q; }); return 'cancelled'; }
      const f = ayahFile(rec, n, a);
      try {
        if (!(f.exists && (f.size ?? 0) > 1000)) {
          if (f.exists) f.delete();
          try { await File.downloadFileAsync(audioUrl(rec, n, a, 128), f); }
          catch { if (f.exists) f.delete(); await File.downloadFileAsync(audioUrl(rec, n, a, 64), f); }
        }
      } catch {
        setProgress(p => ({ ...p, [n]: { done, total, error: true } }));
        return 'error';
      }
      done++;
      setProgress(p => ({ ...p, [n]: { done, total } }));
    }
    setProgress(p => { const q = { ...p }; delete q[n]; return q; });
    setVersion(v => v + 1);
    return 'ok';
  }, [reciter, wifiOnly]);

  const cancel = useCallback((n: number) => { cancelled.current.add(n); }, []);
  const removeAll = useCallback(() => { stop(); try { const r = root(); if (r.exists) r.delete(); } catch {} setVersion(v => v + 1); }, [stop]);
  const stats = useCallback(() => {
    let surahs = 0, bytes = 0;
    try {
      const d = new Directory(root(), reciter.replace(/[^a-z0-9.]/gi, '_'));
      if (d.exists) for (const s of d.list()) if (s instanceof Directory) {
        const files = s.list().filter(x => x instanceof File) as File[];
        if (files.length >= (SURAHS[Number(s.name) - 1]?.ayahs ?? 1e9)) surahs++;
        for (const f of files) bytes += f.size ?? 0;
      }
    } catch {}
    return { surahs, mb: Math.round(bytes / 1048576) };
  }, [reciter, version]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<Ctx>(() => ({ now, play, toggle, stop, step, downloaded, progress, download, cancel, removeAll, stats, version }),
    [now, play, toggle, stop, step, downloaded, progress, download, cancel, removeAll, stats, version]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
