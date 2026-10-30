// The Qur'an kept on the phone.
// - Arabic (Uthmani): built into the app when the APK workflow could bundle it (assets/quran/quran-uthmani.json),
//   otherwise downloaded once and saved.
// - Translation: the edition chosen for the app language (Swedish or English) is downloaded once and saved, and a new one
//   is fetched when the language or the edition changes.
// Everything is read from the phone afterwards, so the Qur'an works without internet.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Directory, File, Paths } from 'expo-file-system';
import { ARABIC_EDITION, Ayah, QuranData, SurahText, completeQuran, fetchWholeQuran, localAyahs, localSurah, pickEdition } from './core/quran';
import { useApp } from './store';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BUNDLED: QuranData = require('../assets/quran/quran-uthmani.json');

type Status = 'idle' | 'loading' | 'ready' | 'error';
type Ctx = {
  status: Status;           // the Arabic text plus the translation for the current language
  arabicReady: boolean;
  translationReady: boolean;
  bundled: boolean;         // Arabic text came with the app
  edition: string;
  ensure: () => void;       // load from the phone, download what is missing
  surah: (n: number) => SurahText | null;
  ayahs: (surah: number, from: number, to: number) => Ayah[] | null;
  surahName: (n: number) => string | undefined; // Arabic name, when the text is on the phone
  arabic: QuranData | null; // the whole Arabic text, when it is on the phone
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useQuran = () => useContext(C);

const dir = () => new Directory(Paths.document, 'quran');
const fileFor = (edition: string) => new File(dir(), `${edition.replace(/[^a-z0-9._-]/gi, '_')}.json`);

async function readSaved(edition: string): Promise<QuranData | null> {
  try {
    const f = fileFor(edition);
    if (!f.exists) return null;
    const q = JSON.parse(await f.text()) as QuranData;
    return completeQuran(q) ? q : null;
  } catch { return null; }
}
async function save(q: QuranData) {
  try {
    const f = fileFor(q.edition);
    f.create({ intermediates: true, overwrite: true });
    await f.write(JSON.stringify(q));
  } catch {}
}

export function QuranProvider({ children }: { children: React.ReactNode }) {
  const { lang, editions, ready } = useApp();
  const edition = pickEdition(lang, editions[lang]);
  const bundled = completeQuran(BUNDLED);
  const [arabic, setArabic] = useState<QuranData | null>(bundled ? BUNDLED : null);
  const [tr, setTr] = useState<Record<string, QuranData>>({});
  const [status, setStatus] = useState<Status>('idle');
  const busy = useRef(false);

  const ensure = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setStatus('loading');
    let ok = true;
    try {
      let ar = arabic;
      if (!ar) {
        ar = await readSaved(ARABIC_EDITION);
        if (!ar) { ar = await fetchWholeQuran(ARABIC_EDITION); await save(ar); }
        setArabic(ar);
      }
    } catch { ok = false; }
    try {
      if (!tr[edition]) {
        let t = await readSaved(edition);
        if (!t) { t = await fetchWholeQuran(edition); await save(t); }
        const got = t;
        setTr(o => ({ ...o, [edition]: got }));
      }
    } catch { ok = false; }
    setStatus(ok ? 'ready' : 'error');
    busy.current = false;
  }, [arabic, tr, edition]);

  // Load what is saved on the phone at start and whenever the translation changes (no download needed if it is there).
  useEffect(() => { if (ready) ensure(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [ready, edition]);

  const translation = tr[edition] ?? null;
  const value = useMemo<Ctx>(() => ({
    status: arabic && translation ? 'ready' : status === 'ready' ? 'error' : status,
    arabicReady: !!arabic, translationReady: !!translation, bundled, edition, ensure,
    surah: n => (arabic ? localSurah(n, arabic, translation) : null),
    ayahs: (s, a, b) => (arabic ? localAyahs(arabic, translation, s, a, b) : null),
    surahName: n => arabic?.surahs[n - 1]?.name,
    arabic,
  }), [arabic, translation, status, bundled, edition, ensure]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
