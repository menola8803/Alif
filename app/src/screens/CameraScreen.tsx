import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../store';
import { Result } from '../core/engine';
import { errorText, translateImage } from '../translate';
import { ResultView } from '../result';
import { Body, Btn, Card, H1, SmallBtn, Sub, Text } from '../ui';
import { Route } from '../nav';
import { useQuran } from '../library';

export default function CameraScreen({ go, openSurah }: { go: (r: Route) => void; openSurah: (s: number, a: number) => void }) {
  const app = useApp();
  const { t, theme } = app;
  const quran = useQuran();
  const [perm, requestPerm] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [torch, setTorch] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [noKey, setNoKey] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (uri: string) => {
    setPhoto(uri); setResult(null); setErr(''); setNoKey(false); setBusy(true);
    try {
      const r = await translateImage(uri, app, quran);
      setResult(r);
      if (r.arabic) app.addHistory('camera', r);
    } catch (e) {
      setErr(errorText(e, t));
      setNoKey((e as any)?.kind === 'nokey' || (e as any)?.kind === 'badkey');
    }
    setBusy(false);
  };

  const shoot = async () => {
    try {
      const p = await cam.current?.takePictureAsync({ quality: 0.9, shutterSound: false });
      if (p?.uri) run(p.uri);
    } catch (e) { setErr(errorText(e, t)); }
  };
  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: true });
    if (!r.canceled && r.assets[0]?.uri) run(r.assets[0].uri);
  };
  const reset = () => { setPhoto(null); setResult(null); setErr(''); setNoKey(false); };

  if (photo) {
    return (
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={{ uri: photo }} style={{ width: 72, height: 96, borderRadius: 12, borderWidth: 1, borderColor: theme.line }} />
          <View style={{ flex: 1, gap: 8 }}>
            <H1 size={22}>{t.cameraTitle}</H1>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SmallBtn title={t.retake} tone="accent" onPress={reset} />
              {!busy && (err || result) ? <SmallBtn title={t.retry} onPress={() => run(photo)} /> : null}
            </View>
          </View>
        </View>
        {busy ? (
          <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
            <ActivityIndicator color={theme.primary} />
            <Text style={{ color: theme.muted }}>{t.reading}</Text>
          </Card>
        ) : null}
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

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View><H1>{t.cameraTitle}</H1><Sub>{t.cameraSub}</Sub></View>
      {!perm ? <View style={{ flex: 1 }} /> : !perm.granted ? (
        <Card style={{ flex: 1, justifyContent: 'center' }}>
          <Body muted>{perm.canAskAgain ? t.cameraSub : t.camDenied}</Body>
          {perm.canAskAgain ? <Btn title={t.allowCam} onPress={requestPerm} /> : null}
          <Btn title={t.pickImage} kind="secondary" onPress={pick} />
        </Card>
      ) : (
        <>
          <View style={{ flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: theme.line, backgroundColor: '#000' }}>
            <CameraView ref={cam} style={{ flex: 1 }} facing="back" enableTorch={torch} />
            {/* frame with gold corners */}
            <View pointerEvents="none" style={{ position: 'absolute', left: 24, right: 24, top: '18%', bottom: '18%' }}>
              <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <Path d="M0 14V0H14M86 0H100V14M100 86V100H86M14 100H0V86" stroke={theme.dark ? '#E8B04A' : '#F3E9D2'} strokeWidth={1.2} fill="none" vectorEffect="non-scaling-stroke" />
              </Svg>
            </View>
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center' }}>
              <Text style={{ color: '#F3E9D2', fontSize: 13, backgroundColor: 'rgba(11,20,22,0.55)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, overflow: 'hidden' }}>{t.frameHint}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SmallBtn title={t.pickImage} onPress={pick} />
            <Pressable accessibilityRole="button" accessibilityLabel={t.shoot} onPress={shoot}
              style={({ pressed }) => ({ width: 74, height: 74, borderRadius: 37, borderWidth: 3, borderColor: theme.primary, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}>
              <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: theme.primary }} />
            </Pressable>
            <SmallBtn title={`${t.torch}: ${torch ? t.on : t.off}`} tone={torch ? 'accent' : undefined} onPress={() => setTorch(v => !v)} />
          </View>
        </>
      )}
    </View>
  );
}
