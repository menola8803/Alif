import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../store';
import { Ayah, SURAHS, SurahText, fetchSurah, pickEdition } from '../core/quran';
import { Result } from '../core/engine';
import { transliterate } from '../core/translit';
import { arabicDigits, errorText, translateText } from '../translate';
import { ResultView } from '../result';
import { Arabic, Body, Btn, Card, Header, Screen, SmallBtn, Text, Toggle } from '../ui';
import { StarNum } from './Quran';
import { Route } from '../nav';
import { useQuran } from '../library';

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

function Verse({ a, surah }: { a: Ayah; surah: number }) {
  const app = useApp();
  const { t, theme, scheme, mode, showTranslit, showTranslation } = app;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState('');
  const translit = transliterate(a.arabic, { scheme, mode });

  const explain = async () => {
    if (res) { setRes(null); return; }
    setBusy(true); setErr('');
    try {
      const r = await translateText(a.arabic, app, 'ar2x');
      const withRef: Result = { ...r, arabic: a.arabic, quran: { surah, from: a.n, to: a.n }, verses: [{ n: a.n, arabic: a.arabic, translation: a.translation }] };
      setRes(withRef);
      app.addHistory('quran', withRef);
    } catch (e) { setErr(errorText(e, t)); }
    setBusy(false);
  };

  return (
    <View style={{ paddingVertical: 14, gap: 8, borderBottomWidth: 1, borderBottomColor: theme.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <StarNum n={a.n} size={34} />
        <View style={{ flex: 1 }}>
          <Arabic>{a.arabic} <Arabic size={18} color={theme.primary}>۝{arabicDigits(a.n)}</Arabic></Arabic>
        </View>
      </View>
      {showTranslit ? <Text selectable style={{ fontSize: 15.5, lineHeight: 23, color: theme.accent, fontWeight: '500' }}>{translit}</Text> : null}
      {showTranslation && a.translation ? <Body>{a.translation}</Body> : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <SmallBtn title={open ? '–' : '…'} onPress={() => setOpen(o => !o)} />
        {open ? <>
          <SmallBtn title={t.explainVerse} tone="accent" onPress={explain} disabled={busy} />
          <SmallBtn title={t.copy} onPress={() => Clipboard.setStringAsync(`${a.arabic}\n${translit}\n${a.translation}\n(${SURAHS[surah - 1].name} ${surah}:${a.n})`).catch(() => {})} />
        </> : null}
      </View>
      {busy ? <ActivityIndicator color={theme.primary} /> : null}
      {err ? <Body muted>{err}</Body> : null}
      {res ? <ResultView r={res} /> : null}
    </View>
  );
}

export default function Surah({ n, ayah, onBack, go }: { n: number; ayah?: number; onBack: () => void; go: (r: Route) => void }) {
  const app = useApp();
  const lib = useQuran();
  const { t, theme, lang, editions, scheme, mode, showTranslit, showTranslation, setPrefs } = app;
  const info = SURAHS[n - 1];
  const edition = pickEdition(lang, editions[lang]);
  const [data, setData] = useState<SurahText | null>(null);
  const [err, setErr] = useState('');
  const [cached, setCached] = useState(false);
  const list = useRef<FlatList<Ayah>>(null);

  const local = lib.arabicReady ? lib.surah(n) : null;
  const localFull = !!local && lib.translationReady;

  const load = useCallback(async () => {
    setErr('');
    if (localFull) { setData(local); setCached(true); return; }
    const c = await app.loadSurah(n, edition);
    if (c) { setData(c); setCached(true); }
    if (!c && local) { setData(local); setCached(true); } // Arabic on the phone, translation still coming
    try {
      const fresh = await fetchSurah(n, edition);
      setData(fresh); app.saveSurah(fresh); setCached(true);
    } catch (e) {
      if (!c && !local) setErr(t.loadFail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, edition, localFull]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (data && ayah && ayah > 1) setTimeout(() => list.current?.scrollToIndex({ index: Math.min(ayah - 1, data.ayahs.length - 1), animated: true }), 300);
  }, [data, ayah]);

  return (
    <Screen>
      <Header title={`${n}. ${info.name}`} sub={data ? `${data.meaning} · ${info.ayahs} ${t.verses}` : `${info.ayahs} ${t.verses}`} onBack={onBack} />
      {!data && !err ? <Card style={{ alignItems: 'center', paddingVertical: 28 }}><ActivityIndicator color={theme.primary} /><Text style={{ color: theme.muted }}>{t.loading}</Text></Card> : null}
      {err ? <Card><Body>{err}</Body><Btn title={t.retry} onPress={load} /></Card> : null}
      {data ? (
        <FlatList
          ref={list}
          data={data.ayahs}
          keyExtractor={a => String(a.n)}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={i => setTimeout(() => list.current?.scrollToIndex({ index: i.index, animated: true }), 400)}
          ListHeaderComponent={
            <View style={{ gap: 10, paddingBottom: 6 }}>
              <Card style={{ paddingVertical: 10, gap: 0 }}>
                <Toggle title={t.showTranslit} on={showTranslit} onChange={v => setPrefs({ showTranslit: v })} />
                <Toggle title={t.showTranslation} on={showTranslation} onChange={v => setPrefs({ showTranslation: v })} />
                <Text style={{ fontSize: 12, color: theme.muted }} onPress={() => go({ name: 'edition' })}>{data.edition}{cached ? ` · ${t.offlineCached}` : ''} ›</Text>
              </Card>
              {data.arabicName ? <Arabic size={34} center color={theme.primary}>{data.arabicName}</Arabic> : null}
              {data.bismillah ? (
                <View style={{ alignItems: 'center' }}>
                  <Arabic center>{BASMALA}</Arabic>
                  {showTranslit ? <Text style={{ color: theme.accent, fontSize: 15 }}>{transliterate(BASMALA, { scheme, mode })}</Text> : null}
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => <Verse a={item} surah={n} />}
        />
      ) : null}
    </Screen>
  );
}
