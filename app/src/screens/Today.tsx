import React from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useApp } from '../store';
import { usePrayer } from '../prayer';
import { Route } from '../nav';
import { PRAYER_AR, PRAYER_TR, PrayerName } from '../core/prayer';
import { MONTHS, nextSacredMonth, nextSpecial, toHijri } from '../core/hijri';
import { qibla, compassPoint } from '../core/qibla';
import { AWRAD, countFor, dayKey } from '../core/awrad';
import { hijriText, longDate, shortDate } from '../dates';
import { askPermission } from '../reminder';
import { HomeArt, PrayerClock, TimesRow, untilText } from '../today';
import { Arabic, Card, PageTitle, TAB_SPACE, Text } from '../ui';

function Tile({ title, sub, right, onPress, gold, half }: { title: string; sub: string; right?: React.ReactNode; onPress: () => void; gold?: boolean; half?: boolean }) {
  const { theme } = useApp();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flex: half ? 1 : undefined, opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ padding: 14, gap: 4, borderColor: gold ? theme.primary : theme.line, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>{title}</Text>
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 17 }}>{sub}</Text>
        </View>
        {right}
        <Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>
      </Card>
    </Pressable>
  );
}

export default function Today({ go, onGear, glow, image }: { go: (r: Route) => void; onGear: () => void; glow: boolean; image: number }) {
  const app = useApp();
  const { t, theme, lang, place, school, prayerNotify, setPrefs, awradDay, awradCounts, awradLevel } = app;
  const { today, next, now, source, hijriOffset } = usePrayer();
  const { width } = useWindowDimensions();
  const h = toHijri(now, hijriOffset);
  const month = MONTHS[h.m - 1];
  const sacred = nextSacredMonth(now, hijriOffset);
  const special = nextSpecial(now, hijriOffset);
  const q = qibla(place.lat, place.lng);

  const steps = AWRAD.filter(s => !s.optional);
  const doneSteps = awradDay === dayKey(now) ? steps.filter(s => (awradCounts[s.id] ?? 0) >= countFor(s, awradLevel, now)).length : 0;

  const toggle = async (k: PrayerName) => {
    const on = !prayerNotify[k];
    if (on && !(await askPermission())) return;
    setPrefs({ prayerNotify: { ...prayerNotify, [k]: on } });
  };
  const clock = Math.min(width - 32, 360);

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: TAB_SPACE }} showsVerticalScrollIndicator={false}>
      <PageTitle title={t.tabToday} sub={`${longDate(now, lang)} · ${hijriText(h)}`} onGear={onGear} glow={glow} />

      {today ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t.prayerTimes} onPress={() => go({ name: 'prayer' })} style={{ alignItems: 'center' }}>
          <View style={{ width: clock, height: clock }}>
            <PrayerClock day={today} now={now} next={next?.name} size={clock} />
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              {next ? <>
                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: theme.accent }}>{t.nextPrayer.toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: theme.ink }}>{PRAYER_TR[next.name]}</Text>
                  <Arabic size={20} selectable={false} style={{ lineHeight: 36 }}>{PRAYER_AR[next.name]}</Arabic>
                </View>
                <Text style={{ fontSize: 32, fontWeight: '700', color: theme.primary, lineHeight: 38 }}>{`${String(next.at.getHours()).padStart(2, '0')}:${String(next.at.getMinutes()).padStart(2, '0')}`}</Text>
                <Text style={{ fontSize: 12.5, color: theme.muted }}>{untilText(next.minutes, lang)}</Text>
              </> : null}
            </View>
          </View>
        </Pressable>
      ) : null}
      {today ? <TimesRow day={today} next={next?.name} notify={prayerNotify} onToggle={toggle} /> : null}
      <Text style={{ fontSize: 11.5, color: theme.muted, textAlign: 'center' }} onPress={() => go({ name: 'prayer' })}>
        {`${place.name} · MWL · ʿaṣr ${school === 'hanafi' ? 'Ḥanafī' : t.asrStandard} · ${source === 'aladhan' ? 'Aladhan' : t.calcOnPhone} ›`}
      </Text>

      <Tile title={t.awrad} sub={`${doneSteps} / ${steps.length} ${t.awradStepsDone}`} onPress={() => go({ name: 'awrad' })}
        right={<Arabic size={18} selectable={false} style={{ lineHeight: 32 }}>أَوْرَاد</Arabic>} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Tile half title={t.qibla} sub={`${Math.round(q)}° ${compassPoint(q, lang)}`} onPress={() => go({ name: 'qibla' })} />
        <Tile half title={month.tr} sub={`${t.hijriMonth} ${h.m}`} onPress={() => go({ name: 'hijri' })} right={<Arabic size={17} selectable={false} style={{ lineHeight: 30 }}>{month.ar}</Arabic>} />
      </View>
      <Tile gold title={special.days === 0 ? `${t.todayIs} ${special.day.tr}` : `${special.day.tr}`}
        sub={special.days === 0 ? special.day[lang] : `${special.day[lang]} · ${shortDate(special.date, lang)} · ${t.inDays.replace('{n}', String(special.days))}`}
        onPress={() => go({ name: 'hijri' })} />
      {sacred.days <= 45 ? (
        <Tile title={`${t.sacredMonth}: ${sacred.month.tr}`} sub={`${sacred.month[lang]} · ${shortDate(sacred.date, lang)} · ${t.inDays.replace('{n}', String(sacred.days))}`}
          onPress={() => go({ name: 'hijri' })} right={<Arabic size={18} selectable={false} style={{ lineHeight: 32 }}>{sacred.month.ar}</Arabic>} />
      ) : null}

      <HomeArt index={image} height={320} />
    </ScrollView>
  );
}
