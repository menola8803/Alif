import React, { useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import * as Speech from 'expo-speech';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { useApp } from '../store';
import { Route } from '../nav';
import { LETTERS, SIGNS, questionsFor } from '../core/learn';
import { FORMS, MAKHRAJ, OVERVIEW } from '../learnImages';
import { Arabic, Body, Btn, Card, Header, Label, PageTitle, Screen, SmallBtn, Sub, TAB_SPACE, Text, Toggle } from '../ui';

const say = (ar: string) => { try { Speech.stop(); Speech.speak(ar, { language: 'ar', rate: 0.8 }); } catch {} };

/** Opens the book (PDF) in the phone's own PDF viewer. */
async function openBook(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const a = Asset.fromModule(require('../../assets/book/iqra.pdf'));
    await a.downloadAsync();
    const src = new File(a.localUri ?? a.uri);
    const dst = new File(Paths.cache, 'Iqraa.pdf');
    if (!dst.exists) src.copy(dst);
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: dst.contentUri, flags: 1, type: 'application/pdf' });
      return true;
    }
    await Sharing.shareAsync(dst.uri, { mimeType: 'application/pdf' });
    return true;
  } catch { return false; }
}

/** The corner menu (⋮) on the Learn page: questions on/off. */
function CornerMenu() {
  const { t, theme, learnQuiz, setPrefs } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={t.learnMenu} onPress={() => setOpen(true)} hitSlop={8}
        style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line }}>
        <Text style={{ fontSize: 22, color: theme.ink, lineHeight: 24 }}>⋮</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(5,10,11,0.5)' }} onPress={() => setOpen(false)}>
          <View style={{ position: 'absolute', top: 90, right: 16, width: 270, backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.line, padding: 14, gap: 6 }}>
            <Toggle title={t.showQuestions} on={learnQuiz} onChange={v => setPrefs({ learnQuiz: v })} />
            <Text style={{ fontSize: 12.5, color: theme.muted, lineHeight: 18 }}>{t.showQuestionsSub}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function Learn({ go, onGear, glow }: { go: (r: Route) => void; onGear: () => void; glow: boolean }) {
  const { t, theme, learnDone } = useApp();
  const { width } = useWindowDimensions();
  const [bookErr, setBookErr] = useState(false);
  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: TAB_SPACE }} showsVerticalScrollIndicator={false}>
      <PageTitle title={t.tabLearn} sub={t.learnSub} onGear={onGear} glow={glow} right={<CornerMenu />} />
      <Card style={{ alignItems: 'center' }}>
        <Image source={OVERVIEW} style={{ width: width - 66, height: Math.round((width - 66) * 415 / 467), borderRadius: 12 }} resizeMode="contain" />
        <Text style={{ fontSize: 12, color: theme.muted }}>{t.bookCredit}</Text>
        <Btn title={t.openBook} kind="secondary" onPress={async () => setBookErr(!(await openBook()))} />
        {bookErr ? <Text style={{ fontSize: 12.5, color: theme.danger }}>{t.bookErr}</Text> : null}
      </Card>
      <Text style={{ fontSize: 13, color: theme.muted }}>{t.learnProgress.replace('{n}', String(learnDone.length)).replace('{m}', String(LETTERS.length))}</Text>
      <Pressable accessibilityRole="button" onPress={() => go({ name: 'signs' })}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: theme.primary }}>
          <Arabic size={30} selectable={false} style={{ width: 54, textAlign: 'center', lineHeight: 52 }}>بَ بِ بُ</Arabic>
          <View style={{ flex: 1 }}><Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>{t.vowelSigns}</Text><Text style={{ fontSize: 12.5, color: theme.muted }}>{t.vowelSignsSub}</Text></View>
          <Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>
        </Card>
      </Pressable>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {LETTERS.map((l, i) => {
          const done = learnDone.includes(l.id);
          return (
            <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={l.name} onPress={() => go({ name: 'letter', id: l.id })}
              style={({ pressed }) => ({ width: '31.5%', opacity: pressed ? 0.8 : 1 })}>
              <View style={{ borderRadius: 18, borderWidth: 1, borderColor: done ? theme.good : theme.line, backgroundColor: theme.card, alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ position: 'absolute', left: 8, top: 6, fontSize: 10, color: theme.muted }}>{i + 1}</Text>
                {done ? <Text style={{ position: 'absolute', right: 8, top: 4, fontSize: 12, color: theme.good }}>✓</Text> : null}
                <Arabic size={34} center selectable={false} style={{ lineHeight: 62 }}>{l.ar}</Arabic>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.ink }}>{l.name}</Text>
                <Text style={{ fontSize: 11, color: theme.accent }}>{l.sound}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Quiz({ id }: { id: string }) {
  const { t, theme, lang } = useApp();
  const l = LETTERS.find(x => x.id === id)!;
  const qs = questionsFor(l, lang);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const right = qs.filter((q, i) => picked[i] === q.answer).length;
  return (
    <Card style={{ borderColor: theme.primary }}>
      <Label color={theme.primary}>{t.questions}</Label>
      {qs.map((q, i) => (
        <View key={i} style={{ gap: 6 }}>
          <Text style={{ fontSize: 14.5, fontWeight: '700', color: theme.ink }}>{i + 1}. {q.q}</Text>
          {i === 0 && q.glyph ? <Arabic size={40} center selectable={false} style={{ lineHeight: 72 }}>{q.glyph}</Arabic> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {q.options.map((o, k) => {
              const chosen = picked[i] === k, done = picked[i] !== undefined;
              const color = done && k === q.answer ? theme.good : chosen ? theme.danger : theme.line;
              return (
                <Pressable key={k} disabled={done} onPress={() => setPicked(p => ({ ...p, [i]: k }))}
                  style={{ minHeight: 40, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: color, backgroundColor: theme.chip, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>{o}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      {Object.keys(picked).length === qs.length ? <Text style={{ fontSize: 14, fontWeight: '700', color: right === qs.length ? theme.good : theme.ink }}>{t.quizScore.replace('{n}', String(right)).replace('{m}', String(qs.length))}</Text> : null}
      {Object.keys(picked).length ? <SmallBtn title={t.tryAgain} onPress={() => setPicked({})} /> : null}
    </Card>
  );
}

/** One letter: how it sounds, where it is pronounced (the book's picture), its forms (the book's table) and questions. */
export function LetterScreen({ id, onBack, go }: { id: string; onBack: () => void; go: (r: Route) => void }) {
  const { t, theme, lang, learnQuiz, learnDone, setPrefs } = useApp();
  const i = LETTERS.findIndex(x => x.id === id);
  const l = LETTERS[i];
  const done = learnDone.includes(l.id);
  const prev = LETTERS[i - 1], next = LETTERS[i + 1];
  // Two boxes per row, sized in pixels (screen padding 16 + card padding 16 on each side).
  const { width } = useWindowDimensions();
  const GAP = 12;
  const cell = Math.floor((width - 64 - GAP) / 2);
  return (
    <Screen>
      <Header title={`${i + 1}. ${l.name}`} sub={`${t.sound}: ${l.sound}`} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <Card style={{ alignItems: 'center' }}>
          <Arabic size={88} center selectable={false} style={{ lineHeight: 150 }}>{l.ar}</Arabic>
          <SmallBtn title={`▶ ${t.listen}`} tone="accent" onPress={() => say(`${l.ar}`)} />
          <Body>{l[lang]}</Body>
          <Text style={{ fontSize: 13, color: theme.muted }}>{l.joins ? t.joinsYes : t.joinsNo}</Text>
        </Card>
        {l.makhraj && MAKHRAJ[l.id] ? (
          <Card style={{ alignItems: 'center' }}>
            <Label>{t.makhraj}</Label>
            <Image source={MAKHRAJ[l.id]} style={{ width: 180, height: 240, backgroundColor: '#fff', borderRadius: 12 }} resizeMode="contain" />
          </Card>
        ) : null}
        {l.forms && FORMS[l.id] ? (
          <Card>
            <Label>{t.letterForms}</Label>
            <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: GAP }}>
              {(['iso', 'ini', 'med', 'fin'] as const).map(k => (
                <View key={k} style={{ width: cell, gap: 6 }}>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: theme.muted, textAlign: 'center' }}>{t[`form_${k}`]}</Text>
                  <View style={{ width: cell, height: Math.round(cell / 1.5), backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.line, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={FORMS[l.id][k]} style={{ width: cell - 12, height: Math.round(cell / 1.5) - 12 }} resizeMode="contain" />
                  </View>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 12, color: theme.muted }}>{t.formsHelp}</Text>
          </Card>
        ) : null}
        {learnQuiz ? <Quiz key={l.id} id={l.id} /> : null}
        <Btn title={done ? `✓ ${t.learned}` : t.markLearned} kind={done ? 'secondary' : 'primary'}
          onPress={() => setPrefs({ learnDone: done ? learnDone.filter(x => x !== l.id) : [...learnDone, l.id] })} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>{prev ? <Btn title={`‹ ${prev.name}`} kind="secondary" onPress={() => go({ name: 'letter', id: prev.id })} /> : null}</View>
          <View style={{ flex: 1 }}>{next ? <Btn title={`${next.name} ›`} kind="secondary" onPress={() => go({ name: 'letter', id: next.id })} /> : null}</View>
        </View>
        <Text style={{ fontSize: 12, color: theme.muted }}>{t.bookCredit}</Text>
      </ScrollView>
    </Screen>
  );
}

/** Vowel signs, sukūn, shadda, tanwīn and the long vowels. */
export function SignsScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, lang } = useApp();
  return (
    <Screen>
      <Header title={t.vowelSigns} sub={t.vowelSignsSub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        {SIGNS.map(s => (
          <Card key={s.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`${t.listen} ${s.ex}`} onPress={() => say(s.example)}>
              <Arabic size={40} center selectable={false} style={{ width: 70, lineHeight: 76 }}>{s.example}</Arabic>
            </Pressable>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>{s.name} <Text style={{ color: theme.accent, fontWeight: '600' }}>· {s.ex}</Text></Text>
              <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 18 }}>{s[lang]}</Text>
            </View>
          </Card>
        ))}
        <Sub>{t.tapToListen}</Sub>
      </ScrollView>
    </Screen>
  );
}
