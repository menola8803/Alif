package se.sncab.alifnative

import android.graphics.Typeface
import android.os.Handler
import android.os.Looper
import android.service.dreams.DreamService
import android.widget.LinearLayout
import android.widget.TextClock
import android.widget.TextView
import android.widget.FrameLayout
import kotlin.random.Random

/**
 * Screen saver (phone settings › Display › Screen saver › Alif): a clock and today's prayer times in the widget's
 * look on black. With Alif's light theme the card is toned down and the screen dimmed, so it does not dazzle at night.
 * The card moves a little every minute so nothing burns into the screen.
 */
class AlifDream : DreamService() {
  private val handler = Handler(Looper.getMainLooper())
  private val tick = object : Runnable {
    override fun run() { fill(); handler.postDelayed(this, 60_000L) }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    isInteractive = false
    isFullscreen = true
    setContentView(R.layout.alif_dream)
  }

  override fun onDreamingStarted() {
    super.onDreamingStarted()
    handler.post(tick)
  }

  override fun onDreamingStopped() {
    handler.removeCallbacks(tick)
    super.onDreamingStopped()
  }

  private fun fill() {
    val d = AlifTimes.read(this)
    val dark = d?.dark ?: true
    isScreenBright = dark            // light theme: the system dims the screen as well
    val gold = if (dark) AlifTimes.GOLD else android.graphics.Color.rgb(201, 162, 102)
    val card = findViewById<LinearLayout>(R.id.alif_dream_card) ?: return
    card.setBackgroundResource(if (dark) R.drawable.alif_dream_bg else R.drawable.alif_dream_bg_light)
    card.alpha = if (dark) 1f else 0.7f
    findViewById<TextClock>(R.id.alif_dream_clock)?.setTextColor(gold)
    findViewById<TextView>(R.id.alif_dream_sub)?.apply {
      setTextColor(AlifTimes.withAlpha(gold, 210))
      // Without saved times (Alif not opened yet, or more than three days ago) the card says so instead of showing empty rows.
      val sv = java.util.Locale.getDefault().language == "sv"
      text = if (d != null && d.times.any { it > 0 }) listOf(d.hijri, d.place).filter { s -> s.isNotEmpty() }.joinToString(" · ")
        else if (sv) "Öppna Alif en gång så visas bönetiderna här" else "Open Alif once and the prayer times appear here"
    }
    val names = intArrayOf(R.id.alif_d_name0, R.id.alif_d_name1, R.id.alif_d_name2, R.id.alif_d_name3, R.id.alif_d_name4)
    val times = intArrayOf(R.id.alif_d_time0, R.id.alif_d_time1, R.id.alif_d_time2, R.id.alif_d_time3, R.id.alif_d_time4)
    for (i in 0 until 5) {
      val next = d != null && i == d.nextIndex
      val c = if (next) gold else AlifTimes.withAlpha(gold, 170)
      for ((id, s) in listOf(names[i] to (d?.names?.get(i) ?: ""), times[i] to (d?.times?.get(i)?.let { AlifTimes.hhmm(it) } ?: ""))) {
        findViewById<TextView>(id)?.apply { text = s; setTextColor(c); setTypeface(null, if (next) Typeface.BOLD else Typeface.NORMAL) }
      }
    }
    // Move the card a little (burn-in protection).
    (card.layoutParams as? FrameLayout.LayoutParams)?.let {
      val dp = resources.displayMetrics.density
      it.leftMargin = (Random.nextInt(-40, 41) * dp).toInt(); it.topMargin = (Random.nextInt(-80, 81) * dp).toInt()
      card.layoutParams = it
    }
  }
}
