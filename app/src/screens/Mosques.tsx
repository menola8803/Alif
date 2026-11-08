import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { Route } from '../nav';
import { getMapView } from '../../modules/alif-native';
import { Mosque, distanceKm, fromOverpass, overpassQuery, sortByDistance } from '../core/mosques';
import { Body, Btn, Card, Header, Screen, SmallBtn, Text, TextInput } from '../ui';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BUILT_IN: { updated: string; mosques: Mosque[] } = require('../../assets/mosques.json');
const CACHE = 'alif.mosques.v1';

/** The mosques: built into the app at build time; if that list is empty, fetched once from OpenStreetMap and saved. */
export function useMosques() {
  const [list, setList] = useState<Mosque[] | null>(BUILT_IN.mosques?.length ? BUILT_IN.mosques : null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (list) return;
    (async () => {
      try { const raw = await AsyncStorage.getItem(CACHE); if (raw) { setList(JSON.parse(raw)); return; } } catch {}
      try {
        const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `data=${encodeURIComponent(overpassQuery)}` });
        const got = fromOverpass(await r.json());
        if (got.length) { setList(got); AsyncStorage.setItem(CACHE, JSON.stringify(got)).catch(() => {}); } else setErr(true);
      } catch { setErr(true); }
    })();
  }, [list]);
  return { list, err, updated: BUILT_IN.updated };
}

function RoundBtn({ onPress, label, children }: { onPress: () => void; label: string; children: React.ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(23,38,41,0.92)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1, elevation: 6 })}>
      {children}
    </Pressable>
  );
}

/** The mosque map, laid out like the Trace map: legend top left, round buttons top right, a dark panel at the bottom. */
export default function MosquesScreen({ onBack, go }: { onBack: () => void; go: (r: Route) => void }) {
  const { t, theme, place, useLocation, lang } = useApp();
  const i = useSafeAreaInsets();
  const { list, err } = useMosques();
  const MapView = getMapView();
  const [sel, setSel] = useState(-1);
  const [center, setCenter] = useState<number[]>([place.lat, place.lng, 11, 1]);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const from = useMemo(() => me ?? { lat: place.lat, lng: place.lng }, [me, place.lat, place.lng]);
  const sorted = useMemo(() => (list ? sortByDistance(list, from) : []), [list, from]);
  // The dot button: zooms in on where the phone is now. Asks for location only when the button is pressed;
  // without permission it falls back to the place chosen for prayer times.
  const toMe = async () => {
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { setCenter([place.lat, place.lng, 12, Date.now()]); return; }
      const last = await Location.getLastKnownPositionAsync({ maxAge: 120000 }).catch(() => null);
      if (last) { setMe({ lat: last.coords.latitude, lng: last.coords.longitude }); setCenter([last.coords.latitude, last.coords.longitude, 15, Date.now()]); }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setCenter([pos.coords.latitude, pos.coords.longitude, 15, Date.now()]);
    } catch { setCenter([place.lat, place.lng, 12, Date.now()]); }
  };
  const pins = useMemo(() => (list ?? []).map(m => ({ lat: m.lat, lng: m.lng, title: m.name })), [list]);
  const chosen = sel >= 0 && list ? list[sel] : null;
  const nearest = sorted[0];
  const gold = '#E8B04A';
  const goTo = (m: Mosque, idx: number) => { setSel(idx); setCenter([m.lat, m.lng, 15, Date.now()]); };
  const directions = (m: Mosque) => Linking.openURL(`geo:${m.lat},${m.lng}?q=${m.lat},${m.lng}(${encodeURIComponent(m.name)})`).catch(() => Linking.openURL(`https://www.openstreetmap.org/directions?to=${m.lat},${m.lng}`).catch(() => {}));

  if (!MapView) {
    return <Screen><Header title={t.mosques} onBack={onBack} /><Card><Body>{t.mapNotAvailable}</Body></Card></Screen>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <MapView style={{ flex: 1 }} pins={pins} selected={sel} center={center} showMe={useLocation || !!me}
        onMarkerPress={e => setSel(e.nativeEvent.index)} />
      {/* legend */}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: i.top + 10, left: 12, right: 76 }}>
        <View style={{ backgroundColor: 'rgba(23,38,41,0.92)', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, gap: 4, alignSelf: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Svg width={14} height={14} viewBox="0 0 14 14"><Circle cx={7} cy={7} r={6} fill="#172629" stroke={gold} strokeWidth={1.5} /><Path d="M4 9.5V8a3 3 0 0 1 6 0v1.5z" fill={gold} /></Svg>
            <Text style={{ fontSize: 13, color: '#EAF1EF' }}>{t.mosque}</Text>
            {useLocation || me ? <><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#4A90E2', marginLeft: 8 }} /><Text style={{ fontSize: 13, color: '#EAF1EF' }}>{t.you}</Text></> : null}
          </View>
        </View>
      </View>
      {/* round buttons */}
      <View style={{ position: 'absolute', top: i.top + 10, right: 12, gap: 10 }}>
        <RoundBtn label={t.back} onPress={onBack}><Text style={{ color: gold, fontSize: 26, marginTop: -3 }}>‹</Text></RoundBtn>
        <RoundBtn label={t.myPlaceBtn} onPress={toMe}>
          <Svg width={24} height={24} viewBox="0 0 24 24"><Circle cx={12} cy={12} r={4} fill={gold} /><Circle cx={12} cy={12} r={8} stroke={gold} strokeWidth={1.6} fill="none" /><Path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke={gold} strokeWidth={1.6} /></Svg>
        </RoundBtn>
      </View>
      <Text style={{ position: 'absolute', right: 8, bottom: (chosen ? 210 : 150) + i.bottom, fontSize: 10, color: '#26231F', backgroundColor: 'rgba(255,255,255,0.75)', paddingHorizontal: 6, borderRadius: 6 }}>© OpenStreetMap</Text>
      {/* bottom panel */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(23,38,41,0.97)', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 16, paddingBottom: 16 + i.bottom, gap: 10 }}>
        {!list && !err ? <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><ActivityIndicator color={gold} /><Text style={{ color: '#EAF1EF' }}>{t.loadingMosques}</Text></View> : null}
        {err && !list ? <Text style={{ color: '#EAF1EF' }}>{t.mosquesFail}</Text> : null}
        {chosen ? (
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: gold }}>{chosen.name}</Text>
            <Text style={{ fontSize: 13, color: '#EAF1EF' }}>{[chosen.addr, chosen.city].filter(Boolean).join(' · ') || t.noAddress}</Text>
            <Text style={{ fontSize: 12, color: '#B7C6C3' }}>{`${distanceKm(from, chosen).toFixed(1).replace('.', lang === 'sv' ? ',' : '.')} km · ${t.source}: ${chosen.src.replace('osm', 'OpenStreetMap').replace('wikidata', 'Wikidata')}`}</Text>
          </View>
        ) : list ? (
          <Text style={{ fontSize: 13.5, color: '#EAF1EF' }}>{`${t.mosquesCount.replace('{n}', String(list.length))}${nearest ? ` · ${t.nearest}: ${nearest.name} (${distanceKm(from, nearest).toFixed(1)} km)` : ''}`}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Btn title={t.list} kind="secondary" onPress={() => go({ name: 'mosqueList' })} /></View>
          <View style={{ flex: 1 }}>{chosen ? <Btn title={t.directions} onPress={() => directions(chosen)} /> : <Btn title={t.nearestBtn} disabled={!nearest} onPress={() => nearest && list && goTo(nearest, list.indexOf(nearest))} />}</View>
        </View>
      </View>
    </View>
  );
}

/** All mosques by distance from your place, with search. */
export function MosqueListScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, place } = useApp();
  const { list, updated } = useMosques();
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const all = list ? sortByDistance(list, place) : [];
    const k = q.trim().toLowerCase();
    return k ? all.filter(m => `${m.name} ${m.addr} ${m.city}`.toLowerCase().includes(k)) : all;
  }, [list, place, q]);
  return (
    <Screen>
      <Header title={t.mosques} sub={`${shown.length} · ${t.from} ${place.name}`} onBack={onBack} />
      <TextInput value={q} onChangeText={setQ} placeholder={t.searchMosque} placeholderTextColor={theme.muted}
        style={{ minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.card, paddingHorizontal: 14, color: theme.ink, fontSize: 15 }} />
      <FlatList data={shown} keyExtractor={(m, i) => `${m.lat},${m.lng},${i}`} showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListFooterComponent={<Text style={{ fontSize: 11.5, color: theme.muted, marginTop: 10 }}>{t.mosqueSources}{updated ? ` · ${updated}` : ''}</Text>}
        renderItem={({ item: m }) => (
          <Card style={{ padding: 12, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: theme.ink }}>{m.name}</Text>
              <Text style={{ fontSize: 13, color: theme.primary, fontWeight: '700' }}>{distanceKm(place, m).toFixed(1)} km</Text>
            </View>
            <Text style={{ fontSize: 12.5, color: theme.muted }}>{[m.addr, m.city].filter(Boolean).join(' · ')}</Text>
            <SmallBtn title={t.directions} onPress={() => Linking.openURL(`geo:${m.lat},${m.lng}?q=${m.lat},${m.lng}(${encodeURIComponent(m.name)})`).catch(() => {})} />
          </Card>
        )} />
    </Screen>
  );
}
