import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../store';
import { SURAHS } from '../core/quran';
import { arabicDigits } from '../translate';
import { useQuran } from '../library';
import { Card, H1, SmallBtn, Sub, Text, TextInput } from '../ui';

/** Eight-pointed star with a number in it (verse and sūra numbers). */
export function StarNum({ n, size = 40, hideNumber }: { n: number; size?: number; hideNumber?: boolean }) {
  const { theme } = useApp();
  const r = size / 2 - 1, c = size / 2, s = r / Math.SQRT2;
  const d = `M${c - s} ${c - s}H${c + s}V${c + s}H${c - s}ZM${c} ${c - r}L${c + r} ${c}L${c} ${c + r}L${c - r} ${c}Z`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}><Path d={d} stroke={theme.primary} strokeOpacity={0.7} strokeWidth={1.2} fill="none" /></Svg>
      {hideNumber ? <View style={{ width: 8, height: 8, backgroundColor: theme.primary, transform: [{ rotate: '45deg' }] }} /> : <Text style={{ fontSize: size > 34 ? 12 : 10, fontWeight: '700', color: theme.ink }}>{n}</Text>}
    </View>
  );
}

export default function Quran({ open, onAwrad }: { open: (n: number) => void; onAwrad: () => void }) {
  const { t, theme } = useApp();
  const lib = useQuran();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const k = q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʿʾ'-]/g, '');
    if (!k) return SURAHS;
    return SURAHS.filter(s => String(s.number) === k || s.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʿʾ'-]/g, '').includes(k));
  }, [q]);

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View><H1>{t.quranTitle}</H1><Sub>{t.quranSub}</Sub></View>
      <Pressable accessibilityRole="button" onPress={onAwrad}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: theme.primary, backgroundColor: theme.chip, opacity: pressed ? 0.85 : 1 })}>
        <StarNum n={0} hideNumber />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>{t.awrad}</Text>
          <Text style={{ fontSize: 13, color: theme.muted }}>{t.awradSub}</Text>
        </View>
        <Text style={{ fontFamily: theme.fonts.arabic, fontSize: 18, lineHeight: 32, color: theme.arabicInk }}>أَوْرَاد</Text>
      </Pressable>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
        {lib.status === 'loading' ? <ActivityIndicator color={theme.primary} /> : <View style={{ width: 10, height: 10, backgroundColor: lib.status === 'ready' ? theme.good : theme.danger, transform: [{ rotate: '45deg' }] }} />}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 18 }}>
            {lib.status === 'ready' ? t.libReady : lib.status === 'loading' ? (lib.arabicReady ? t.libArabicOnly : t.libLoading) : t.libError}
          </Text>
          <Text style={{ fontSize: 11, color: theme.muted }}>{lib.edition} · {t.libSource}</Text>
        </View>
        {lib.status === 'error' ? <SmallBtn title={t.libDownload} tone="accent" onPress={lib.ensure} /> : null}
      </Card>
      <TextInput value={q} onChangeText={setQ} placeholder={t.searchSurah} placeholderTextColor={theme.muted}
        style={{ minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.card, paddingHorizontal: 14, color: theme.ink, fontSize: 15 }} />
      <FlatList
        data={list}
        keyExtractor={s => String(s.number)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.line, marginLeft: 56 }} />}
        renderItem={({ item: s }) => (
          <Pressable accessibilityRole="button" onPress={() => open(s.number)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}>
            <StarNum n={s.number} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.ink }}>{s.name}</Text>
              <Text style={{ fontSize: 13, color: theme.muted }}>{s.ayahs} {t.verses}</Text>
            </View>
            <Text style={{ fontFamily: theme.fonts.arabic, fontSize: 19, lineHeight: 34, color: theme.arabicInk }}>{lib.surahName(s.number) ?? arabicDigits(s.number)}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
