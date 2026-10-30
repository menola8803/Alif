import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Result } from './core/engine';
import { SURAHS } from './core/quran';
import { useApp } from './store';
import { translitFor } from './translate';
import { Arabic, Body, Card, Label, SmallBtn, Text } from './ui';

function CopyBtn({ text }: { text: string }) {
  const { t } = useApp();
  const [done, setDone] = useState(false);
  return <SmallBtn title={done ? t.copied : t.copy} onPress={() => { Clipboard.setStringAsync(text).catch(() => {}); setDone(true); setTimeout(() => setDone(false), 1500); }} />;
}

function Head({ label, copy }: { label: string; copy?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Label>{label}</Label>
      {copy ? <CopyBtn text={copy} /> : null}
    </View>
  );
}

/** Everything about one reading/translation: Qur'an reference, Arabic, transliteration, translation, word by word, notes. */
export function ResultView({ r, onOpenSurah }: { r: Result; onOpenSurah?: (surah: number, ayah: number) => void }) {
  const { t, theme, scheme, mode } = useApp();
  const translit = translitFor(r, scheme, mode);
  const toArabic = r.direction === 'x2ar';
  const q = r.quran;

  if (!r.arabic) return <Card><Body muted>{r.notes || t.errNoArabic}</Body></Card>;

  return (
    <View style={{ gap: 12 }}>
      {q ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <View style={{ flex: 1 }}>
            <Label color={theme.primary}>{t.fromQuran}</Label>
            <Text style={{ color: theme.ink, fontSize: 16, fontWeight: '700' }}>
              {SURAHS[q.surah - 1]?.name} · {q.surah}:{q.from}{q.to !== q.from ? `–${q.to}` : ''}
            </Text>
            {r.verses ? <Text style={{ color: theme.muted, fontSize: 12 }}>{t.verifiedVerse}</Text> : null}
          </View>
          {onOpenSurah ? <SmallBtn title={t.openSurah} tone="accent" onPress={() => onOpenSurah(q.surah, q.from)} /> : null}
        </Card>
      ) : null}

      {toArabic ? (
        <Card>
          <Head label={t.yourText} />
          <Body>{r.translation || r.source}</Body>
        </Card>
      ) : null}

      <Card>
        <Head label={t.arabic} copy={r.arabic} />
        <Arabic>{r.arabic}</Arabic>
      </Card>

      {translit ? (
        <Card>
          <Head label={t.translit} copy={translit} />
          <Text selectable style={{ fontSize: 17, lineHeight: 26, color: theme.accent, fontWeight: '500' }}>{translit}</Text>
        </Card>
      ) : null}

      {!toArabic && r.verses?.some(v => v.translation) ? (
        <Card>
          <Head label={t.quranTranslation} copy={r.verses.map(v => v.translation).join(' ')} />
          {r.verses.map(v => <Body key={v.n}><Text style={{ color: theme.muted, fontSize: 13 }}>({v.n}) </Text>{v.translation}</Body>)}
          {r.edition ? <Text style={{ fontSize: 12, color: theme.muted }}>{r.edition}</Text> : null}
        </Card>
      ) : null}

      {!toArabic && r.translation ? (
        <Card>
          <Head label={r.verses ? t.aiTranslation : t.translation} copy={r.translation} />
          <Body>{r.translation}</Body>
        </Card>
      ) : null}

      {r.words.length ? (
        <Card>
          <Head label={t.wordByWord} />
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
            {r.words.map((w, i) => (
              <Pressable key={i} style={{ minWidth: 84, maxWidth: '48%', borderRadius: 14, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.chip, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' }}>
                <Arabic size={22} center>{w.ar}</Arabic>
                <Text style={{ fontSize: 13, color: theme.accent, fontWeight: '600' }}>{w.tr}</Text>
                <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center' }}>{w.gloss}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      {r.notes ? (
        <Card>
          <Head label={t.notes} />
          <Body muted>{r.notes}</Body>
        </Card>
      ) : null}
    </View>
  );
}
