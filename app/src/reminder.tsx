// Daily Awrad reminder: one notification every day at the chosen local time (default 21:00 / 9:00 PM). It follows the
// phone's time zone, so it moves with you when you travel. It is shown on the lock screen, and tapping it opens the Awrad.
// When the app is opened after the time and today's awrad is not finished, a reminder box pops up in the app as well.
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Modal, Platform, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useApp } from './store';
import { AWRAD, countFor, dayKey, formatTime, pastTime } from './core/awrad';
import { Arabic, Btn, Text } from './ui';
import { SALAWAT_SAYYIDINA } from './core/awrad';

const CHANNEL = 'awrad';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export const uses12h = () => { try { return /AM|PM/i.test(new Date(2000, 0, 1, 21).toLocaleTimeString()); } catch { return false; } };
export const timeZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; } };

export async function askPermission(): Promise<boolean> {
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const r = await Notifications.requestPermissionsAsync();
    return r.granted;
  } catch { return false; }
}

async function schedule(on: boolean, hour: number, minute: number, title: string, body: string) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!on) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Daily Awrad', importance: Notifications.AndroidImportance.HIGH,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, vibrationPattern: [0, 250, 150, 250], lightColor: '#E8B04A',
      });
    }
    if (!(await askPermission())) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { open: 'awrad' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
    });
  } catch {}
}

/** Keeps the scheduled notification in step with the settings, opens the Awrad from a tapped notification and shows the in-app popup. */
export function ReminderManager({ openAwrad, active }: { openAwrad: () => void; active: boolean }) {
  const { ready, t, theme, reminderOn, reminderHour, reminderMinute, awradDay, awradCounts, awradLevel, popupDay, setPrefs, lang } = useApp();
  const open = useRef(openAwrad); open.current = openAwrad;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!ready) return;
    schedule(reminderOn, reminderHour, reminderMinute, t.awradNotifTitle, t.awradNotifBody);
  }, [ready, reminderOn, reminderHour, reminderMinute, lang, t.awradNotifTitle, t.awradNotifBody]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(r => { if (r.notification.request.content.data?.open === 'awrad') open.current(); });
    Notifications.getLastNotificationResponseAsync().then(r => { if (r?.notification.request.content.data?.open === 'awrad') open.current(); }).catch(() => {});
    return () => sub.remove();
  }, []);

  // re-check when the app comes back and once a minute
  useEffect(() => {
    const s = AppState.addEventListener('change', st => { if (st === 'active') setNow(new Date()); });
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => { s.remove(); clearInterval(id); };
  }, []);

  const today = dayKey(now);
  const done = awradDay === today && AWRAD.filter(s => !s.optional).every(s => (awradCounts[s.id] ?? 0) >= countFor(s, awradLevel, now));
  const show = ready && active && reminderOn && pastTime(reminderHour, reminderMinute, now) && !done && popupDay !== today;
  const close = () => setPrefs({ popupDay: today });

  return (
    <Modal visible={show} transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(5,10,11,0.72)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 26, borderWidth: 1, borderColor: theme.primary, padding: 22, gap: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.4, color: theme.accent, textAlign: 'center' }}>{formatTime(reminderHour, reminderMinute, uses12h()).toUpperCase()} · DAILY AWRAD</Text>
          <Arabic center size={24} color={theme.primary}>{SALAWAT_SAYYIDINA}</Arabic>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.ink, textAlign: 'center' }}>{t.awradPopupTitle}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: theme.muted, textAlign: 'center' }}>{t.awradPopupBody}</Text>
          <Btn title={t.awradOpen} onPress={() => { close(); open.current(); }} />
          <Btn title={t.awradLater} kind="secondary" onPress={close} />
        </View>
      </View>
    </Modal>
  );
}
