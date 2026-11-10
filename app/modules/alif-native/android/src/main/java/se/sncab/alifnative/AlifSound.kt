package se.sncab.alifnative

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ContentValues
import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import java.io.File

/**
 * Sounds for the prayer notifications. A sound is written as:
 *   "default"            the phone's notification sound
 *   "silent"             no sound (the notification only)
 *   "raw:adhan_makkah"   an adhan that comes with the app (res/raw)
 *   "content://…"        a sound on the phone (from the system picker or a file the person imported)
 * Android fixes a channel's sound when it is created, so every sound gets its own channel; old ones are removed.
 */
object AlifSound {
  private var player: MediaPlayer? = null

  fun uri(context: Context, sound: String): Uri? = when {
    sound == "default" -> RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
    sound == "silent" -> null
    sound.startsWith("raw:") -> Uri.parse("android.resource://${context.packageName}/raw/${sound.removePrefix("raw:")}")
    else -> Uri.parse(sound)
  }

  /** Creates the channels the app now uses (prayer: "prayer…", Daily Awrad: "awrad-…") and removes earlier ones of that kind. */
  fun setChannels(context: Context, channels: List<Map<String, Any?>>, prefix: String = "prayer") {
    if (Build.VERSION.SDK_INT < 26) return
    val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val keep = channels.map { it["id"] as String }.toSet()
    for (c in nm.notificationChannels) if (c.id.startsWith(prefix) && c.id !in keep) nm.deleteNotificationChannel(c.id)
    for (c in channels) {
      val id = c["id"] as String
      if (nm.getNotificationChannel(id) != null) continue
      val alarm = c["alarm"] as? Boolean ?: false
      val ch = NotificationChannel(id, c["name"] as? String ?: "Prayer", NotificationManager.IMPORTANCE_HIGH)
      ch.lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
      ch.enableVibration(true)
      ch.vibrationPattern = longArrayOf(0, 300, 200, 300)
      val u = uri(context, c["sound"] as? String ?: "default")
      val attrs = AudioAttributes.Builder()
        .setUsage(if (alarm) AudioAttributes.USAGE_ALARM else AudioAttributes.USAGE_NOTIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
      ch.setSound(u, if (u == null) null else attrs)
      nm.createNotificationChannel(ch)
    }
  }

  fun preview(context: Context, sound: String) {
    stop()
    val u = uri(context, sound) ?: return
    try {
      player = MediaPlayer().apply {
        setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build())
        setDataSource(context, u)
        setOnCompletionListener { stop() }
        prepare(); start()
      }
    } catch (_: Exception) { stop() }
  }

  fun stop() {
    try { player?.stop() } catch (_: Exception) {}
    try { player?.release() } catch (_: Exception) {}
    player = null
  }

  /** Copies a sound file into the phone's Notifications folder so the system can play it; returns its address. */
  fun import(context: Context, path: String, title: String): String? {
    if (Build.VERSION.SDK_INT < 29) return null
    val src = File(Uri.parse(path).path ?: path)
    if (!src.exists()) return null
    val values = ContentValues().apply {
      put(MediaStore.Audio.Media.DISPLAY_NAME, src.name)
      put(MediaStore.Audio.Media.TITLE, title)
      put(MediaStore.Audio.Media.MIME_TYPE, if (src.name.endsWith(".ogg")) "audio/ogg" else if (src.name.endsWith(".m4a")) "audio/mp4" else if (src.name.endsWith(".wav")) "audio/wav" else "audio/mpeg")
      put(MediaStore.Audio.Media.RELATIVE_PATH, "Notifications/Alif")
      put(MediaStore.Audio.Media.IS_NOTIFICATION, 1)
      put(MediaStore.Audio.Media.IS_ALARM, 1)
      put(MediaStore.Audio.Media.IS_PENDING, 1)
    }
    val resolver = context.contentResolver
    val uri = resolver.insert(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, values) ?: return null
    resolver.openOutputStream(uri)?.use { out -> src.inputStream().use { it.copyTo(out) } }
    values.clear(); values.put(MediaStore.Audio.Media.IS_PENDING, 0)
    resolver.update(uri, values, null, null)
    return uri.toString()
  }
}
