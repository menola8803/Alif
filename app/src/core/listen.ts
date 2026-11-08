// When the microphone may be open. It is only open while ALL of these hold; anything else closes it at once:
// the person has turned the microphone on in Settings, the Listen page is the page on screen, Alif is in the
// foreground, and the person has pressed Listen (and not Stop).
export type MicState = { micOn: boolean; onListenPage: boolean; appActive: boolean; pressed: boolean };
export const micMayRun = (s: MicState) => s.micOn && s.onListenPage && s.appActive && s.pressed;

/** Android SpeechRecognizer error codes → our message keys. */
export function speechError(code: number): 'noOffline' | 'noService' | 'noMatch' | 'noPermission' | 'network' | 'other' {
  if (code === -2) return 'noOffline';           // on-device recogniser / Arabic pack missing
  if (code === -3 || code === -1) return 'noService';
  if (code === 7 || code === 6) return 'noMatch'; // ERROR_NO_MATCH, ERROR_SPEECH_TIMEOUT
  if (code === 9) return 'noPermission';          // ERROR_INSUFFICIENT_PERMISSIONS
  if (code === 1 || code === 2) return 'network';
  return 'other';
}
