package se.sncab.alifnative

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build

/**
 * After an update that Alif itself started (Settings › Updates or the card on Today): open Alif again, and – since
 * Android may stop an app from opening itself in the background – also show a notification "Alif is updated, tap to
 * open". Nothing happens after other updates.
 */
object AlifUpdate {
  private const val PREFS = "alif_update"
  private const val CHANNEL = "alif-update"

  /** Called from JS just before the installer opens. */
  fun markPending(ctx: Context, title: String, body: String, channel: String) {
    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
      .putBoolean("pending", true).putString("title", title).putString("body", body).putString("channel", channel)
      .putLong("at", System.currentTimeMillis()).apply()
  }

  fun afterReplaced(ctx: Context) {
    val p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    // Only for an update started from Alif within the last hour
    if (!p.getBoolean("pending", false) || System.currentTimeMillis() - p.getLong("at", 0) > 3600_000) return
    p.edit().putBoolean("pending", false).apply()
    val launch = ctx.packageManager.getLaunchIntentForPackage(ctx.packageName)?.apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    } ?: return
    try { ctx.startActivity(launch) } catch (_: Exception) {}
    try {
      val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CHANNEL) == null) {
        nm.createNotificationChannel(NotificationChannel(CHANNEL, p.getString("channel", "Alif"), NotificationManager.IMPORTANCE_HIGH))
      }
      val pi = PendingIntent.getActivity(ctx, 7320, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
      @Suppress("DEPRECATION")
      val b = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(ctx, CHANNEL) else Notification.Builder(ctx)
      val icon = ctx.resources.getIdentifier("notification_icon", "drawable", ctx.packageName).let { if (it != 0) it else android.R.drawable.stat_sys_download_done }
      nm.notify(7320, b.setSmallIcon(icon).setColor(AlifTimes.GOLD).setContentTitle(p.getString("title", "Alif")).setContentText(p.getString("body", ""))
        .setContentIntent(pi).setAutoCancel(true).build())
    } catch (_: Exception) {}
  }
}
