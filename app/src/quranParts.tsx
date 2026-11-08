import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useApp } from './store';
import { TAJWEED_COLORS, TajweedRule } from './core/tajweed';
import { Text } from './ui';
import { useRecitation } from './recitation';

/** ⤓ to download, a ring while downloading, a green tick when the sūra is on the phone. */
export function DownloadIcon({ state, part = 0, size = 22 }: { state: 'idle' | 'busy' | 'done'; part?: number; size?: number }) {
  const { theme } = useApp();
  if (state === 'done') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="rgba(95,196,180,0.15)" stroke={theme.good} strokeWidth={1.6} />
      <Path d="M8 12.3l2.6 2.6L16 9.5" stroke={theme.good} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
  if (state === 'busy') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" stroke={theme.line} strokeWidth={2.4} />
      <Circle cx={12} cy={12} r={9} fill="none" stroke={theme.primary} strokeWidth={2.4} strokeDasharray={`${Math.max(2, 56.5 * part)} 60`} rotation={-90} origin="12, 12" strokeLinecap="round" />
    </Svg>
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" stroke={theme.primary} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** The download button in the sūra list. */
export function SurahDownload({ n }: { n: number }) {
  const { t } = useApp();
  const rec = useRecitation();
  const prog = rec.progress[n];
  const done = rec.downloaded(n);
  const busy = !!prog && !prog.error;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={done ? t.onPhone : busy ? t.cancel : t.downloadSurah} disabled={done} hitSlop={8}
      onPress={async () => { if (busy) { rec.cancel(n); return; } const r = await rec.download(n); if (r === 'wifi' || r === 'error') Alert.alert(t.downloadSurah, r === 'wifi' ? t.needWifi : t.downloadFail); }} style={{ padding: 6 }}>
      <DownloadIcon state={done ? 'done' : busy ? 'busy' : 'idle'} part={prog ? prog.done / prog.total : 0} />
    </Pressable>
  );
}

const LEGEND: TajweedRule[] = ['hamza_wasl', 'madd_normal', 'madd_necessary', 'qalqala', 'ikhfa', 'idgham_ghunna', 'iqlab', 'ghunna'];

export function TajweedLegend() {
  const { t, theme } = useApp();
  const ink = theme.dark ? 0 : 1;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 6 }}>
      {LEGEND.map(r => (
        <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: TAJWEED_COLORS[r][ink] }} />
          <Text style={{ fontSize: 11.5, color: theme.muted }}>{t.tajweedRules[r]}</Text>
        </View>
      ))}
    </View>
  );
}
