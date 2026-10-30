import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../store';
import { Spaced } from '../spaced';

// Start screen. Always dark, whatever theme is chosen. Same build as Direct's start screen (390 x 844 canvas scaled to
// the screen, native-driver animations), with an Arabic theme: an eight-pointed star (khātam) behind a gold alif,
// floating Arabic words with their transliteration and an English or Swedish meaning, and the three things the app does.

const W0 = 390;
const H0 = 844;
const SHOW_MS = 3600;
const SHOW_REDUCED_MS = 1200;
const FADE_MS = 450;
const MIN_SKIP_MS = 700;

const C = {
  bg: '#0B1416', teal: '#17393E', panel: '#132225', line: '#2A4448',
  gold: '#E8B04A', goldDim: '#8A6D2E', goldPale: '#F3D9A0', mint: '#5FC4B4',
  ink: '#B7C6C3', dim: '#8FA5A2',
};
const DISPLAY = 'Cinzel_700Bold';
const SANS = 'PlusJakartaSans_700Bold';
const SANS_REG = 'PlusJakartaSans_500Medium';
const ARABIC = 'Amiri_400Regular';
const ARABIC_BOLD = 'Amiri_700Bold';

type Ease = (t: number) => number;

function useEntrance(delay: number, duration: number, reduce: boolean, native = true) {
  const v = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    if (reduce) return;
    const a = Animated.timing(v, { toValue: 1, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: native });
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

function useLoop(kind: 'repeat' | 'pingpong', duration: number, delay: number, reduce: boolean, easing: Ease = Easing.linear) {
  const v = useRef(new Animated.Value(reduce ? 0.5 : 0)).current;
  useEffect(() => {
    if (reduce) return;
    const step = kind === 'repeat'
      ? Animated.timing(v, { toValue: 1, duration, easing, useNativeDriver: true })
      : Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]);
    const a = Animated.sequence([Animated.delay(delay), Animated.loop(step)]);
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

function usePulse(delay: number, reduce: boolean) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const cycle = Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(v, { toValue: 0, duration: 240, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.delay(2220),
    ]);
    const a = Animated.sequence([Animated.delay(delay), Animated.loop(cycle)]);
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

const lerp = (v: Animated.Value, from: number, to: number) => v.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

// Eight-pointed star (two squares, one turned 45°) centered on cx, cy with "radius" r.
function starPath(cx: number, cy: number, r: number) {
  const s = r / Math.SQRT2;
  const sq = `M${cx - s} ${cy - s}H${cx + s}V${cy + s}H${cx - s}Z`;
  const di = `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;
  return sq + di;
}

// ---- Background: faint khātam stars joined by thin lines ----

const STARS: [number, number, number, number][] = [
  [22, 214, 7, 600], [372, 196, 7, 1500], [24, 420, 6, 300], [366, 440, 6, 1100], [28, 612, 7, 1200], [364, 620, 7, 300],
];
const EDGES = 'M22 214L24 420L28 612M372 196L366 440L364 620';

function Star({ x, y, r, delay, reduce }: { x: number; y: number; r: number; delay: number; reduce: boolean }) {
  const v = useLoop('pingpong', 3600, delay, reduce);
  return (
    <Animated.View style={{ position: 'absolute', left: x - r - 2, top: y - r - 2, width: r * 2 + 4, height: r * 2 + 4, opacity: lerp(v, 0.2, 0.75) }}>
      <Svg width={r * 2 + 4} height={r * 2 + 4}><Path d={starPath(r + 2, r + 2, r)} stroke={C.mint} strokeWidth={1} fill="none" /></Svg>
    </Animated.View>
  );
}

function Pattern({ reduce }: { reduce: boolean }) {
  const fade = useEntrance(100, 900, reduce);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      <Svg width={W0} height={H0} style={StyleSheet.absoluteFill}>
        <Path d={EDGES} stroke={C.mint} strokeOpacity={0.12} strokeWidth={1} fill="none" />
      </Svg>
      {STARS.map(([x, y, r, d], i) => <Star key={i} x={x} y={y} r={r} delay={d} reduce={reduce} />)}
    </Animated.View>
  );
}

// ---- Floating words: Arabic, transliteration and meaning ----

type FW = { ar: string; tr: string; gloss: string; x: number; y: number; delay: number };

function Floating({ w, reduce }: { w: FW; reduce: boolean }) {
  const enter = useEntrance(250 + w.delay / 3, 900, reduce);
  const drift = useLoop('pingpong', 4200 + (w.delay % 900), w.delay, reduce);
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: w.x - 60, top: w.y, width: 120, alignItems: 'center',
      opacity: Animated.multiply(enter, lerp(drift, 0.55, 1)),
      transform: [{ translateY: lerp(drift, 4, -4) }],
    }}>
      <Text allowFontScaling={false} style={{ fontFamily: ARABIC, fontSize: 24, lineHeight: 40, color: C.goldPale, writingDirection: 'rtl' }}>{w.ar}</Text>
      <Text allowFontScaling={false} style={{ fontFamily: SANS_REG, fontSize: 11, color: C.mint, marginTop: -4 }}>{w.tr}</Text>
      <Text allowFontScaling={false} style={{ fontFamily: SANS_REG, fontSize: 9.5, color: C.dim, letterSpacing: 1.2 }}>{w.gloss.toUpperCase()}</Text>
    </Animated.View>
  );
}

// ---- Logo: rotating khātam, ring that draws itself, alif, two dots (nuqaṭ) orbiting, ripples ----

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_LEN = 2 * Math.PI * 56;

function Ripple({ delay, color, reduce }: { delay: number; color: string; reduce: boolean }) {
  const v = useLoop('repeat', 3400, delay, reduce, Easing.out(Easing.quad));
  if (reduce) return null;
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: 137, top: 234, width: 116, height: 116, borderRadius: 58, borderWidth: 1.5, borderColor: color,
      opacity: lerp(v, 0.45, 0), transform: [{ scale: lerp(v, 1, 2.6) }],
    }} />
  );
}

// A nuqṭa: Arabic dots are written as small rhombi.
function Nuqta({ left, top, color }: { left: number; top: number; color: string }) {
  return (
    <>
      <View style={{ position: 'absolute', left: left - 6, top: top - 6, width: 24, height: 24, borderRadius: 12, backgroundColor: color, opacity: 0.18 }} />
      <View style={{ position: 'absolute', left: left + 1, top: top + 1, width: 10, height: 10, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    </>
  );
}

function Logo({ reduce }: { reduce: boolean }) {
  const pop = useEntrance(50, 700, reduce);
  const draw = useEntrance(150, 1000, reduce, false);
  const inner = useEntrance(550, 800, reduce);
  const spin = useLoop('repeat', 40000, 0, reduce);
  const orbit = useLoop('repeat', 9000, 0, reduce);
  return (
    <Animated.View style={{ position: 'absolute', left: 115, top: 212, width: 160, height: 160, opacity: pop, transform: [{ scale: lerp(pop, 0.82, 1) }] }}>
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: 160, height: 160, opacity: inner, transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
        <Svg width={160} height={160}>
          <Path d={starPath(80, 80, 44)} stroke={C.goldDim} strokeWidth={1.2} fill="none" />
          <Circle cx={80} cy={80} r={27} stroke={C.goldDim} strokeWidth={0.8} strokeOpacity={0.6} fill="none" />
        </Svg>
      </Animated.View>
      <Svg width={160} height={160} style={StyleSheet.absoluteFill}>
        <AnimatedCircle
          cx={80} cy={80} r={56} stroke={C.gold} strokeWidth={3.5} strokeLinecap="round" fill="none"
          strokeDasharray={`${RING_LEN} ${RING_LEN}`} strokeDashoffset={lerp(draw, RING_LEN, 0)}
          rotation={-90} origin="80, 80"
        />
      </Svg>
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: 160, height: 160, alignItems: 'center', justifyContent: 'center', opacity: inner, transform: [{ translateY: lerp(inner, 8, 0) }] }}>
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC_BOLD, fontSize: 72, lineHeight: 110, color: C.gold, textAlign: 'center', includeFontPadding: false, marginTop: 8, textShadowColor: 'rgba(232,176,74,0.35)', textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 } }}>ا</Text>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: 160, height: 160, transform: [{ rotate: orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
        <Nuqta left={74} top={18} color={C.mint} />
        <Nuqta left={74} top={130} color={C.goldPale} />
      </Animated.View>
    </Animated.View>
  );
}

function Wordmark({ tagline, reduce }: { tagline: string; reduce: boolean }) {
  const v = useEntrance(600, 700, reduce);
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 380, width: W0, alignItems: 'center', opacity: v, transform: [{ translateY: lerp(v, 16, 0) }] }}>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Spaced text="ALIF" spacing={14} style={{ fontFamily: DISPLAY, fontSize: 42, lineHeight: 50, color: C.gold, textShadowColor: 'rgba(232,176,74,0.3)', textShadowRadius: 18, textShadowOffset: { width: 0, height: 0 } }} />
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC, fontSize: 22, lineHeight: 38, color: C.goldPale }}>أَلِف</Text>
        <Spaced text={`— ${tagline} —`} spacing={2.6} style={{ fontFamily: SANS, fontSize: 10.5, color: C.mint }} />
      </View>
    </Animated.View>
  );
}

// ---- Camera, transliterate, translate ----

function CameraIcon({ reduce }: { reduce: boolean }) {
  const scan = useLoop('pingpong', 1800, 0, reduce);
  return (
    <View style={{ width: 38, height: 36 }}>
      <Svg width={38} height={36} viewBox="0 0 38 36">
        <G fill="none" stroke={C.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 11V6.5A2.5 2.5 0 0 1 5.5 4H10M28 4h4.5A2.5 2.5 0 0 1 35 6.5V11M35 25v4.5a2.5 2.5 0 0 1-2.5 2.5H28M10 32H5.5A2.5 2.5 0 0 1 3 29.5V25" />
        </G>
      </Svg>
      <Text allowFontScaling={false} style={{ position: 'absolute', left: 0, right: 0, top: 2, textAlign: 'center', fontFamily: ARABIC, fontSize: 17, lineHeight: 30, color: C.goldPale }}>نُور</Text>
      <Animated.View style={{ position: 'absolute', left: 6, width: 26, height: 2, borderRadius: 1, backgroundColor: C.mint, top: 8, opacity: 0.9, transform: [{ translateY: lerp(scan, 0, 19) }] }} />
    </View>
  );
}

// ع fades into ʿ and back: Arabic letter to its transliteration.
function TranslitIcon({ reduce }: { reduce: boolean }) {
  const v = useLoop('pingpong', 2400, 400, reduce);
  return (
    <View style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Text allowFontScaling={false} style={{ position: 'absolute', fontFamily: ARABIC_BOLD, fontSize: 26, lineHeight: 44, color: C.gold, opacity: lerp(v, 1, 0) }}>عَ</Animated.Text>
      <Animated.Text allowFontScaling={false} style={{ position: 'absolute', fontFamily: SANS, fontSize: 18, color: C.mint, opacity: v }}>ʿa</Animated.Text>
    </View>
  );
}

function TranslateIcon({ reduce }: { reduce: boolean }) {
  const v = useLoop('pingpong', 2000, 0, reduce);
  return (
    <View style={{ width: 40, height: 36 }}>
      <Text allowFontScaling={false} style={{ position: 'absolute', left: 1, top: -4, fontFamily: ARABIC_BOLD, fontSize: 20, lineHeight: 34, color: C.gold }}>ب</Text>
      <Text allowFontScaling={false} style={{ position: 'absolute', right: 3, bottom: 1, fontFamily: SANS, fontSize: 15, color: C.mint }}>B</Text>
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: 40, height: 36, transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) }] }}>
        <Svg width={40} height={36} viewBox="0 0 40 36">
          <Path d="M13 24L27 12M23 12h4v4" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

function Feature({ x, label, enter, glow, reduce, children }: { x: number; label: string; enter: number; glow: number; reduce: boolean; children: React.ReactNode }) {
  const ent = useEntrance(enter, 700, reduce);
  const lab = useEntrance(enter + 400, 800, reduce);
  const pulse = usePulse(glow, reduce);
  return (
    <>
      <Animated.View style={{ position: 'absolute', left: x, top: 528, width: 72, height: 72, opacity: ent, transform: [{ translateY: lerp(ent, 16, 0) }] }}>
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: -14, top: -14, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(232,176,74,0.05)', opacity: pulse, transform: [{ scale: lerp(pulse, 0.9, 1.2) }] }} />
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: -6, top: -6, width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(232,176,74,0.10)', opacity: pulse, transform: [{ scale: lerp(pulse, 0.95, 1.15) }] }} />
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: 72, height: 72, borderRadius: 36, borderWidth: 1.5, borderColor: C.gold, opacity: pulse }} />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', left: x + 36 - 60, top: 612, width: 120, alignItems: 'center', opacity: lab }}>
        <Spaced text={label} spacing={1.6} style={{ fontFamily: SANS, fontSize: 9.5, color: C.ink }} />
      </Animated.View>
    </>
  );
}

function Packet({ from, to, duration, delay, color, size, reduce }: { from: [number, number]; to: [number, number]; duration: number; delay: number; color: string; size: number; reduce: boolean }) {
  const v = useLoop('repeat', duration, delay, reduce);
  if (reduce) return null;
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: 0, top: 0, width: size, height: size, backgroundColor: color,
      opacity: v.interpolate({ inputRange: [0, 0.08, 0.92, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateX: lerp(v, from[0] - size / 2, to[0] - size / 2) }, { translateY: lerp(v, from[1] - size / 2, to[1] - size / 2) }, { rotate: '45deg' }],
    }} />
  );
}

function Connectors({ reduce }: { reduce: boolean }) {
  const fade = useEntrance(1200, 800, reduce);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      <Svg width={W0} height={H0} style={StyleSheet.absoluteFill}>
        <Path d="M123 564H159M231 564H267" stroke={C.line} strokeWidth={1.5} />
      </Svg>
      <Packet from={[123, 564]} to={[159, 564]} duration={2200} delay={0} color={C.gold} size={5} reduce={reduce} />
      <Packet from={[231, 564]} to={[267, 564]} duration={2200} delay={1100} color={C.mint} size={5} reduce={reduce} />
    </Animated.View>
  );
}

// ---- Sufi art: hanging lanterns, a pointed arch (miḥrāb) around the mark, a mosque on the horizon ----

// A lantern hanging on a chain from the top edge, swinging gently around its hook. The view is twice the hanging length
// high so that its center (the rotation point) is the hook.
function Lantern({ x, len, delay, reduce }: { x: number; len: number; delay: number; reduce: boolean }) {
  const enter = useEntrance(200 + delay / 2, 900, reduce);
  const swing = useLoop('pingpong', 4600, delay, reduce);
  const glow = useLoop('pingpong', 2400, delay + 300, reduce);
  const H = len + 64;
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x - 20, top: -H, width: 40, height: H * 2, opacity: enter,
      transform: [{ rotate: swing.interpolate({ inputRange: [0, 1], outputRange: ['-3.5deg', '3.5deg'] }) }],
    }}>
      <View style={{ position: 'absolute', left: 19.5, top: H, width: 1, height: len, backgroundColor: C.goldDim }} />
      <Animated.View style={{ position: 'absolute', left: 4, top: H + len + 12, width: 32, height: 34, borderRadius: 16, backgroundColor: C.gold, opacity: lerp(glow, 0.08, 0.22) }} />
      <Svg width={40} height={64} style={{ position: 'absolute', left: 0, top: H + len }}>
        <G fill="none" stroke={C.gold} strokeWidth={1.4} strokeLinejoin="round">
          <Path d="M20 0V4M14 10L20 4L26 10Z" />
          <Path d="M10 10H30V14H10Z" />
          <Path d="M11 14H29V40Q29 48 20 52Q11 48 11 40Z" fill={C.panel} />
          <Path d="M20 52V58" />
        </G>
        <Path d="M15 19H25V37Q20 43 15 37Z" fill={C.goldPale} fillOpacity={0.85} />
        <Path d="M20 19V40" stroke={C.goldDim} strokeWidth={1} />
        <Circle cx={20} cy={60} r={2} fill={C.gold} />
      </Svg>
    </Animated.View>
  );
}

// Pointed (ogee) arch around the mark and the name, drawn in two thin lines like a carved miḥrāb.
function Arch({ reduce }: { reduce: boolean }) {
  const v = useEntrance(300, 1100, reduce);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: v }]}>
      <Svg width={W0} height={H0}>
        <Path d="M64 508V262Q64 214 112 196Q170 176 195 136Q220 176 278 196Q326 214 326 262V508" stroke={C.goldDim} strokeWidth={1.2} fill="none" />
        <Path d="M74 508V266Q74 224 118 208Q172 190 195 154Q218 190 272 208Q316 224 316 266V508" stroke={C.goldDim} strokeOpacity={0.45} strokeWidth={0.8} fill="none" />
        <Path d={starPath(195, 124, 7)} stroke={C.gold} strokeWidth={1} fill="none" />
        <Path d="M56 508H334" stroke={C.goldDim} strokeOpacity={0.5} strokeWidth={0.8} />
      </Svg>
    </Animated.View>
  );
}

// Mosque silhouette on the horizon: a large dome, two small domes and four minarets with crescents.
function Mosque({ reduce }: { reduce: boolean }) {
  const v = useEntrance(900, 1000, reduce);
  const crescent = (cx: number, cy: number, r: number) => `M${cx + r * 0.2} ${cy - r}A${r} ${r} 0 1 0 ${cx + r * 0.2} ${cy + r}A${r * 0.78} ${r * 0.78} 0 1 1 ${cx + r * 0.2} ${cy - r}Z`;
  const minaret = (x: number, top: number, w: number) =>
    `M${x - w / 2} 110V${top}H${x + w / 2}V110Z M${x - w / 2 - 2} ${top + 22}H${x + w / 2 + 2}V${top + 25}H${x - w / 2 - 2}Z M${x - w / 2} ${top}L${x} ${top - 13}L${x + w / 2} ${top}Z`;
  const windows = [118, 146, 174, 216, 244, 272].map(x => `M${x - 5} 110V100Q${x} 92 ${x + 5} 100V110Z`).join('');
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 734, width: W0, height: 110, opacity: v, transform: [{ translateY: lerp(v, 12, 0) }] }}>
      <Svg width={W0} height={110}>
        <G fill={C.panel} stroke={C.goldDim} strokeWidth={1}>
          <Path d={minaret(62, 26, 10)} />
          <Path d={minaret(328, 26, 10)} />
          <Path d={minaret(88, 50, 8)} />
          <Path d={minaret(302, 50, 8)} />
          <Path d="M98 110V72H292V110Z" />
          <Path d="M104 80Q104 58 125 55Q146 58 146 80Z" />
          <Path d="M244 80Q244 58 265 55Q286 58 286 80Z" />
          <Path d="M156 72V62H234V72Z" />
          <Path d="M150 62C150 38 172 32 195 14C218 32 240 38 240 62Z" />
        </G>
        <Path d={windows} fill={C.bg} stroke={C.goldDim} strokeWidth={0.8} />
        <Path d="M195 16V6M62 13V4M328 13V4" stroke={C.gold} strokeWidth={1.2} />
        <G fill={C.gold}>
          <Path d={crescent(195, 1, 4)} />
          <Path d={crescent(62, 0, 3)} />
          <Path d={crescent(328, 0, 3)} />
        </G>
        <Path d="M0 110H390" stroke={C.goldDim} strokeWidth={1} />
      </Svg>
    </Animated.View>
  );
}

// Ṣalawāt upon the Prophet ﷺ in Arabic, transliterated, and its meaning.
function Salawat({ meaning, reduce }: { meaning: string; reduce: boolean }) {
  const v = useEntrance(1500, 900, reduce);
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 646, width: W0, alignItems: 'center', opacity: v, transform: [{ translateY: lerp(v, 8, 0) }] }}>
      <Text allowFontScaling={false} style={{ fontFamily: ARABIC, fontSize: 21, lineHeight: 38, color: C.gold, writingDirection: 'rtl' }}>اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ ﷺ</Text>
      <Text allowFontScaling={false} style={{ fontFamily: SANS_REG, fontSize: 11, color: C.mint, marginTop: -2 }}>allāhumma ṣalli ʿalā sayyidinā muḥammad</Text>
      <Text allowFontScaling={false} style={{ fontFamily: SANS_REG, fontSize: 9.5, color: C.dim, letterSpacing: 1.2, marginTop: 2 }}>{meaning.toUpperCase()}</Text>
    </Animated.View>
  );
}

export default function Splash({ onDone }: { onDone: () => void }) {
  const { t, lang } = useApp();
  const { width: W, height: H } = useWindowDimensions();
  const [reduce, setReduce] = useState<boolean | null>(null);
  const fade = useRef(new Animated.Value(1)).current;
  const closing = useRef(false);
  const born = useRef(Date.now());
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then(r => live && setReduce(!!r)).catch(() => live && setReduce(false));
    return () => { live = false; };
  }, []);

  const finish = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(fade, { toValue: 0, duration: FADE_MS, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => done.current());
  }, [fade]);

  useEffect(() => {
    if (reduce === null) return;
    const timer = setTimeout(finish, reduce ? SHOW_REDUCED_MS : SHOW_MS);
    return () => clearTimeout(timer);
  }, [reduce, finish]);

  // English and Swedish meanings are mixed on purpose: the app works in both.
  const sv = lang === 'sv';
  const words: FW[] = [
    { ar: 'عِلْم', tr: 'ʿilm', gloss: sv ? 'kunskap' : 'knowledge', x: 112, y: 26, delay: 0 },
    { ar: 'نُور', tr: 'nūr', gloss: sv ? 'light' : 'ljus', x: 196, y: 34, delay: 900 },
    { ar: 'حِكْمَة', tr: 'ḥikmah', gloss: sv ? 'visdom' : 'wisdom', x: 280, y: 26, delay: 1600 },
  ];

  const s = Math.min(W / W0, H / H0, 1.3);
  const top0 = (H - H0 * s) / 2;
  const r = reduce === true;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade, backgroundColor: C.bg, zIndex: 100, elevation: 100 }]}>
      <StatusBar style="light" />
      <Pressable style={StyleSheet.absoluteFill} onPress={() => { if (Date.now() - born.current > MIN_SKIP_MS) finish(); }}>
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="glowTop" cx={W / 2} cy={top0 + 292 * s} r={330 * s} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={C.teal} stopOpacity="1" />
              <Stop offset="1" stopColor={C.teal} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="glowBottom" cx={W / 2} cy={H + 17 * s} r={260 * s} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={C.gold} stopOpacity="0.13" />
              <Stop offset="1" stopColor={C.gold} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={W} height={H} fill={C.bg} />
          <Rect x={0} y={0} width={W} height={H} fill="url(#glowTop)" />
          <Rect x={0} y={0} width={W} height={H} fill="url(#glowBottom)" />
        </Svg>
        {reduce !== null && (
          <View style={{ position: 'absolute', left: (W - W0) / 2, top: (H - H0) / 2, width: W0, height: H0, transform: [{ scale: s }] }}>
            <Pattern reduce={r} />
            <Arch reduce={r} />
            <Lantern x={38} len={64} delay={0} reduce={r} />
            <Lantern x={352} len={84} delay={700} reduce={r} />
            <Mosque reduce={r} />
            {words.map((w, i) => <Floating key={i} w={w} reduce={r} />)}
            <Ripple delay={0} color={C.mint} reduce={r} />
            <Ripple delay={1700} color={C.gold} reduce={r} />
            <Logo reduce={r} />
            <Wordmark tagline={t.tagline} reduce={r} />
            <Connectors reduce={r} />
            <Feature x={51} label={t.splashCamera} enter={850} glow={1300} reduce={r}><CameraIcon reduce={r} /></Feature>
            <Feature x={159} label={t.splashTranslit} enter={1000} glow={2000} reduce={r}><TranslitIcon reduce={r} /></Feature>
            <Feature x={267} label={t.splashTranslate} enter={1150} glow={2700} reduce={r}><TranslateIcon reduce={r} /></Feature>
            <Salawat meaning={t.salawatMeaning} reduce={r} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
