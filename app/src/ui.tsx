import React from 'react';
import { Pressable, StyleSheet, Text as RNText, TextInput as RNTextInput, TextInputProps, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { useApp } from './store';
import { Theme } from './theme';

// Text and TextInput that pick the theme's font family from fontWeight (custom fonts need one family per weight).
function familyFor(theme: Theme, weight: unknown, explicit?: string) {
  if (explicit) return explicit;
  const w = String(weight ?? '400');
  const f = theme.fonts;
  return w === '700' || w === 'bold' ? f.bold : w === '800' || w === '900' ? f.extrabold : w === '600' ? f.semibold : w === '500' ? f.medium : f.regular;
}
export function Text({ style, ...rest }: TextProps) {
  const { theme } = useApp();
  const f = StyleSheet.flatten(style) ?? {};
  const fam = familyFor(theme, f.fontWeight, f.fontFamily);
  return <RNText {...rest} style={[style, fam ? { fontFamily: fam, fontWeight: undefined } : null]} />;
}
export function TextInput({ style, ...rest }: TextInputProps) {
  const { theme } = useApp();
  const f = StyleSheet.flatten(style) ?? {};
  const fam = familyFor(theme, f.fontWeight, f.fontFamily);
  return <RNTextInput {...rest} style={[style, fam ? { fontFamily: fam, fontWeight: undefined } : null]} />;
}

/** Arabic text: Amiri, right to left, generous line height so the vowel marks are not clipped. */
export function Arabic({ children, size, color, style, selectable = true, center }: { children: React.ReactNode; size?: number; color?: string; style?: TextStyle; selectable?: boolean; center?: boolean }) {
  const { theme, arabicSize } = useApp();
  const fs = size ?? arabicSize;
  return (
    <RNText selectable={selectable} style={[{ fontFamily: theme.fonts.arabic, fontSize: fs, lineHeight: Math.round(fs * 1.9), color: color ?? theme.arabicInk, writingDirection: 'rtl', textAlign: center ? 'center' : 'right' }, style]}>
      {children}
    </RNText>
  );
}

// Screen frame that never ends up under the Android status bar or gesture bar.
export function Screen({ children, bottom = true }: { children: React.ReactNode; bottom?: boolean }) {
  const { theme } = useApp();
  const i = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: i.top + 12, paddingBottom: bottom ? i.bottom + 12 : 0, paddingHorizontal: 16, gap: 14 }}>
      {children}
    </View>
  );
}

export function H1({ children, size = 28 }: { children: React.ReactNode; size?: number }) {
  const { theme } = useApp();
  return <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '600', fontSize: size, color: theme.ink, letterSpacing: -0.4 }}>{children}</Text>;
}
export function Sub({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();
  return <Text style={{ fontSize: 14, color: theme.muted, marginTop: 2 }}>{children}</Text>;
}
export function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  const { theme } = useApp();
  return <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: color ?? theme.accent }}>{children}</Text>;
}
export function Body({ children, muted, style }: { children: React.ReactNode; muted?: boolean; style?: TextStyle }) {
  const { theme } = useApp();
  return <Text selectable style={[{ fontSize: 15, lineHeight: 22, color: muted ? theme.muted : theme.ink }, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { theme } = useApp();
  return <View style={[{ backgroundColor: theme.card, borderColor: theme.line, borderWidth: 1, borderRadius: 22, padding: 16, gap: 12 }, style]}>{children}</View>;
}

export function Btn({ title, onPress, kind = 'primary', disabled }: { title: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }) {
  const { theme } = useApp();
  const bg = kind === 'primary' ? theme.primary : theme.card;
  const fg = kind === 'primary' ? theme.onPrimary : kind === 'danger' ? theme.danger : theme.ink;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => ({ minHeight: 52, paddingHorizontal: 16, borderRadius: 16, backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1, alignItems: 'center', justifyContent: 'center', borderWidth: kind === 'primary' ? 0 : 1, borderColor: kind === 'danger' ? theme.danger : theme.line })}>
      <Text style={{ color: fg, fontSize: 16, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}

export function SmallBtn({ title, onPress, tone, disabled }: { title: string; onPress: () => void; tone?: 'accent'; disabled?: boolean }) {
  const { theme } = useApp();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => ({ minHeight: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: theme.chip, borderWidth: tone === 'accent' ? 1 : 0, borderColor: theme.accent, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : pressed ? 0.8 : 1 })}>
      <Text style={{ color: tone === 'accent' ? theme.accent : theme.ink, fontWeight: '600', fontSize: 14 }}>{title}</Text>
    </Pressable>
  );
}

export function Header({ title, sub, onBack, right }: { title: string; sub?: string; onBack: () => void; right?: React.ReactNode }) {
  const { theme, t } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable accessibilityLabel={t.back} accessibilityRole="button" onPress={onBack}
        style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.muted, fontSize: 22 }}>‹</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <H1 size={22}>{title}</H1>
        {sub ? <Sub>{sub}</Sub> : null}
      </View>
      {right}
    </View>
  );
}

export function Row({ title, sub, right, onPress, danger }: { title: string; sub?: string; right?: string; onPress?: () => void; danger?: boolean }) {
  const { theme } = useApp();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: danger ? theme.danger : theme.ink }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 13, color: theme.muted }}>{sub}</Text> : null}
      </View>
      {right ? <Text style={{ fontSize: 13, fontWeight: '600', color: theme.muted, maxWidth: 150, textAlign: 'right' }} numberOfLines={1}>{right}</Text> : null}
      <Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

/** A choice in a list: radio dot, title and description. */
export function Choice({ title, sub, on, onPress, children }: { title: string; sub?: string; on: boolean; onPress: () => void; children?: React.ReactNode }) {
  const { theme } = useApp();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress}
      style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: on ? theme.primary : theme.line, backgroundColor: on ? theme.chip : theme.card }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? theme.primary : theme.muted, alignItems: 'center', justifyContent: 'center' }}>
        {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} /> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.ink }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 18 }}>{sub}</Text> : null}
        {children}
      </View>
    </Pressable>
  );
}

/** Two or three options side by side. */
export function Segmented<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  const { theme } = useApp();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: theme.chip, borderRadius: 14, padding: 4, gap: 4 }}>
      {options.map(([k, label]) => {
        const on = k === value;
        return (
          <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(k)}
            style={{ flex: 1, minHeight: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? theme.card : 'transparent', borderWidth: on ? 1 : 0, borderColor: theme.line, paddingHorizontal: 6 }}>
            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '600', color: on ? theme.ink : theme.muted }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ title, on, onChange }: { title: string; on: boolean; onChange: (v: boolean) => void }) {
  const { theme } = useApp();
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={() => onChange(!on)} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 12 }}>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: theme.ink }}>{title}</Text>
      <View style={{ width: 48, height: 28, borderRadius: 14, padding: 3, backgroundColor: on ? theme.primary : theme.chip, alignItems: on ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: on ? theme.onPrimary : theme.muted }} />
      </View>
    </Pressable>
  );
}

export type TabName = 'today' | 'quran' | 'translate' | 'learn' | 'dhikr';

/** Room at the bottom of a tab page, so the last line can be scrolled up above the floating menu. */
export const TAB_SPACE = 96;

// Two-tone icons for the bottom bar (24 x 24): soft fill and a line in the tab's color.
function TabIcon({ tab, color, fill }: { tab: TabName; color: string; fill: string }) {
  const line = { stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const beads = Array.from({ length: 10 }, (_, i) => i * 0.5236 - 1.05);
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {tab === 'today' ? <>
        <Path {...line} fill={fill} d="M15.6 4.2a8 8 0 1 0 4.2 11.6 6.4 6.4 0 1 1-4.2-11.6z" />
        <Path fill={color} d="M17.6 7.2l.7-1.5.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7z" />
      </> : null}
      {tab === 'quran' ? <>
        <Path {...line} fill={fill} d="M12 7.5c-2.2-1.6-5.2-2-8.5-1.5v11.5c3.3-.5 6.3 0 8.5 1.5 2.2-1.5 5.2-2 8.5-1.5V6c-3.3-.5-6.3-.1-8.5 1.5z" />
        <Path {...line} fill="none" d="M12 7.5V19M5 21.5l7-3 7 3" />
        <Path fill={color} d="M15 10.5l1.2-1.2 1.2 1.2-1.2 1.2z" />
      </> : null}
      {tab === 'translate' ? <>
        {/* the old dip pen: holder, ferrule and steel nib, writing a thin Arabic stroke */}
        <G transform="translate(5.6 19) rotate(45) scale(0.9) translate(-12 -26)">
          <Path d="M10.25 17 L9.75 11 L10.75 1.4 Q12 0 13.25 1.4 L14.25 11 L13.75 17 Z" fill={fill} stroke={color} strokeWidth={1.35} strokeLinejoin="round" />
          <Path d="M10 12.6 H14 M10.1 14.4 H13.9" stroke={color} strokeWidth={0.9} strokeLinecap="round" opacity={0.75} />
          <Rect x={9.9} y={17} width={4.2} height={2.1} rx={0.5} fill={color} />
          <Path d="M12 26 L10 21.2 Q9.8 19.7 10.3 19.1 H13.7 Q14.2 19.7 14 21.2 Z" fill={fill} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M12 25.5 V21.7" stroke={color} strokeWidth={0.9} strokeLinecap="round" />
          <Circle cx={12} cy={21} r={0.6} fill={color} />
        </G>
        <Path d="M22.2 16.2 c.3 1.6 -.6 2.9 -2.4 3.2 c-2.6 .5 -7.2 .6 -14 -.5" fill="none" stroke={color} strokeWidth={1.1} strokeLinecap="round" />
        <Path d="M15 19.7 c.1 -.9 -.1 -1.6 -.5 -2.1" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" />
        <Path d="M13.2 21.9 l.6 -.6 .6 .6 -.6 .6 z" fill={color} />
      </> : null}
      {tab === 'learn' ? <>
        <Rect x={3.5} y={3.5} width={17} height={17} rx={4.5} fill={fill} stroke={color} strokeWidth={1.6} />
        <Path d="M15.5 7.5v8" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M7 13.2c0 1.6 1.2 2.3 3 2.3s3-.7 3-2.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <Path d="M9.6 17.6l.6-.6.6.6-.6.6z" fill={color} />
      </> : null}
      {tab === 'dhikr' ? <>
        {beads.map((a, i) => <Circle key={i} cx={12 + 7.2 * Math.cos(a)} cy={11 + 7.2 * Math.sin(a)} r={1.55} fill={fill} stroke={color} strokeWidth={1.2} />)}
        <Path d="M12 18.2v2.6M10.6 22h2.8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Circle cx={12} cy={11} r={1.8} fill={color} />
      </> : null}
    </Svg>
  );
}

/** The bottom menu: floats over the page and is slightly see-through, so long pages show faintly behind it. */
export function TabBar({ tab, setTab }: { tab: TabName; setTab: (t: TabName) => void }) {
  const { theme, t } = useApp();
  const i = useSafeAreaInsets();
  const items: [TabName, string][] = [['today', t.tabToday], ['quran', t.tabQuran], ['translate', t.tabTranslate], ['learn', t.tabLearn], ['dhikr', t.tabDhikr]];
  const glass = theme.dark ? 'rgba(19,34,37,0.78)' : 'rgba(250,248,244,0.86)';
  return (
    <View style={{ position: 'absolute', left: 12, right: 12, bottom: i.bottom + 8, flexDirection: 'row', gap: 2, backgroundColor: glass, borderColor: theme.dark ? 'rgba(232,176,74,0.22)' : theme.line, borderWidth: 1, borderRadius: 24, padding: 5, elevation: 8, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }}>
      {items.map(([k, label]) => {
        const on = tab === k, color = on ? theme.tabActive : theme.muted;
        const fill = on ? (theme.dark ? 'rgba(232,176,74,0.22)' : 'rgba(38,35,31,0.12)') : (theme.dark ? 'rgba(183,198,195,0.08)' : 'rgba(106,99,88,0.08)');
        return (
          <Pressable key={k} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: on }} onPress={() => setTab(k)}
            style={{ flex: 1, minHeight: 60, borderRadius: 19, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: on ? (theme.dark ? 'rgba(232,176,74,0.12)' : theme.chip) : 'transparent', borderWidth: on ? 1 : 0, borderColor: theme.dark ? 'rgba(232,176,74,0.5)' : theme.line }}>
            <TabIcon tab={k} color={color} fill={fill} />
            <Text numberOfLines={1} style={{ fontSize: 10.5, fontWeight: on ? '700' : '600', color, maxWidth: '100%', paddingHorizontal: 1 }}>{label}</Text>
            {on ? <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: theme.tabActive }} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Gear in the top right corner that opens Settings; a ring glows around it when a new version is out. */
export function GearButton({ onPress, glow }: { onPress: () => void; glow?: boolean }) {
  const { theme, t } = useApp();
  const c = theme.dark ? '#E8B04A' : theme.ink;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={glow ? `${t.settings} · ${t.newVersion}` : t.settings} onPress={onPress} hitSlop={8}
      style={({ pressed }) => ({ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card, borderWidth: glow ? 2 : 1, borderColor: glow ? '#E8B04A' : theme.line, opacity: pressed ? 0.8 : 1,
        shadowColor: '#E8B04A', shadowOpacity: glow ? 0.9 : 0, shadowRadius: glow ? 10 : 0, elevation: glow ? 10 : 0 })}>
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z" stroke={c} strokeWidth={1.7} fill="none" />
        <Path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.6-1.5L14.1 2.5h-4l-.4 2.5a7.5 7.5 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.3.9 2-3.4z" stroke={c} strokeWidth={1.5} strokeLinejoin="round" fill="none" />
      </Svg>
      {glow ? <View style={{ position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E8B04A', borderWidth: 2, borderColor: theme.card }} /> : null}
    </Pressable>
  );
}

/** Title of a tab page with the gear on the right. */
export function PageTitle({ title, sub, onGear, glow, right }: { title: string; sub?: string; onGear: () => void; glow?: boolean; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ flex: 1 }}><H1>{title}</H1>{sub ? <Sub>{sub}</Sub> : null}</View>
      {right}
      <GearButton onPress={onGear} glow={glow} />
    </View>
  );
}

/** Small preview of a theme (used in the theme picker). */
export function ThemePreview({ th }: { th: Theme }) {
  return (
    <View style={{ width: 120, height: 200, borderRadius: 16, backgroundColor: th.bg, borderWidth: 1, borderColor: th.line, padding: 10, gap: 8 }}>
      <View style={{ height: 10, width: 60, borderRadius: 5, backgroundColor: th.ink }} />
      <View style={{ height: 46, borderRadius: 10, backgroundColor: th.card, borderWidth: 1, borderColor: th.line, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 8 }}>
        <RNText style={{ fontFamily: th.fonts.arabic, fontSize: 18, color: th.arabicInk }}>أَلِف</RNText>
      </View>
      <View style={{ height: 8, width: 70, borderRadius: 4, backgroundColor: th.accent }} />
      <View style={{ height: 8, width: 90, borderRadius: 4, backgroundColor: th.muted }} />
      <View style={{ flex: 1 }} />
      <View style={{ height: 28, borderRadius: 10, backgroundColor: th.primary }} />
    </View>
  );
}

/** The Alif mark: gold ring with an eight-pointed star and the letter alif. */
export function AlifMark({ size = 54 }: { size?: number }) {
  const { theme } = useApp();
  const gold = theme.dark ? '#E8B04A' : theme.accent;
  const k = size / 54;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 54 54" style={StyleSheet.absoluteFill}>
        <Circle cx={27} cy={27} r={25} stroke={gold} strokeWidth={2} fill="none" />
        <Rect x={13} y={13} width={28} height={28} stroke={gold} strokeOpacity={0.45} strokeWidth={1} fill="none" />
        <Rect x={13} y={13} width={28} height={28} stroke={gold} strokeOpacity={0.45} strokeWidth={1} fill="none" rotation={45} origin="27, 27" />
      </Svg>
      <RNText style={{ fontFamily: theme.fonts.arabicBold, fontSize: 30 * k, lineHeight: 40 * k, color: gold, includeFontPadding: false, marginTop: 4 * k }}>ا</RNText>
    </View>
  );
}

export const styles = StyleSheet.create({ fill: { flex: 1 } });
