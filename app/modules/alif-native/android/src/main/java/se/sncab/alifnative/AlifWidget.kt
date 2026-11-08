package se.sncab.alifnative

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Typeface
import android.text.SpannableString
import android.text.Spanned
import android.text.style.StyleSpan
import android.widget.RemoteViews

/**
 * Home screen (and lock screen) widget in gold on the theme's colour, a rectangle with slightly rounded corners and a
 * thin gold border. Two looks, chosen in Alif's settings: the full one (next prayer, Hijri date, place, today's times)
 * or only the five prayers with their times. It follows Alif's light or dark theme. The app writes the times of the
 * coming days; the widget picks the next one itself and is refreshed shortly after each prayer and every 30 minutes.
 */
class AlifWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    update(context, manager, ids)
  }

  companion object {
    const val PREFS = AlifTimes.PREFS
    private val NAME_IDS = intArrayOf(R.id.alif_w_name0, R.id.alif_w_name1, R.id.alif_w_name2, R.id.alif_w_name3, R.id.alif_w_name4)
    private val TIME_IDS = intArrayOf(R.id.alif_w_time0, R.id.alif_w_time1, R.id.alif_w_time2, R.id.alif_w_time3, R.id.alif_w_time4)

    fun refresh(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, AlifWidget::class.java))
      if (ids.isNotEmpty()) update(context, mgr, ids)
    }

    private fun bold(s: String, on: Boolean): CharSequence {
      if (!on) return s
      val sp = SpannableString(s); sp.setSpan(StyleSpan(Typeface.BOLD), 0, s.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE); return sp
    }

    fun update(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val d = AlifTimes.read(context)
      val timesOnly = d?.style == "times"
      val views = RemoteViews(context.packageName, if (timesOnly) R.layout.alif_widget_times else R.layout.alif_widget)
      val dark = d?.dark ?: true
      val gold = if (dark) AlifTimes.GOLD else AlifTimes.GOLD_LIGHT
      views.setInt(R.id.alif_widget_root, "setBackgroundResource", if (dark) R.drawable.alif_widget_bg else R.drawable.alif_widget_bg_light)
      val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
      if (launch != null) {
        views.setOnClickPendingIntent(R.id.alif_widget_root, PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
      }
      if (timesOnly && d != null) {
        for (i in 0 until 5) {
          val next = i == d.nextIndex
          val c = if (next) gold else AlifTimes.withAlpha(gold, 200)
          views.setTextViewText(NAME_IDS[i], bold(d.names[i], next))
          views.setTextViewText(TIME_IDS[i], bold(AlifTimes.hhmm(d.times[i]), next))
          views.setTextColor(NAME_IDS[i], c); views.setTextColor(TIME_IDS[i], c)
        }
      } else if (d != null) {
        views.setTextViewText(R.id.alif_widget_label, d.label)
        views.setTextViewText(R.id.alif_widget_next, if (d.nextAt > 0) "${d.nextName}  ${AlifTimes.hhmm(d.nextAt)}" else "–")
        views.setTextViewText(R.id.alif_widget_sub, listOf(d.hijri, d.place).filter { it.isNotEmpty() }.joinToString(" · "))
        views.setTextViewText(R.id.alif_widget_times, (0 until 5).joinToString("   ") { "${d.names[it]} ${AlifTimes.hhmm(d.times[it])}" })
        views.setTextColor(R.id.alif_widget_label, AlifTimes.withAlpha(gold, 180))
        views.setTextColor(R.id.alif_widget_next, gold)
        views.setTextColor(R.id.alif_widget_sub, AlifTimes.withAlpha(gold, 220))
        views.setTextColor(R.id.alif_widget_times, AlifTimes.withAlpha(gold, 190))
      } else {
        views.setTextViewText(R.id.alif_widget_next, "Alif")
      }
      for (id in ids) manager.updateAppWidget(id, views)
      // Refresh a minute after the next prayer, so "next" moves on (inexact alarm: no special permission needed).
      val nextAt = d?.nextAt ?: 0L
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
