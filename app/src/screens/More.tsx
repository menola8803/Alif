import React, { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useApp } from '../store';
import { Route } from '../nav';
import { useRecitation } from '../recitation';
import { RECITERS } from '../core/recite';
import { LETTERS } from '../core/learn';
import { Arabic, Body, Btn, Card, Choice, Header, Label, Screen, Segmented, Text, Toggle } from '../ui';
import { usePrayer } from '../prayer';
import { askPermission } from '../reminder';
import { PRAYER_TR, SALAH, hhmm } from '../core/prayer';

/** Settings › Recitation: reciter, downloads only on wifi, what is downloaded, remove downloads. */
export function RecitationScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, reciter, wifiOnly, setPrefs } = useApp();
  const rec = useRecitation();
  const st = rec.stats();
  return (
    <Screen>
      <Header title={t.recitation} sub={t.recitationSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        {RECITERS.map(r => (
          <Choice key={r.id} title={r.name} sub={`${r.ar} · ${r.style}`} on={reciter === r.id} onPress={() => setPrefs({ reciter: r.id })} />
        ))}
        <Label>{t.downloads}</Label>
        <Card>
          <Text style={{ fontSize: 15, color: theme.ink }}>{t.downloadedStats.replace('{n}', String(st.surahs)).replace('{mb}', String(st.mb))}</Text>
          <Text style={{ fontSize: 12.5, color: theme.muted }}>{t.wholeQuranSize}</Text>
          <Toggle title={t.wifiOnly} on={wifiOnly} onChange={v => setPrefs({ wifiOnly: v })} />
          <Btn title={t.removeDownloads} kind="danger" disabled={!st.mb} onPress={rec.removeAll} />
        </Card>
        <Body muted>{t.recitationHelp}</Body>
      </ScrollView>
    </Screen>
  );
}

/** Settings › Backup: everything in a file you can keep anywhere, and read back. */
export function BackupScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, backup, restore } = useApp();
  const [msg, setMsg] = useState('');
  const save = async () => {
    setMsg('');
    try {
      const d = new Date();
      const f = new File(Paths.cache, `alif-backup-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`);
      if (f.exists) f.delete();
      f.create();
      f.write(JSON.stringify(backup()));
      await Sharing.shareAsync(f.uri, { mimeType: 'application/json', dialogTitle: t.backupSave });
    } catch { setMsg(t.backupFail); }
  };
  const load = async () => {
    setMsg('');
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
      const a = r.canceled ? null : r.assets[0];
      if (!a) return;
      const ok = restore(JSON.parse(await new File(a.uri).text()));
      setMsg(ok ? t.backupRestored : t.backupWrong);
    } catch { setMsg(t.backupWrong); }
  };
  return (
    <Screen>
      <Header title={t.backup} sub={t.backupSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        <Card>
          <Body>{t.backupHelp}</Body>
          <Btn title={t.backupSave} onPress={save} />
          <Btn title={t.backupLoad} kind="secondary" onPress={load} />
          {msg ? <Text style={{ color: theme.accent }}>{msg}</Text> : null}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const DAY = 86400000;
const BOX_DAYS = [0, 1, 2, 4, 8, 16];

/** Repetition cards for the letters (Leitner boxes): known letters come back after longer and longer breaks. */
export function CardsScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, lang, learnCards, setPrefs } = useApp();
  const now = Date.now();
  const due = LETTERS.filter(l => (learnCards[l.id]?.due ?? 0) <= now);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const l = due[i % Math.max(1, due.length)];
  const answer = (knew: boolean) => {
    const c = learnCards[l.id] ?? { box: 0, due: 0 };
    const box = knew ? Math.min(BOX_DAYS.length - 1, c.box + 1) : 0;
    setPrefs({ learnCards: { ...learnCards, [l.id]: { box, due: knew ? now + BOX_DAYS[box] * DAY : now } } });
    setShow(false);
    if (!knew) setI(x => x + 1);
  };
  const boxes = BOX_DAYS.map((_, b) => LETTERS.filter(x => (learnCards[x.id]?.box ?? 0) === b).length);
  return (
    <Screen>
      <Header title={t.cards} sub={t.cardsSub.replace('{n}', String(due.length))} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        {l ? (
          <Pressable accessibilityRole="button" onPress={() => setShow(true)}>
            <Card style={{ alignItems: 'center', minHeight: 300, justifyContent: 'center' }}>
              <Arabic size={110} center selectable={false} style={{ lineHeight: 180 }}>{l.ar}</Arabic>
              {show ? <>
                <Text style={{ fontSize: 24, fontWeight: '700', color: theme.ink }}>{l.name}</Text>
                <Text style={{ fontSize: 16, color: theme.accent }}>{t.sound}: {l.sound}</Text>
                <Text style={{ fontSize: 13.5, color: theme.muted, textAlign: 'center' }}>{l[lang]}</Text>
              </> : <Text style={{ color: theme.muted }}>{t.tapToShow}</Text>}
            </Card>
          </Pressable>
        ) : <Card><Body>{t.cardsDone}</Body></Card>}
        {l && show ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Btn title={t.again} kind="secondary" onPress={() => answer(false)} /></View>
            <View style={{ flex: 1 }}><Btn title={t.knewIt} onPress={() => answer(true)} /></View>
          </View>
        ) : null}
        <Card>
          <Label>{t.cardBoxes}</Label>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {boxes.map((n, b) => (
              <View key={b} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: theme.chip }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>{n}</Text>
                <Text style={{ fontSize: 10.5, color: theme.muted }}>{b === 0 ? t.newCards : `${BOX_DAYS[b]} d`}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 12.5, color: theme.muted }}>{t.cardsHelp}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

/** Settings › Microphone: off by default; what happens when it is on. */
export function MicSettingsScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, micOn, micOnlyPhone, listenTranslit, setPrefs } = useApp();
  const [msg, setMsg] = useState('');
  const setMic = async (on: boolean) => {
    setMsg('');
    if (!on) { setPrefs({ micOn: false }); setMsg(t.micOffDone); return; }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { requestRecordingPermissionsAsync } = require('expo-audio');
      const r = await requestRecordingPermissionsAsync();
      if (!r.granted) { setMsg(t.micDenied); return; }
    } catch { setMsg(t.micDenied); return; }
    setPrefs({ micOn: true });
  };
  return (
    <Screen>
      <Header title={t.micTitle} sub={t.micSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        <Card>
          <Toggle title={t.micToggle} on={micOn} onChange={setMic} />
          <Toggle title={t.micOnlyPhone} on={micOnlyPhone} onChange={v => setPrefs({ micOnlyPhone: v })} />
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.micOnlyPhoneSub}</Text>
          <Toggle title={t.listenTranslit} on={listenTranslit} onChange={v => setPrefs({ listenTranslit: v })} />
          {msg ? <Text style={{ color: theme.accent }}>{msg}</Text> : null}
          {!micOn ? <Btn title={t.openPhoneSettings} kind="secondary" onPress={() => Linking.openSettings().catch(() => {})} /> : null}
        </Card>
        <Card style={{ borderColor: theme.primary }}>
          <Label color={theme.primary}>{t.micRulesTitle}</Label>
          {t.micRules.map((r, i) => <Body key={i}>• {r}</Body>)}
        </Card>
      </ScrollView>
    </Screen>
  );
}

/** Settings › Widget and screen saver: the look of the widget, with a preview in the same colours. */
export function WidgetSettingsScreen({ onBack, go }: { onBack: () => void; go: (r: Route) => void }) {
  const { t, theme, widgetStyle, setPrefs, lockPrayer } = useApp();
  const { today, next } = usePrayer();
  const gold = theme.dark ? '#E8B04A' : '#9C6B22';
  const box = { backgroundColor: theme.dark ? '#172629' : '#FAF8F4', borderColor: theme.dark ? 'rgba(232,176,74,0.7)' : 'rgba(156,107,34,0.7)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 } as const;
  return (
    <Screen>
      <Header title={t.widgetTitle} sub={t.widgetSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        <Card style={{ paddingVertical: 8 }}>
          <Toggle title={t.lockPrayer} on={lockPrayer} onChange={async v => { if (v && !(await askPermission())) return; setPrefs({ lockPrayer: v }); }} />
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.lockPrayerSub}</Text>
        </Card>
        <Segmented<'full' | 'times'> options={[['full', t.widgetFull], ['times', t.widgetTimes]]} value={widgetStyle} onChange={v => setPrefs({ widgetStyle: v })} />
        <Text style={{ fontSize: 12.5, color: theme.muted }}>{widgetStyle === 'times' ? t.widgetTimesSub : t.widgetFullSub}</Text>
        {/* preview */}
        <View style={{ alignItems: 'center' }}>
          <View style={[box, { width: 280, gap: widgetStyle === 'times' ? 4 : 2 }]}>
            {widgetStyle === 'times' ? SALAH.map(k => {
              const on = next?.name === k;
              return (
                <View key={k} style={{ flexDirection: 'row' }}>
                  <Text style={{ flex: 1, fontSize: 15, color: gold, opacity: on ? 1 : 0.8, fontWeight: on ? '700' : '400' }}>{PRAYER_TR[k]}</Text>
                  <Text style={{ fontSize: 15, color: gold, opacity: on ? 1 : 0.8, fontWeight: on ? '700' : '400' }}>{today ? hhmm(today.times[k]) : '–'}</Text>
                </View>
              );
            }) : <>
              <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.1, color: gold, opacity: 0.7 }}>{t.nextPrayer.toUpperCase()}</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: gold }}>{next ? `${PRAYER_TR[next.name]}  ${String(next.at.getHours()).padStart(2, '0')}:${String(next.at.getMinutes()).padStart(2, '0')}` : '–'}</Text>
              <Text style={{ fontSize: 11, color: gold, opacity: 0.75, marginTop: 4 }}>{today ? SALAH.map(k => `${PRAYER_TR[k]} ${hhmm(today.times[k])}`).join('   ') : ''}</Text>
            </>}
          </View>
        </View>
        <Card><Body>{t.widgetTheme}</Body><Body muted>{t.widgetHow}</Body></Card>
        <Card>
          <Label>{t.nightClock}</Label>
          <Body muted>{t.nightClockSub}</Body>
          <Btn title={t.nightClockOpen} onPress={() => go({ name: 'nightClock' })} />
        </Card>
        <Card>
          <Label>{t.dreamTitle}</Label>
          <Body muted>{t.dreamHow}</Body>
          {Platform.OS === 'android' ? <Btn title={t.dreamOpen} kind="secondary" onPress={() => Linking.sendIntent('android.settings.DREAM_SETTINGS').catch(() => Linking.openSettings().catch(() => {}))} /> : null}
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.dreamMissing}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
