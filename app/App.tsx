import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Vibration, View } from 'react-native';
import { useFonts } from 'expo-font';
import Constants from 'expo-constants';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store';
import { QuranProvider } from './src/library';
import { PrayerProvider } from './src/prayer';
import { RecitationProvider, useRecitation } from './src/recitation';
import { BackupScreen, CardsScreen, MicSettingsScreen, RecitationScreen, WidgetSettingsScreen } from './src/screens/More';
import MosquesScreen, { MosqueListScreen } from './src/screens/Mosques';
import { Route } from './src/nav';
import { Screen, TabBar, TabName } from './src/ui';
import { HOME_IMAGES } from './src/homeImages';
import { isNewer, latestRelease } from './src/update';
import Splash from './src/screens/Splash';
import Today from './src/screens/Today';
import Quran from './src/screens/Quran';
import Surah from './src/screens/Surah';
import JuzScreen from './src/screens/Juz';
import Translate, { TranslateMode } from './src/screens/Translate';
import Learn, { LetterScreen, SignsScreen } from './src/screens/Learn';
import Dhikr from './src/screens/Dhikr';
import { EntryScreen } from './src/screens/History';
import Awrad, { ReminderScreen } from './src/screens/Awrad';
import PrayerScreen, { CityScreen, PrayerSoundScreen } from './src/screens/Prayer';
import NightClockScreen from './src/screens/NightClock';
import HuroofScreen from './src/screens/Huroof';
import QiblaScreen from './src/screens/Qibla';
import HijriScreen from './src/screens/Hijri';
import ManualScreen, { HistoryScreen, PrivacyScreen } from './src/screens/Manual';
import { ReminderManager } from './src/reminder';
import Settings, { AboutScreen, AiScreen, EditionScreen, LanguageScreen, ThemeScreen, TranslitScreen, UpdateScreen } from './src/screens/Settings';

const UPDATE_EVERY = 6 * 3600 * 1000;

function Content({ splashDone }: { splashDone: boolean }) {
  const { ready, updateTag, updateChecked, homeImg, setPrefs, t } = useApp();
  const rec = useRecitation();
  const [stack, setStack] = useState<Route[]>([{ name: 'tabs' }]);
  const [tab, setTabState] = useState<TabName>('today');
  const [mode, setMode] = useState<TranslateMode>('write');
  const [image, setImage] = useState(-1);
  const push = useCallback((r: Route) => setStack(s => [...s, r]), []);
  const pop = useCallback(() => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const openSurah = useCallback((n: number, ayah?: number) => setStack([{ name: 'tabs' }, { name: 'surah', n, ayah }]), []);
  const openAwrad = useCallback(() => setStack([{ name: 'tabs' }, { name: 'awrad' }]), []);
  const version = Constants.expoConfig?.version ?? '0.0.0';
  const glow = !!updateTag && isNewer(updateTag, version);

  // A new picture on Today every time it is opened (never the same twice in a row).
  const shown = useRef(-1);
  const newImage = useCallback(() => {
    const last = shown.current >= 0 ? shown.current : homeImg;
    let n = Math.floor(Math.random() * HOME_IMAGES.length);
    if (HOME_IMAGES.length > 1 && n === last) n = (n + 1 + Math.floor(Math.random() * (HOME_IMAGES.length - 1))) % HOME_IMAGES.length;
    shown.current = n;
    setImage(n);
    setPrefs({ homeImg: n });
  }, [homeImg, setPrefs]);
  useEffect(() => { if (ready && image < 0) newImage(); }, [ready, image, newImage]);
  const setTab = useCallback((k: TabName) => { if (k === 'today') newImage(); setTabState(k); }, [newImage]);

  // Look for a new version now and then; the gear glows when there is one.
  useEffect(() => {
    if (!ready || Date.now() - updateChecked < UPDATE_EVERY) return;
    latestRelease().then(r => setPrefs({ updateTag: r && isNewer(r.tag, version) ? r.tag : '', updateChecked: Date.now() })).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) { pop(); return true; }
      if (tab !== 'today') { setTab('today'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, pop, tab, setTab]);

  const gear = () => push({ name: 'settings' });
  // The Qur'an tab shows the verse being recited (sūra:verse); a long press stops it, a tap on the open tab goes to it.
  const quranBadge = rec.now ? { quran: { label: `${rec.now.surah}:${rec.now.ayah}`, a11y: t.tabPlaying.replace('{v}', `${rec.now.surah}:${rec.now.ayah}`), active: rec.now.playing } } : undefined;
  const r = stack[stack.length - 1];
  const reminder = <ReminderManager openAwrad={openAwrad} active={splashDone && r.name !== 'awrad'} />;
  return <>{reminder}{screen()}</>;
  function screen() {
    switch (r.name) {
      case 'surah': return <Surah key={`${r.n}:${r.ayah ?? ''}`} n={r.n} ayah={r.ayah} onBack={pop} go={push} />;
      case 'entry': return <EntryScreen id={r.id} onBack={pop} openSurah={openSurah} />;
      case 'settings': return <Settings go={push} onBack={pop} />;
      case 'history': return <HistoryScreen onBack={pop} open={id => push({ name: 'entry', id })} />;
      case 'manual': return <ManualScreen onBack={pop} />;
      case 'privacy': return <PrivacyScreen onBack={pop} />;
      case 'language': return <LanguageScreen onBack={pop} />;
      case 'theme': return <ThemeScreen onBack={pop} />;
      case 'translit': return <TranslitScreen onBack={pop} />;
      case 'edition': return <EditionScreen onBack={pop} />;
      case 'ai': return <AiScreen onBack={pop} />;
      case 'update': return <UpdateScreen onBack={pop} />;
      case 'about': return <AboutScreen onBack={pop} />;
      case 'awrad': return <Awrad onBack={pop} onReminder={() => push({ name: 'reminder' })} />;
      case 'reminder': return <ReminderScreen onBack={pop} go={push} />;
      case 'prayer': return <PrayerScreen onBack={pop} go={push} />;
      case 'city': return <CityScreen onBack={pop} />;
      case 'qibla': return <QiblaScreen onBack={pop} onMosques={() => push({ name: 'mosques' })} />;
      case 'hijri': return <HijriScreen onBack={pop} />;
      case 'letter': return <LetterScreen key={r.id} id={r.id} onBack={pop} go={l => setStack(s => [...s.slice(0, -1), l])} />;
      case 'signs': return <SignsScreen onBack={pop} />;
      case 'recitation': return <RecitationScreen onBack={pop} />;
      case 'backup': return <BackupScreen onBack={pop} />;
      case 'cards': return <CardsScreen onBack={pop} />;
      case 'mosques': return <MosquesScreen onBack={pop} go={push} />;
      case 'mosqueList': return <MosqueListScreen onBack={pop} />;
      case 'micSettings': return <MicSettingsScreen onBack={pop} />;
      case 'juz': return <JuzScreen key={r.n} n={r.n} onBack={pop} go={push} />;
      case 'widgetSettings': return <WidgetSettingsScreen onBack={pop} go={push} />;
      case 'nightClock': return <NightClockScreen onBack={pop} />;
      case 'huroof': return <HuroofScreen onBack={pop} go={push} />;
      case 'prayerSound': return <PrayerSoundScreen key={r.target ?? 'prayer'} onBack={pop} target={r.target} />;
      default:
        return (
          <Screen bottom={false}>
            <View style={{ flex: 1 }}>
              {tab === 'today' && <Today go={push} onGear={gear} glow={glow} image={Math.max(0, image)} />}
              {tab === 'quran' && <Quran open={(n, ayah) => push({ name: 'surah', n, ayah })} openJuz={n => push({ name: 'juz', n })} onAwrad={() => push({ name: 'awrad' })} onGear={gear} glow={glow} />}
              {tab === 'translate' && <Translate go={push} openSurah={openSurah} onGear={gear} glow={glow} mode={mode} setMode={setMode} />}
              {tab === 'learn' && <Learn go={push} onGear={gear} glow={glow} />}
              {tab === 'dhikr' && <Dhikr go={push} onGear={gear} glow={glow} focused={r.name === 'tabs'} />}
            </View>
            <TabBar tab={tab} badges={quranBadge} onLong={k => { if (k === 'quran') { Vibration.vibrate(40); rec.stop(); } }}
              setTab={k => (k === 'quran' && tab === 'quran' && rec.now ? openSurah(rec.now.surah, rec.now.ayah) : setTab(k))} />
          </Screen>
        );
    }
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
      <Content splashDone={splashDone} />
      {!splashDone && <Splash onDone={() => setSplashDone(true)} />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider><QuranProvider><PrayerProvider><RecitationProvider><Root /></RecitationProvider></PrayerProvider></QuranProvider></AppProvider>
    </SafeAreaProvider>
  );
}
