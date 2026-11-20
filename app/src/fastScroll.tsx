import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, PanResponder, View } from 'react-native';
import { useApp } from './store';
import { Text } from './ui';

/**
 * A scroll bar on the right edge of a long list (a sūra, a juzʾ): it shows where you are, and you can drag it to
 * move quickly – a bubble beside the finger shows the verse. Only the bar re-renders while scrolling.
 */
export function useFastScroll<T>(list: React.RefObject<FlatList<T> | null>, count: number, label: (i: number) => string) {
  const st = useRef({ offset: 0, content: 1, view: 1 });
  const subs = useRef(new Set<() => void>());
  const ping = () => subs.current.forEach(f => f());
  const listProps = {
    scrollEventThrottle: 16,
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => { st.current.offset = e.nativeEvent.contentOffset.y; ping(); },
    onLayout: (e: LayoutChangeEvent) => { st.current.view = e.nativeEvent.layout.height; ping(); },
    onContentSizeChange: (_w: number, h: number) => { st.current.content = h; ping(); },
  };
  const bar = <Bar st={st} subs={subs} list={list as React.RefObject<FlatList<unknown> | null>} count={count} label={label} />;
  return { listProps, bar };
}

const THUMB = 52, TOUCH = 34;

function Bar({ st, subs, list, count, label }: {
  st: React.MutableRefObject<{ offset: number; content: number; view: number }>; subs: React.MutableRefObject<Set<() => void>>;
  list: React.RefObject<FlatList<unknown> | null>; count: number; label: (i: number) => string;
}) {
  const { theme } = useApp();
  const [, tick] = useState(0);
  const [drag, setDrag] = useState<number | null>(null); // 0–1 while dragging
  const [h, setH] = useState(0);
  const [active, setActive] = useState(false);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const f = () => { tick(x => x + 1); setActive(true); if (hide.current) clearTimeout(hide.current); hide.current = setTimeout(() => setActive(false), 1400); };
    subs.current.add(f); return () => { subs.current.delete(f); if (hide.current) clearTimeout(hide.current); };
  }, [subs]);
  const { offset, content, view } = st.current;
  const room = Math.max(1, content - view);
  const frac = drag ?? Math.max(0, Math.min(1, offset / room));
  const track = Math.max(1, h - THUMB);
  const y0 = useRef(0);
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: e => {
      // touching the bar jumps there; then follow the finger
      y0.current = e.nativeEvent.locationY - THUMB / 2;
      move(y0.current);
    },
    onPanResponderMove: (_e, g) => move(y0.current + g.dy),
    onPanResponderRelease: () => setDrag(null),
    onPanResponderTerminate: () => setDrag(null),
  }), [h, count]); // eslint-disable-line react-hooks/exhaustive-deps
  function move(y: number) {
    const f = Math.max(0, Math.min(1, y / track));
    setDrag(f);
    const { content: c, view: v } = st.current;
    list.current?.scrollToOffset({ offset: f * Math.max(0, c - v), animated: false });
  }
  if (content <= view * 1.5 || count < 2) return null; // short lists need no bar
  const top = frac * track;
  const verse = Math.min(count - 1, Math.round(frac * (count - 1)));
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: -12, top: 0, bottom: 0, width: TOUCH }}
      onLayout={e => setH(e.nativeEvent.layout.height)}>
      <View {...pan.panHandlers} accessibilityRole="adjustable" accessibilityLabel={label(verse)} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: TOUCH }}>
        {/* a slim grey staff at the right edge (gold while dragging) */}
        <View style={{ position: 'absolute', right: 10, top, width: 6, height: THUMB, borderRadius: 3, backgroundColor: drag != null ? theme.tabActive : theme.muted, opacity: drag != null ? 1 : active ? 0.8 : 0.5 }} />
      </View>
      {drag != null ? (
        <View pointerEvents="none" style={{ position: 'absolute', right: TOUCH + 4, top: Math.max(0, top + THUMB / 2 - 22), minWidth: 64, height: 44, paddingHorizontal: 12, borderRadius: 14,
          alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.tabActive }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: theme.tabActive }}>{label(verse)}</Text>
        </View>
      ) : null}
    </View>
  );
}
