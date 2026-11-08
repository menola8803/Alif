import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, useWindowDimensions, Vibration, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useApp } from '../store';
import { angleDiff, compassPoint, declination, distanceKm, headingFromMag, qibla } from '../core/qibla';
import { Arabic, Btn, Card, Header, Screen, Text } from '../ui';

/**
 * Qibla compass. The direction is worked out on the phone from the chosen place. The phone's compass shows which way the
 * phone points: with location on, Android's own heading (true north) is used; otherwise the magnetometer, corrected for
 * the magnetic declination in Scandinavia. A short vibration when the phone points at the Qibla.
 */
export default function QiblaScreen({ onBack, onMosques }: { onBack: () => void; onMosques?: () => void }) {
  const { t, theme, lang, place, useLocation } = useApp();
  const { width } = useWindowDimensions();
  const target = qibla(place.lat, place.lng);
  const [heading, setHeading] = useState<number | null>(null);
  const [noSensor, setNoSensor] = useState(false);
  const smooth = useRef<number | null>(null);
  const aligned = useRef(false);

  useEffect(() => {
    let stop: (() => void) | null = null;
    let alive = true;
    const feed = (h: number) => {
      const prev = smooth.current;
      const next = prev === null ? h : (prev + angleDiff(h, prev) * 0.25 + 360) % 360;
      smooth.current = next;
      if (alive) setHeading(next);
    };
    (async () => {
      if (useLocation) {
        try {
          const perm = await Location.getForegroundPermissionsAsync();
          if (perm.granted) {
            const sub = await Location.watchHeadingAsync(h => feed(h.trueHeading >= 0 ? h.trueHeading : h.magHeading + declination(place.lat, place.lng)));
            stop = () => sub.remove();
            return;
          }
        } catch {}
      }
      if (!(await Magnetometer.isAvailableAsync().catch(() => false))) { setNoSensor(true); return; }
      Magnetometer.setUpdateInterval(100);
      const dec = declination(place.lat, place.lng);
      const sub = Magnetometer.addListener(m => feed((headingFromMag(m.x, m.y) + dec + 360) % 360));
      stop = () => sub.remove();
    })();
    return () => { alive = false; stop?.(); };
  }, [useLocation, place.lat, place.lng]);

  const diff = heading === null ? null : angleDiff(target, heading);
  const isAligned = diff !== null && Math.abs(diff) <= 3;
  useEffect(() => {
    if (isAligned && !aligned.current) Vibration.vibrate(60);
    aligned.current = isAligned;
  }, [isAligned]);

  const size = Math.min(width - 32, 340);
  const C = 160, R = 140;
  const rot = -(heading ?? 0);
  const gold = theme.dark ? '#E8B04A' : '#9C6B22';
  const ticks = [];
  for (let d = 0; d < 360; d += 5) {
    const a = (d * Math.PI) / 180, l = d % 30 === 0 ? 14 : 7;
    ticks.push(<Line key={d} x1={C + (R - 6) * Math.sin(a)} y1={C - (R - 6) * Math.cos(a)} x2={C + (R - 6 - l) * Math.sin(a)} y2={C - (R - 6 - l) * Math.cos(a)} stroke={theme.muted} strokeOpacity={d % 30 === 0 ? 0.8 : 0.35} strokeWidth={d % 30 === 0 ? 1.6 : 0.8} />);
  }
  const points: [number, string][] = lang === 'sv' ? [[0, 'N'], [90, 'Ö'], [180, 'S'], [270, 'V']] : [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']];
  const qa = (target * Math.PI) / 180;
  const kx = C + (R - 18) * Math.sin(qa), ky = C - (R - 18) * Math.cos(qa);

  return (
    <Screen>
      <Header title={t.qibla} sub={t.qiblaSub} onBack={onBack} right={<Arabic size={22} selectable={false} style={{ lineHeight: 40 }}>ٱلْقِبْلَة</Arabic>} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12, alignItems: 'stretch' }} showsVerticalScrollIndicator={false}>
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.2, color: theme.accent }}>{t.place.toUpperCase()}</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>{place.name}</Text>
            <Text style={{ fontSize: 12, color: theme.muted }}>{useLocation ? t.locationOn : t.locationOffList}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: theme.primary }}>{Math.round(target)}°</Text>
            <Text style={{ fontSize: 12, color: theme.muted }}>{compassPoint(target, lang)} · {Math.round(distanceKm(place.lat, place.lng)).toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-GB')} km</Text>
          </View>
        </Card>
        <View style={{ alignItems: 'center' }}>
          <Svg width={size} height={size} viewBox="0 0 320 320">
            <Circle cx={C} cy={C} r={R} fill={theme.card} stroke={isAligned ? gold : theme.line} strokeWidth={isAligned ? 4 : 2} />
            <G rotation={rot} origin={`${C}, ${C}`}>
              {ticks}
              {points.map(([d, l]) => {
                const a = (d * Math.PI) / 180, x = C + (R - 36) * Math.sin(a), y = C - (R - 36) * Math.cos(a);
                return <SvgText key={l} x={x} y={y + 6} fontSize={17} fontWeight="700" fill={d === 0 ? theme.danger : theme.muted} textAnchor="middle" rotation={-rot} origin={`${x}, ${y}`}>{l}</SvgText>;
              })}
              <Line x1={C} y1={C} x2={C + (R - 40) * Math.sin(qa)} y2={C - (R - 40) * Math.cos(qa)} stroke={gold} strokeWidth={3} strokeLinecap="round" strokeDasharray="2 7" />
              <G rotation={-rot} origin={`${kx}, ${ky}`}>
                <Path d={`M${kx - 13} ${ky - 5} L${kx} ${ky - 11} L${kx + 13} ${ky - 5} L${kx + 13} ${ky + 11} L${kx} ${ky + 16} L${kx - 13} ${ky + 11} Z`} fill="#111" stroke={gold} strokeWidth={1.6} strokeLinejoin="round" />
                <Path d={`M${kx - 13} ${ky - 1} L${kx} ${ky + 5} L${kx + 13} ${ky - 1}`} fill="none" stroke={gold} strokeWidth={2.4} />
              </G>
            </G>
            <Path d={`M${C} 6 l-9 16 h18 z`} fill={isAligned ? gold : theme.ink} />
            <Circle cx={C} cy={C} r={44} fill={theme.bg} stroke={theme.line} />
            <SvgText x={C} y={C + 6} fontSize={24} fontWeight="700" fill={isAligned ? gold : theme.ink} textAnchor="middle">{heading === null ? '–' : `${Math.round(heading)}°`}</SvgText>
          </Svg>
        </View>
        <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '700', color: isAligned ? theme.primary : theme.ink }}>
          {noSensor ? t.noCompass : diff === null ? t.compassStarting : isAligned ? t.facingQibla : t.turnBy.replace('{n}', String(Math.abs(Math.round(diff)))).replace('{dir}', diff > 0 ? t.right : t.left)}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 13, color: theme.muted }}>{t.holdFlat}</Text>
        <Card><Text style={{ fontSize: 13, lineHeight: 19, color: theme.muted }}>{t.compassHelp}</Text></Card>
        {onMosques ? <Btn title={t.mosquesNear} kind="secondary" onPress={onMosques} /> : null}
      </ScrollView>
    </Screen>
  );
}
