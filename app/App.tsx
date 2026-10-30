import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store';
import { Route } from './src/nav';
import { Screen, TabBar, TabName } from './src/ui';
import Splash from './src/screens/Splash';
import CameraScreen from './src/screens/CameraScreen';
import TextScreen from './src/screens/TextScreen';
import Quran from './src/screens/Quran';
import Surah from './src/screens/Surah';
import History, { EntryScreen } from './src/screens/History';
import Settings, { AboutScreen, AiScreen, EditionScreen, LanguageScreen, ThemeScreen, TranslitScreen, UpdateScreen } from './src/screens/Settings';

function Content() {
  const [stack, setStack] = useState<Route[]>([{ name: 'tabs' }]);
  const [tab, setTab] = useState<TabName>('camera');
  const push = useCallback((r: Route) => setStack(s => [...s, r]), []);
  const pop = useCallback(() => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const openSurah = useCallback((n: number, ayah?: number) => setStack([{ name: 'tabs' }, { name: 'surah', n, ayah }]), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) { pop(); return true; }
      if (tab !== 'camera') { setTab('camera'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, pop, tab]);

  const r = stack[stack.length - 1];
  switch (r.name) {
    case 'surah': return <Surah key={`${r.n}`} n={r.n} ayah={r.ayah} onBack={pop} go={push} />;
    case 'entry': return <EntryScreen id={r.id} onBack={pop} openSurah={openSurah} />;
    case 'language': return <LanguageScreen onBack={pop} />;
    case 'theme': return <ThemeScreen onBack={pop} />;
    case 'translit': return <TranslitScreen onBack={pop} />;
    case 'edition': return <EditionScreen onBack={pop} />;
    case 'ai': return <AiScreen onBack={pop} />;
    case 'update': return <UpdateScreen onBack={pop} />;
    case 'about': return <AboutScreen onBack={pop} />;
    default:
      return (
        <Screen>
          <View style={{ flex: 1 }}>
            {tab === 'camera' && <CameraScreen go={push} openSurah={openSurah} />}
            {tab === 'text' && <TextScreen go={push} openSurah={openSurah} />}
            {tab === 'quran' && <Quran open={n => push({ name: 'surah', n })} />}
            {tab === 'history' && <History open={id => push({ name: 'entry', id })} />}
            {tab === 'settings' && <Settings go={push} />}
          </View>
          <TabBar tab={tab} setTab={setTab} />
        </Screen>
      );
  }
}

// Fonts and saved settings load first (on the same dark color as the native start screen),
// then the animated start screen plays on top of the app while it gets ready.
function Root() {
  const { ready, theme } = useApp();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
    Cinzel_700Bold, Amiri_400Regular, Amiri_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);
  if (!ready || !fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#0B1416' }} />;
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Content />
      {!splashDone && <Splash onDone={() => setSplashDone(true)} />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider><Root /></AppProvider>
    </SafeAreaProvider>
  );
}
