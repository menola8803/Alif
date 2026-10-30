import React from 'react';
import { Alert, FlatList, Pressable, ScrollView, View } from 'react-native';
import { useApp } from '../store';
import { SURAHS } from '../core/quran';
import { stripHarakat } from '../core/translit';
import { ResultView } from '../result';
import { Body, Btn, H1, Header, Screen, SmallBtn, Sub, Text } from '../ui';

const when = (at: number, lang: string) => new Date(at).toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function History({ open }: { open: (id: string) => void }) {
  const { t, theme, history, lang, clearHistory } = useApp();
  const kind = { camera: t.kindCamera, text: t.kindText, quran: t.kindQuran };
  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
        <View style={{ flex: 1 }}><H1>{t.historyTitle}</H1><Sub>{t.historySub}</Sub></View>
        {history.length ? <SmallBtn title={t.clear} onPress={() => Alert.alert(t.clearHistory, t.clearHistoryConfirm, [{ text: t.cancel, style: 'cancel' }, { text: t.delete, style: 'destructive', onPress: clearHistory }])} /> : null}
      </View>
      {!history.length ? <Body muted>{t.noHistory}</Body> : null}
      <FlatList
        data={history}
        keyExtractor={e => e.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item: e }) => {
          const q = e.result.quran;
          return (
            <Pressable accessibilityRole="button" onPress={() => open(e.id)}
              style={({ pressed }) => ({ backgroundColor: theme.card, borderColor: theme.line, borderWidth: 1, borderRadius: 18, padding: 14, gap: 4, opacity: pressed ? 0.8 : 1 })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent }}>{kind[e.kind]}{q ? ` · ${SURAHS[q.surah - 1]?.name} ${q.surah}:${q.from}` : ''}</Text>
                <Text style={{ fontSize: 12, color: theme.muted }}>{when(e.at, lang)}</Text>
              </View>
              <Text numberOfLines={1} style={{ fontFamily: theme.fonts.arabic, fontSize: 22, lineHeight: 40, color: theme.arabicInk, textAlign: 'right', writingDirection: 'rtl' }}>{stripHarakat(e.result.arabic).slice(0, 80)}</Text>
              <Text numberOfLines={2} style={{ fontSize: 14, color: theme.ink }}>{e.result.direction === 'x2ar' ? e.result.source : e.result.translation}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

export function EntryScreen({ id, onBack, openSurah }: { id: string; onBack: () => void; openSurah: (s: number, a: number) => void }) {
  const { t, history, removeHistory } = useApp();
  const e = history.find(h => h.id === id);
  return (
    <Screen>
      <Header title={t.historyTitle} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        {e ? <ResultView r={e.result} onOpenSurah={openSurah} /> : null}
        {e ? <Btn title={t.delete} kind="danger" onPress={() => { removeHistory(e.id); onBack(); }} /> : null}
      </ScrollView>
    </Screen>
  );
}
