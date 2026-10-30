import React from 'react';
import { Pressable, StyleSheet, Text as RNText, TextInput as RNTextInput, TextInputProps, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
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

export type TabName = 'camera' | 'text' | 'quran' | 'history' | 'settings';

// Line icons for the bottom bar (24 x 24, drawn with the text color of the tab).
function TabIcon({ tab, color }: { tab: TabName; color: string }) {
  const p = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {tab === 'camera' ? <>
        <Path {...p} d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
        <Circle {...p} cx={12} cy={12.8} r={3.4} />
      </> : null}
      {tab === 'text' ? <>
        <Path {...p} d="M4 20h4L19 9l-4-4L4 16z" />
        <Path {...p} d="M13.5 6.5l4 4" />
      </> : null}
      {tab === 'quran' ? <>
        <Path {...p} d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" />
        <Path {...p} d="M12 6.5v13" />
      </> : null}
      {tab === 'history' ? <>
        <Circle {...p} cx={12} cy={12} r={8} />
        <Path {...p} d="M12 7.5V12l3 2" />
      </> : null}
      {tab === 'settings' ? <>
        <Path {...p} d="M4 7h8M18 7h2M4 12h2M12 12h8M4 17h10M20 17h0" />
        <Circle {...p} cx={15} cy={7} r={2.2} />
        <Circle {...p} cx={9} cy={12} r={2.2} />
        <Circle {...p} cx={17} cy={17} r={2.2} />
      </> : null}
    </Svg>
  );
}

export function TabBar({ tab, setTab }: { tab: TabName; setTab: (t: TabName) => void }) {
  const { theme, t } = useApp();
  const items: [TabName, string][] = [['camera', t.tabCamera], ['text', t.tabText], ['quran', t.tabQuran], ['history', t.tabHistory], ['settings', t.tabSettings]];
  return (
    <View style={{ flexDirection: 'row', gap: 2, backgroundColor: theme.card, borderColor: theme.line, borderWidth: 1, borderRadius: 22, padding: 5 }}>
      {items.map(([k, label]) => {
        const on = tab === k, color = on ? theme.tabActive : theme.muted;
        return (
          <Pressable key={k} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: on }} onPress={() => setTab(k)}
            style={{ flex: 1, minHeight: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center', gap: 3, backgroundColor: on ? theme.chip : 'transparent' }}>
            <TabIcon tab={k} color={color} />
            <Text numberOfLines={1} style={{ fontSize: 10.5, fontWeight: '600', color, maxWidth: '100%', paddingHorizontal: 1 }}>{label}</Text>
          </Pressable>
        );
      })}
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
