import React, { useMemo, useState } from 'react';
import { Alert, Image, Linking, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useApp } from '../store';
import { AlifNativeModule } from '../../modules/alif-native';
import * as ImagePicker from 'expo-image-picker';
import { PICTURES, importPicture, pictureFor, libraryPictures, pictureName, readInFolder, removeLibraryPicture } from '../pictures';
import { Route } from '../nav';
import { useRecitation } from '../recitation';
import { RECITERS } from '../core/recite';
import { LETTERS } from '../core/learn';
import { Arabic, Body, Btn, Card, Choice, Header, Label, Screen, Segmented, Text, Toggle , useButtonLook } from '../ui';
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
          {Platform.OS === 'android' ? <Btn title={t.dreamOpen} onPress={() => Linking.sendIntent('android.settings.DREAM_SETTINGS').catch(() => Linking.openSettings().catch(() => {}))} /> : null}
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.dreamMissing}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

/**
 * Settings › Pictures: one grid with all pictures. Hold a picture to choose what it is used for – Start (the start
 * screen), Today (the top of Today) or Awrad (under the Daily Awrad title); the choices show as labels in the corner.
 * Tap a picture with labels to take its choices away. Pictures are read in from Download/Alif/Pictures.
 */
type Role = 'startImg' | 'todayImg' | 'awradImg';
export function PicturesScreen({ onBack }: { onBack: () => void }) {
  const app = useApp();
  const { t, theme, setPrefs, picFolderMade } = app;
  const { width } = useWindowDimensions();
  const look = useButtonLook();
  const cell = (width - 32 - 16) / 3;
  const [ver, setVer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [menu, setMenu] = useState<string | null>(null);
  const lib = useMemo(() => libraryPictures(), [ver]); // eslint-disable-line react-hooks/exhaustive-deps
  const all = [...PICTURES, ...lib];
  const ROLES: [Role, string, string][] = [['startImg', t.picRoleStart, 'animated'], ['todayImg', t.picRoleToday, 'none'], ['awradImg', t.picRoleAwrad, 'none']];
  const rolesOf = (id: string) => ROLES.filter(([k]) => app[k] === id);
  const toggle = (id: string, k: Role, empty: string) => setPrefs({ [k]: app[k] === id ? empty : id } as never);
  const clear = (id: string) => setPrefs(Object.fromEntries(rolesOf(id).map(([k, , empty]) => [k, empty])) as never);
  const names = { minaret: t.picMinaret, picture: t.picPicture, none: t.picNoneShort, animated: t.picAnimated };

  const readIn = async () => {
    setBusy(true); setMsg('');
    if (!picFolderMade && AlifNativeModule) {
      const ok = await AlifNativeModule.makePictureFolder(t.picFolderNote).catch(() => false);
      if (ok) setPrefs({ picFolderMade: true });
    }
    const r = await readInFolder();
    setBusy(false); setVer(v => v + 1);
    if (!r) return setMsg('');
    setMsg(r.found === 0 ? t.picReadEmpty : r.added === 0 && r.failed === 0 ? t.picReadNone
      : t.picReadDone.replace('{n}', String(r.added)) + (r.failed ? ' ' + t.picReadFailed.replace('{n}', String(r.failed)) : ''));
  };
  const addOne = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsMultipleSelection: true, selectionLimit: 0 });
    if (r.canceled || !r.assets.length) return;
    setBusy(true);
    const ids: string[] = [];
    for (const a of r.assets) {
      const id = await importPicture(a.uri, a.fileName ?? `bild-${Date.now()}-${ids.length}.jpg`);
      if (id && id !== 'failed') ids.push(id);
    }
    setBusy(false); setVer(v => v + 1);
    if (ids.length === 1) setMenu(ids[0]);
    else if (ids.length) setMsg(t.picReadDone.replace('{n}', String(ids.length)));
  };
  const remove = (id: string) => Alert.alert(t.picRemove, t.picRemoveQ, [
    { text: t.cancel, style: 'cancel' },
    { text: t.picRemove, style: 'destructive', onPress: () => { clear(id); removeLibraryPicture(id); setMenu(null); setVer(v => v + 1); } },
  ]);

  return (
    <Screen>
      <Header title={t.picTitle} sub={t.picSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <Card style={{ gap: 4 }}>
          {ROLES.map(([k, label]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40 }}>
              <Text style={{ fontSize: 14, color: theme.muted }}>{label}</Text>
              {pictureFor(app[k])
                ? <Image source={pictureFor(app[k])!.src} resizeMode="cover" accessibilityLabel={label} style={{ width: 56, height: 36, borderRadius: 6, borderWidth: 1, borderColor: theme.line }} />
                : <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>{pictureName(app[k], names)}</Text>}
            </View>
          ))}
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18, marginTop: 4 }}>{t.picHowRoles}</Text>
        </Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {all.map(p => {
            const r = rolesOf(p.id);
            return (
              <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`${t.picPicture}${r.length ? ` · ${r.map(x => x[1]).join(', ')}` : ''}`}
                onPress={() => (r.length ? clear(p.id) : setMenu(p.id))} onLongPress={() => setMenu(p.id)} delayLongPress={400}
                style={{ width: cell, height: cell * 1.5, borderRadius: 12, overflow: 'hidden', borderWidth: r.length ? 2 : 1, borderColor: r.length ? theme.tabActive : theme.line, backgroundColor: theme.card }}>
                <Image source={p.src} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                {r.length ? (
                  <View style={{ position: 'absolute', top: 6, left: 6, gap: 4 }}>
                    {r.map(([k, label]) => (
                      <View key={k} style={{ backgroundColor: 'rgba(15,27,29,0.85)', borderWidth: 1, borderColor: theme.tabActive, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: theme.tabActive }}>{label}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          <Pressable accessibilityRole="button" onPress={addOne}
            style={{ width: cell, height: cell * 1.5, borderRadius: 12, borderWidth: 1, borderColor: look.border, backgroundColor: look.bg, alignItems: 'center', justifyContent: 'center', padding: 6 }}>
            <Text style={{ color: look.fg, fontSize: 13, textAlign: 'center' }}>{`＋ ${t.picOwn}`}</Text>
          </Pressable>
        </View>
        <Card style={{ gap: 8 }}>
          <Label>{t.picFolder}</Label>
          <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>{t.picFolderHow}</Text>
          <Btn title={busy ? t.picReading : t.picReadIn} onPress={readIn} disabled={busy} />
          {msg ? <Text style={{ fontSize: 13, color: theme.accent }}>{msg}</Text> : null}
          {lib.length ? <Text style={{ fontSize: 12, color: theme.muted }}>{t.picLibCount.replace('{n}', String(lib.length))}</Text> : null}
        </Card>
      </ScrollView>

      {/* What the held picture is used for */}
      <Modal visible={!!menu} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(5,10,11,0.75)', justifyContent: 'center', padding: 24 }} onPress={() => setMenu(null)}>
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.line, padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>{t.picUseFor}</Text>
            {menu ? ROLES.map(([k, label, empty]) => {
              const on = app[k] === menu;
              return (
                <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => toggle(menu, k, empty)}
                  style={{ minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: on ? theme.tabActive : look.border, backgroundColor: look.bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
                  <Text style={{ fontSize: 15, fontWeight: on ? '700' : '600', color: look.fg }}>{label}</Text>
                  <Text style={{ fontSize: 15, color: look.fg }}>{on ? '✓' : ''}</Text>
                </Pressable>
              );
            }) : null}
            {menu?.startsWith('lib:') ? <Btn kind="danger" title={t.picRemove} onPress={() => remove(menu)} /> : null}
            <Btn kind="secondary" title={t.picDone} onPress={() => setMenu(null)} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
