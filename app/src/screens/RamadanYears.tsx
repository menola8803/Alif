import React, { useMemo, useState } from 'react';
import { Pressable, Vibration, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, G, Line, Marker, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useApp } from '../store';
import { usePrayer } from '../prayer';
import { shortDate, weekday } from '../dates';
import { arabicDigits } from '../translate';
import { fromHijri } from '../core/hijri';
import { Arabic, Card, Label, Text, useButtonLook } from '../ui';
import {
  RAMADAN_VIEWS, currentOrNext, dayOfYear, daysUntil, fastMinutes, partIn, ramadans, seasonOf, twiceYears, yearLength,
  type Ramadan, type RamadanView,
} from '../core/ramadan';

/** The years that can be chosen, and shown at first: 2026–2050. */
const MIN_YEAR = 2026, MAX_YEAR = 2050, DEFAULT_TO = 2050;

/**
 * Hijri › Ramadan: how Ramadan moves through the year, about 11 days earlier every year. Five pictures to choose
 * between (ring, grid, clock, spiral, fasting hours) – the last one chosen is kept. Tap a year in the list (or in the
 * picture) to light it up; tap it again to go back to the next Ramadan.
 */
export function RamadanYears() {
  const { t, theme, lang, setPrefs, ramadanView, ramFrom, ramTo, ramFromH, ramToH, ramEra, place, school, highLat } = useApp();
  const { hijriOffset, now } = usePrayer();
  const { width } = useWindowDimensions();
  const look = useButtonLook();
  const W = width - 32 - 28;
  const year = now.getFullYear();
  // The interval chosen by the person (kept for next time), in Gregorian or Hijri years; 0 = the default.
  const hijri = ramEra === 'hijri';
  const hyIn = (gy: number) => ramadans(gy, gy, hijriOffset).find(r => r.start.getFullYear() === gy)?.hy ?? 0;
  const HMIN = hyIn(MIN_YEAR), HMAX = hyIn(MAX_YEAR);
  const G0 = Math.max(MIN_YEAR, Math.min(ramFrom || MIN_YEAR, MAX_YEAR)), G1 = Math.max(G0, Math.min(ramTo || DEFAULT_TO, MAX_YEAR));
  const H0 = Math.max(HMIN, Math.min(ramFromH || HMIN, HMAX)), H1 = Math.max(H0, Math.min(ramToH || hyIn(DEFAULT_TO), HMAX));
  const all = useMemo(() => {
    if (!hijri) return ramadans(G0, G1, hijriOffset).filter(r => r.start.getFullYear() >= G0 && r.start.getFullYear() <= G1);
    const a = fromHijri({ y: H0, m: 9, d: 1 }, hijriOffset).getFullYear(), b = fromHijri({ y: H1, m: 9, d: 30 }, hijriOffset).getFullYear();
    return ramadans(a, b, hijriOffset).filter(r => r.hy >= H0 && r.hy <= H1);
  }, [hijri, G0, G1, H0, H1, hijriOffset]);
  const lo = hijri ? H0 : G0, hi = hijri ? H1 : G1, MIN = hijri ? HMIN : MIN_YEAR, MAX = hijri ? HMAX : MAX_YEAR;
  const setRange = (from: number, to: number) => {
    const f = Math.max(MIN, Math.min(from, MAX)), tt = Math.max(MIN, Math.min(to, MAX));
    setPrefs(hijri ? { ramFromH: Math.min(f, tt), ramToH: Math.max(f, tt) } : { ramFrom: Math.min(f, tt), ramTo: Math.max(f, tt) });
  };
  // The Gregorian years the pictures span
  const Y0 = all.length ? all[0].start.getFullYear() : G0, Y1 = all.length ? all[all.length - 1].start.getFullYear() : G1;
  const inRange = (y: number) => y >= Y0 && y <= Y1;
  const showToday = inRange(year);
  /** The year written for a Ramadan: its Hijri year or the Gregorian year it begins in. */
  const yearOf = (r: Ramadan) => (hijri ? r.hy : r.start.getFullYear());
  const every = hi - lo > 60 ? 20 : hi - lo > 30 ? 10 : 5; // which years get a label
  const next = currentOrNext(all, now) ?? all[0];
  const [selHy, setSelHy] = useState<number | null>(null);
  const sel = all.find(r => r.hy === selHy) ?? next;
  const pick = (r: Ramadan) => setSelHy(r.hy === sel?.hy ? null : r.hy);
  const view: RamadanView = RAMADAN_VIEWS.includes(ramadanView) ? ramadanView : 'ring';
  /** Hold the picture to change to the next one (kept for next time) – no buttons needed. */
  const cycle = () => { Vibration.vibrate(15); setPrefs({ ramadanView: RAMADAN_VIEWS[(RAMADAN_VIEWS.indexOf(view) + 1) % RAMADAN_VIEWS.length] }); };
  const opts = { school, highLat };

  const gold = theme.tabActive, teal = theme.accent;
  const colorOf = (r: Ramadan) => (r === sel ? gold : r.end < now ? teal : teal);
  const opacityOf = (r: Ramadan) => (r === sel ? 1 : selHy != null ? 0.3 : r.end < now ? 0.45 : 0.85);
  const font = theme.fonts.regular, bold = theme.fonts.bold;
  const mon = (i: number) => shortDate(new Date(2001, i, 1), lang).split(' ')[1];
  const full = (d: Date) => `${shortDate(d, lang)} ${d.getFullYear()}`;
  const S = Math.min(W, 340);
  const step = (S / 2 - 22 - S / 4.6) / Math.max(1, Y1 - Y0); // ring distance
  const thin = Math.max(1, Math.min(3.4, step * 0.75));
  const twice = twiceYears(all.filter(r => r.start.getFullYear() >= Y0 && r.start.getFullYear() <= Y1));

  const when = (r: Ramadan) => {
    if (r.start <= now && r.end >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) return t.ramNow;
    if (r.end < now) return t.ramPast;
    const d = daysUntil(r, now);
    return d > 400 ? t.ramInYears.replace('{n}', String(Math.round(d / 365))) : t.ramInDays.replace('{n}', String(d));
  };

  // ---- the pictures ----
  const ang = (day: number, len = 365.25) => (day / len) * 2 * Math.PI - Math.PI / 2;
  const P = (r: number, a: number) => [r * Math.cos(a), r * Math.sin(a)] as const;
  const arc = (R: number, a0: number, a1: number) => {
    const [x0, y0] = P(R, a0), [x1, y1] = P(R, a1);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  };
  const monthLabels = (r: number) => Array.from({ length: 12 }, (_, i) => {
    const [x, y] = P(r, ang(i * 30.44 + 15.2));
    return <SvgText key={`m${i}`} x={x} y={y + 4} textAnchor="middle" fill={theme.muted} fontSize={10.5} fontFamily={font}>{mon(i)}</SvgText>;
  });
  const todayDay = dayOfYear(now);
  const wd = (d: Date) => `${weekday(d, lang).slice(0, 3)} ${shortDate(d, lang)}`;
  /** ▶ start and ■ end marks on the chosen Ramadan (same signs as in the middle and the card). */
  const startMark = (x: number, y: number) => (
    <G><Circle cx={x} cy={y} r={8} fill={gold} stroke={theme.card} strokeWidth={2} /><Path d={`M${x - 2.5} ${y - 3.5}L${x + 3.5} ${y}L${x - 2.5} ${y + 3.5}Z`} fill={theme.card} /></G>
  );
  const endMark = (x: number, y: number) => (
    <G><Circle cx={x} cy={y} r={8} fill={theme.card} stroke={gold} strokeWidth={2} /><Rect x={x - 3} y={y - 3} width={6} height={6} fill={gold} /></G>
  );
  const ends = (x0: number, y0: number, x1: number, y1: number) => <G>{startMark(x0, y0)}{endMark(x1, y1)}</G>;
  const centre = sel ? (
    <G>
      <SvgText x={0} y={-46} textAnchor="middle" fill={gold} fontSize={21} fontFamily={theme.fonts.arabic}>{`رَمَضَان ${arabicDigits(sel.hy)}`}</SvgText>
      <SvgText x={0} y={-22} textAnchor="middle" fill={theme.ink} fontSize={13} fontFamily={bold}>{`Ramadan ${sel.hy}`}</SvgText>
      {([[2, true, t.ramStart, sel.start], [24, false, t.ramEnd, sel.end]] as const).map(([y, start, label, d]) => (
        <G key={label}>
          {start ? startMark(-62, y - 4) : endMark(-62, y - 4)}
          <SvgText x={-49} y={y} fill={theme.muted} fontSize={10.5} fontFamily={font}>{label}</SvgText>
          <SvgText x={68} y={y} textAnchor="end" fill={theme.ink} fontSize={11.5} fontFamily={bold}>{wd(d)}</SvgText>
        </G>
      ))}
      <SvgText x={0} y={48} textAnchor="middle" fill={theme.muted} fontSize={10.5} fontFamily={font}>{`${sel.start.getFullYear()}${sel.end.getFullYear() !== sel.start.getFullYear() ? `–${sel.end.getFullYear()}` : ''} · ${sel.days} ${t.ramDaysWord}`}</SvgText>
      <SvgText x={0} y={66} textAnchor="middle" fill={gold} fontSize={12.5} fontFamily={bold}>{when(sel)}</SvgText>
    </G>
  ) : null;

  const ring = () => {
    const rOf = (y: number) => S / 2 - 22 - (y - Y0) * step;
    return (
      <Svg width={S} height={S} viewBox={`${-S / 2} ${-S / 2} ${S} ${S}`}>
        {monthLabels(S / 2 - 9)}
        {Array.from({ length: Y1 - Y0 + 1 }, (_, i) => Y0 + i).map(y => (
          <Circle key={`c${y}`} r={rOf(y)} fill="none" stroke={twice.includes(y) ? gold : theme.line} strokeWidth={0.6} strokeDasharray={twice.includes(y) ? '2 3' : undefined} strokeOpacity={twice.includes(y) ? 0.9 : 0.6} />
        ))}
        {all.flatMap(r => Array.from({ length: Y1 - Y0 + 1 }, (_, i) => Y0 + i).map(y => {
          const p = partIn(r, y); if (!p) return null;
          const d = arc(rOf(y), ang(p.from, yearLength(y)), ang(p.to + 1, yearLength(y)));
          return (
            <G key={`${r.hy}-${y}`} onPress={() => pick(r)} onLongPress={cycle} delayLongPress={450}>
              {r === sel ? <Path d={d} stroke={gold} strokeOpacity={0.3} strokeWidth={12} strokeLinecap="round" fill="none" /> : null}
              <Path d={d} stroke={colorOf(r)} strokeOpacity={opacityOf(r)} strokeWidth={r === sel ? thin + 2 : thin} strokeLinecap="round" fill="none" />
            </G>
          );
        }))}
        {sel ? (() => { const a = partIn(sel, sel.start.getFullYear())!, b = partIn(sel, sel.end.getFullYear())!; const [x0, y0] = P(rOf(sel.start.getFullYear()), ang(a.from, yearLength(sel.start.getFullYear()))), [x1, y1] = P(rOf(sel.end.getFullYear()), ang(b.to + 1, yearLength(sel.end.getFullYear()))); return inRange(sel.start.getFullYear()) && inRange(sel.end.getFullYear()) ? ends(x0, y0, x1, y1) : null; })() : null}
        {twice.map(y => { const [x, yy] = P(rOf(y), ang(dayOfYear(new Date(y, 8, 10)))); return <SvgText key={`t${y}`} x={x} y={yy + 4} textAnchor="middle" fill={gold} fontSize={10} fontFamily={bold}>{`2× ${y}`}</SvgText>; })}
        {[Y0, Y1].map((y, k) => { const [x, yy] = P(rOf(y), ang(dayOfYear(new Date(y, 7, 1)))); return <SvgText key={`y${y}`} x={x} y={yy + 3.5} textAnchor="middle" fill={theme.muted} fontSize={9.5} fontFamily={font}>{hijri && all.length ? (k ? all[all.length - 1].hy : all[0].hy) : y}</SvgText>; })}
        {showToday && (() => { const [x, y] = P(rOf(year), ang(todayDay)); const [lx, ly] = P(rOf(year) + 20, ang(todayDay - 6)); return <G><Circle cx={x} cy={y} r={4.5} fill={theme.ink} stroke={theme.card} strokeWidth={2} /><SvgText x={lx} y={ly + 4} textAnchor="middle" fill={theme.ink} fontSize={10} fontFamily={bold}>{t.legToday.toLowerCase()}</SvgText></G>; })()}
        {centre}
      </Svg>
    );
  };

  const grid = () => {
    const L = 40, GW = W - L, rowH = Math.max(12, Math.min(30, 600 / (Y1 - Y0 + 1))), top = 18, years = Array.from({ length: Y1 - Y0 + 1 }, (_, i) => Y0 + i);
    return (
      <Svg width={W} height={top + years.length * rowH + 16}>
        {Array.from({ length: 12 }, (_, i) => (
          <G key={`g${i}`}>
            <Rect x={L + (i * GW) / 12} y={top} width={GW / 12} height={years.length * rowH} fill={i % 2 ? theme.card : theme.chip} opacity={0.7} />
            <SvgText x={L + (i + 0.5) * (GW / 12)} y={12} textAnchor="middle" fill={theme.muted} fontSize={10} fontFamily={font}>{mon(i).slice(0, 3)}</SvgText>
          </G>
        ))}
        {years.map((y, i) => (
          <G key={`r${y}`}>
            {twice.includes(y) ? <Rect x={2} y={top + i * rowH + 2} width={W - 4} height={rowH - 4} rx={7} fill="none" stroke={gold} strokeDasharray="3 3" /> : null}
            {rowH >= 16 || y % 5 === 0 || y === year ? <SvgText x={L - 6} y={top + i * rowH + rowH / 2 + 4} textAnchor="end" fill={y === year ? theme.ink : theme.muted} fontSize={10.5} fontFamily={y === year ? bold : font}>{y}</SvgText> : null}
          </G>
        ))}
        {all.flatMap(r => years.map((y, i) => {
          const p = partIn(r, y); if (!p) return null;
          const x0 = L + (p.from / yearLength(y)) * GW, x1 = L + ((p.to + 1) / yearLength(y)) * GW;
          return (
            <G key={`${r.hy}-${y}`} onPress={() => pick(r)} onLongPress={cycle} delayLongPress={450}>
              <Rect x={x0} y={top + i * rowH + rowH * 0.22} width={Math.max(3, x1 - x0)} height={rowH * 0.56} rx={4} fill={colorOf(r)} opacity={opacityOf(r)} />
              {hijri && rowH >= 16 && r.start.getFullYear() === y ? <SvgText x={x1 > W - 34 ? x0 - 4 : x1 + 4} y={top + i * rowH + rowH / 2 + 3.5} textAnchor={x1 > W - 34 ? 'end' : 'start'} fill={r === sel ? gold : theme.muted} fontSize={9.5} fontFamily={r === sel ? bold : font}>{r.hy}</SvgText> : null}
            </G>
          );
        }))}
        {sel && inRange(sel.start.getFullYear()) && inRange(sel.end.getFullYear()) ? (() => {
          const ys = sel.start.getFullYear(), ye = sel.end.getFullYear(), a = partIn(sel, ys)!, b = partIn(sel, ye)!;
          return ends(L + (a.from / yearLength(ys)) * GW, top + (ys - Y0) * rowH + rowH / 2, L + ((b.to + 1) / yearLength(ye)) * GW, top + (ye - Y0) * rowH + rowH / 2);
        })() : null}
        {showToday && (() => { const x = L + (todayDay / yearLength(year)) * GW, y = top + (year - Y0) * rowH; return <G><Line x1={x} x2={x} y1={y + 3} y2={y + rowH - 3} stroke={theme.ink} strokeWidth={2} /><SvgText x={x} y={y + rowH + 1} textAnchor="middle" fill={theme.ink} fontSize={9.5} fontFamily={bold}>{t.legToday.toLowerCase()}</SvgText></G>; })()}
      </Svg>
    );
  };

  const clock = () => {
    const R = S / 2 - 40, list = all;
    return (
      <Svg width={S} height={S} viewBox={`${-S / 2} ${-S / 2} ${S} ${S}`}>
        <Defs><Marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><Path d="M0 0L10 5L0 10z" fill={gold} /></Marker></Defs>
        <Circle r={R} fill="none" stroke={theme.line} strokeWidth={14} />
        {monthLabels(R + 26)}
        {list.map(r => {
          const a = ang(dayOfYear(r.start), yearLength(r.start.getFullYear())); const [x, y] = P(R, a); const [lx, ly] = P(R - 24, a);
          return (
            <G key={r.hy} onPress={() => pick(r)} onLongPress={cycle} delayLongPress={450}>
              {r === sel ? null : <Circle cx={x} cy={y} r={4} fill={colorOf(r)} opacity={opacityOf(r)} stroke={theme.card} strokeWidth={2} />}
              {r === sel || r === next || yearOf(r) % every === 0 ? <SvgText x={lx} y={ly + 3.5} textAnchor="middle" fill={r === sel ? gold : theme.muted} fontSize={r === sel ? 11.5 : 9.5} fontFamily={r === sel ? bold : font}>{hijri ? String(r.hy) : `’${String(r.start.getFullYear()).slice(2)}`}</SvgText> : null}
            </G>
          );
        })}
        {sel ? (() => { const a0 = ang(dayOfYear(sel.start), yearLength(sel.start.getFullYear())), d = sel.days; const a1 = a0 + (d / 365.25) * 2 * Math.PI; const [x0, y0] = P(R, a0), [x1, y1] = P(R, a1); return <G><Path d={arc(R, a0, a1)} stroke={gold} strokeWidth={9} strokeLinecap="round" fill="none" strokeOpacity={0.9} />{ends(x0, y0, x1, y1)}</G>; })() : null}
        {showToday && (() => { const [x, y] = P(R, ang(todayDay)); return <Circle cx={x} cy={y} r={4} fill={theme.ink} />; })()}
        {(() => { const r0 = R - 58, a0 = ang(300), a1 = ang(255); const [x0, y0] = P(r0, a0), [x1, y1] = P(r0, a1); return <Path d={`M${x0} ${y0}A${r0} ${r0} 0 0 0 ${x1} ${y1}`} fill="none" stroke={gold} strokeWidth={2} markerEnd="url(#ah)" />; })()}
        {centre}
      </Svg>
    );
  };

  const spiral = () => {
    const R0 = S / 2 - 22, R1 = S / 4.6, span = Y1 + 1 - Y0;
    const rad = (tt: number) => R0 - ((R0 - R1) * tt) / span;
    const pos = (tt: number) => P(rad(tt), (tt % 1) * 2 * Math.PI - Math.PI / 2);
    const tOf = (d: Date) => d.getFullYear() - Y0 + dayOfYear(d) / yearLength(d.getFullYear());
    const line = (a: number, b: number) => { let d = ''; for (let tt = a; tt <= b; tt += 0.004) { const [x, y] = pos(tt); d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; } return d; };
    return (
      <Svg width={S} height={S} viewBox={`${-S / 2} ${-S / 2} ${S} ${S}`}>
        {monthLabels(S / 2 - 9)}
        <Path d={line(0, span)} fill="none" stroke={theme.line} strokeWidth={1} />
        {all.map(r => {
          const a = tOf(r.start), b = tOf(r.end) + 1 / 365; if (b < 0 || a > span) return null;
          return (
            <G key={r.hy} onPress={() => pick(r)} onLongPress={cycle} delayLongPress={450}>
              {r === sel ? <Path d={line(Math.max(0, a), Math.min(span, b))} fill="none" stroke={gold} strokeOpacity={0.3} strokeWidth={12} strokeLinecap="round" /> : null}
              <Path d={line(Math.max(0, a), Math.min(span, b))} fill="none" stroke={colorOf(r)} strokeOpacity={opacityOf(r)} strokeWidth={r === sel ? thin + 2.5 : thin + 0.5} strokeLinecap="round" />
            </G>
          );
        })}
        {sel ? (() => { const a = tOf(sel.start), b = tOf(sel.end) + 1 / 365; if (a < 0 || b > span) return null; const [x0, y0] = pos(a), [x1, y1] = pos(b); return ends(x0, y0, x1, y1); })() : null}
        {showToday && (() => { const [x, y] = pos(tOf(now)); return <Circle cx={x} cy={y} r={4.5} fill={theme.ink} stroke={theme.card} strokeWidth={2} />; })()}
        {centre}
      </Svg>
    );
  };

  const hours = () => {
    const list = all;
    const mins = list.map(r => fastMinutes(r, place, opts));
    const L = 30, GW = W - L, H = 200, top = 16, bw = GW / list.length, max = 22 * 60;
    const col = (r: Ramadan) => { const s = seasonOf(r, place.lat); return s === 'summer' ? theme.danger : s === 'winter' ? '#7FB8E8' : gold; };
    return (
      <Svg width={W} height={top + H + 22}>
        {[8, 12, 16, 20].map(h => { const y = top + H - ((h * 60) / max) * H; return <G key={h}><Line x1={L} x2={W} y1={y} y2={y} stroke={theme.line} /><SvgText x={L - 5} y={y + 4} textAnchor="end" fill={theme.muted} fontSize={9.5} fontFamily={font}>{`${h} h`}</SvgText></G>; })}
        {list.map((r, i) => {
          const h = (mins[i] / max) * H;
          const first = i === 0 || list[i - 1].start.getFullYear() !== r.start.getFullYear();
          return (
            <G key={r.hy} onPress={() => pick(r)} onLongPress={cycle} delayLongPress={450}>
              <Rect x={L + i * bw + 1} y={top + H - h} width={Math.max(2, bw - 2)} height={h} rx={2} fill={col(r)} opacity={r === sel ? 1 : r.end < now ? 0.35 : 0.7} stroke={r === sel ? theme.ink : 'none'} strokeWidth={1.2} />
              {r === sel ? <SvgText x={L + i * bw + bw / 2} y={top + H - h - 5} textAnchor="middle" fill={theme.ink} fontSize={10} fontFamily={bold}>{r.hy}</SvgText> : null}
              {(hijri || first) && yearOf(r) % every === 0 ? <SvgText x={Math.min(L + i * bw + bw / 2, W - 2)} y={top + H + 15} textAnchor={L + i * bw + bw / 2 > W - 14 ? 'end' : 'middle'} fill={theme.muted} fontSize={9.5} fontFamily={font}>{yearOf(r)}</SvgText> : null}
            </G>
          );
        })}
      </Svg>
    );
  };

  const picture = { ring, grid, clock, spiral, hours }[view]();
  const help = { ring: t.ramHelpRing, grid: t.ramHelpGrid, clock: t.ramHelpClock, spiral: t.ramHelpSpiral, hours: t.ramHelpHours }[view];
  const names: Record<RamadanView, string> = { ring: t.ramViewRing, grid: t.ramViewGrid, clock: t.ramViewClock, spiral: t.ramViewSpiral, hours: t.ramViewHours };
  const fastH = sel ? fastMinutes(sel, place, opts) : 0;
  const fastEq = sel ? fastMinutes(sel, { ...place, lat: 0 }, opts) : 0;
  const season = sel ? { summer: t.ramSummer, winter: t.ramWinter, mid: t.ramSpringAutumn }[seasonOf(sel, place.lat)] : '';
  const listRows = all;
  const dot = (c: string, o = 1) => <View style={{ width: 16, height: 4, borderRadius: 2, backgroundColor: c, opacity: o }} />;

  return (
    <View style={{ gap: 12 }}>
      {/* Gregorian or Hijri years – for the interval and the years written in the pictures and the list */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Text style={{ fontSize: 12.5, color: theme.muted }}>{t.ramEra}</Text>
        {(['greg', 'hijri'] as const).map(e => {
          const on = (e === 'hijri') === hijri;
          return (
            <Pressable key={e} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setPrefs({ ramEra: e })}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: on ? look.border : theme.line, backgroundColor: on ? look.bg : 'transparent' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: on ? look.fg : theme.muted }}>{e === 'greg' ? t.ramGreg : t.ramHijri}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* The interval: from year – to year, kept for next time. Tap ‹ › for one year, hold for ten. */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
        {([['from', lo], ['to', hi]] as const).map(([k, v]) => (
          <View key={k} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted }}>{`${k === 'from' ? t.ramFrom : t.ramTo}${hijri ? ' (AH)' : ''}`}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {[-1, 1].map(d => (
                <Pressable key={d} accessibilityRole="button" accessibilityLabel={`${k === 'from' ? t.ramFrom : t.ramTo} ${d < 0 ? '−' : '+'}`} hitSlop={6}
                  onPress={() => (k === 'from' ? setRange(lo + d, hi) : setRange(lo, hi + d))} onLongPress={() => (k === 'from' ? setRange(lo + 10 * d, hi) : setRange(lo, hi + 10 * d))}
                  style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: look.border, backgroundColor: look.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, color: look.fg }}>{d < 0 ? '‹' : '›'}</Text>
                </Pressable>
              )).flatMap((b, i) => (i === 0 ? [b, <Text key="v" style={{ width: 58, textAlign: 'center', fontSize: 17, fontWeight: '800', color: theme.ink }}>{v}</Text>] : [b]))}
            </View>
          </View>
        ))}
      </Card>
      <Text style={{ fontSize: 12, color: theme.muted, marginTop: -4 }}>{t.ramRangeHint.replace('{a}', String(MIN)).replace('{b}', String(MAX))}</Text>

      <Card style={{ gap: 8, paddingHorizontal: 14 }}>
        <Label>{view === 'hours' ? t.ramHoursTitle.replace('{place}', place.name) : t.ramTitle.replace('{a}', String(lo)).replace('{b}', hijri ? `${hi} AH` : String(hi))}</Label>
        {sel && (view === 'grid' || view === 'hours') ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: look.border, backgroundColor: look.bg }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: gold }}>{sel.hy}</Text>
            <Text style={{ fontSize: 12.5, color: theme.ink }}><Text style={{ color: gold }}>▶ </Text>{wd(sel.start)}</Text>
            <Text style={{ fontSize: 12.5, color: theme.ink }}><Text style={{ color: gold }}>■ </Text>{`${wd(sel.end)} ${sel.end.getFullYear()}`}</Text>
          </View>
        ) : null}
        <Pressable onLongPress={cycle} delayLongPress={450} accessibilityRole="adjustable" accessibilityLabel={`${names[view]} · ${t.ramHoldHint}`}
          accessibilityActions={[{ name: 'increment' }]} onAccessibilityAction={cycle} style={{ alignItems: 'center' }}>{picture}</Pressable>
        {/* Which picture of the five, and how to change */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {RAMADAN_VIEWS.map(v => <View key={v} style={{ width: v === view ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: v === view ? gold : theme.line }} />)}
          <Text style={{ fontSize: 12, color: theme.muted, marginLeft: 6 }}>{`${names[view]} · ${t.ramHoldHint}`}</Text>
        </View>
        {view === 'hours' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{dot(theme.danger)}<Text style={{ fontSize: 12, color: theme.muted }}>{t.ramSummer}</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{dot(gold)}<Text style={{ fontSize: 12, color: theme.muted }}>{t.ramSpringAutumn}</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{dot('#7FB8E8')}<Text style={{ fontSize: 12, color: theme.muted }}>{t.ramWinter}</Text></View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, columnGap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: theme.ink }} /><Text style={{ fontSize: 12, color: theme.muted }}>{t.legToday}</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{dot(gold)}<Text style={{ fontSize: 12, color: theme.muted }}>{t.legChosen}</Text></View>
            <Text style={{ fontSize: 12, color: theme.muted }}><Text style={{ color: gold }}>▶ </Text>{t.ramFirstDay}</Text>
            <Text style={{ fontSize: 12, color: theme.muted }}><Text style={{ color: gold }}>■ </Text>{t.ramLastDay}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{dot(teal, 0.85)}<Text style={{ fontSize: 12, color: theme.muted }}>{t.legComing}</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{dot(teal, 0.45)}<Text style={{ fontSize: 12, color: theme.muted }}>{t.legPast}</Text></View>
            {view !== 'clock' ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 16, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: gold }} /><Text style={{ fontSize: 12, color: theme.muted }}>{t.legTwice}</Text></View> : null}
          </View>
        )}
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>{help}</Text>
      </Card>

      {sel ? (
        <Card style={{ gap: 6, borderColor: gold }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Arabic size={26} selectable={false} color={gold}>{arabicDigits(sel.hy)}</Arabic>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: theme.ink }}>{`Ramadan ${sel.hy} · ${when(sel)}`}</Text>
          </View>
          {([['▶', t.ramFirstDay, sel.start, true], ['■', t.ramLastDay, sel.end, false], ['☾', t.ramEid, new Date(sel.end.getFullYear(), sel.end.getMonth(), sel.end.getDate() + 1, 12), false]] as const).map(([icon, label, d, filled]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 30 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: filled ? gold : 'transparent', borderWidth: 1.5, borderColor: gold }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: filled ? theme.bg : gold }}>{icon}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 13.5, color: theme.muted }}>{label}</Text>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: theme.ink }}>{`${wd(d)} ${d.getFullYear()}`}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{`${sel.days} ${t.ramDaysWord} · ${t.ramTarawih.replace('{d}', shortDate(new Date(sel.start.getFullYear(), sel.start.getMonth(), sel.start.getDate() - 1), lang))}`}</Text>
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.ramFast.replace('{h}', String(Math.round(fastH / 60))).replace('{season}', season).replace('{place}', place.name).replace('{eq}', String(Math.round(fastEq / 60)))}</Text>
        </Card>
      ) : null}

      <Card style={{ gap: 2 }}>
        <Label>{t.ramDates}</Label>
        <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 4 }}>{t.ramTapHint}</Text>
        {listRows.map(r => {
          const on = r === sel; const two = twiceYears(all).includes(r.start.getFullYear());
          return (
            <Pressable key={r.hy} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => pick(r)}
              style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: 10, borderWidth: 1, borderColor: on ? look.border : 'transparent', backgroundColor: on ? look.bg : 'transparent' }}>
              <Text style={{ width: 52, fontSize: 13.5, fontWeight: on ? '700' : '500', color: on ? gold : theme.muted }}>{r.hy}</Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <Text style={{ fontSize: 13.5, fontWeight: on ? '700' : '500', color: on ? gold : theme.ink }}>{`${full(r.start)} – ${full(r.end)}`}</Text>
                {two ? <View style={{ backgroundColor: gold, borderRadius: 6, paddingHorizontal: 5 }}><Text style={{ fontSize: 10.5, fontWeight: '800', color: theme.bg }}>{`2× ${r.start.getFullYear()}`}</Text></View> : null}
              </View>
              <Text style={{ fontSize: 12, color: on ? gold : theme.muted }}>{`${r.days} ${t.ramDaysShort}`}</Text>
            </Pressable>
          );
        })}
        <Text style={{ fontSize: 11.5, color: theme.muted, lineHeight: 17, marginTop: 6 }}>{t.ramNote}</Text>
      </Card>
    </View>
  );
}
