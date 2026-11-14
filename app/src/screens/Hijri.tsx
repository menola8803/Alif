import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useApp } from '../store';
import { usePrayer } from '../prayer';
import { MONTHS, SPECIAL_DAYS, fromHijri, monthLength, toHijri } from '../core/hijri';
import { WEEK_SHORT, shortDate } from '../dates';
import { Arabic, Card, Header, Label, Screen, Text, useButtonLook } from '../ui';
import { RamadanYears } from './RamadanYears';

/** Hijri calendar: a month with the Swedish/English dates under the Hijri ones, and the twelve months with their names. */
export default function HijriScreen({ onBack, tab: firstTab }: { onBack: () => void; tab?: 'month' | 'ramadan' }) {
  const { t, theme, lang } = useApp();
  const { hijriOffset, now } = usePrayer();
  const today = toHijri(now, hijriOffset);
  const [view, setView] = useState({ y: today.y, m: today.m });
  const [tab, setTab] = useState<'month' | 'ramadan'>(firstTab ?? 'month');
  const look = useButtonLook();
  const month = MONTHS[view.m - 1];
  const len = monthLength(view.y, view.m);
  const first = fromHijri({ y: view.y, m: view.m, d: 1 }, hijriOffset);
  const lastG = fromHijri({ y: view.y, m: view.m, d: len }, hijriOffset);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const step = (k: number) => setView(v => { const m = v.m + k; return m < 1 ? { y: v.y - 1, m: 12 } : m > 12 ? { y: v.y + 1, m: 1 } : { y: v.y, m }; });
  const specials = SPECIAL_DAYS.filter(s => s.m === view.m);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < lead; i++) cells.push(<View key={`e${i}`} style={{ width: '14.28%', height: 52 }} />);
  for (let d = 1; d <= len; d++) {
    const g = new Date(first.getFullYear(), first.getMonth(), first.getDate() + d - 1);
    const isToday = view.y === today.y && view.m === today.m && d === today.d;
    const special = specials.some(s => s.d === d);
    const fast = g.getDay() === 1 || g.getDay() === 4;
    cells.push(
      <View key={d} style={{ width: '14.28%', height: 52, padding: 2 }}>
        <View style={{ flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: isToday ? theme.primary : theme.card, borderWidth: 1, borderColor: special ? theme.primary : theme.line }}>
          {fast && !isToday ? <View style={{ position: 'absolute', top: 4, right: 5, width: 5, height: 5, borderRadius: 3, backgroundColor: theme.accent }} /> : null}
          <Text style={{ fontSize: 15, fontWeight: '700', color: isToday ? theme.onPrimary : theme.ink }}>{d}</Text>
          <Text style={{ fontSize: 9.5, color: isToday ? theme.onPrimary : theme.muted }}>{g.getDate() === 1 || d === 1 ? shortDate(g, lang) : g.getDate()}</Text>
        </View>
      </View>,
    );
  }

  return (
    <Screen>
      <Header title={t.hijriCalendar} sub={`${today.d} ${MONTHS[today.m - 1].tr} ${today.y}`} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['month', 'ramadan'] as const).map(k => (
            <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} onPress={() => setTab(k)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: tab === k ? look.border : theme.line, backgroundColor: tab === k ? look.bg : 'transparent' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: tab === k ? look.fg : theme.muted }}>{k === 'month' ? t.monthTab : t.ramTab}</Text>
            </Pressable>
          ))}
        </View>
        {tab === 'ramadan' ? <RamadanYears /> : <>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t.prevMonth} onPress={() => step(-1)} hitSlop={10} style={{ padding: 10 }}><Text style={{ fontSize: 24, color: theme.muted }}>‹</Text></Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Arabic size={30} center selectable={false} color={theme.primary}>{`${month.ar} ${view.y}`}</Arabic>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>{month.tr} {view.y}</Text>
            <Text style={{ fontSize: 12, color: theme.muted }}>{`${view.m}. ${month[lang]} · ${shortDate(first, lang)} – ${shortDate(lastG, lang)}`}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t.nextMonth} onPress={() => step(1)} hitSlop={10} style={{ padding: 10 }}><Text style={{ fontSize: 24, color: theme.muted }}>›</Text></Pressable>
        </View>
        <View style={{ flexDirection: 'row' }}>{WEEK_SHORT[lang].map(w => <Text key={w} style={{ width: '14.28%', textAlign: 'center', fontSize: 11, fontWeight: '700', color: theme.muted }}>{w}</Text>)}</View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{cells}</View>
        <Text style={{ fontSize: 11.5, color: theme.muted }}>{t.hijriLegend}</Text>
        {specials.length ? (
          <Card style={{ borderColor: theme.primary }}>
            <Label color={theme.primary}>{t.specialDays}</Label>
            {specials.map(s => <Text key={s.d} style={{ fontSize: 14, color: theme.ink }}>{`${s.d} ${month.tr} · ${s.tr} – ${s[lang]}`}</Text>)}
          </Card>
        ) : null}

        <Label>{t.theMonths}</Label>
        {MONTHS.map(m => (
          <Pressable key={m.n} accessibilityRole="button" onPress={() => setView({ y: m.n < today.m ? today.y + 1 : today.y, m: m.n })}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderColor: m.n === today.m ? theme.primary : theme.line }}>
              <Text style={{ width: 22, fontSize: 12, fontWeight: '700', color: theme.muted, textAlign: 'center' }}>{m.n}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, fontWeight: '700', color: theme.ink }}>{m.tr}{m.sacred ? `  · ${t.sacred}` : ''}</Text>
                <Text style={{ fontSize: 12, color: theme.muted }}>{m[lang]}</Text>
              </View>
              <Arabic size={20} selectable={false} style={{ lineHeight: 36 }}>{m.ar}</Arabic>
            </Card>
          </Pressable>
        ))}
        <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 18 }}>{t.hijriSource}</Text>
        </>}
      </ScrollView>
    </Screen>
  );
}
