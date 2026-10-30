import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../store';
import { SURAHS } from '../core/quran';
import { arabicDigits } from '../translate';
import { H1, Sub, Text, TextInput } from '../ui';

/** Eight-pointed star with a number in it (verse and sūra numbers). */
export function StarNum({ n, size = 40 }: { n: number; size?: number }) {
  const { theme } = useApp();
  const r = size / 2 - 1, c = size / 2, s = r / Math.SQRT2;
  const d = `M${c - s} ${c - s}H${c + s}V${c + s}H${c - s}ZM${c} ${c - r}L${c + r} ${c}L${c} ${c + r}L${c - r} ${c}Z`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}><Path d={d} stroke={theme.primary} strokeOpacity={0.7} strokeWidth={1.2} fill="none" /></Svg>
      <Text style={{ fontSize: size > 34 ? 12 : 10, fontWeight: '700', color: theme.ink }}>{n}</Text>
    </View>
  );
}

export default function Quran({ open }: { open: (n: number) => void }) {
  const { t, theme } = useApp();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const k = q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʿʾ'-]/g, '');
    if (!k) return SURAHS;
    return SURAHS.filter(s => String(s.number) === k || s.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʿʾ'-]/g, '').includes(k));
  }, [q]);

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View><H1>{t.quranTitle}</H1><Sub>{t.quranSub}</Sub></View>
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
            <Text style={{ fontFamily: theme.fonts.arabic, fontSize: 18, color: theme.arabicInk }}>{arabicDigits(s.number)}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
