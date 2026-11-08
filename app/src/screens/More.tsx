import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useApp } from '../store';
import { useRecitation } from '../recitation';
import { RECITERS } from '../core/recite';
import { LETTERS } from '../core/learn';
import { Arabic, Body, Btn, Card, Choice, Header, Label, Screen, Text, Toggle } from '../ui';

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
