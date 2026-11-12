// Parts of the Today page: the prayer-time clock and the picture with the ṣalawāt.
import React from 'react';
import { Image, Pressable, Text as RNText, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { useApp } from './store';
import { PRAYERS, PRAYER_TR, PrayerDay, PrayerName, SALAH } from './core/prayer';
import { HOME_FOCUS, HOME_IMAGES } from './homeImages';

const pt = (minutes: number, r: number, c: number) => {
  const a = ((minutes / 60 - 12) / 24) * 2 * Math.PI;
  return { x: c + r * Math.sin(a), y: c - r * Math.cos(a) };
};
const arc = (m0: number, m1: number, r: number, c: number) => {
  const a = pt(m0, r, c), b = pt(m1, r, c);
  const span = (((m1 - m0) % 1440) + 1440) % 1440;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} A${r} ${r} 0 ${span > 720 ? 1 : 0} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
};

/**
 * A 24-hour clock: midnight at the bottom, noon at the top. The prayers are dots on the ring at their times, the sun
 * moves round with the time, and the ring is light between sunrise and Maghrib. The next prayer glows in gold.
 */
export function PrayerClock({ day, now, next, size }: { day: PrayerDay; now: Date; next?: PrayerName; size: number }) {
  const { theme } = useApp();
  const c = 160, R = 118;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const gold = theme.dark ? '#E8B04A' : '#9C6B22';
  const ink = theme.ink, muted = theme.muted;
  const ticks = [];
  for (let m = 0; m < 96; m++) {
    const big = m % 4 === 0, a = pt(m * 15, big ? 146 : 146, c), b = pt(m * 15, big ? 136 : 141, c);
    ticks.push(<Line key={m} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={muted} strokeOpacity={big ? 0.7 : 0.3} strokeWidth={big ? 1.6 : 0.8} />);
  }
  const sun = pt(nowMin, R, c);
  return (
    <Svg width={size} height={size} viewBox="0 0 320 320">
      <Defs>
        <LinearGradient id="day" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor={gold} stopOpacity={0.4} />
          <Stop offset="0.5" stopColor={theme.dark ? '#FBE7B0' : '#C8963E'} />
          <Stop offset="1" stopColor={gold} stopOpacity={0.55} />
        </LinearGradient>
        <RadialGradient id="face" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={theme.chip} />
          <Stop offset="1" stopColor={theme.bg} />
        </RadialGradient>
        <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FBE7B0" stopOpacity={0.8} />
          <Stop offset="1" stopColor="#FBE7B0" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={c} cy={c} r={150} fill="url(#face)" />
      {ticks}
      {([[0, '24'], [360, '6'], [720, '12'], [1080, '18']] as [number, string][]).map(([m, l]) => {
        const p = pt(m, 126, c);
        return <SvgText key={l} x={p.x} y={p.y + 4} fontSize={11} fontWeight="700" fill={muted} textAnchor="middle">{l}</SvgText>;
      })}
      <Circle cx={c} cy={c} r={R} fill="none" stroke={theme.line} strokeWidth={10} />
      <Path d={arc(day.times.sunrise, day.times.maghrib, R, c)} fill="none" stroke="url(#day)" strokeWidth={10} strokeLinecap="round" />
      <Path d={arc(day.times.fajr, day.times.sunrise, R, c)} fill="none" stroke={theme.accent} strokeOpacity={0.45} strokeWidth={10} />
      <Path d={arc(day.times.maghrib, day.times.isha, R, c)} fill="none" stroke={theme.danger} strokeOpacity={0.4} strokeWidth={10} />
      {PRAYERS.map(k => {
        const p = pt(day.times[k], R, c), on = k === next, l = pt(day.times[k], R - 30, c);
        return (
          <React.Fragment key={k}>
            <Circle cx={p.x} cy={p.y} r={on ? 7 : 5} fill={on ? gold : theme.bg} stroke={on ? '#FBE7B0' : ink} strokeWidth={2} />
            <SvgText x={l.x} y={l.y + 4} fontSize={on ? 11.5 : 9.5} fontWeight={on ? '700' : '600'} fill={on ? gold : ink} textAnchor="middle">{PRAYER_TR[k]}</SvgText>
          </React.Fragment>
        );
      })}
      <Circle cx={sun.x} cy={sun.y} r={16} fill="url(#sunGlow)" />
      <Circle cx={sun.x} cy={sun.y} r={7.5} fill="#FBE7B0" stroke={gold} strokeWidth={1} />
    </Svg>
  );
}

/** Minutes as "1 h 05 min" / "17 min". */
export function untilText(min: number, lang: 'sv' | 'en'): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60), r = m % 60;
  if (lang === 'sv') return h ? `om ${h} tim ${String(r).padStart(2, '0')} min` : `om ${r} min`;
  return h ? `in ${h} h ${String(r).padStart(2, '0')} min` : `in ${r} min`;
}

/** Times of the day in a row; tap one to turn its notification on or off. */
export function TimesRow({ day, next, notify, onToggle }: { day: PrayerDay; next?: PrayerName; notify: Record<PrayerName, boolean>; onToggle: (k: PrayerName) => void }) {
  const { theme, t } = useApp();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {PRAYERS.map(k => {
        const on = k === next, canNotify = SALAH.includes(k);
        const hh = `${String(Math.floor(((day.times[k] % 1440) + 1440) % 1440 / 60)).padStart(2, '0')}:${String(((day.times[k] % 60) + 60) % 60).padStart(2, '0')}`;
        return (
          <Pressable key={k} disabled={!canNotify} onPress={() => onToggle(k)} accessibilityRole={canNotify ? 'button' : undefined}
            accessibilityLabel={`${PRAYER_TR[k]} ${hh}${canNotify ? ` · ${notify[k] ? t.notifOn : t.notifOff}` : ''}`}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: on ? theme.primary : theme.line, backgroundColor: on ? theme.chip : theme.card }}>
            <RNText numberOfLines={1} style={{ fontFamily: theme.fonts.bold, fontWeight: theme.fonts.bold ? undefined : '700', fontSize: 9.5, color: on ? theme.primary : theme.muted }}>{PRAYER_TR[k]}{canNotify ? (notify[k] ? ' ●' : ' ○') : ''}</RNText>
            <RNText style={{ fontFamily: theme.fonts.bold, fontWeight: theme.fonts.bold ? undefined : '700', fontSize: 13.5, color: theme.ink }}>{hh}</RNText>
          </Pressable>
        );
      })}
    </View>
  );
}

// The ṣalawāt above the picture: Arabic, with the transliteration under it.
const SALAWAT_TR = 'Allāhumma ṣalli ʿalā sayyidinā Muḥammadin wa ʿalā ālihi wa aṣḥābihi wa sallim';
const SALAWAT_AR = 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَأَصْحَابِهِ وَسَلِّمْ';

/**
 * One of the pictures, with its own colours; only the edges fade into the background on every side.
 * The ṣalawāt is written in gold over it: transliteration first, the Arabic under it.
 */
export function HomeArt({ index, height }: { index: number; height: number }) {
  const { theme } = useApp();
  const i = ((index % HOME_IMAGES.length) + HOME_IMAGES.length) % HOME_IMAGES.length;
  const src = HOME_IMAGES[i];
  const { width } = useWindowDimensions();
  // Fill the width and keep the strip around the picture's subject (the Kaʿba, the green dome …) instead of the middle.
  const dim = Image.resolveAssetSource(src);
  const ratio = dim?.width && dim?.height ? dim.height / dim.width : 1;
  let w = width, h = width * ratio;
  if (h < height) { h = height; w = height / ratio; }
  const top = -(h - height) * (HOME_FOCUS[i] ?? 0.5), left = -(w - width) / 2;
  const bg = theme.bg;
  const shadow = { textShadowColor: 'rgba(0,0,0,0.85)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } };
  return (
    <View style={{ height, width, marginHorizontal: -16, overflow: 'hidden' }}>
      {dim
        ? <Image source={src} resizeMode="cover" style={{ position: 'absolute', left, top, width: w, height: h }} />
        : <Image source={src} resizeMode="cover" style={{ position: 'absolute', left: 0, top: 0, width, height }} />}
      <Svg width="100%" height="100%" style={{ position: 'absolute' }} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="edge" cx="50%" cy="52%" rx="62%" ry="56%">
            <Stop offset="0.35" stopColor={bg} stopOpacity={0} />
            <Stop offset="0.62" stopColor={bg} stopOpacity={0.4} />
            <Stop offset="0.92" stopColor={bg} stopOpacity={1} />
          </RadialGradient>
          <LinearGradient id="tb" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={bg} stopOpacity={1} />
            <Stop offset="0.2" stopColor={bg} stopOpacity={0.55} />
            <Stop offset="0.42" stopColor={bg} stopOpacity={0} />
            <Stop offset="0.62" stopColor={bg} stopOpacity={0} />
            <Stop offset="0.85" stopColor={bg} stopOpacity={0.7} />
            <Stop offset="1" stopColor={bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill="url(#tb)" />
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 10, alignItems: 'center', paddingHorizontal: 16 }}>
        <RNText style={{ fontFamily: theme.fonts.arabicBold, fontSize: 23, lineHeight: 42, color: '#E8B04A', textAlign: 'center', writingDirection: 'rtl', ...shadow }}>{SALAWAT_AR}</RNText>
        <RNText style={{ fontFamily: theme.fonts.bold ?? undefined, fontWeight: theme.fonts.bold ? undefined : '700', fontSize: 13.5, lineHeight: 19, color: '#F3D9A0', textAlign: 'center', marginTop: 2, ...shadow }}>{SALAWAT_TR}</RNText>
      </View>
    </View>
  );
}

/**
 * A picture from edge to edge (the page's ScrollView must reach the screen's edges and pad its content by 16), cropped
 * around its subject and fading into the page colour at the top and the bottom.
 */
export function PictureBand({ src, focus = 0.5, height, children }: { src: import('react-native').ImageSourcePropType; focus?: number; height: number; children?: React.ReactNode }) {
  const { theme } = useApp();
  const { width } = useWindowDimensions();
  const dim = typeof src === 'number' ? Image.resolveAssetSource(src) : null;
  const ratio = dim?.width && dim?.height ? dim.height / dim.width : 1.6;
  let w = width, h = width * ratio;
  if (h < height) { h = height; w = height / ratio; }
  const top = -(h - height) * focus, left = -(w - width) / 2;
  const bg = theme.bg;
  return (
    <View style={{ height, width, marginHorizontal: -16, overflow: 'hidden' }}>
      <Image source={src} resizeMode="cover" style={{ position: 'absolute', left, top, width: w, height: h }} />
      <Svg width="100%" height="100%" style={{ position: 'absolute' }} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="pb" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={bg} stopOpacity={1} />
            <Stop offset="0.22" stopColor={bg} stopOpacity={0.45} />
            <Stop offset="0.45" stopColor={bg} stopOpacity={0} />
            <Stop offset="0.6" stopColor={bg} stopOpacity={0} />
            <Stop offset="0.82" stopColor={bg} stopOpacity={0.6} />
            <Stop offset="1" stopColor={bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill="url(#pb)" />
      </Svg>
      {children}
    </View>
  );
}
