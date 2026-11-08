package se.sncab.alifnative

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Home screen widget: the next prayer with its time, the Hijri date and the place, and today's five times.
 * The app writes the times of the coming days (saved by setWidgetData); the widget picks the next one itself and is
 * refreshed shortly after each prayer and every 30 minutes.
 */
class AlifWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    update(context, manager, ids)
  }

  companion object {
    const val PREFS = "alif_widget"
    private val ORDER = listOf("fajr", "dhuhr", "asr", "maghrib", "isha")

    fun refresh(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, AlifWidget::class.java))
      if (ids.isNotEmpty()) update(context, mgr, ids)
    }

    fun update(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("data", null)
      val views = RemoteViews(context.packageName, R.layout.alif_widget)
      val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
      if (launch != null) {
        views.setOnClickPendingIntent(R.id.alif_widget_root, PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
      }
      var nextAt = 0L
      if (raw != null) {
        try {
          val j = JSONObject(raw)
          val names = j.getJSONObject("names")
          val days = j.getJSONArray("days")
          val now = System.currentTimeMillis()
          val fmt = SimpleDateFormat("HH:mm", Locale.getDefault())
          var nextName = ""
          var today: JSONObject? = null
          val todayKey = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(now))
          for (i in 0 until days.length()) {
            val d = days.getJSONObject(i)
            if (d.getString("date") == todayKey) today = d
            if (nextAt == 0L) for (k in ORDER) {
              val t = d.getJSONObject("times").optLong(k, 0L)
              if (t > now) { nextAt = t; nextName = names.optString(k, k); break }
            }
          }
          views.setTextViewText(R.id.alif_widget_label, j.optString("labelNext", "Next prayer"))
          views.setTextViewText(R.id.alif_widget_next, if (nextAt > 0) "$nextName  ${fmt.format(Date(nextAt))}" else "–")
          views.setTextViewText(R.id.alif_widget_sub, listOf(j.optString("hijri"), j.optString("place")).filter { it.isNotEmpty() }.joinToString(" · "))
          val row = today?.let { d -> ORDER.joinToString("   ") { k -> "${names.optString(k, k)} ${fmt.format(Date(d.getJSONObject("times").optLong(k, 0L)))}" } } ?: ""
          views.setTextViewText(R.id.alif_widget_times, row)
        } catch (e: Exception) {
          views.setTextViewText(R.id.alif_widget_next, "Alif")
        }
      } else {
        views.setTextViewText(R.id.alif_widget_next, "Alif")
        views.setTextViewText(R.id.alif_widget_sub, "")
        views.setTextViewText(R.id.alif_widget_times, "")
      }
      for (id in ids) manager.updateAppWidget(id, views)
      // Refresh a minute after the next prayer, so "next" moves on (inexact alarm: no special permission needed).
      if (nextAt > 0) {
        try {
          val intent = Intent(context, AlifWidget::class.java).setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE).putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
          val pi = PendingIntent.getBroadcast(context, 1, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
          (context.getSystemService(Context.ALARM_SERVICE) as AlarmManager).set(AlarmManager.RTC, nextAt + 60_000L, pi)
        } catch (_: Exception) {}
      }
    }
  }
}
