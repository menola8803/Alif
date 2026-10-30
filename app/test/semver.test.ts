import { cmpVersion } from '../src/core/semver';
const ok = cmpVersion('v0.2.0', '0.1.9') > 0 && cmpVersion('0.10.0', '0.9.9') > 0 && cmpVersion('v1.0.0', '1.0.0') === 0 && cmpVersion('0.1.0', '0.1.1') < 0;
if (!ok) { console.log('semver FAIL'); process.exit(1); }
console.log('semver: all ok');
