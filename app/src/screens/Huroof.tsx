import React, { useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useApp } from '../store';
import { Route } from '../nav';
import { SURAHS } from '../core/quran';
import { ABU_BAKR, HADITH_SUMS, HUROOF_SOURCE, H_LETTERS, H_TEXT, MISSING7, OPENERS } from '../core/huroof';
import { Arabic, Body, Card, Header, Label, Screen, Text } from '../ui';

const TREE = require('../../assets/huroof/muqattaat-tree.png');
const TREE_RATIO = 542 / 300;

/** Ḥurūf: the disjoined letters that open 29 sūras, with explaining text, the picture and the letters. */
export default function HuroofScreen({ onBack, go }: { onBack: () => void; go: (r: Route) => void }) {
  const { t, theme, lang } = useApp();
  const { width, height } = useWindowDimensions();
  const [big, setBig] = useState(false);
  const tx = (k: string) => H_TEXT[k][lang];
  const tile = (width - 32 - 16) / 3;
  const imgW = Math.min(width - 66, 300);
  const bigH = Math.min(height - 120, (width - 32) * TREE_RATIO);
  const Section = ({ label, text, children }: { label: string; text: string; children?: React.ReactNode }) => (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>
      <Body>{text}</Body>
      {children}
    </View>
  );
  return (
    <Screen>
      <Header title={t.huroofTitle} sub={t.huroofSub} onBack={onBack} right={<Arabic size={24} selectable={false} color={theme.primary} style={{ lineHeight: 42 }}>حُرُوف</Arabic>} />
      <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Body>{tx('intro')}</Body>
        <Card>
          <Arabic size={22}>{ABU_BAKR}</Arabic>
          <Text style={{ fontSize: 14, lineHeight: 21, color: theme.ink }}>{tx('quote')}</Text>
          <Text style={{ fontSize: 12.5, color: theme.accent }}>Abū Bakr aṣ-Ṣiddīq (r) · al-Ḥasan al-Baṣrī</Text>
        </Card>

        <Section label={t.huroofTree} text={tx('tree')}>
          {/* The picture: white, rounded, a thin gold border; tap to enlarge, tap again to close. */}
          <Pressable accessibilityRole="imagebutton" accessibilityLabel={t.tapToEnlarge} onPress={() => setBig(true)} style={{ alignSelf: 'center', alignItems: 'center', gap: 6 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#C9A05A', padding: 8, overflow: 'hidden' }}>
              <Image source={TREE} style={{ width: imgW, height: imgW * TREE_RATIO }} resizeMode="contain" />
            </View>
            <Text style={{ fontSize: 12, color: theme.muted }}>{t.tapToEnlarge}</Text>
          </Pressable>
        </Section>

        <Section label={t.huroofLetters} text={tx('letters')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {H_LETTERS.map(l => (
              <View key={l.ar} style={{ width: tile, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line, borderRadius: 14, alignItems: 'center', paddingVertical: 8, gap: 1 }}>
                <Arabic size={32} selectable={false} color={theme.primary} style={{ lineHeight: 50 }}>{l.ar}</Arabic>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.ink }}>{l.tr}</Text>
                <Arabic size={16} selectable={false} style={{ lineHeight: 28 }}>{l.name}</Arabic>
                <Text style={{ fontSize: 11, color: theme.muted }}>{`${l.divine} · ${l.value}`}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section label={t.huroofOpeners} text={tx('openers')}>
          <Card style={{ paddingVertical: 4, gap: 0 }}>
            {OPENERS.map((o, i) => (
              <View key={o.ar} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: theme.line }}>
                <Arabic size={24} selectable={false} color={theme.primary} style={{ width: 100, textAlign: 'right', lineHeight: 42 }}>{o.ar}</Arabic>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>{o.tr}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {o.surahs.map(n => (
                      <Text key={n} onPress={() => go({ name: 'surah', n })} accessibilityRole="link" accessibilityLabel={`${n}. ${SURAHS[n - 1].name}`}
                        style={{ fontSize: 12.5, color: theme.primary, borderWidth: 1, borderColor: theme.line, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>{n}</Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </Section>

        <Section label="كٓهيعٓصٓ" text={tx('kaf')} />

        <Section label={t.huroofHadith} text={tx('hadith')}>
          <Card style={{ paddingVertical: 4, gap: 0 }}>
            {HADITH_SUMS.map((h, i) => (
              <View key={h.ar} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: theme.line }}>
                <Arabic size={22} selectable={false} color={theme.primary} style={{ width: 90, textAlign: 'right', lineHeight: 38 }}>{h.ar}</Arabic>
                <Text style={{ flex: 1, fontSize: 14, color: theme.ink }}>{h.tr}</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.primary }}>{h.value}</Text>
              </View>
            ))}
          </Card>
        </Section>

        <Section label={t.huroofMissing} text={tx('missing')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MISSING7.map(m => (
              <View key={m.ar} style={{ width: tile, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line, borderRadius: 14, alignItems: 'center', paddingVertical: 6 }}>
                <Arabic size={26} selectable={false} color={theme.primary} style={{ lineHeight: 42 }}>{m.ar}</Arabic>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: theme.ink }}>{m.tr}</Text>
                <Text style={{ fontSize: 11, color: theme.muted }}>{m.divine}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Card><Body muted>{tx('humility')}</Body></Card>
        <Text style={{ fontSize: 12, color: theme.muted }} onPress={() => Linking.openURL(HUROOF_SOURCE).catch(() => {})}>{`${t.source}: nurmuhammad.com – Secrets of Muqattaʿat in Ahadith of Prophet ﷺ ›`}</Text>
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
