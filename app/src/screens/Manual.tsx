import React from 'react';
import { ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { useApp } from '../store';
import { MANUAL } from '../manual';
import { Body, Card, Header, Label, Screen, Text } from '../ui';
import History from './History';

export default function ManualScreen({ onBack }: { onBack: () => void }) {
  const { t, theme, lang } = useApp();
  return (
    <Screen>
      <Header title={t.manual} sub={`${t.version} ${Constants.expoConfig?.version ?? ''}`} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        {MANUAL[lang].map(s => (
          <Card key={s.title}>
            <Label>{s.title}</Label>
            {s.items.map((it, i) => <Body key={i}>• {it}</Body>)}
          </Card>
        ))}
        <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center' }}>{t.developer}</Text>
      </ScrollView>
    </Screen>
  );
}

/** What stays on the phone and what is sent where. */
export function PrivacyScreen({ onBack }: { onBack: () => void }) {
  const { t } = useApp();
  return (
    <Screen>
      <Header title={t.privacy} sub={t.privacySub} onBack={onBack} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        {t.privacyItems.map(([title, body]) => (
          <Card key={title}><Label>{title}</Label><Body>{body}</Body></Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

/** History, now under Settings. */
export function HistoryScreen({ onBack, open }: { onBack: () => void; open: (id: string) => void }) {
  const { t } = useApp();
  return (
    <Screen>
      <Header title={t.historyTitle} sub={t.historySub} onBack={onBack} />
      <History open={open} hideTitle />
    </Screen>
  );
}
