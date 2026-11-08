package se.sncab.alifnative

import android.content.Context
import android.graphics.Color
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** The prayer times the app saved (setWidgetData), read by the widget and the screen saver. */
class AlifTimes(
  val names: List<String>, val times: List<Long>, val nextIndex: Int, val nextName: String, val nextAt: Long,
  val label: String, val hijri: String, val place: String, val dark: Boolean, val style: String,
) {
  companion object {
    const val PREFS = "alif_widget"
    val ORDER = listOf("fajr", "dhuhr", "asr", "maghrib", "isha")
    val GOLD = Color.rgb(232, 176, 74)          // dark theme
    val GOLD_LIGHT = Color.rgb(156, 107, 34)    // light theme

    fun read(context: Context): AlifTimes? {
      val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("data", null) ?: return null
      return try {
        val j = JSONObject(raw)
        val n = j.getJSONObject("names")
        val days = j.getJSONArray("days")
        val now = System.currentTimeMillis()
        val todayKey = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(now))
        var today: JSONObject? = null
        var nextAt = 0L; var nextName = ""; var nextIndex = -1
        for (i in 0 until days.length()) {
          val d = days.getJSONObject(i)
          if (d.getString("date") == todayKey) today = d
          if (nextAt == 0L) for ((k, key) in ORDER.withIndex()) {
            val t = d.getJSONObject("times").optLong(key, 0L)
            if (t > now) { nextAt = t; nextName = n.optString(key, key); if (d.getString("date") == todayKey) nextIndex = k; break }
          }
        }
        AlifTimes(
          ORDER.map { n.optString(it, it) },
          ORDER.map { today?.getJSONObject("times")?.optLong(it, 0L) ?: 0L },
          nextIndex, nextName, nextAt,
          j.optString("labelNext", "Next prayer"), j.optString("hijri"), j.optString("place"),
          j.optBoolean("dark", true), j.optString("style", "full"),
        )
      } catch (e: Exception) { null }
    }

    fun hhmm(t: Long): String = if (t > 0) SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date(t)) else "–"
    fun withAlpha(c: Int, a: Int) = Color.argb(a, Color.red(c), Color.green(c), Color.blue(c))
  }
}
