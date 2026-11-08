import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useApp } from '../store';
import { Route } from '../nav';
import { AlifNativeModule, SpeechEvent } from '../../modules/alif-native';
import { micMayRun, speechError } from '../core/listen';
import { transliterate } from '../core/translit';
import { Result } from '../core/engine';
import { errorText, translateText } from '../translate';
import { useQuran } from '../library';
import { Body, Btn, Card, Label, Sub, TAB_SPACE, Text } from '../ui';

/**
 * Listen: Arabic speech → text (in a beige box) → transliteration → Swedish/English.
 * The microphone is only open while micMayRun(...) holds (see core/listen.ts): it is closed by Stop, by leaving the page
 * or the tab (this component unmounts), and when Alif goes to the background.
 */
export default function Listen({ go }: { go: (r: Route) => void }) {
  const app = useApp();
  const { t, theme, micOn, micOnlyPhone, listenTranslit, scheme, mode } = app;
  const quran = useQuran();
  const [pressed, setPressed] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [heard, setHeard] = useState('');
  const [partial, setPartial] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'busy'>('idle');
  const [err, setErr] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [info, setInfo] = useState<{ available: boolean; onDevice: boolean } | null>(null);
  const run = micMayRun({ micOn, onListenPage: true, appActive: active, pressed });
  const runRef = useRef(run); runRef.current = run;

  useEffect(() => { AlifNativeModule?.speechInfo().then(setInfo).catch(() => setInfo({ available: false, onDevice: false })); }, []);
  useEffect(() => {
    const s = AppState.addEventListener('change', st => setActive(st === 'active'));
    return () => s.remove();
  }, []);

  // Open or close the microphone whenever the rule changes; always closed when this page goes away.
  useEffect(() => {
    if (!AlifNativeModule) return;
    if (run) { setErr(''); AlifNativeModule.startListening('ar', micOnlyPhone); setStatus('listening'); }
    else { AlifNativeModule.stopListening(); setStatus(s => (s === 'listening' ? 'idle' : s)); }
  }, [run, micOnlyPhone]);
  useEffect(() => () => { AlifNativeModule?.stopListening(); }, []);

  useEffect(() => {
    if (!AlifNativeModule) return;
    const sub = AlifNativeModule.addListener('onSpeech', (e: SpeechEvent) => {
      if (e.type === 'partial') setPartial(e.text);
      if (e.type === 'final') {
        setPartial('');
        if (e.text) setHeard(h => (h ? `${h} ${e.text}` : e.text));
        // keep listening for the next sentence while Listen is still on
        if (runRef.current) setTimeout(() => { if (runRef.current) AlifNativeModule?.startListening('ar', app.micOnlyPhone); }, 250);
      }
      if (e.type === 'error') {
        const k = speechError(e.error);
        if (k === 'noMatch' && runRef.current) { setTimeout(() => { if (runRef.current) AlifNativeModule?.startListening('ar', app.micOnlyPhone); }, 250); return; }
        setErr(k === 'noOffline' ? t.micNoOffline : k === 'noService' ? t.micNoService : k === 'noPermission' ? t.micDenied : k === 'network' ? t.errNetwork : t.micError);
        setPressed(false); setStatus('idle');
      }
    });
    return () => sub.remove();
  }, [t, app.micOnlyPhone]);

  // Translate what was heard when the person stops.
  const translate = async (text: string) => {
    if (!text.trim()) return;
    setStatus('busy'); setResult(null);
    try { const r = await translateText(text, app, 'ar2x', quran); setResult(r); if (r.arabic) app.addHistory('text', r); }
    catch (e) { setErr(errorText(e, t)); }
    setStatus('idle');
  };
  const stop = () => { setPressed(false); const all = `${heard} ${partial}`.trim(); setPartial(''); if (all) { setHeard(all); translate(all); } };

  const askPermission = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { requestRecordingPermissionsAsync } = require('expo-audio');
      const r = await requestRecordingPermissionsAsync();
      return !!r.granted;
    } catch { return false; }
  };
  const start = async () => {
    if (!(await askPermission())) { setErr(t.micDenied); return; }
    setResult(null); setHeard(''); setPartial(''); setPressed(true);
  };

  if (!micOn) {
    return (
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: TAB_SPACE }}>
        <Sub>{t.listenSub}</Sub>
        <Card style={{ borderColor: theme.primary }}>
          <Label color={theme.primary}>{t.micOffTitle}</Label>
          <Body>{t.micOffBody}</Body>
          <Btn title={t.micToSettings} onPress={() => go({ name: 'micSettings' })} />
        </Card>
      </ScrollView>
    );
  }
  const shown = `${heard}${partial ? ` ${partial}` : ''}`.trim();
  const listening = status === 'listening' && pressed;
  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: TAB_SPACE }} showsVerticalScrollIndicator={false}>
      <Sub>{t.listenSub}</Sub>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={listening ? t.stop : t.listen} onPress={listening ? stop : start}
          style={({ pressed: p }) => ({ width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: listening ? theme.danger : theme.primary, opacity: p ? 0.85 : 1 })}>
          <Svg width={48} height={48} viewBox="0 0 24 24">
            {listening ? <Rect x={7} y={7} width={10} height={10} rx={2} fill={theme.onPrimary} /> : <>
              <Rect x={9} y={3} width={6} height={11} rx={3} fill={theme.onPrimary} />
              <Path d="M6 10.5a6 6 0 0 0 12 0M12 16.5V20M9 20.5h6" stroke={theme.onPrimary} strokeWidth={1.8} strokeLinecap="round" fill="none" />
            </>}
          </Svg>
        </Pressable>
        <Text style={{ fontSize: 14, fontWeight: '700', color: listening ? theme.danger : theme.muted }}>{listening ? `● ${t.micRecording}` : t.tapToListenMic}</Text>
        <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center' }}>{micOnlyPhone ? (info?.onDevice ? t.micPhoneOnly : t.micNoOffline) : t.micViaGoogle}</Text>
      </View>
      <Card style={{ backgroundColor: '#F6EFE2', borderColor: '#E3D7BF' }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.2, color: '#7A5C2B' }}>{t.heardArabic.toUpperCase()}</Text>
        <Text selectable style={{ fontFamily: theme.fonts.arabic, fontSize: 24, lineHeight: 44, color: '#26231F', textAlign: 'right', writingDirection: 'rtl', minHeight: 44 }}>{shown || '…'}</Text>
      </Card>
      {listenTranslit && shown ? (
        <Card>
          <Label>{t.translit}</Label>
          <Text selectable style={{ fontSize: 16, lineHeight: 24, color: theme.accent }}>{transliterate(shown, { scheme, mode })}</Text>
        </Card>
      ) : null}
      {status === 'busy' ? <ActivityIndicator color={theme.primary} /> : null}
      {result ? (
        <Card>
          <Label>{t.translation}</Label>
          <Body>{result.translation}</Body>
        </Card>
      ) : null}
      {err ? <Card><Body>{err}</Body>{err === t.micDenied ? <Btn title={t.openPhoneSettings} kind="secondary" onPress={() => Linking.openSettings().catch(() => {})} /> : null}</Card> : null}
    </ScrollView>
  );
}
