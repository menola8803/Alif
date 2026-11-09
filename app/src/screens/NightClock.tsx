import React, { useEffect, useState } from 'react';
import { AppState, Pressable, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../store';
import { usePrayer } from '../prayer';
import { PRAYER_TR, SALAH, hhmm } from '../core/prayer';
import { MONTHS, toHijri } from '../core/hijri';
import { AlifNativeModule } from '../../modules/alif-native';
import { Text } from '../ui';

/**
 * Night clock: the screen saver inside Alif, for phones without Android's screen saver (OnePlus and others).
 * A clock and today's prayer times in the widget's look on black; the screen stays on and is dimmed. With the light
 * theme the card is toned down and the screen dimmed further, so it does not dazzle. The card moves a little every
 * minute (burn-in). Tap to show the close button.
 */
export default function NightClockScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, place } = useApp();
  const { today, next, hijriOffset } = usePrayer();
  const { width, height } = useWindowDimensions();
  const [now, setNow] = useState(new Date());
  const [shift, setShift] = useState({ x: 0, y: 0 });
  const [ui, setUi] = useState(true);
  const dark = theme.dark;

  useEffect(() => {
    const on = () => AlifNativeModule?.screenAwake(true, dark ? 0.2 : 0.04);
    on();
    const s = AppState.addEventListener('change', st => (st === 'active' ? on() : AlifNativeModule?.screenAwake(false, -1)));
    return () => { s.remove(); AlifNativeModule?.screenAwake(false, -1); };
  }, [dark]);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    const mv = setInterval(() => setShift({ x: Math.round((Math.random() - 0.5) * width * 0.2), y: Math.round((Math.random() - 0.5) * height * 0.3) }), 60000);
    return () => { clearInterval(id); clearInterval(mv); };
  }, [width, height]);
  useEffect(() => { if (!ui) return; const id = setTimeout(() => setUi(false), 5000); return () => clearTimeout(id); }, [ui]);

  const gold = dark ? '#E8B04A' : '#C9A266';
  const h = toHijri(now, hijriOffset);
  return (
    <Pressable style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }} onPress={() => setUi(true)} accessibilityLabel={t.nightClock}>
      <StatusBar hidden />
      <View style={{ transform: [{ translateX: shift.x }, { translateY: shift.y }], width: Math.min(width - 48, 340), padding: 22, borderRadius: 16, borderWidth: 1,
        borderColor: dark ? 'rgba(232,176,74,0.6)' : 'rgba(201,162,102,0.7)', backgroundColor: dark ? '#132225' : '#6F6A60', opacity: dark ? 1 : 0.7 }}>
        <Text style={{ fontSize: 64, fontWeight: '300', color: gold, textAlign: 'center', lineHeight: 76 }}>{`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`}</Text>
        <Text style={{ fontSize: 14, color: gold, opacity: 0.85, textAlign: 'center', marginBottom: 12 }}>{`${h.d} ${MONTHS[h.m - 1].tr} ${h.y} · ${place.name}`}</Text>
        {today ? SALAH.map(k => {
          const on = next?.name === k && next.at.getDate() === now.getDate();
          return (
            <View key={k} style={{ flexDirection: 'row', paddingVertical: 4 }}>
              <Text style={{ flex: 1, fontSize: 22, color: gold, opacity: on ? 1 : 0.7, fontWeight: on ? '700' : '400' }}>{PRAYER_TR[k]}</Text>
              <Text style={{ fontSize: 22, color: gold, opacity: on ? 1 : 0.7, fontWeight: on ? '700' : '400' }}>{hhmm(today.times[k])}</Text>
            </View>
          );
        }) : null}
      </View>
      {ui ? (
        <Pressable accessibilityRole="button" onPress={onBack} style={{ position: 'absolute', bottom: 40, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(232,176,74,0.5)' }}>
          <Text style={{ color: gold, fontSize: 15, fontWeight: '600' }}>{t.close}</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}
