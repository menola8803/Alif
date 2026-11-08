// Expo config plugin: lets the volume buttons count dhikr. MainActivity passes each key event to
// se.sncab.alifnative.AlifKeys first; it only takes the volume buttons while the Dhikr page has asked for it.
const { withMainActivity } = require('expo/config-plugins');

const MARK = 'AlifKeys.handle';

module.exports = function withVolumeKeys(config) {
  return withMainActivity(config, cfg => {
    let src = cfg.modResults.contents;
    if (src.includes(MARK)) return cfg;
    if (cfg.modResults.language !== 'kt') throw new Error('withVolumeKeys: MainActivity is not Kotlin');
    src = src.replace(/^(package [^\n]+\n)/, `$1\nimport android.view.KeyEvent\nimport se.sncab.alifnative.AlifKeys\n`);
    const m = /class MainActivity\s*:\s*ReactActivity\(\)\s*\{/.exec(src);
    if (!m) throw new Error('withVolumeKeys: MainActivity class not found');
    const at = m.index + m[0].length;
    src = src.slice(0, at) + `
  // Volume buttons count dhikr while the Dhikr page asks for it (see AlifKeys).
  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (${MARK}(event)) return true
    return super.dispatchKeyEvent(event)
  }
` + src.slice(at);
    cfg.modResults.contents = src;
    return cfg;
  });
};
