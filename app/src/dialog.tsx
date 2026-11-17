import React, { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useApp } from './store';
import { Text, useButtonLook } from './ui';

/**
 * Alif's own question box, in the app's theme (Android's own box ignores it). Same shape as React Native's
 * Alert.alert: showDialog(title, message, [{ text, style: 'cancel' | 'destructive', onPress }]).
 */
export type DialogButton = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };
type Dialog = { title: string; message?: string; buttons: DialogButton[] };

let show: ((d: Dialog) => void) | null = null;
export function showDialog(title: string, message?: string, buttons?: DialogButton[]) {
  const d = { title, message, buttons: buttons ?? [] };
  if (show) show(d);
}

/** Put once at the root of the app. */
export function DialogHost() {
  const { theme, t } = useApp();
  const look = useButtonLook();
  const [d, setD] = useState<Dialog | null>(null);
  useEffect(() => { show = setD; return () => { show = null; }; }, []);
  const close = (b?: DialogButton) => { setD(null); b?.onPress?.(); };
  const cancel = d?.buttons.find(b => b.style === 'cancel');
  return (
    <Modal visible={!!d} transparent animationType="fade" statusBarTranslucent onRequestClose={() => close(cancel)}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(5,10,11,0.75)', justifyContent: 'center', padding: 24 }} onPress={() => close(cancel)}>
        <Pressable onPress={() => {}} accessibilityRole="alert"
          style={{ backgroundColor: theme.card, borderRadius: 22, borderWidth: 1, borderColor: theme.line, padding: 20, gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.ink }}>{d?.title}</Text>
          {d?.message ? <Text style={{ fontSize: 14.5, lineHeight: 21, color: theme.muted }}>{d.message}</Text> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            {(d?.buttons.length ? d.buttons : [{ text: t.ok }]).map((b: DialogButton) => {
              const danger = b.style === 'destructive', plain = b.style === 'cancel';
              return (
                <Pressable key={b.text} accessibilityRole="button" onPress={() => close(b)}
                  style={({ pressed }) => ({ minHeight: 44, minWidth: 88, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
                    borderColor: danger ? theme.danger : plain ? theme.line : look.border, backgroundColor: plain ? 'transparent' : danger ? 'rgba(232,119,109,0.12)' : look.bg, opacity: pressed ? 0.8 : 1 })}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: danger ? theme.danger : plain ? theme.muted : look.fg }}>{b.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
