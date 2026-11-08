import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, LayoutChangeEvent, PanResponder, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../store';
import { Route } from '../nav';
import { Result } from '../core/engine';
import { errorText, readFileText, translateImage, translateText } from '../translate';
import { ResultView } from '../result';
import { useQuran } from '../library';
import { Arabic, Body, Btn, Card, Label, PageTitle, Segmented, SmallBtn, Sub, TAB_SPACE, Text, TextInput } from '../ui';
import TextScreen from './TextScreen';
import CameraScreen from './CameraScreen';

export type TranslateMode = 'write' | 'image' | 'camera' | 'file';

/** The Translate tab: write, a picture, the camera or a file – chosen at the top. */
export default function Translate({ go, openSurah, onGear, glow, mode, setMode }: { go: (r: Route) => void; openSurah: (s: number, a: number) => void; onGear: () => void; glow: boolean; mode: TranslateMode; setMode: (m: TranslateMode) => void }) {
  const { t } = useApp();
  const [sent, setSent] = useState<{ text: string; at: number } | undefined>();
  const toWrite = (text: string) => { setSent({ text, at: Date.now() }); setMode('write'); };
  return (
    <View style={{ flex: 1, gap: 12 }}>
      <PageTitle title={t.tabTranslate} onGear={onGear} glow={glow} />
      <Segmented<TranslateMode> options={[['write', t.modeWrite], ['image', t.modeImage], ['camera', t.modeCamera], ['file', t.modeFile]]} value={mode} onChange={setMode} />
      <View style={{ flex: 1 }}>
        {mode === 'write' ? <TextScreen go={go} openSurah={openSurah} hideTitle initial={sent} /> : null}
        {mode === 'image' ? <ImageScreen go={go} openSurah={openSurah} toWrite={toWrite} /> : null}
        {mode === 'camera' ? <CameraScreen go={go} openSurah={openSurah} openWrite={() => setMode('write')} hideTitle /> : null}
        {mode === 'file' ? <FileScreen toWrite={toWrite} /> : null}
      </View>
    </View>
  );
}

type Rect = { x: number; y: number; w: number; h: number };

/** Open a picture (png, jpeg, bmp …), circle the text with a finger, and translate just that part. */
function ImageScreen({ go, openSurah, toWrite }: { go: (r: Route) => void; openSurah: (s: number, a: number) => void; toWrite: (s: string) => void }) {
  const app = useApp();
  const { t, theme } = app;
  const quran = useQuran();
  const [img, setImg] = useState<{ uri: string; width: number; height: number } | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [sel, setSel] = useState<Rect | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const start = useRef({ x: 0, y: 0 });

  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    const a = r.canceled ? null : r.assets[0];
    if (a?.uri) { setImg({ uri: a.uri, width: a.width, height: a.height }); setSel(null); setResult(null); setErr(''); setRaw(''); }
  };
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: e => { start.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY }; setSel({ x: start.current.x, y: start.current.y, w: 0, h: 0 }); },
    onPanResponderMove: (_, g) => {
      const x0 = start.current.x, y0 = start.current.y;
      const x1 = clamp(x0 + g.dx, box.w), y1 = clamp(y0 + g.dy, box.h);
      setSel({ x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) });
    },
  }), [box.w, box.h]);

  const run = async (part: boolean) => {
    if (!img) return;
    setBusy(true); setErr(''); setResult(null); setRaw('');
    const crop = part && sel && sel.w > 12 && sel.h > 12 && box.w ? { x: sel.x / box.w, y: sel.y / box.h, w: sel.w / box.w, h: sel.h / box.h } : undefined;
    try {
      const r = await translateImage({ uri: img.uri, width: img.width, height: img.height, crop }, app, quran);
      setResult(r);
      if (r.arabic) app.addHistory('camera', r);
    } catch (e: any) {
      if (e?.kind === 'unreadable') { setErr(t.errUnreadable); setRaw(e.raw ?? ''); }
      else setErr(errorText(e, t));
    }
    setBusy(false);
  };

  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const ratio = img ? img.width / Math.max(1, img.height) : 1;

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: TAB_SPACE }} showsVerticalScrollIndicator={false} scrollEnabled={!sel || !busy}>
      <Sub>{t.imageSub}</Sub>
      <Btn title={img ? t.otherImage : t.openImage} kind={img ? 'secondary' : 'primary'} onPress={pick} />
      {img ? <>
        <View style={{ alignItems: 'center' }}>
          <View onLayout={onLayout} {...pan.panHandlers} style={{ width: '100%', maxHeight: 460, aspectRatio: ratio, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: theme.line, backgroundColor: '#000' }}>
            <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
            {sel && sel.w > 4 ? <View pointerEvents="none" style={{ position: 'absolute', left: sel.x, top: sel.y, width: sel.w, height: sel.h, borderWidth: 2.5, borderColor: '#E8B04A', borderRadius: 14, backgroundColor: 'rgba(232,176,74,0.12)' }} /> : null}
          </View>
        </View>
        <Text style={{ fontSize: 12.5, color: theme.muted, textAlign: 'center' }}>{t.circleHint}</Text>
        <Btn title={busy ? t.reading : t.translateMarked} disabled={busy || !sel || sel.w < 12} onPress={() => run(true)} />
        <Btn title={t.translateWhole} kind="secondary" disabled={busy} onPress={() => run(false)} />
      </> : null}
      {busy ? <ActivityIndicator color={theme.primary} /> : null}
      {err ? <Card style={{ borderColor: raw ? theme.danger : theme.line }}><Body>{err}</Body>{raw ? <><Label>{t.unreadRaw}</Label><Arabic size={18} color={theme.muted}>{raw.slice(0, 300)}</Arabic><Btn title={t.unreadType} kind="secondary" onPress={() => toWrite(raw)} /></> : null}</Card> : null}
      {result ? <ResultView r={result} onOpenSurah={openSurah} /> : null}
      {result?.arabic ? <SmallBtn title={t.editInWrite} onPress={() => toWrite(result.arabic)} /> : null}
      {!img ? <Text style={{ fontSize: 12, color: theme.muted }} onPress={() => go({ name: 'ai' })}>{t.imageEngineNote} ›</Text> : null}
    </ScrollView>
  );
}

/** Open a .docx, .odt, .pdf, a picture or a text file; the text goes into a white box where you mark what to translate. */
function FileScreen({ toWrite }: { toWrite: (s: string) => void }) {
  const app = useApp();
  const { t, theme } = app;
  const quran = useQuran();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [sel, setSel] = useState({ start: 0, end: 0 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const open = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text', 'application/pdf', 'image/*', 'text/plain'],
      copyToCacheDirectory: true, multiple: false,
    });
    const a = r.canceled ? null : r.assets[0];
    if (!a) return;
    setName(a.name); setText(''); setResult(null); setErr(''); setBusy(true);
    try { setText(await readFileText(a.uri, a.name, a.mimeType ?? '')); }
    catch (e) { setErr(errorText(e, t)); }
    setBusy(false);
  };
  const marked = sel.end > sel.start ? text.slice(sel.start, sel.end).trim() : '';
  const translate = async () => {
    const part = marked || text.trim();
    if (!part) return;
    setBusy(true); setErr(''); setResult(null);
    try { const r = await translateText(part, app, undefined, quran); setResult(r); if (r.arabic) app.addHistory('text', r); }
    catch (e) { setErr(errorText(e, t)); }
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: TAB_SPACE }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Sub>{t.fileSub}</Sub>
      <Btn title={name ? t.otherFile : t.openFile} kind={name ? 'secondary' : 'primary'} onPress={open} />
      {name ? <Text style={{ fontSize: 12.5, color: theme.muted }}>{name}</Text> : null}
      {busy && !text ? <Card style={{ alignItems: 'center' }}><ActivityIndicator color={theme.primary} /><Text style={{ color: theme.muted }}>{t.readingFile}</Text></Card> : null}
      {text ? <>
        <Label>{t.markText}</Label>
        <TextInput value={text} onChangeText={setText} multiline textAlignVertical="top" onSelectionChange={e => setSel(e.nativeEvent.selection)}
          style={{ minHeight: 180, maxHeight: 420, borderRadius: 16, borderWidth: 1, borderColor: '#DDD8CD', backgroundColor: '#FFFFFF', padding: 14, color: '#26231F', fontFamily: theme.fonts.arabic, fontSize: 21, lineHeight: 40, textAlign: 'right', writingDirection: 'rtl' }} />
        <Text style={{ fontSize: 12.5, color: theme.muted }}>{marked ? t.markedChars.replace('{n}', String(marked.length)) : t.markHint}</Text>
        <Btn title={busy ? t.translating : marked ? t.translateMarked : t.translateAll} disabled={busy} onPress={translate} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SmallBtn title={t.copy} onPress={() => Clipboard.setStringAsync(marked || text).catch(() => {})} />
          <SmallBtn title={t.editInWrite} onPress={() => toWrite(marked || text)} />
        </View>
      </> : null}
      {err ? <Card><Body>{err}</Body></Card> : null}
      {result ? <ResultView r={result} /> : null}
    </ScrollView>
  );
}
