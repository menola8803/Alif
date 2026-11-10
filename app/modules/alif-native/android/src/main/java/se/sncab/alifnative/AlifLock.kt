package se.sncab.alifnative

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/**
 * Prayer times on the lock screen: a quiet notification that stays (like a message from WhatsApp), shown when the
 * screen is turned on. Title: the next prayer and its time with a live countdown; text: the five times of today;
 * below: the Hijri date and the place. No sound, no vibration. Renewed after every prayer (an alarm), when the app
 * saves new times, after a restart of the phone and when the time zone changes. Turned on and off in Alif's settings.
 */
object AlifLock {
  const val CHANNEL = "alif-lock"
  const val ID = 4711
  const val ACTION = "se.sncab.alifnative.LOCK_UPDATE"

  fun update(context: Context) {
    val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val raw = context.getSharedPreferences(AlifTimes.PREFS, Context.MODE_PRIVATE).getString("data", null)
    val on = raw != null && try { org.json.JSONObject(raw).optBoolean("lock", false) } catch (e: Exception) { false }
    val d = if (on) AlifTimes.read(context) else null
    if (d == null || d.nextAt <= 0) { nm.cancel(ID); cancelAlarm(context); return }

    if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CHANNEL) == null) {
      val sv = java.util.Locale.getDefault().language == "sv"
      val ch = NotificationChannel(CHANNEL, if (sv) "Bönetider på låsskärmen" else "Prayer times on the lock screen", NotificationManager.IMPORTANCE_DEFAULT)
      ch.setSound(null, null); ch.enableVibration(false); ch.setShowBadge(false)
      ch.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      nm.createNotificationChannel(ch)
    }
    val icon = context.resources.getIdentifier("notification_icon", "drawable", context.packageName).let { if (it != 0) it else android.R.drawable.ic_lock_idle_alarm }
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val pi = launch?.let { PendingIntent.getActivity(context, 2, it, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT) }
    val times = (0 until 5).joinToString("   ") { "${d.names[it]} ${AlifTimes.hhmm(d.times[it])}" }
    val sub = listOf(d.hijri, d.place).filter { it.isNotEmpty() }.joinToString(" · ")
    @Suppress("DEPRECATION")
    val b = (if (Build.VERSION.SDK_INT >= 26) Notification.Builder(context, CHANNEL) else Notification.Builder(context))
      .setSmallIcon(icon)
      .setColor(AlifTimes.GOLD)
      .setContentTitle("${d.nextName}  ${AlifTimes.hhmm(d.nextAt)}")
      .setContentText(times)
      .setStyle(Notification.BigTextStyle().bigText(times))
      .setSubText(sub)
      .setWhen(d.nextAt).setShowWhen(true).setUsesChronometer(true)
      .setOngoing(true).setOnlyAlertOnce(true)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setCategory(Notification.CATEGORY_STATUS)
    if (Build.VERSION.SDK_INT >= 24) b.setChronometerCountDown(true)
    if (pi != null) b.setContentIntent(pi)
    try { nm.notify(ID, b.build()) } catch (_: SecurityException) {}
    schedule(context, d.nextAt + 30_000L)
  }

  private fun pending(context: Context) = PendingIntent.getBroadcast(context, 3,
    Intent(context, AlifLockReceiver::class.java).setAction(ACTION), PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

  private fun schedule(context: Context, at: Long) {
    val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    try {
      if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending(context))
      else am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending(context))
    } catch (_: Exception) {
      try { am.set(AlarmManager.RTC, at, pending(context)) } catch (_: Exception) {}
    }
  }

  private fun cancelAlarm(context: Context) {
    try { (context.getSystemService(Context.ALARM_SERVICE) as AlarmManager).cancel(pending(context)) } catch (_: Exception) {}
  }
}

/** Renews the lock screen times (and the widget) after a prayer, a restart of the phone or a change of time zone. */
class AlifLockReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    AlifLock.update(context)
    AlifWidget.refresh(context)
  }
}
