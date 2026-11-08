package se.sncab.alifnative

import android.view.KeyEvent

/**
 * Volume buttons as a dhikr counter. MainActivity hands every key event here first (added by the config plugin
 * plugins/withVolumeKeys.js). Only while the Dhikr page asks for it are the volume buttons taken; otherwise they
 * change the volume as usual.
 */
object AlifKeys {
  @Volatile var capture = false
  var listener: ((Int) -> Unit)? = null

  @JvmStatic
  fun handle(event: KeyEvent): Boolean {
    if (!capture) return false
    val k = event.keyCode
    if (k != KeyEvent.KEYCODE_VOLUME_UP && k != KeyEvent.KEYCODE_VOLUME_DOWN) return false
    if (event.action == KeyEvent.ACTION_DOWN && event.repeatCount == 0) listener?.invoke(if (k == KeyEvent.KEYCODE_VOLUME_UP) 1 else -1)
    return true
  }
}
