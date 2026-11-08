// The microphone rule: open only while every condition holds; every other case closes it.
import { micMayRun, speechError } from '../src/core/listen';
import { distanceKm, fromOverpass, sortByDistance } from '../src/core/mosques';
import { readFileSync } from 'fs';
import { join } from 'path';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
const all = { micOn: true, onListenPage: true, appActive: true, pressed: true };
ok(micMayRun(all), 'open when everything holds');
for (const k of Object.keys(all) as (keyof typeof all)[]) ok(!micMayRun({ ...all, [k]: false }), `closed when ${k} is false`);
ok(speechError(-2) === 'noOffline' && speechError(7) === 'noMatch' && speechError(9) === 'noPermission', 'errors');
// Settings: microphone off and "on the phone only" on by default; the app must not hold the mic in the background.
const store = readFileSync(join(__dirname, '..', 'src', 'store.tsx'), 'utf8');
ok(/micOn: false/.test(store) && /micOnlyPhone: true/.test(store), 'microphone off by default, on the phone only');
const listen = readFileSync(join(__dirname, '..', 'src', 'screens', 'Listen.tsx'), 'utf8');
ok(/stopListening\(\); \}, \[\]\)/.test(listen) && /AppState\.addEventListener/.test(listen), 'Listen closes the mic on unmount and follows the app state');
// mosques
const m = fromOverpass({ elements: [{ lat: 59.3, lon: 18.0, tags: { name: 'Stockholms moské', 'addr:street': 'Kapellgränd', 'addr:housenumber': '10', 'addr:city': 'Stockholm' } }, { center: { lat: 57.7, lon: 11.9 }, tags: {} }, { tags: {} }] });
ok(m.length === 2 && m[0].addr === 'Kapellgränd 10' && m[1].name === 'Moské', 'overpass');
ok(Math.abs(distanceKm({ lat: 59.3293, lng: 18.0686 }, { lat: 57.7089, lng: 11.9746 }) - 398) < 5, 'distance Stockholm–Göteborg');
ok(sortByDistance(m, { lat: 57.7, lng: 11.9 })[0].lat === 57.7, 'sort');
if (fail) process.exit(1);
console.log('listen: all ok');
