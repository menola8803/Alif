import React from 'react';
import { Image, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { pictureFor } from '../pictures';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const SHADOW = { textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 };

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
  const { t, theme, lang, place, school, prayerNotify, setPrefs, awradDay, awradCounts, awradLevel, todayImg } = app;
  const top = todayImg === 'none' ? null : pictureFor(todayImg);
  const ins = useSafeAreaInsets();
  const lift = ins.top + 12; // the Screen's top padding: the picture reaches up behind the status bar
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
    // With a picture the page reaches the screen's edges, so the picture can go from edge to edge and up to the top.
    <ScrollView style={top ? { marginHorizontal: -16, marginTop: -lift } : undefined}
      contentContainerStyle={{ gap: 12, paddingBottom: TAB_SPACE, paddingHorizontal: top ? 16 : 0 }} showsVerticalScrollIndicator={false}>
      {top ? (
        // The chosen picture behind the title and the next prayer, fading into the page colour.
        <View style={{ marginHorizontal: -16, height: Math.min(width * 1.15, 470) + lift, marginBottom: -8 }}>
          <Image source={top.src} resizeMode="cover" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' }} />
          <Svg width="100%" height="100%" style={{ position: 'absolute' }} preserveAspectRatio="none" viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="tt" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.bg} stopOpacity={0.75} />
                <Stop offset="0.2" stopColor={theme.bg} stopOpacity={0.15} />
                <Stop offset="0.4" stopColor={theme.bg} stopOpacity={0} />
                <Stop offset="0.62" stopColor={theme.bg} stopOpacity={0.35} />
                <Stop offset="0.85" stopColor={theme.bg} stopOpacity={0.85} />
                <Stop offset="1" stopColor={theme.bg} stopOpacity={1} />
              </LinearGradient>
              {/* a soft shade behind the next prayer, so the time reads well on any picture */}
              <RadialGradient id="tc" cx="50" cy="78" rx="42" ry="20" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={theme.bg} stopOpacity={0.6} />
                <Stop offset="0.6" stopColor={theme.bg} stopOpacity={0.3} />
                <Stop offset="1" stopColor={theme.bg} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={100} height={100} fill="url(#tt)" />
            <Rect x={0} y={0} width={100} height={100} fill="url(#tc)" />
          </Svg>
          <View style={{ paddingHorizontal: 16, paddingTop: lift }}>
            <PageTitle title={t.tabToday} sub={`${longDate(now, lang)} · ${hijriText(h)}`} onGear={onGear} glow={glow} />
          </View>
          {next ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t.prayerTimes} onPress={() => go({ name: 'prayer' })} style={{ position: 'absolute', left: 0, right: 0, bottom: 36, alignItems: 'center' }}>
              <Text style={{ fontSize: 11.5, fontWeight: '700', letterSpacing: 1.3, color: '#F3D9A0', ...SHADOW }}>{t.nextPrayer.toUpperCase()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF', ...SHADOW }}>{PRAYER_TR[next.name]}</Text>
                <Arabic size={22} selectable={false} color="#F3D9A0" style={{ lineHeight: 40, ...SHADOW }}>{PRAYER_AR[next.name]}</Arabic>
              </View>
              <Text style={{ fontSize: 44, fontWeight: '800', color: '#E8B04A', lineHeight: 50, ...SHADOW }}>{`${String(next.at.getHours()).padStart(2, '0')}:${String(next.at.getMinutes()).padStart(2, '0')}`}</Text>
              <Text style={{ fontSize: 13, color: '#F3D9A0', ...SHADOW }}>{untilText(next.minutes, lang)}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : <>
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
      </>}
      {today ? <TimesRow day={today} next={next?.name} notify={prayerNotify} onToggle={toggle} /> : null}
      <Text style={{ fontSize: 11.5, color: theme.muted, textAlign: 'center' }} onPress={() => go({ name: 'prayer' })}>
        {`${place.name} · MWL · ʿaṣr ${school === 'hanafi' ? 'Ḥanafī' : t.asrStandard} · ${source === 'aladhan' ? 'Aladhan' : t.calcOnPhone} ›`}
      </Text>

      <Tile title={t.awrad} sub={`${doneSteps} / ${steps.length} ${t.awradStepsDone}`} onPress={() => go({ name: 'awrad' })}
        right={<Arabic size={18} selectable={false} style={{ lineHeight: 32 }}>أَوْرَاد</Arabic>} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Tile half title={t.qibla} sub={`${Math.round(q)}° ${compassPoint(q, lang)}`} onPress={() => go({ name: 'qibla' })} />
        <Tile half title={t.mosques} sub={t.mosquesNear} onPress={() => go({ name: 'mosques' })} />
      </View>
      {/* One card for the Hijri calendar: the month, the next special day and, when it is near, the next sacred month. */}
      <Tile gold title={`${h.d} ${month.tr} ${h.y}`}
        sub={[
          special.days === 0 ? `${t.todayIs} ${special.day.tr}` : `${special.day.tr} · ${shortDate(special.date, lang)} · ${t.inDays.replace('{n}', String(special.days))}`,
          sacred.days <= 45 ? `${t.sacredMonth}: ${sacred.month.tr} · ${t.inDays.replace('{n}', String(sacred.days))}` : '',
        ].filter(Boolean).join('\n')}
        onPress={() => go({ name: 'hijri' })} right={<Arabic size={18} selectable={false} style={{ lineHeight: 32 }}>{month.ar}</Arabic>} />

      <HomeArt index={image} height={320} />
    </ScrollView>
  );
}
