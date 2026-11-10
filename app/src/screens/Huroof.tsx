import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useApp } from '../store';
import { Route } from '../nav';
import { ABU_BAKR, HADITH_SUMS, HUROOF_SOURCE, H_HUMILITY, H_LETTERS, H_SECTIONS, LETTERS_SOURCE, MISSING7, OPENERS } from '../core/huroof';
import { ABJAD, abjadParts } from '../core/abjad';
import { Arabic, Body, Btn, Card, Header, Screen, Text, TextInput, useButtonLook } from '../ui';

const TREE = require('../../assets/huroof/muqattaat-tree.png');
const TREE_RATIO = 542 / 300;

/**
 * Ḥurūf: the disjoined letters that open 29 sūras. The nine parts of the nurmuhammad.com article as summaries (a row of
 * chips jumps to each), with the picture, the letters and the tables; at the end a button opens the whole article.
 */
export default function HuroofScreen({ onBack, go }: { onBack: () => void; go: (r: Route) => void }) {
  const { t, theme, lang } = useApp();
  const look = useButtonLook();
  const { width, height } = useWindowDimensions();
  const [big, setBig] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [word, setWord] = useState('بسم الله الرحمن الرحيم');
  const parts = abjadParts(word);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const ys = useRef<Record<string, number>>({});
  const tile = (width - 32 - 16) / 3;
  const imgW = Math.min(width - 66, 300);
  const bigH = Math.min(height - 120, (width - 32) * TREE_RATIO);

  const extra = (id: string) => {
    switch (id) {
      case 'intro': return (
        <View style={{ gap: 4, paddingTop: 4 }}>
          <Arabic size={22}>{ABU_BAKR}</Arabic>
          <Text style={{ fontSize: 12.5, color: theme.accent }}>Abū Bakr aṣ-Ṣiddīq (r)</Text>
        </View>
      );
      case 'keys': return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {H_LETTERS.map(l => (
            <View key={l.ar} style={{ width: tile - 10, backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.line, borderRadius: 14, alignItems: 'center', paddingVertical: 8, gap: 1 }}>
              <Arabic size={30} selectable={false} color={theme.primary} style={{ lineHeight: 48 }}>{l.ar}</Arabic>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.ink }}>{l.tr}</Text>
              <Arabic size={16} selectable={false} style={{ lineHeight: 28 }}>{l.name}</Arabic>
              <Text style={{ fontSize: 11, color: theme.muted }}>{`${l.divine} · ${l.value}`}</Text>
            </View>
          ))}
        </View>
      );
      case 'yafii': return (
        <View>
          <View style={{ flexDirection: 'row', paddingVertical: 6 }}>
            {[t.huroofLetter, t.huroofDay, t.huroofAngel, t.huroofName].map((h, i) => (
              <Text key={h} style={{ flex: i === 0 ? 0.7 : 1, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: theme.accent }}>{h.toUpperCase()}</Text>
            ))}
          </View>
          {MISSING7.map(m => (
            <View key={m.ar} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: theme.line }}>
              <View style={{ flex: 0.7 }}><Arabic size={24} selectable={false} color={theme.primary} style={{ lineHeight: 40, textAlign: 'left' }}>{m.ar}</Arabic><Text style={{ fontSize: 11.5, color: theme.muted }}>{m.tr}</Text></View>
              <Text style={{ flex: 1, fontSize: 13.5, color: m.day ? theme.ink : theme.muted }}>{m.day ? m.day[lang] : '–'}</Text>
              <Text style={{ flex: 1, fontSize: 13.5, color: theme.ink }}>{m.angel}</Text>
              <View style={{ flex: 1 }}><Text style={{ fontSize: 13.5, fontWeight: '600', color: theme.ink }}>{m.divine}</Text><Arabic size={16} selectable={false} style={{ lineHeight: 28, textAlign: 'left' }}>{m.divineAr}</Arabic></View>
            </View>
          ))}
        </View>
      );
      case 'openers': return (
        <View style={{ gap: 10 }}>
          {/* The picture: white, rounded, a thin gold border; tap to enlarge, tap again to close. */}
          <Pressable accessibilityRole="imagebutton" accessibilityLabel={t.tapToEnlarge} onPress={() => setBig(true)} style={{ alignSelf: 'center', alignItems: 'center', gap: 6 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#C9A05A', padding: 8, overflow: 'hidden' }}>
              <Image source={TREE} style={{ width: imgW - 20, height: (imgW - 20) * TREE_RATIO }} resizeMode="contain" />
            </View>
            <Text style={{ fontSize: 12, color: theme.muted }}>{t.tapToEnlarge}</Text>
          </Pressable>
          {OPENERS.map((o, i) => (
            <View key={o.ar} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: theme.line }}>
              <Arabic size={24} selectable={false} color={theme.primary} style={{ width: 96, textAlign: 'right', lineHeight: 42 }}>{o.ar}</Arabic>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>{o.tr}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {o.surahs.map(n => (
                    <Pressable key={n} accessibilityRole="button" onPress={() => go({ name: 'surah', n })}
                      style={{ borderWidth: 1, borderColor: look.border, backgroundColor: look.bg, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 12.5, color: look.fg }}>{n}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      );
      case 'hadith': return (
        <View>
          {HADITH_SUMS.map((h, i) => (
            <View key={h.ar} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: theme.line }}>
              <Arabic size={22} selectable={false} color={theme.primary} style={{ width: 90, textAlign: 'right', lineHeight: 38 }}>{h.ar}</Arabic>
              <Text style={{ flex: 1, fontSize: 14, color: theme.ink }}>{h.tr}</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.primary }}>{h.value}</Text>
            </View>
          ))}
        </View>
      );
      case 'numbers': {
        // The abjad table in blocks of nine, then the calculator.
        const cell = (width - 32 - 30 - 8 * 2) / 3;
        return (
          <View style={{ gap: 10 }}>
            {[ABJAD.slice(0, 9), ABJAD.slice(9, 18), ABJAD.slice(18, 27), ABJAD.slice(27)].map((block, b) => (
              <View key={b} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {block.map(l => (
                  <View key={l.ar} style={{ width: cell, backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.line, borderRadius: 12, alignItems: 'center', paddingVertical: 4 }}>
                    <Text style={{ position: 'absolute', top: 4, left: 6, fontSize: 10, color: theme.muted }}>{l.order}</Text>
                    <Arabic size={24} selectable={false} color={theme.primary} style={{ lineHeight: 40 }}>{l.ar}</Arabic>
                    <Text style={{ fontSize: 12, color: theme.ink }}>{l.tr}</Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: theme.primary }}>{l.value}</Text>
                  </View>
                ))}
              </View>
            ))}
            <View style={{ gap: 8, marginTop: 4 }}>
              <Text style={{ fontSize: 11.5, fontWeight: '700', letterSpacing: 1.2, color: theme.accent }}>{t.abjadCalc.toUpperCase()}</Text>
              <TextInput value={word} onChangeText={setWord} placeholder={t.abjadPlaceholder} style={{ fontFamily: 'Amiri_400Regular', fontSize: 22, textAlign: 'right', writingDirection: 'rtl' }} />
              <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 }}>
                {parts.map((l, i) => (
                  <View key={i} style={{ alignItems: 'center', borderWidth: 1, borderColor: theme.line, borderRadius: 8, paddingHorizontal: 6 }}>
                    <Arabic size={18} selectable={false} style={{ lineHeight: 30 }}>{l.ar}</Arabic>
                    <Text style={{ fontSize: 11, color: theme.muted }}>{l.value}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.primary, textAlign: 'center' }}>{`= ${parts.reduce((n, l) => n + l.value, 0)}`}</Text>
            </View>
          </View>
        );
      }
      default: return null;
    }
  };

  return (
    <Screen>
      <Header title={t.huroofTitle} sub={t.huroofSub} onBack={onBack} right={<Arabic size={24} selectable={false} color={theme.primary} style={{ lineHeight: 42 }}>حُرُوف</Arabic>} />
      <ScrollView ref={scroll} contentContainerStyle={{ gap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Contents: tap a part to jump to it. */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {H_SECTIONS.map((sec, i) => (
            <Pressable key={sec.id} accessibilityRole="button" onPress={() => scroll.current?.scrollTo({ y: Math.max(0, (ys.current[sec.id] ?? 0) - 8), animated: true })}
              style={{ borderWidth: 1, borderColor: look.border, backgroundColor: look.bg, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 }}>
              <Text style={{ fontSize: 12.5, color: look.fg }}>{`${i + 1} ${sec.title[lang]}`}</Text>
            </Pressable>
          ))}
        </View>
        {H_SECTIONS.map((sec, i) => (
          <View key={sec.id} onLayout={e => { ys.current[sec.id] = e.nativeEvent.layout.y; }}>
            <Card style={{ gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}><Text style={{ color: theme.primary, fontWeight: '800' }}>{`${i + 1}  `}</Text>{sec.title[lang]}</Text>
              <Body>{sec.text[lang]}</Body>
              {sec.more ? (open[sec.id]
                ? <Body>{sec.more[lang]}</Body>
                : <Text onPress={() => setOpen(o => ({ ...o, [sec.id]: true }))} style={{ fontSize: 13.5, fontWeight: '700', color: theme.primary }}>{`${t.showMore} ⌄`}</Text>) : null}
              {extra(sec.id)}
            </Card>
          </View>
        ))}
        <Card><Body muted>{H_HUMILITY[lang]}</Body></Card>
        <Btn title={t.readArticle} onPress={() => go({ name: 'article', url: HUROOF_SOURCE, title: 'Secrets of Muqattaʿat' })} />
        <Btn kind="secondary" title={t.readLetters} onPress={() => go({ name: 'article', url: LETTERS_SOURCE, title: 'Knowledge of Letters & Numbers' })} />
        <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center' }}>{`${t.source}: nurmuhammad.com – Secrets of Muqattaʿat in Ahadith of Prophet ﷺ · Knowledge of Letters and Numbers`}</Text>
      </ScrollView>

      <Modal visible={big} transparent animationType="fade" onRequestClose={() => setBig(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.tapToClose} onPress={() => setBig(false)}
          style={{ flex: 1, backgroundColor: 'rgba(5,10,11,0.9)', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#C9A05A', padding: 8 }}>
            <Image source={TREE} style={{ width: bigH / TREE_RATIO, height: bigH }} resizeMode="contain" />
          </View>
          <Text style={{ fontSize: 12.5, color: '#B7C6C3' }}>{t.tapToClose}</Text>
        </Pressable>
      </Modal>
    </Screen>
  );
}

/** The whole article, shown inside Alif (needs internet). Links inside it are not followed. */
export function ArticleScreen({ onBack, url = HUROOF_SOURCE, title = 'Secrets of Muqattaʿat' }: { onBack: () => void; url?: string; title?: string }) {
  const { t, theme } = useApp();
  const [err, setErr] = useState(false);
  const [key, setKey] = useState(0);
  return (
    <Screen>
      <Header title={t.articleTitle} sub={`nurmuhammad.com · ${title}`} onBack={onBack} />
      <View style={{ flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#C9A05A', backgroundColor: '#fbfaf7', marginBottom: 8 }}>
        {err ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, backgroundColor: theme.card }}>
            <Body>{t.articleOffline}</Body>
            <Btn title={t.tryAgainShort} onPress={() => { setErr(false); setKey(k => k + 1); }} />
          </View>
        ) : (
          <WebView key={key} source={{ uri: url }} startInLoadingState
            renderLoading={() => <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.primary} /></View>}
            onError={() => setErr(true)} onHttpError={e => { if (e.nativeEvent.statusCode >= 500) setErr(true); }}
            // Only the article itself: links inside it are not followed.
            onShouldStartLoadWithRequest={r => r.url.split('#')[0].replace(/\/$/, '') === url.replace(/\/$/, '') || r.url.startsWith('about:')}
            setSupportMultipleWindows={false} allowsLinkPreview={false} />
        )}
      </View>
    </Screen>
  );
}
