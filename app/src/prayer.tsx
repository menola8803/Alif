// Prayer times on the phone: fetched a month at a time from Aladhan and saved, calculated on the phone when there is
// nothing saved and no internet. Also keeps the Hijri date in step with Umm al-Qurā and schedules a notification for
// each of the five prayers (the next days, renewed every time the app is opened).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { useApp } from './store';
import { PRAYER_TR, PrayerDay, SALAH, calcDay, fetchMonth, hhmm, nextPrayer, ymd } from './core/prayer';
import { MONTHS, offsetFor, toHijri } from './core/hijri';
import { AlifNativeModule } from '../modules/alif-native';

export type PrayerSource = 'aladhan' | 'phone';
type Ctx = {
  today?: PrayerDay; tomorrow?: PrayerDay; source: PrayerSource; now: Date;
  next: ReturnType<typeof nextPrayer>;
  dayFor: (d: Date) => PrayerDay;
  refresh: () => void;
  hijriOffset: number;                 // auto + the person's adjustment
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const usePrayer = () => useContext(C);

const CHANNEL = 'prayer';
const cacheKey = (k: string, ym: string) => `alif.prayer.v1.${k}.${ym}`;
const ymOf = (d: Date) => ymd(d).slice(0, 7);

/** Gets the phone's position (only called when the person has turned location on). */
export async function locate(): Promise<{ lat: number; lng: number; name: string; country: string } | null> {
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted) { const r = await Location.requestForegroundPermissionsAsync(); if (!r.granted) return null; }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    let name = '', country = '';
    try {
      const g = (await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }))[0];
      name = g?.city || g?.subregion || g?.district || ''; country = g?.country || '';
    } catch {}
    return { lat: pos.coords.latitude, lng: pos.coords.longitude, name, country };
  } catch { return null; }
}

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const { ready, place, school, highLat, prayerNotify, hijriAdjust, hijriAuto, setPrefs, t, notifV2, useLocation } = useApp();
  const [days, setDays] = useState<Record<string, PrayerDay>>({});
  const [now, setNow] = useState(() => new Date());
  const placeKey = `${place.lat.toFixed(3)},${place.lng.toFixed(3)}.${school}.${highLat}`;
  const loading = useRef('');

  // Loads (or fetches) this month and, from the 20th, next month.
  const load = useCallback(async () => {
    const d = new Date();
    const months = [d];
    if (d.getDate() >= 20) months.push(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    const got: Record<string, PrayerDay> = {};
    for (const m of months) {
      const ym = ymOf(m), key = cacheKey(placeKey, ym);
      let list: PrayerDay[] | null = null;
      try { const raw = await AsyncStorage.getItem(key); if (raw) list = JSON.parse(raw); } catch {}
      if (!list) {
        try {
          list = await fetchMonth(place, m.getFullYear(), m.getMonth() + 1, { school, highLat });
          AsyncStorage.setItem(key, JSON.stringify(list)).catch(() => {});
        } catch { list = null; }
      }
      for (const day of list ?? []) got[day.date] = day;
    }
    setDays(got);
  }, [place, placeKey, school, highLat]);

  useEffect(() => {
    if (!ready || loading.current === placeKey) return;
    loading.current = placeKey;
    load();
  }, [ready, placeKey, load]);

  // With location on, the position is checked again at start (it follows you when you travel).
  useEffect(() => {
    if (!ready || !useLocation) return;
    locate().then(p => {
      if (p && (Math.abs(p.lat - place.lat) > 0.05 || Math.abs(p.lng - place.lng) > 0.05)) setPrefs({ place: { name: p.name || t.myPlace, country: p.country, lat: p.lat, lng: p.lng } });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, useLocation]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    const s = AppState.addEventListener('change', st => { if (st === 'active') { setNow(new Date()); load(); } });
    return () => { clearInterval(id); s.remove(); };
  }, [load]);

  const dayFor = useCallback((d: Date) => days[ymd(d)] ?? calcDay(d, place, { school, highLat }), [days, place, school, highLat]);
  const todayKey = ymd(now);
  const today = dayFor(now);
  const tomorrow = dayFor(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const source: PrayerSource = days[todayKey] ? 'aladhan' : 'phone';

  // Keep the arithmetic Hijri calendar in step with Umm al-Qurā.
  useEffect(() => {
    const h = days[todayKey]?.hijri;
    if (!h) return;
    const off = offsetFor(new Date(), h);
    if (off !== hijriAuto) setPrefs({ hijriAuto: off });
  }, [days, todayKey, hijriAuto, setPrefs]);

  // Notifications for the five prayers, the next six days.
  useEffect(() => {
    if (!ready || !notifV2) return; // wait until the reminder has cleared notifications from older versions
    let cancelled = false;
    (async () => {
      try {
        const all = await Notifications.getAllScheduledNotificationsAsync();
        for (const n of all) if (n.identifier.startsWith('prayer-')) await Notifications.cancelScheduledNotificationAsync(n.identifier);
        const wanted = SALAH.filter(k => prayerNotify[k]);
        if (!wanted.length || cancelled) return;
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(CHANNEL, {
            name: t.prayerChannel, importance: Notifications.AndroidImportance.HIGH,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, vibrationPattern: [0, 300, 200, 300], lightColor: '#E8B04A',
          });
        }
        const perm = await Notifications.getPermissionsAsync();
        if (!perm.granted) return;
        const start = new Date();
        for (let i = 0; i < 6 && !cancelled; i++) {
          const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
          const day = dayFor(d);
          for (const k of wanted) {
            const at = new Date(d); at.setHours(0, day.times[k], 0, 0);
            if (at.getTime() <= Date.now() + 30000) continue;
            await Notifications.scheduleNotificationAsync({
              identifier: `prayer-${day.date}-${k}`,
              content: { title: `${PRAYER_TR[k]} · ${hhmm(day.times[k])}`, body: t.prayerNotifBody.replace('{p}', PRAYER_TR[k]).replace('{c}', place.name), data: { open: 'today' } },
              trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
            });
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, notifV2, days, place.name, prayerNotify, t.prayerNotifBody, todayKey]);

  // Home screen widget: the times of today and the next two days, the Hijri date and the place.
  useEffect(() => {
    if (!ready || !AlifNativeModule) return;
    try {
      const base = new Date();
      const out = [0, 1, 2].map(k => {
        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + k);
        const day = dayFor(d);
        const times: Record<string, number> = {};
        for (const p of SALAH) { const at = new Date(d); at.setHours(0, day.times[p], 0, 0); times[p] = at.getTime(); }
        return { date: day.date, times };
      });
      const h = toHijri(base, hijriAuto + hijriAdjust);
      AlifNativeModule.setWidgetData(JSON.stringify({ days: out, names: PRAYER_TR, labelNext: t.nextPrayer.toUpperCase(), hijri: `${h.d} ${MONTHS[h.m - 1].tr} ${h.y}`, place: place.name }));
    } catch {}
  }, [ready, days, todayKey, place.name, hijriAuto, hijriAdjust, t.nextPrayer, dayFor]);

  const value = useMemo<Ctx>(() => ({
    today, tomorrow, source, now, next: nextPrayer(now, today, tomorrow), dayFor, refresh: () => { loading.current = ''; load(); },
    hijriOffset: hijriAuto + hijriAdjust,
  }), [today, tomorrow, source, now, dayFor, load, hijriAuto, hijriAdjust]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
