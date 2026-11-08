import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text as RNText, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../store';
import { Ayah, SURAHS, SurahText, fetchSurah, pickEdition } from '../core/quran';
import { Result } from '../core/engine';
import { transliterate } from '../core/translit';
import { arabicDigits, errorText, textEngine, translateText } from '../translate';
import { ResultView } from '../result';
import { Arabic, Body, Btn, Card, Header, Screen, Segmented, SmallBtn, Text, Toggle } from '../ui';
import { useRecitation } from '../recitation';
import { RECITERS } from '../core/recite';
import { TAJWEED_COLORS, dropBasmala, parseTajweed } from '../core/tajweed';
import { hasTajweed, tajweedText } from '../library';
import { Word, WbwSurah, loadWbw } from '../wbw';
import { DownloadIcon, TajweedLegend } from '../quranParts';
import { StarNum } from './Quran';
import { Route } from '../nav';
import { useQuran } from '../library';

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

/** The verse text, in tajwīd colours when that is on and the marked text is in the app. */
function VerseText({ a, surah }: { a: Ayah; surah: number }) {
  const { theme, arabicSize, tajweed } = useApp();
  const ink = theme.dark ? 0 : 1;
  const marked = tajweed ? tajweedText(surah, a.n) : null;
  const pieces = useMemo(() => {
    if (!marked) return null;
    const p = parseTajweed(marked);
    return a.n === 1 && surah !== 1 && surah !== 9 ? dropBasmala(p) : p;
  }, [marked, a.n, surah]);
  const end = <Arabic size={18} color={theme.primary}>{` ۝${arabicDigits(a.n)}`}</Arabic>;
  if (!pieces) return <Arabic>{a.arabic}{end}</Arabic>;
  return (
    <Arabic>
      {pieces.map((p, i) => <RNText key={i} style={p.rule ? { color: TAJWEED_COLORS[p.rule][ink] } : null}>{p.text}</RNText>)}
      {end}
    </Arabic>
  );
}

/** Word by word: Arabic, transliteration and the English meaning of each word, right to left. */
function Words({ words }: { words: Word[] }) {
  const { theme } = useApp();
  return (
    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 }}>
      {words.map((w, i) => (
        <View key={i} style={{ alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.chip, maxWidth: 150 }}>
          <RNText style={{ fontFamily: theme.fonts.arabic, fontSize: 22, lineHeight: 40, color: theme.arabicInk }}>{w.ar}</RNText>
          <RNText style={{ fontSize: 11.5, color: theme.accent, textAlign: 'center' }}>{w.tr}</RNText>
          <RNText style={{ fontSize: 11.5, color: theme.ink, textAlign: 'center' }}>{w.en}</RNText>
        </View>
      ))}
    </View>
  );
}

function Verse({ a, surah, current, words, onPlay }: { a: Ayah; surah: number; current: boolean; words?: Word[]; onPlay: () => void }) {
  const app = useApp();
  const { t, theme, scheme, mode, showTranslit, showTranslation, bookmarks, setPrefs, hifz } = app;
  const marked = bookmarks.some(b => b.n === surah && b.ayah === a.n);
  const toggleMark = () => setPrefs({ bookmarks: marked ? bookmarks.filter(b => !(b.n === surah && b.ayah === a.n)) : [{ n: surah, ayah: a.n, at: Date.now() }, ...bookmarks].slice(0, 50) });
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState('');
  const translit = transliterate(a.arabic, { scheme, mode });
  const hidden = hifz && !shown;

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
    <View style={{ paddingVertical: 14, paddingHorizontal: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: theme.line, backgroundColor: current ? theme.chip : 'transparent', borderRadius: current ? 16 : 0, marginHorizontal: -8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${t.playFrom} ${a.n}`} onPress={onPlay}><StarNum n={a.n} size={34} /></Pressable>
        <View style={{ flex: 1 }}>
          {hidden ? (
            <Pressable accessibilityRole="button" onPress={() => setShown(true)} style={{ minHeight: 56, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: theme.line, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 12 }}>
              <Arabic size={22} selectable={false}>{`${a.arabic.split(' ')[0]} …`}</Arabic>
              <Text style={{ fontSize: 12, color: theme.muted }}>{t.tapToShow}</Text>
            </Pressable>
          ) : <VerseText a={a} surah={surah} />}
        </View>
      </View>
      {!hidden && words ? <Words words={words} /> : null}
      {!hidden && showTranslit ? <Text selectable style={{ fontSize: 15.5, lineHeight: 23, color: theme.accent, fontWeight: '500' }}>{translit}</Text> : null}
      {!hidden && showTranslation && a.translation ? <Body>{a.translation}</Body> : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <SmallBtn title={`▶ ${a.n}`} onPress={onPlay} />
        <SmallBtn title={open ? '–' : '…'} onPress={() => setOpen(o => !o)} />
        <SmallBtn title={marked ? `🔖 ${t.bookmarked}` : t.bookmark} tone={marked ? 'accent' : undefined} onPress={toggleMark} />
        {hifz && shown ? <SmallBtn title={t.hideAgain} onPress={() => setShown(false)} /> : null}
        {open ? <>
          {textEngine(app) === 'claude' ? <SmallBtn title={t.explainVerse} tone="accent" onPress={explain} disabled={busy} /> : null}
          <SmallBtn title={t.copy} onPress={() => Clipboard.setStringAsync(`${a.arabic}\n${translit}\n${a.translation}\n(${SURAHS[surah - 1].name} ${surah}:${a.n})`).catch(() => {})} />
        </> : null}
      </View>
      {busy ? <ActivityIndicator color={theme.primary} /> : null}
      {err ? <Body muted>{err}</Body> : null}
      {res ? <ResultView r={res} /> : null}
    </View>
  );
}

/** Player at the bottom of a sūra: play/pause, previous/next verse, repeat count (ḥifẓ) and download. */
function Player({ n }: { n: number }) {
  const { t, theme, reciter, hifz, hifzRepeat } = useApp();
  const rec = useRecitation();
  const [msg, setMsg] = useState('');
  const here = rec.now && rec.now.surah === n ? rec.now : null;
  const prog = rec.progress[n];
  const done = rec.downloaded(n);
  const name = RECITERS.find(r => r.id === reciter)?.name ?? reciter;
  const dl = async () => {
    if (prog && !prog.error) { rec.cancel(n); return; }
    setMsg('');
    const r = await rec.download(n);
    setMsg(r === 'wifi' ? t.needWifi : r === 'error' ? t.downloadFail : '');
  };
  return (
    <View style={{ gap: 4 }}>
      {msg ? <Text style={{ fontSize: 12, color: theme.danger, textAlign: 'center' }}>{msg}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line, borderRadius: 22, padding: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={here?.playing ? t.pause : t.play} onPress={() => (here ? rec.toggle() : rec.play(n, 1))}
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
          {here?.loading ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={{ color: theme.onPrimary, fontSize: 18, fontWeight: '700' }}>{here?.playing ? '❚❚' : '▶'}</Text>}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: '700', color: theme.ink }}>{here ? `${t.verse} ${here.ayah} / ${SURAHS[n - 1].ayahs}${hifz && hifzRepeat > 1 ? ` · ${here.rep}/${hifzRepeat}` : ''}` : t.listenSurah}</Text>
          <Text numberOfLines={1} style={{ fontSize: 11.5, color: theme.muted }}>{`${name} · ${done ? t.onPhone : prog ? `${prog.done}/${prog.total}` : t.streamed}`}</Text>
          {prog ? <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.chip, marginTop: 4 }}><View style={{ width: `${Math.round((prog.done / prog.total) * 100)}%`, height: 4, borderRadius: 2, backgroundColor: theme.primary }} /></View> : null}
        </View>
        {here ? <SmallBtn title="‹" onPress={() => rec.step(-1)} /> : null}
        {here ? <SmallBtn title="›" onPress={() => rec.step(1)} /> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={done ? t.onPhone : t.downloadSurah} disabled={done} onPress={dl}
          style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: done ? theme.good : theme.primary, alignItems: 'center', justifyContent: 'center' }}>
          <DownloadIcon state={done ? 'done' : prog && !prog.error ? 'busy' : 'idle'} part={prog ? prog.done / prog.total : 0} />
        </Pressable>
      </View>
    </View>
  );
}

export default function Surah({ n, ayah, onBack, go }: { n: number; ayah?: number; onBack: () => void; go: (r: Route) => void }) {
  const app = useApp();
  const lib = useQuran();
  const { t, theme, lang, editions, scheme, mode, showTranslit, showTranslation, setPrefs, tajweed, wbw, hifz, hifzRepeat } = app;
  const info = SURAHS[n - 1];
  const rec = useRecitation();
  const playing = rec.now && rec.now.surah === n ? rec.now.ayah : 0;
  const [words, setWords] = useState<WbwSurah | null>(null);
  const [wbwErr, setWbwErr] = useState('');
  useEffect(() => {
    if (!wbw || words) return;
    setWbwErr('');
    loadWbw(n, info.ayahs).then(setWords).catch(() => setWbwErr(t.wbwFail));
  }, [wbw, n]); // eslint-disable-line react-hooks/exhaustive-deps
  const edition = pickEdition(lang, editions[lang]);
  const [data, setData] = useState<SurahText | null>(null);
  const [err, setErr] = useState('');
  const [cached, setCached] = useState(false);
  const list = useRef<FlatList<Ayah>>(null);
  // Remembers where you are, for "Continue reading".
  const setPrefsRef = useRef(setPrefs); setPrefsRef.current = setPrefs;
  const onViewable = useRef(({ viewableItems }: { viewableItems: { item: Ayah }[] }) => {
    const first = viewableItems[0]?.item;
    if (first) setPrefsRef.current({ lastRead: { n, ayah: first.n } });
  });

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
  // Follows the recitation: the verse being recited is scrolled into view.
  useEffect(() => {
    if (data && playing) list.current?.scrollToIndex({ index: Math.min(playing - 1, data.ayahs.length - 1), animated: true, viewPosition: 0.2 });
  }, [playing, data]);

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
          onViewableItemsChanged={onViewable.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          onScrollToIndexFailed={i => setTimeout(() => list.current?.scrollToIndex({ index: i.index, animated: true }), 400)}
          ListHeaderComponent={
            <View style={{ gap: 10, paddingBottom: 6 }}>
              <Card style={{ paddingVertical: 10, gap: 0 }}>
                <Toggle title={t.showTranslit} on={showTranslit} onChange={v => setPrefs({ showTranslit: v })} />
                <Toggle title={t.showTranslation} on={showTranslation} onChange={v => setPrefs({ showTranslation: v })} />
                {hasTajweed() ? <Toggle title={t.tajweedColors} on={tajweed} onChange={v => setPrefs({ tajweed: v })} /> : null}
                <Toggle title={t.wordByWord} on={wbw} onChange={v => setPrefs({ wbw: v })} />
                <Toggle title={t.hifzMode} on={hifz} onChange={v => setPrefs({ hifz: v })} />
                {hifz ? <View style={{ gap: 6, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, color: theme.muted }}>{t.hifzSub}</Text>
                  <Segmented options={[['1', '1×'], ['3', '3×'], ['5', '5×'], ['10', '10×']]} value={String(hifzRepeat) as '1' | '3' | '5' | '10'} onChange={v => setPrefs({ hifzRepeat: Number(v) })} />
                </View> : null}
                {wbw ? <Text style={{ fontSize: 12, color: wbwErr ? theme.danger : theme.muted }}>{wbwErr || (words ? t.wbwNote : t.loading)}</Text> : null}
                {tajweed && hasTajweed() ? <TajweedLegend /> : null}
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
          contentContainerStyle={{ paddingBottom: 12 }}
          extraData={`${playing}:${words ? 1 : 0}:${tajweed}:${hifz}`}
          renderItem={({ item }) => <Verse a={item} surah={n} current={playing === item.n} words={wbw ? words?.[item.n] : undefined} onPlay={() => rec.play(n, item.n)} />}
        />
      ) : null}
      {data ? <Player n={n} /> : null}
    </Screen>
  );
}
