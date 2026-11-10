import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, Vibration, View } from 'react-native';
import { AlifNativeModule } from '../../modules/alif-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../store';
import { Route } from '../nav';
import { DHIKR, targetOf } from '../core/dhikr';
import { SALAWAT, SALAWAT_SAYYIDINA } from '../core/awrad';
import { Arabic, Card, Label, PageTitle, SmallBtn, TAB_SPACE, Text, Toggle } from '../ui';

const TARGETS = [33, 99, 100, 313, 1000];

/** Dhikr counter (tap the circle; a short buzz each time and a longer one at the goal), Daily Awrad and ṣalawāt. */
export default function Dhikr({ go, onGear, glow, focused = true }: { go: (r: Route) => void; onGear: () => void; glow: boolean; focused?: boolean }) {
  const { t, theme, lang, dhikrSel, dhikrCounts, dhikrTargets, setPrefs, dhikrVolume } = useApp();
  const d = DHIKR.find(x => x.id === dhikrSel) ?? DHIKR[0];
  const count = dhikrCounts[d.id] ?? 0;
  const target = targetOf(d, dhikrTargets);
  const done = count >= target;
  const tap = () => {
    const n = count + 1;
    setPrefs({ dhikrCounts: { ...dhikrCounts, [d.id]: n } });
    if (n === target) Vibration.vibrate([0, 120, 80, 220]); else Vibration.vibrate(12);
  };
  // Volume buttons count while this page is on screen and the option is on; otherwise they change the volume as usual.
  const tapRef = useRef(tap); tapRef.current = tap;
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => { const s = AppState.addEventListener('change', st => setActive(st === 'active')); return () => s.remove(); }, []);
  const capture = dhikrVolume && focused && active;
  useEffect(() => {
    if (!AlifNativeModule) return;
    AlifNativeModule.captureVolumeKeys(capture);
    if (!capture) return;
    const sub = AlifNativeModule.addListener('onVolumeKey', () => tapRef.current());
    return () => { sub.remove(); AlifNativeModule?.captureVolumeKeys(false); };
  }, [capture]);
  const reset = () => setPrefs({ dhikrCounts: { ...dhikrCounts, [d.id]: 0 } });
  const R = 120, C = 2 * Math.PI * R, part = Math.min(1, count / target);

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: TAB_SPACE }} showsVerticalScrollIndicator={false}>
      <PageTitle title={t.tabDhikr} sub={t.dhikrSub} onGear={onGear} glow={glow} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0, flexShrink: 0 }}>
        {DHIKR.map(x => (
          <Pressable key={x.id} accessibilityRole="button" accessibilityState={{ selected: x.id === d.id }} onPress={() => setPrefs({ dhikrSel: x.id })}
            style={{ paddingHorizontal: 12, minHeight: 40, justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: x.id === d.id ? theme.primary : theme.line, backgroundColor: x.id === d.id ? theme.chip : theme.card }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: x.id === d.id ? theme.primary : theme.ink }}>{x.tr}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Arabic size={30} center>{d.ar}</Arabic>
        <Text style={{ fontSize: 15, color: theme.accent, fontWeight: '600', textAlign: 'center' }}>{d.tr}</Text>
        <Text style={{ fontSize: 13, color: theme.muted, textAlign: 'center' }}>{d[lang]}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${t.tapToCount}: ${count} / ${target}`} onPress={tap}
          style={({ pressed }) => ({ width: 270, height: 270, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <Svg width={270} height={270} viewBox="0 0 270 270" style={{ position: 'absolute' }}>
            <Circle cx={135} cy={135} r={R} stroke={theme.line} strokeWidth={12} fill={theme.card} />
            <Circle cx={135} cy={135} r={R} stroke={done ? theme.good : theme.primary} strokeWidth={12} fill="none" strokeLinecap="round"
              strokeDasharray={`${C * part} ${C}`} rotation={-90} origin="135, 135" />
          </Svg>
          <Text style={{ fontSize: 64, fontWeight: '800', color: done ? theme.good : theme.ink }}>{count}</Text>
          <Text style={{ fontSize: 14, color: theme.muted }}>/ {target}{done ? ` · ${t.countDone}` : ''}</Text>
          <Text style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>{t.tapToCount}</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {[d.target, ...TARGETS.filter(x => x !== d.target)].map(n => (
          <SmallBtn key={n} title={`${n}`} tone={n === target ? 'accent' : undefined} onPress={() => setPrefs({ dhikrTargets: { ...dhikrTargets, [d.id]: n } })} />
        ))}
        <SmallBtn title={t.resetCount} onPress={reset} />
      </View>

      <Pressable accessibilityRole="button" onPress={() => go({ name: 'awrad' })}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: theme.primary }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>{t.awrad}</Text>
            <Text style={{ fontSize: 12.5, color: theme.muted }}>{t.awradWithIhda}</Text>
          </View>
          <Arabic size={18} selectable={false} style={{ lineHeight: 32 }}>أَوْرَاد</Arabic>
          <Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>
        </Card>
      </Pressable>
      <Card>
        <Label>{t.salawatTitle}</Label>
        <Arabic size={24}>{SALAWAT_SAYYIDINA}</Arabic>
        <Text style={{ fontSize: 14, color: theme.accent }}>Allāhumma ṣalli ʿalā sayyidinā Muḥammadin wa ʿalā ālihi wa ṣaḥbihi wa sallim</Text>
        <Arabic size={24}>{SALAWAT}</Arabic>
        <Text style={{ fontSize: 14, color: theme.accent }}>Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammadin wa sallim</Text>
        <Text style={{ fontSize: 13, color: theme.muted }}>{t.salawatMeaning}</Text>
      </Card>
    </ScrollView>
  );
}
