import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../store';
import { Direction, Result } from '../core/engine';
import { hasArabic, isVocalized, transliterate } from '../core/translit';
import { directionOf, errorText, translateText } from '../translate';
import { ResultView } from '../result';
import { Body, Btn, Card, H1, Label, Segmented, SmallBtn, Sub, Text, TextInput } from '../ui';
import { Route } from '../nav';

export default function TextScreen({ go, openSurah }: { go: (r: Route) => void; openSurah: (s: number, a: number) => void }) {
  const app = useApp();
  const { t, theme, scheme, mode } = app;
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

  const go2 = async () => {
    if (!text.trim()) return;
    Keyboard.dismiss();
    setBusy(true); setErr(''); setNoKey(false); setResult(null);
    try {
      const r = await translateText(text.trim(), app, dir);
      setResult(r);
      if (r.arabic) app.addHistory('text', r);
    } catch (e) {
      setErr(errorText(e, t));
      setNoKey((e as any)?.kind === 'nokey' || (e as any)?.kind === 'badkey');
    }
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View><H1>{t.textTitle}</H1><Sub>{t.textSub}</Sub></View>
      <Card>
        <Segmented<Direction> options={[['ar2x', t.dirAr], ['x2ar', t.dirX]]} value={dir} onChange={d => setManual(d === auto ? null : d)} />
        <TextInput
          value={text}
          onChangeText={v => { setText(v); setManual(null); setResult(null); }}
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
        <Btn title={busy ? t.translating : t.translate} onPress={go2} disabled={busy || !text.trim()} />
      </Card>

      {instant && !result ? (
        <Card>
          <Label>{t.instant}</Label>
          <Text selectable style={{ fontSize: 17, lineHeight: 26, color: theme.accent, fontWeight: '500' }}>{instant}</Text>
          <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 18 }}>{isVocalized(text) ? t.instantHint : t.unvocalized}</Text>
        </Card>
      ) : null}

      {busy ? <Card style={{ alignItems: 'center', paddingVertical: 24 }}><ActivityIndicator color={theme.primary} /><Text style={{ color: theme.muted }}>{t.translating}</Text></Card> : null}
      {err ? (
        <Card>
          <Body>{err}</Body>
          {noKey ? <Btn title={t.goSettings} onPress={() => go({ name: 'ai' })} /> : null}
        </Card>
      ) : null}
      {result ? <ResultView r={result} onOpenSurah={openSurah} /> : null}
    </ScrollView>
  );
}
