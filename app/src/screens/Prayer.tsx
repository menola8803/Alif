import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AlifNativeModule } from '../../modules/alif-native';
import { ADHANS, isAdhan } from '../core/sounds';
import * as IntentLauncher from 'expo-intent-launcher';
import { useApp } from '../store';
import { locate, usePrayer } from '../prayer';
import { Route } from '../nav';
import { PRAYERS, PRAYER_AR, PRAYER_TR, Place, SALAH, SWEDEN, aladhanCityUrl, hhmm, parseCityMeta } from '../core/prayer';
import { askPermission } from '../reminder';
import { Arabic, Body, Btn, Card, Choice, Header, Label, Row, Screen, Segmented, SmallBtn, Text, TextInput, Toggle } from '../ui';

/** Settings › Prayer times: place, method, ʿaṣr, the rule for short summer nights and the notifications. */
export default function PrayerScreen({ onBack, go }: { onBack: () => void; go: (r: Route) => void }) {
  const { t, theme, place, useLocation, school, highLat, prayerNotify, setPrefs, prayerSound, prayerSoundName, lockPrayer } = useApp();
  const { today, source, refresh } = usePrayer();
  const soundName = prayerSound === 'default' ? t.soundDefault : prayerSound === 'silent' ? t.soundSilent : isAdhan(prayerSound) ? ADHANS.find(a => a.id === prayerSound)?.name ?? t.adhanTitle : prayerSoundName || t.soundPhone.replace('…', '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const setLocation = async (on: boolean) => {
    if (!on) { setPrefs({ useLocation: false }); return; }
    setBusy(true); setMsg('');
    const p = await locate();
    setBusy(false);
    if (!p) { setMsg(t.locationDenied); return; }
    setPrefs({ useLocation: true, place: { name: p.name || t.myPlace, country: p.country, lat: p.lat, lng: p.lng } });
  };
  const notify = async (k: typeof SALAH[number], on: boolean) => {
    if (on && !(await askPermission())) { setMsg(t.reminderDenied); return; }
    setPrefs({ prayerNotify: { ...prayerNotify, [k]: on } });
  };
  const openAndroid = (action: string, data?: string) => {
    if (Platform.OS !== 'android') return;
    IntentLauncher.startActivityAsync(action, data ? { data } : undefined).catch(() => Linking.openSettings().catch(() => {}));
  };

  return (
    <Screen>
      <Header title={t.prayerTimes} sub={t.prayerTimesSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <Card>
          <Label>{t.today}</Label>
          {today ? PRAYERS.map(k => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ width: 80, fontSize: 15, fontWeight: '600', color: theme.ink }}>{PRAYER_TR[k]}</Text>
              <Arabic size={18} selectable={false} style={{ flex: 1, textAlign: 'left', lineHeight: 32 }}>{PRAYER_AR[k]}</Arabic>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>{hhmm(today.times[k])}</Text>
            </View>
          )) : <ActivityIndicator color={theme.primary} />}
          <Text style={{ fontSize: 12, color: theme.muted }}>{source === 'aladhan' ? t.sourceAladhan : t.sourcePhone}</Text>
          <SmallBtn title={t.refresh} onPress={refresh} />
        </Card>

        <Label>{t.place}</Label>
        <Card>
          <Row title={place.name} sub={place.country} right={t.change} onPress={() => go({ name: 'city' })} />
          <Toggle title={t.useLocation} on={useLocation} onChange={setLocation} />
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.useLocationSub}</Text>
          {busy ? <ActivityIndicator color={theme.primary} /> : null}
          {msg ? <Text style={{ color: theme.danger, fontSize: 13 }}>{msg}</Text> : null}
        </Card>

        <Label>{t.calculation}</Label>
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.ink }}>Muslim World League</Text>
          <Text style={{ fontSize: 13, color: theme.muted }}>{t.mwlSub}</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>ʿAṣr</Text>
          <Segmented options={[['hanafi', 'Ḥanafī'], ['standard', t.asrStandard]]} value={school} onChange={v => setPrefs({ school: v })} />
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.asrSub}</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>{t.highLat}</Text>
          <Segmented options={[['angle', t.hlAngle], ['middle', t.hlMiddle], ['seventh', t.hlSeventh]]} value={highLat} onChange={v => setPrefs({ highLat: v })} />
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.highLatSub}</Text>
        </Card>

        <Label>{t.prayerNotifs}</Label>
        <Card style={{ gap: 4 }}>
          {SALAH.map(k => <Toggle key={k} title={PRAYER_TR[k]} on={prayerNotify[k]} onChange={v => notify(k, v)} />)}
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.prayerNotifsSub}</Text>
          {AlifNativeModule ? <Row title={t.prayerSound} right={soundName} onPress={() => go({ name: 'prayerSound' })} /> : null}
          {AlifNativeModule ? <Toggle title={t.lockPrayer} on={lockPrayer} onChange={async v => { if (v && !(await askPermission())) return; setPrefs({ lockPrayer: v }); }} /> : null}
        </Card>
        {Platform.OS === 'android' ? (
          <Card>
            <Label>{t.onTime}</Label>
            <Body muted>{t.onTimeSub}</Body>
            <Btn title={t.allowAlarms} kind="secondary" onPress={() => openAndroid('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', 'package:se.sncab.alif')} />
            <Btn title={t.batterySettings} kind="secondary" onPress={() => openAndroid('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS')} />
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

/** Choosing the town: the Swedish list, or any place in the world looked up by name. */
export function CityScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, place, setPrefs } = useApp();
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return k ? SWEDEN.filter(c => c.name.toLowerCase().includes(k)) : SWEDEN;
  }, [q]);
  const choose = (p: Place) => { setPrefs({ place: p, useLocation: false }); onBack(); };
  const lookUp = async () => {
    const city = q.trim(), land = country.trim() || 'Sweden';
    if (!city) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch(aladhanCityUrl(city, land), { headers: { Accept: 'application/json' } });
      const meta = r.ok ? parseCityMeta(await r.json()) : null;
      if (!meta) setErr(t.cityNotFound);
      else choose({ name: city, country: land, ...meta });
    } catch { setErr(t.errNetwork); }
    setBusy(false);
  };
  return (
    <Screen>
      <Header title={t.place} sub={`${place.name}, ${place.country}`} onBack={onBack} />
      <TextInput value={q} onChangeText={setQ} placeholder={t.searchCity} placeholderTextColor={theme.muted}
        style={{ minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.card, paddingHorizontal: 14, color: theme.ink, fontSize: 15 }} />
      <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
        {list.map(c => <Choice key={c.name} title={c.name} sub={c.country} on={c.name === place.name && c.lat === place.lat} onPress={() => choose(c)} />)}
        <Card>
          <Label>{t.otherPlace}</Label>
          <Text style={{ fontSize: 13, color: theme.muted }}>{t.otherPlaceSub}</Text>
          <TextInput value={country} onChangeText={setCountry} placeholder={t.countryPh} placeholderTextColor={theme.muted}
            style={{ minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.bg, paddingHorizontal: 12, color: theme.ink }} />
          <Btn title={busy ? t.checking : t.findPlace.replace('{q}', q.trim() || '…')} disabled={busy || !q.trim()} onPress={lookUp} />
          {err ? <Text style={{ color: theme.danger }}>{err}</Text> : null}
        </Card>
      </ScrollView>
    </Screen>
  );
}

/** Settings › Prayer times › Sound: the phone's sound, silence, five adhans, a sound from the phone or an own file. */
export function PrayerSoundScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, lang, prayerSound, prayerSoundName, fajrAdhan, prayerAlarm, setPrefs } = useApp();
  const [playing, setPlaying] = useState('');
  const [msg, setMsg] = useState('');
  const N = AlifNativeModule;
  useEffect(() => () => N?.stopSound(), [N]);
  const play = (s: string) => {
    if (!N) return;
    if (playing === s) { N.stopSound(); setPlaying(''); return; }
    N.previewSound(s); setPlaying(s);
  };
  const choose = (s: string, name = '') => { setMsg(''); setPrefs({ prayerSound: s, prayerSoundName: name }); };
  const phone = async () => {
    N?.stopSound(); setPlaying('');
    const r = await N?.pickPhoneSound(prayerSound.startsWith('content://') ? prayerSound : null, t.prayerSound).catch(() => null);
    if (r) choose(r.uri, r.title);
  };
  const file = async () => {
    N?.stopSound(); setPlaying('');
    if (Platform.OS === 'android' && Number(Platform.Version) < 29) { setMsg(t.soundFileOld); return; }
    const r = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (r.canceled || !r.assets?.[0]) return;
    const a = r.assets[0];
    const title = a.name.replace(/\.[^.]+$/, '');
    const uri = await N?.importSound(a.uri, title).catch(() => null);
    if (uri) choose(uri, title); else setMsg(t.soundFailed);
  };
  const PlayBtn = ({ s }: { s: string }) => (
    <Pressable accessibilityRole="button" accessibilityLabel={playing === s ? t.soundStop : t.soundPlay} onPress={() => play(s)}
      style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.primary, fontSize: 15 }}>{playing === s ? t.soundStop : t.soundPlay}</Text>
    </Pressable>
  );
  const own = prayerSound.startsWith('content://');
  return (
    <Screen>
      <Header title={t.prayerSound} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
        <Choice title={t.soundDefault} on={prayerSound === 'default'} onPress={() => choose('default')} />
        <Choice title={t.soundSilent} on={prayerSound === 'silent'} onPress={() => choose('silent')} />
        <Label>{t.adhanTitle}</Label>
        {ADHANS.map(a => (
          <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}><Choice title={a.name} sub={a[lang]} on={prayerSound === a.id} onPress={() => choose(a.id)} /></View>
            <PlayBtn s={a.id} />
          </View>
        ))}
        {isAdhan(prayerSound) ? (
          <Card style={{ paddingVertical: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}><Toggle title={t.fajrAdhan} on={fajrAdhan} onChange={v => setPrefs({ fajrAdhan: v })} /></View>
              <PlayBtn s="raw:adhan_fajr" />
            </View>
            <Text style={{ fontSize: 12.5, color: theme.muted }}>{t.fajrAdhanSub}</Text>
          </Card>
        ) : null}
        <Label>{t.soundPhone.replace('…', '')}</Label>
        <Choice title={own && prayerSoundName ? prayerSoundName : t.soundPhone} sub={t.soundPhoneSub} on={own} onPress={phone} />
        <Choice title={t.soundFile} sub={t.soundFileSub} on={false} onPress={file} />
        {msg ? <Text style={{ color: theme.danger, fontSize: 13 }}>{msg}</Text> : null}
        <Card style={{ paddingVertical: 8 }}>
          <Toggle title={t.soundAlarm} on={prayerAlarm} onChange={v => setPrefs({ prayerAlarm: v })} />
          <Text style={{ fontSize: 12.5, color: theme.muted }}>{t.soundAlarmSub}</Text>
        </Card>
        <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.soundNote}</Text>
      </ScrollView>
    </Screen>
  );
}
