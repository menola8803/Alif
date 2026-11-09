import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useApp } from '../store';
import { useQuran } from '../library';
import { useRecitation } from '../recitation';
import { Ayah, SURAHS } from '../core/quran';
import { JUZ, juzRange } from '../core/juz';
import { transliterate } from '../core/translit';
import { Arabic, Body, Btn, Card, Header, Screen, Text } from '../ui';
import { Verse } from './Surah';
import { Route } from '../nav';

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
type Item = { k: 'head'; surah: number } | { k: 'ayah'; surah: number; a: Ayah };

/** One part (juz) of the Qur'an, read straight through: the sūras in it, with a heading where each sūra begins. */
export default function JuzScreen({ n, onBack, go }: { n: number; onBack: () => void; go: (r: Route) => void }) {
  const { t, theme, scheme, mode, showTranslit, setPrefs } = useApp();
  const lib = useQuran();
  const rec = useRecitation();
  const z = JUZ[n - 1];
  const items = useMemo<Item[] | null>(() => {
    if (!lib.arabicReady) return null;
    const out: Item[] = [];
    for (const [s, from, to] of juzRange(n)) {
      const ayahs = lib.ayahs(s, from, to);
      if (!ayahs) return null;
      if (from === 1) out.push({ k: 'head', surah: s });
      for (const a of ayahs) out.push({ k: 'ayah', surah: s, a });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lib.arabicReady, lib.translationReady, n]);
  const playing = rec.now ? `${rec.now.surah}:${rec.now.ayah}` : '';
  const list = useRef<FlatList<Item>>(null);
  const setPrefsRef = useRef(setPrefs); setPrefsRef.current = setPrefs;
  const onViewable = useRef(({ viewableItems }: { viewableItems: { item: Item }[] }) => {
    const first = viewableItems.find(v => v.item.k === 'ayah')?.item;
    if (first && first.k === 'ayah') setPrefsRef.current({ lastRead: { n: first.surah, ayah: first.a.n } });
  });
  useEffect(() => {
    if (!items || !playing) return;
    const i = items.findIndex(x => x.k === 'ayah' && `${x.surah}:${x.a.n}` === playing);
    if (i >= 0) list.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.2 });
  }, [playing, items]);

  return (
    <Screen>
      <Header title={`${t.juz} ${n}`} sub={`${SURAHS[z.surah - 1].name} ${z.ayah}`} onBack={onBack} right={<Arabic size={20} selectable={false} style={{ lineHeight: 36 }}>{z.ar}</Arabic>} />
      {!items ? (
        <Card style={{ alignItems: 'center', paddingVertical: 28, gap: 8 }}>
          {lib.status === 'error' ? <><Body>{t.libError}</Body><Btn title={t.libDownload} onPress={lib.ensure} /></> : <><ActivityIndicator color={theme.primary} /><Text style={{ color: theme.muted }}>{t.loading}</Text></>}
        </Card>
      ) : (
        <FlatList
          ref={list}
          data={items}
          keyExtractor={x => (x.k === 'head' ? `h${x.surah}` : `${x.surah}:${x.a.n}`)}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewable.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          onScrollToIndexFailed={i => setTimeout(() => list.current?.scrollToIndex({ index: i.index, animated: true }), 400)}
          contentContainerStyle={{ paddingBottom: 12 }}
          extraData={playing}
          renderItem={({ item: x }) => x.k === 'head' ? (
            <View style={{ alignItems: 'center', paddingTop: 18, paddingBottom: 6, gap: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted }} onPress={() => go({ name: 'surah', n: x.surah })}>{`${x.surah}. ${SURAHS[x.surah - 1].name} ›`}</Text>
              <Arabic size={30} center color={theme.primary}>{lib.surahName(x.surah) ?? ''}</Arabic>
              {x.surah !== 1 && x.surah !== 9 ? <>
                <Arabic center>{BASMALA}</Arabic>
                {showTranslit ? <Text style={{ color: theme.accent, fontSize: 15 }}>{transliterate(BASMALA, { scheme, mode })}</Text> : null}
              </> : null}
            </View>
          ) : (
            <Verse a={x.a} surah={x.surah} current={playing === `${x.surah}:${x.a.n}`} onPlay={() => rec.play(x.surah, x.a.n)} />
          )}
        />
      )}
    </Screen>
  );
}
