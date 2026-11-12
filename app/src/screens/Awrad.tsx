import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Vibration, View, useWindowDimensions } from 'react-native';
import { useApp } from '../store';
import { pictureFor } from '../pictures';
import { PictureBand } from '../today';
import { Route } from '../nav';
import { AlifNativeModule } from '../../modules/alif-native';
import { ADHANS, isAdhan } from '../core/sounds';
import { useQuran } from '../library';
import { AWRAD, AwradStep, IhdaShaykh, Level, SALAWAT_SAYYIDINA, countFor, dayKey, formatTime, ihdaArabic, ihdaMeaning, isMTF } from '../core/awrad';
import { transliterate } from '../core/translit';
import { arabicDigits } from '../translate';
import { askPermission, timeZone, uses12h } from '../reminder';
import { Arabic, Body, Card, Header, Label, Row, Screen, Segmented, SmallBtn, Text, Toggle } from '../ui';

function Step({ s, n, need, onTap, onUndo }: { s: AwradStep; n: number; need: number; onTap: () => void; onUndo: () => void }) {
  const { t, theme, lang, scheme, mode, showTranslation, ihdaShaykh, setPrefs } = useApp();
  const ihda = s.id === 'ihda';
  const lib = useQuran();
  const done = n >= need;
  const ayahs = s.quran ? lib.ayahs(s.quran.surah, s.quran.from, s.quran.to) : null;
  const arabic = ihda ? ihdaArabic(ihdaShaykh) : s.arabic ?? (ayahs ? ayahs.map(a => `${a.arabic} ۝${arabicDigits(a.n)}`).join(' ') : '');
  const translit = useMemo(() => (arabic ? transliterate(arabic, { scheme, mode }) : ''), [arabic, scheme, mode]);
  const meaning = ihda ? ihdaMeaning(ihdaShaykh, lang) : s.meaning?.[lang] ?? (ayahs && ayahs.some(a => a.translation) ? ayahs.map(a => a.translation).join(' ') : '');

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${s.title[lang]} ${n}/${need}`} onPress={onTap} onLongPress={onUndo}
      style={({ pressed }) => ({ backgroundColor: theme.card, borderRadius: 22, borderWidth: 1, borderColor: done ? theme.good : theme.line, padding: 16, gap: 10, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>{s.title[lang]}</Text>
          {s.optional ? <Text style={{ fontSize: 12, color: theme.muted }}>{t.optional}</Text> : null}
        </View>
        <View style={{ minWidth: 74, paddingHorizontal: 10, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? theme.good : theme.chip }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: done ? theme.onPrimary : theme.ink }}>{done ? `✓ ${need}` : `${n} / ${need}`}</Text>
        </View>
      </View>
      {arabic ? <Arabic size={s.quran || ihda ? undefined : 28}>{arabic}</Arabic> : s.quran ? <Text style={{ color: theme.muted }}>{t.loadingQuran}</Text> : null}
      {translit ? <Text selectable style={{ fontSize: 15, lineHeight: 22, color: theme.accent, fontWeight: '500' }}>{translit}</Text> : null}
      {meaning && showTranslation ? <Body muted>{meaning}</Body> : null}
      {s.note ? <Text style={{ fontSize: 13, lineHeight: 19, color: theme.muted, fontStyle: 'italic' }}>{s.note[lang]}</Text> : null}
      {need > 1 && !done ? <Text style={{ fontSize: 12, color: theme.muted }}>{n > 0 ? `${t.tapToCount} · ${t.holdToReset}` : t.tapToCount}</Text> : done ? <Text style={{ fontSize: 12, color: theme.muted }}>{t.holdToReset}</Text> : null}
    </Pressable>
  );
}

export default function Awrad({ onBack, onReminder }: { onBack: () => void; onReminder: () => void }) {
  const { t, theme, awradLevel, awradDay, awradCounts, setPrefs, reminderOn, reminderHour, reminderMinute, awradImg } = useApp();
  const { width } = useWindowDimensions();
  const awradPic = awradImg === 'none' ? null : pictureFor(awradImg);
  const now = new Date();
  const today = dayKey(now);
  const counts = awradDay === today ? awradCounts : {};
  const steps = AWRAD;
  const need = (s: AwradStep) => countFor(s, awradLevel, now);
  const required = steps.filter(s => !s.optional);
  const doneN = required.filter(s => (counts[s.id] ?? 0) >= need(s)).length;
  const allDone = doneN === required.length;

  const set = (id: string, v: number) => setPrefs({ awradDay: today, awradCounts: { ...counts, [id]: Math.max(0, v) } });

  return (
    <Screen>
      <Header title={t.awrad} sub={t.awradSub} onBack={onBack} />
      <ScrollView style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 12, paddingBottom: 12, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        {awradPic ? <PictureBand src={awradPic.src} focus={awradPic.focus} height={Math.min(width * 1.15, 470)} /> : null}
        <Card style={{ alignItems: 'center' }}>
          <Arabic center size={24} color={theme.primary}>{SALAWAT_SAYYIDINA}</Arabic>
          <Text style={{ fontSize: 13, color: theme.muted, textAlign: 'center', lineHeight: 19 }}>{t.awradIntro}</Text>
          <View style={{ alignSelf: 'stretch' }}>
            <Segmented<Level> options={[['mubtadi', t.levelMubtadi], ['mustaid', t.levelMustaid], ['murid', t.levelMurid]]} value={awradLevel} onChange={v => setPrefs({ awradLevel: v })} />
          </View>
          <View style={{ alignSelf: 'stretch', gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Label>{t.awradProgress}</Label>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.ink }}>{doneN} / {required.length}</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.chip, overflow: 'hidden' }}>
              <View style={{ width: `${(doneN / required.length) * 100}%`, height: 8, backgroundColor: allDone ? theme.good : theme.primary }} />
            </View>
            {allDone ? <Text style={{ color: theme.good, fontWeight: '600', textAlign: 'center' }}>{t.awradDone}</Text> : null}
            {isMTF(now) ? <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center' }}>{t.mtfNote}</Text> : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <SmallBtn title={`${t.reminder}: ${reminderOn ? formatTime(reminderHour, reminderMinute, uses12h()) : t.off}`} tone="accent" onPress={onReminder} />
            <SmallBtn title={t.awradReset} onPress={() => Alert.alert(t.awradReset, t.awradResetConfirm, [{ text: t.cancel, style: 'cancel' }, { text: 'OK', onPress: () => setPrefs({ awradDay: today, awradCounts: {} }) }])} />
          </View>
        </Card>
        {steps.map((s, i) => {
          const n = counts[s.id] ?? 0;
          // A heading where part one and part two begin, as in the awrad booklet.
          const head = i === 0 || steps[i - 1].part !== s.part;
          return (
            <React.Fragment key={s.id}>
              {head ? <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.2, color: theme.accent, marginTop: i ? 10 : 0 }}>{(s.part === 1 ? t.awradPart1 : t.awradPart2).toUpperCase()}</Text> : null}
              <Step s={s} n={n} need={need(s)} onTap={() => set(s.id, n >= need(s) ? n : n + 1)} onUndo={() => { if (n > 0) { Vibration.vibrate(40); set(s.id, 0); } }} />
            </React.Fragment>
          );
        })}
        <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 17 }}>{t.awradSource}</Text>
      </ScrollView>
    </Screen>
  );
}

export function ReminderScreen({ onBack, go }: { onBack: () => void; go?: (r: Route) => void }) {
  const { t, theme, reminderOn, reminderHour, reminderMinute, setPrefs, awradSound, awradSoundName } = useApp();
  const soundName = awradSound === 'default' ? t.soundDefault : awradSound === 'silent' ? t.soundSilent : isAdhan(awradSound) ? ADHANS.find(a => a.id === awradSound)?.name ?? t.adhanTitle : awradSoundName || t.soundPhone.replace('…', '');
  const [denied, setDenied] = useState(false);
  const h12 = uses12h();
  const setTime = (h: number, m: number) => setPrefs({ reminderHour: (h + 24) % 24, reminderMinute: (m + 60) % 60 });
  const toggle = async (v: boolean) => {
    setPrefs({ reminderOn: v });
    if (v) setDenied(!(await askPermission()));
  };
  const Stepper = ({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) => (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} +`} onPress={onPlus} style={{ width: 64, height: 44, borderRadius: 14, backgroundColor: theme.chip, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 22, color: theme.ink }}>＋</Text></Pressable>
      <Text style={{ fontSize: 44, fontWeight: '700', color: theme.primary, fontVariant: ['tabular-nums'] }}>{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} −`} onPress={onMinus} style={{ width: 64, height: 44, borderRadius: 14, backgroundColor: theme.chip, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 22, color: theme.ink }}>－</Text></Pressable>
    </View>
  );
  const shownHour = h12 ? (reminderHour % 12 === 0 ? 12 : reminderHour % 12) : reminderHour;
  return (
    <Screen>
      <Header title={t.reminder} sub={t.reminderSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        <Card>
          <Toggle title={t.reminderOn} on={reminderOn} onChange={toggle} />
          {denied ? <Text style={{ color: theme.danger }}>{t.reminderDenied}</Text> : null}
        </Card>
        <Card style={{ alignItems: 'center', opacity: reminderOn ? 1 : 0.5 }}>
          <Label>{t.reminderTime}</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Stepper label="h" value={String(shownHour).padStart(2, '0')} onPlus={() => setTime(reminderHour + 1, reminderMinute)} onMinus={() => setTime(reminderHour - 1, reminderMinute)} />
            <Text style={{ fontSize: 40, fontWeight: '700', color: theme.primary }}>:</Text>
            <Stepper label="min" value={String(reminderMinute).padStart(2, '0')} onPlus={() => setTime(reminderHour, reminderMinute + 5)} onMinus={() => setTime(reminderHour, reminderMinute - 5)} />
            {h12 ? <Text style={{ fontSize: 22, fontWeight: '700', color: theme.muted }}>{reminderHour < 12 ? 'AM' : 'PM'}</Text> : null}
          </View>
          <Text style={{ fontSize: 15, color: theme.ink, fontWeight: '600' }}>{formatTime(reminderHour, reminderMinute, false)}  ·  {formatTime(reminderHour, reminderMinute, true)}</Text>
          <SmallBtn title={t.reminderDefault} onPress={() => setTime(21, 0)} />
          <Text style={{ fontSize: 12, color: theme.muted }}>{t.reminderZone}{timeZone() ? `: ${timeZone()}` : ''}</Text>
        </Card>
        {go && AlifNativeModule ? <Card style={{ paddingVertical: 4, opacity: reminderOn ? 1 : 0.5 }}><Row title={t.awradSoundTitle} right={soundName} onPress={() => go({ name: 'prayerSound', target: 'awrad' })} /></Card> : null}
        <Body muted>{t.reminderHelp}</Body>
      </ScrollView>
    </Screen>
  );
}
