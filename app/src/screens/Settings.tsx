import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, View } from 'react-native';
import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { useApp } from '../store';
import { Route } from '../nav';
import { MODELS, askClaude, textBlock } from '../core/engine';
import { Edition, listEditions, pickEdition } from '../core/quran';
import { transliterate } from '../core/translit';
import { isNewer, latestRelease, notesFor, Release } from '../update';
import { downloadAndInstall } from '../updateInstall';
import { AlifMark, Arabic, Body, Btn, Card, Choice, H1, Header, Label, Row, Screen, Segmented, Sub, Text, TextInput, ThemePreview, Toggle } from '../ui';
import { themes, ThemeName } from '../theme';
import { Pressable } from 'react-native';
import { formatTime } from '../core/awrad';
import { deviceAvailable, ocrEngineFor, textEngine } from '../translate';
import { AlifNativeModule } from '../../modules/alif-native';
import type { Strings } from '../i18n';

export const engineLabel = (t: Strings, e: 'claude' | 'device' | 'mymemory') => (e === 'claude' ? t.engClaude : e === 'device' ? t.engDevice : t.engMyMemory);
import { uses12h } from '../reminder';
import { RECITERS } from '../core/recite';

export default function Settings({ go, onBack }: { go: (r: Route) => void; onBack: () => void }) {
  const { t, theme, lang, scheme, mode, apiKey, editions, reminderOn, reminderHour, reminderMinute, engine, place, school, hijriAdjust, setPrefs, updateTag, history, reciter, micOn, widgetStyle, dhikrVolume } = useApp();
  const version = Constants.expoConfig?.version ?? '0.0.0';
  const newer = !!updateTag && isNewer(updateTag, version);
  return (
    <Screen>
      <Header title={t.settings} sub={t.settingsSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        {newer ? (
          <Pressable accessibilityRole="button" onPress={() => go({ name: 'update' })}>
            <Card style={{ borderColor: theme.primary, borderWidth: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.primary }}>{t.newVersion}: {updateTag}</Text>
              <Text style={{ fontSize: 13, color: theme.muted }}>{t.updateReady}</Text>
            </Card>
          </Pressable>
        ) : null}
        <Card>
          <Row title={t.language} sub={t.languageSub} right={lang === 'sv' ? t.swedish : t.english} onPress={() => go({ name: 'language' })} />
          <Row title={t.theme} sub={t.themeSub} right={theme.name === 'dark' ? t.themeDark : t.themeBeige} onPress={() => go({ name: 'theme' })} />
          <Row title={t.translitSet} sub={t.translitSetSub} right={`${mode === 'tajwid' ? t.modeTajwid : t.modeWords} · ${scheme === 'academic' ? t.schemeAcademic : t.schemeSimple}`} onPress={() => go({ name: 'translit' })} />
          <Row title={t.engines} sub={t.enginesSub} right={engineLabel(t, textEngine({ engine, apiKey }))} onPress={() => go({ name: 'ai' })} />
          <Row title={t.quranEdition} sub={t.quranEditionSub} right={pickEdition(lang, editions[lang])} onPress={() => go({ name: 'edition' })} />
          <Row title={t.recitation} sub={t.recitationSub} right={RECITERS.find(r => r.id === reciter)?.name.split(' ').slice(-1)[0] ?? ''} onPress={() => go({ name: 'recitation' })} />
        </Card>
        <Card>
          <Row title={t.prayerTimes} sub={t.prayerTimesSub} right={`${place.name} · ${school === 'hanafi' ? 'Ḥanafī' : t.asrStandard}`} onPress={() => go({ name: 'prayer' })} />
          <Row title={`${t.awrad} · ${t.reminder}`} sub={t.reminderSub} right={reminderOn ? formatTime(reminderHour, reminderMinute, uses12h()) : t.off} onPress={() => go({ name: 'reminder' })} />
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.ink }}>{t.hijriAdjust}</Text>
            <Text style={{ fontSize: 13, color: theme.muted }}>{t.hijriAdjustSub}</Text>
            <Segmented options={[['-1', `−1 ${t.day}`], ['0', '0'], ['1', `+1 ${t.day}`]]} value={String(hijriAdjust) as '-1' | '0' | '1'} onChange={v => setPrefs({ hijriAdjust: Number(v) })} />
          </View>
        </Card>
        <Card>
          <Row title={t.historyTitle} sub={t.historySub} right={String(history.length)} onPress={() => go({ name: 'history' })} />
          <Row title={t.picTitle} sub={t.picSub} onPress={() => go({ name: 'pictures' })} />
          <Row title={t.widgetTitle} sub={t.widgetSub} right={widgetStyle === 'times' ? t.widgetTimes : t.widgetFull} onPress={() => go({ name: 'widgetSettings' })} />
          <Row title={t.micTitle} sub={t.micSub} right={micOn ? t.on : t.off} onPress={() => go({ name: 'micSettings' })} />
          {AlifNativeModule ? <View style={{ paddingVertical: 6, gap: 2 }}>
            <Toggle title={t.volumeCount} on={dhikrVolume} onChange={v => setPrefs({ dhikrVolume: v })} />
            <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.volumeCountSub}</Text>
          </View> : null}
          <Row title={t.backup} sub={t.backupSub} onPress={() => go({ name: 'backup' })} />
          <Row title={t.manual} sub={t.manualSub} onPress={() => go({ name: 'manual' })} />
          <Row title={t.privacy} sub={t.privacySub} onPress={() => go({ name: 'privacy' })} />
        </Card>
        <Card style={newer ? { borderColor: theme.primary } : undefined}>
          <Row title={t.update} sub={t.updateSub} right={newer ? `● ${updateTag}` : `v${version}`} onPress={() => go({ name: 'update' })} />
          <Row title={t.about} sub={t.developer} onPress={() => go({ name: 'about' })} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

export function LanguageScreen({ onBack }: { onBack: () => void }) {
  const { t, lang, setPrefs } = useApp();
  return (
    <Screen>
      <Header title={t.language} sub={t.languageSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 10 }}>
        <Choice title="Svenska" sub="Arabiska ⇄ svenska" on={lang === 'sv'} onPress={() => setPrefs({ lang: 'sv' })} />
        <Choice title="English" sub="Arabic ⇄ English" on={lang === 'en'} onPress={() => setPrefs({ lang: 'en' })} />
        <Body muted>{t.languageHelp}</Body>
      </ScrollView>
    </Screen>
  );
}

export function ThemeScreen({ onBack }: { onBack: () => void }) {
  const { t, themeName, setPrefs, theme } = useApp();
  const names: [ThemeName, string][] = [['dark', t.themeDark], ['beige', t.themeBeige]];
  return (
    <Screen>
      <Header title={t.theme} sub={t.themeSub} onBack={onBack} />
      <View style={{ flexDirection: 'row', gap: 14, justifyContent: 'center' }}>
        {names.map(([k, label]) => (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: themeName === k }} onPress={() => setPrefs({ themeName: k })} style={{ alignItems: 'center', gap: 8 }}>
            <View style={{ borderRadius: 20, padding: 4, borderWidth: 2, borderColor: themeName === k ? theme.primary : 'transparent' }}><ThemePreview th={themes[k]} /></View>
            <Text style={{ fontWeight: '600', color: theme.ink }}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const EXAMPLE = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝١ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ۝٢';

export function TranslitScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, scheme, mode, arabicSize, setPrefs } = useApp();
  return (
    <Screen>
      <Header title={t.translitSet} sub={t.translitSetSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
        <Card>
          <Label>{t.example}</Label>
          <Arabic size={24}>{EXAMPLE}</Arabic>
          <Text style={{ fontSize: 16, lineHeight: 24, color: theme.accent, fontWeight: '500' }}>{transliterate(EXAMPLE, { scheme, mode })}</Text>
        </Card>
        <Choice title={t.modeTajwid} sub={t.modeTajwidSub} on={mode === 'tajwid'} onPress={() => setPrefs({ mode: 'tajwid' })} />
        <Choice title={t.modeWords} sub={t.modeWordsSub} on={mode === 'words'} onPress={() => setPrefs({ mode: 'words' })} />
        <Segmented options={[['academic', `${t.schemeAcademic}  ${t.schemeAcademicSub}`], ['simple', `${t.schemeSimple}  aa ii uu`]]} value={scheme} onChange={v => setPrefs({ scheme: v })} />
        <Card>
          <Label>{t.arabicSize}</Label>
          <Segmented options={[['24', 'S'], ['30', 'M'], ['36', 'L'], ['44', 'XL']]} value={String(arabicSize) as '24' | '30' | '36' | '44'} onChange={v => setPrefs({ arabicSize: Number(v) })} />
        </Card>
        <Card>
          <Label>{t.rulesTitle}</Label>
          {t.rules.map((r, i) => <Body key={i} muted>• {r}</Body>)}
        </Card>
      </ScrollView>
    </Screen>
  );
}

export function EditionScreen({ onBack }: { onBack: () => void }) {
  const { t, lang, editions, setPrefs } = useApp();
  const [list, setList] = useState<Edition[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { listEditions(lang).then(setList).catch(() => setErr(t.editionsFail)); }, [lang, t.editionsFail]);
  const current = pickEdition(lang, editions[lang], list ?? undefined);
  return (
    <Screen>
      <Header title={t.quranEdition} sub={t.quranEditionSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
        {!list && !err ? <ActivityIndicator /> : null}
        {err ? <Body muted>{err}</Body> : null}
        {list?.map(e => (
          <Choice key={e.identifier} title={e.name || e.englishName} sub={`${e.englishName} · ${e.identifier}`} on={current === e.identifier} onPress={() => setPrefs({ editions: { ...editions, [lang]: e.identifier } })} />
        ))}
        <Body muted>{t.aboutQuran}</Body>
      </ScrollView>
    </Screen>
  );
}

export function AiScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, apiKey, setApiKey, model, setPrefs } = useApp();
  const [key, setKey] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const test = async () => {
    setBusy(true); setMsg('');
    try { await askClaude({ apiKey, model, system: 'Reply with OK.', content: [textBlock('OK?')], maxTokens: 5 }); setMsg(t.keyOk); }
    catch (e: any) { setMsg(e?.kind === 'badkey' ? t.errBadKey : e?.kind === 'network' ? t.errNetwork : `${t.errOther}: ${e?.message ?? ''}`); }
    setBusy(false);
  };
  const { engine, ocrEngine, live, lang } = useApp();
  const [models, setModels] = useState<string[] | null>(null);
  const [dl, setDl] = useState('');
  useEffect(() => { AlifNativeModule?.downloadedModels().then(setModels).catch(() => setModels([])); }, []);
  const haveModels = !!models && models.includes('ar') && models.includes(lang);
  const download = async () => {
    if (!AlifNativeModule) return;
    setDl(t.downloadingModels);
    try { await AlifNativeModule.translate('سلام', 'ar', lang, true); await AlifNativeModule.translate(lang === 'sv' ? 'fred' : 'peace', lang, 'ar', true); setModels(await AlifNativeModule.downloadedModels()); setDl(''); }
    catch { setDl(t.errModel); }
  };
  return (
    <Screen>
      <Header title={t.engines} sub={t.enginesSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
        <Card style={{ borderColor: theme.primary }}>
          <Label color={theme.primary}>{t.engInfoTitle}</Label>
          {t.engInfo.map(([title, body]) => (
            <View key={title} style={{ gap: 2 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>{title}</Text>
              <Text style={{ fontSize: 13.5, lineHeight: 20, color: theme.muted }}>{body}</Text>
            </View>
          ))}
        </Card>
        <Label>{t.engineText}</Label>
        <Choice title={t.engAuto} sub={`${t.engAutoSub} → ${engineLabel(t, textEngine({ engine: 'auto', apiKey }))}`} on={engine === 'auto'} onPress={() => setPrefs({ engine: 'auto' })} />
        <Choice title={t.engClaude} sub={t.engClaudeSub} on={engine === 'claude'} onPress={() => setPrefs({ engine: 'claude' })} />
        <Choice title={t.engDevice} sub={t.engDeviceSub} on={engine === 'device'} onPress={() => setPrefs({ engine: 'device' })}>
          {deviceAvailable() ? <Text style={{ fontSize: 12, color: haveModels ? theme.good : theme.muted, marginTop: 2 }}>{haveModels ? t.modelsReady : t.modelsMissing}</Text> : <Text style={{ fontSize: 12, color: theme.danger }}>{t.errNoDevice}</Text>}
        </Choice>
        {deviceAvailable() && !haveModels ? <Btn title={dl || t.downloadModels} kind="secondary" disabled={!!dl && dl === t.downloadingModels} onPress={download} /> : null}
        <Choice title={t.engMyMemory} sub={t.engMyMemorySub} on={engine === 'mymemory'} onPress={() => setPrefs({ engine: 'mymemory' })} />
        <Card><Toggle title={t.liveTranslate} on={live} onChange={v => setPrefs({ live: v })} /><Text style={{ fontSize: 13, color: theme.muted }}>{t.liveSub}</Text></Card>

        <Label>{t.engineOcr}</Label>
        <Choice title={t.engAuto} sub={`${t.engAutoSub} → ${ocrEngineFor({ ocrEngine: 'auto', apiKey }) === 'claude' ? t.ocrClaude : t.ocrDevice}`} on={ocrEngine === 'auto'} onPress={() => setPrefs({ ocrEngine: 'auto' })} />
        <Choice title={t.ocrClaude} sub={t.ocrClaudeSub} on={ocrEngine === 'claude'} onPress={() => setPrefs({ ocrEngine: 'claude' })} />
        <Choice title={t.ocrDevice} sub={t.ocrDeviceSub} on={ocrEngine === 'device'} onPress={() => setPrefs({ ocrEngine: 'device' })} />

        <Label>{t.claudeKey}</Label>
        <Card>
          <Label>{t.apiKey}</Label>
          <Text style={{ color: apiKey ? theme.good : theme.muted, fontWeight: '600' }}>{apiKey ? `${t.keySaved} (…${apiKey.slice(-4)})` : t.keyMissing}</Text>
          <TextInput value={key} onChangeText={setKey} placeholder={t.apiKeyPh} placeholderTextColor={theme.muted} autoCapitalize="none" autoCorrect={false} secureTextEntry
            style={{ minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.bg, paddingHorizontal: 14, color: theme.ink }} />
          <Btn title={t.saveKey} disabled={!key.trim()} onPress={async () => { await setApiKey(key); setKey(''); setMsg(t.keySaved); }} />
          {apiKey ? <Btn title={busy ? t.checking : t.testKey} kind="secondary" disabled={busy} onPress={test} /> : null}
          {apiKey ? <Btn title={t.removeKey} kind="danger" onPress={() => { setApiKey(''); setMsg(''); }} /> : null}
          {msg ? <Text style={{ color: theme.muted }}>{msg}</Text> : null}
        </Card>
        <Label>{t.model}</Label>
        {MODELS.map(m => <Choice key={m.id} title={m.label} sub={m.id} on={model === m.id} onPress={() => setPrefs({ model: m.id })} />)}
        <Body muted>{t.apiKeyHelp}</Body>
        <Text style={{ color: theme.accent, fontWeight: '600' }} onPress={() => Linking.openURL('https://console.anthropic.com/settings/keys').catch(() => {})}>console.anthropic.com ›</Text>
      </ScrollView>
    </Screen>
  );
}

export function UpdateScreen({ onBack, auto }: { onBack: () => void; auto?: boolean }) {
  const { theme, t, lang, updateAuto, setPrefs } = useApp();
  const cur = Constants.expoConfig?.version ?? '0.0.0';
  const [msg, setMsg] = useState(''); const [rel, setRel] = useState<Release | null>(null); const [busy, setBusy] = useState(false);
  const [part, setPart] = useState<number | null>(null);
  const install = async (r = rel) => {
    if (!r) return;
    if (!r.apk) { Linking.openURL(r.page).catch(() => {}); return; }
    setBusy(true); setMsg(t.downloading); setPart(0);
    try {
      await downloadAndInstall(r, { title: t.updatedTitle.replace('{v}', r.tag.replace(/^v/, '')), body: t.updatedBody, channel: t.updateChannel }, setPart);
      setMsg(t.installAllow);
    } catch { setMsg(t.installFail); }
    setBusy(false); setPart(null);
  };
  const check = async (andInstall = false) => {
    setBusy(true); setRel(null); setMsg(t.checking);
    try {
      const r = await latestRelease();
      setPrefs({ updateChecked: Date.now(), updateTag: r && isNewer(r.tag, cur) ? r.tag : '' });
      if (!r) setMsg(t.noRelease);
      else if (isNewer(r.tag, cur)) { setRel(r); setMsg(`${t.newVersion}: ${r.tag}`); if (andInstall) { setBusy(false); return install(r); } }
      else setMsg(t.upToDate);
    } catch { setMsg(t.updateFail); }
    setBusy(false);
  };
  // Opened from the card on Today: look and start right away
  useEffect(() => { if (auto) check(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen>
      <Header title={t.update} sub={t.updateSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <Card style={{ gap: 6 }}>
          <Text style={{ color: theme.ink }}>{t.version} {cur}</Text>
          {msg ? <Text style={{ color: theme.muted }}>{msg}</Text> : null}
          {part != null ? (
            <View style={{ gap: 4 }}>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.line, overflow: 'hidden' }}>
                <View style={{ width: `${Math.round(part * 100)}%`, height: 8, borderRadius: 4, backgroundColor: theme.tabActive }} />
              </View>
              <Text style={{ fontSize: 12, color: theme.muted }}>{`${Math.round(part * 100)} %`}</Text>
            </View>
          ) : null}
          {rel && notesFor(rel.notes, lang) ? <Text style={{ color: theme.muted, fontSize: 13, lineHeight: 19 }}>{notesFor(rel.notes, lang)}</Text> : null}
        </Card>
        <Btn title={busy && part == null ? t.checking : t.checkUpdate} onPress={() => check()} disabled={busy} />
        {rel ? <Btn title={t.installUpdate} onPress={() => install()} disabled={busy} /> : null}
        {rel ? <Btn title={t.download} kind="secondary" onPress={() => Linking.openURL(rel.page).catch(() => {})} /> : null}
        <Card style={{ gap: 6 }}>
          <Toggle title={t.updateAutoLabel} on={updateAuto} onChange={v => setPrefs({ updateAuto: v })} />
          <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.updateHow}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

export function AboutScreen({ onBack }: { onBack: () => void }) {
  const { t, theme } = useApp();
  return (
    <Screen>
      <Header title={t.about} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <Card style={{ alignItems: 'center' }}>
          <AlifMark size={84} />
          <Text style={{ fontFamily: theme.fonts.display, fontSize: 28, color: theme.primary, letterSpacing: 8 }}>ALIF</Text>
          <Text style={{ color: theme.muted }}>{t.version} {Constants.expoConfig?.version}</Text>
        </Card>
        <Card>
          <Body>{t.aboutBody}</Body>
          <Body muted>{t.aboutQuran}</Body>
          <Body muted>{t.aboutAi}</Body>
          <Text style={{ color: theme.muted, fontSize: 13 }}>{t.developer}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
