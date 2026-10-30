import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../store';
import { Direction, Result } from '../core/engine';
import { hasArabic, isVocalized, transliterate } from '../core/translit';
import { directionOf, errorText, textEngine, translateText } from '../translate';
import { engineLabel } from './Settings';
import { ResultView } from '../result';
import { Body, Btn, Card, H1, Label, Segmented, SmallBtn, Sub, Text, TextInput } from '../ui';
import { Route } from '../nav';
import { useQuran } from '../library';

export default function TextScreen({ go, openSurah }: { go: (r: Route) => void; openSurah: (s: number, a: number) => void }) {
  const app = useApp();
  const { t, theme, scheme, mode } = app;
  const quran = useQuran();
  const [text, setText] = useState('');
  const [manual, setManual] = useState<Direction | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [noKey, setNoKey] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const auto = directionOf(text);
  const dir = manual ?? auto;
  const arabicIn = hasArabic(text);
  const instant = useMemo(() => (arabicIn ? transliterate(text, { scheme, mode }) : ''), [text, arabicIn, scheme, mode]);

  const engine = textEngine(app);
  const free = engine !== 'claude';
  const seq = useRef(0);

  const go2 = async (live = false) => {
    if (!text.trim()) return;
    if (!live) Keyboard.dismiss();
    const my = ++seq.current;
    setBusy(true); setErr(''); setNoKey(false);
    if (!live) setResult(null);
    try {
      const r = await translateText(text.trim(), app, dir, quran);
      if (my !== seq.current) return; // a newer request has started
      setResult(r);
      if (r.arabic && !live) app.addHistory('text', r);
    } catch (e) {
      if (my !== seq.current) return;
      setErr(errorText(e, t));
      setNoKey(['nokey', 'badkey', 'nodevice', 'quota'].includes((e as any)?.kind));
    }
    setBusy(false);
  };

  // Real time: with a free engine the text is translated when you stop typing.
  useEffect(() => {
    if (!app.live || !free || !text.trim()) return;
    const id = setTimeout(() => go2(true), engine === 'device' ? 700 : 1300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, dir, app.live, free, engine, app.lang]);

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View><H1>{t.textTitle}</H1><Sub>{t.textSub}</Sub></View>
      <Card>
        <Segmented<Direction> options={[['ar2x', t.dirAr], ['x2ar', t.dirX]]} value={dir} onChange={d => setManual(d === auto ? null : d)} />
        <TextInput
          value={text}
          onChangeText={v => { setText(v); setManual(null); if (!free || !app.live) setResult(null); }}
          placeholder={t.inputPh}
          placeholderTextColor={theme.muted}
          multiline
          textAlignVertical="top"
          style={{
            minHeight: 120, borderRadius: 16, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.bg, padding: 14, color: theme.ink,
            ...(arabicIn ? { fontFamily: theme.fonts.arabic, fontSize: 24, lineHeight: 44, textAlign: 'right', writingDirection: 'rtl' as const } : { fontSize: 16, lineHeight: 23 }),
          }}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SmallBtn title={t.paste} onPress={async () => { const v = await Clipboard.getStringAsync().catch(() => ''); if (v) { setText(v); setManual(null); setResult(null); } }} />
          {text ? <SmallBtn title={t.clear} onPress={() => { setText(''); setResult(null); setErr(''); }} /> : null}
        </View>
        <Btn title={busy ? t.translating : t.translate} onPress={() => go2(false)} disabled={busy || !text.trim()} />
        <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center' }} onPress={() => go({ name: 'ai' })}>{t.usingEngine}: {engineLabel(t, engine)} ›</Text>
      </Card>

      {instant && !result ? (
        <Card>
          <Label>{t.instant}</Label>
          <Text selectable style={{ fontSize: 17, lineHeight: 26, color: theme.accent, fontWeight: '500' }}>{instant}</Text>
          <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 18 }}>{isVocalized(text) ? t.instantHint : t.unvocalized}</Text>
        </Card>
      ) : null}

      {busy && !result ? <Card style={{ alignItems: 'center', paddingVertical: 24 }}><ActivityIndicator color={theme.primary} /><Text style={{ color: theme.muted }}>{t.translating}</Text></Card> : null}
      {err ? (
        <Card>
          <Body>{err}</Body>
          {noKey ? <Btn title={t.goSettings} onPress={() => go({ name: 'ai' })} /> : null}
        </Card>
      ) : null}
      {result ? <ResultView r={result} onOpenSurah={openSurah} /> : null}
      {result && free && !result.verses ? <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center' }}>{t.freeNote}</Text> : null}
    </ScrollView>
  );
}
