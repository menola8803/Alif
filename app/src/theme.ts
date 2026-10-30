import { Platform } from 'react-native';

// Themes. The colors and fonts are shared with Direct (dark teal with gold and mint, Plus Jakarta Sans and a Cinzel
// wordmark, and a light beige). To use another palette (e.g. from the "Tema för OnePlus 13R" project), change the values
// here: every screen reads its colors from this file.
export type ThemeName = 'dark' | 'beige';

export type Theme = {
  name: ThemeName;
  dark: boolean;
  bg: string;
  card: string;
  chip: string;
  line: string;
  ink: string;
  muted: string;
  accent: string;   // secondary highlight (mint / bronze)
  primary: string;  // buttons, active tab, Arabic text highlight (gold / charcoal)
  onPrimary: string;
  arabicInk: string; // color of large Arabic text
  good: string;
  danger: string;
  tabActive: string;
  fonts: { regular?: string; medium?: string; semibold?: string; bold?: string; extrabold?: string; heading?: string; display?: string; arabic: string; arabicBold: string };
};

const serif = Platform.select({ ios: 'Georgia', default: 'serif' });

export const themes: Record<ThemeName, Theme> = {
  dark: {
    name: 'dark', dark: true,
    bg: '#0F1A1C', card: '#172629', chip: '#1E3236', line: '#25393D',
    ink: '#EAF1EF', muted: '#B7C6C3', accent: '#5FC4B4',
    primary: '#E8B04A', onPrimary: '#0F1A1C', arabicInk: '#F3D9A0',
    good: '#5FC4B4', danger: '#E8776D', tabActive: '#E8B04A',
    fonts: {
      regular: 'PlusJakartaSans_400Regular', medium: 'PlusJakartaSans_500Medium', semibold: 'PlusJakartaSans_600SemiBold', bold: 'PlusJakartaSans_700Bold',
      extrabold: 'PlusJakartaSans_800ExtraBold', heading: 'PlusJakartaSans_700Bold', display: 'Cinzel_700Bold', arabic: 'Amiri_400Regular', arabicBold: 'Amiri_700Bold',
    },
  },
  beige: {
    name: 'beige', dark: false,
    bg: '#EFEDE8', card: '#FAF8F4', chip: '#E9E2D3', line: '#DDD8CD',
    ink: '#26231F', muted: '#6A6358', accent: '#7A5C2B',
    primary: '#26231F', onPrimary: '#F3E9D2', arabicInk: '#26231F',
    good: '#2F6E4C', danger: '#A8403A', tabActive: '#26231F',
    fonts: { heading: serif, display: 'Cinzel_700Bold', arabic: 'Amiri_400Regular', arabicBold: 'Amiri_700Bold' },
  },
};
