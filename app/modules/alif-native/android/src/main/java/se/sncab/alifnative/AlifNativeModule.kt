package se.sncab.alifnative

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import java.io.File
import java.io.FileOutputStream
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager
import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.TranslateRemoteModel
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions
import com.googlecode.tesseract.android.TessBaseAPI
import expo.modules.kotlin.Promise
import android.app.Activity
import android.media.RingtoneManager
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Free translation and text recognition that run on the phone:
//  - translate: Google ML Kit (Arabic <-> Swedish/English), works offline once the language models are downloaded
//  - ocr: Tesseract with the Arabic trained data that the app downloads into <dataPath>/tessdata
class AlifNativeModule : Module() {
  private val main = Handler(Looper.getMainLooper())
  private var recognizer: SpeechRecognizer? = null
  private val ctx: Context get() = appContext.reactContext ?: throw Exception("No context")
  private var soundPick: Promise? = null
  private val PICK_SOUND = 7311

  override fun definition() = ModuleDefinition {
    Name("AlifNative")
    Events("onSpeech", "onVolumeKey")

    OnCreate { AlifKeys.listener = { dir -> sendEvent("onVolumeKey", mapOf("dir" to dir)) } }
    OnDestroy {
      AlifKeys.capture = false
      AlifKeys.listener = null
      main.post { stopRecognizer() }
      AlifSound.stop()
    }

    // ---- Night clock: keep the screen on and set its brightness (-1 = the phone's own) ----
    Function("screenAwake") { on: Boolean, brightness: Double ->
      main.post {
        val w = appContext.currentActivity?.window ?: return@post
        if (on) w.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) else w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val a = w.attributes
        a.screenBrightness = if (on && brightness >= 0) brightness.toFloat() else android.view.WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE
        w.attributes = a
      }
    }

    // ---- Sounds for the prayer notifications (adhan, phone sounds, own files) ----
    Function("setPrayerChannels") { channels: List<Map<String, Any?>> -> AlifSound.setChannels(ctx, channels) }
    Function("previewSound") { sound: String -> main.post { AlifSound.preview(ctx, sound) } }
    Function("stopSound") { main.post { AlifSound.stop() } }
    AsyncFunction("importSound") { path: String, title: String -> AlifSound.import(ctx, path, title) }
    AsyncFunction("pickPhoneSound") { current: String?, title: String, promise: Promise ->
      val act = appContext.currentActivity
      if (act == null) { promise.resolve(null); return@AsyncFunction }
      soundPick?.resolve(null)
      soundPick = promise
      val i = Intent(RingtoneManager.ACTION_RINGTONE_PICKER)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALL)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, title)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, false)
      if (current != null && current.startsWith("content://")) i.putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, Uri.parse(current))
      act.startActivityForResult(i, PICK_SOUND)
    }.runOnQueue(Queues.MAIN)
    OnActivityResult { _, payload ->
      if (payload.requestCode != PICK_SOUND) return@OnActivityResult
      val p = soundPick ?: return@OnActivityResult
      soundPick = null
      @Suppress("DEPRECATION")
      val u: Uri? = if (payload.resultCode == Activity.RESULT_OK) payload.data?.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI) else null
      if (u == null) { p.resolve(null); return@OnActivityResult }
      val name = try { RingtoneManager.getRingtone(ctx, u)?.getTitle(ctx) ?: "" } catch (e: Exception) { "" }
      p.resolve(mapOf("uri" to u.toString(), "title" to name))
    }

    // ---- Map (osmdroid) ----
    View(AlifMapView::class) {
      Events("onMarkerPress", "onMapLongPress")
      Prop("pins") { view: AlifMapView, pins: List<MosquePin> -> view.setPins(pins) }
      Prop("selected") { view: AlifMapView, i: Int -> view.setSelected(i) }
      Prop("center") { view: AlifMapView, c: List<Double> -> view.setCenter(c) }
      Prop("showMe") { view: AlifMapView, on: Boolean -> view.setShowMe(on) }
    }

    // ---- Volume buttons as dhikr counter ----
    Function("captureVolumeKeys") { on: Boolean -> AlifKeys.capture = on }

    // ---- Home screen widget ----
    Function("setWidgetData") { json: String ->
      ctx.getSharedPreferences(AlifWidget.PREFS, Context.MODE_PRIVATE).edit().putString("data", json).apply()
      AlifWidget.refresh(ctx)
    }

    // ---- Listening (speech to text). Only started from the Listen screen; the microphone is closed by stopListening,
    // by an error or end of speech, and when the module is destroyed. With onlyOnPhone the on-device recogniser is used
    // (Android 12+ with the Arabic offline language pack); then nothing is sent to Google. ----
    AsyncFunction("speechInfo") {
      val c = ctx
      mapOf(
        "available" to SpeechRecognizer.isRecognitionAvailable(c),
        "onDevice" to (Build.VERSION.SDK_INT >= 31 && SpeechRecognizer.isOnDeviceRecognitionAvailable(c)),
      )
    }
    Function("startListening") { lang: String, onlyOnPhone: Boolean -> main.post { startRecognizer(lang, onlyOnPhone) } }
    Function("stopListening") { main.post { stopRecognizer() } }

    AsyncFunction("translate") { text: String, from: String, to: String, allowDownload: Boolean, promise: Promise ->
      val src = TranslateLanguage.fromLanguageTag(from)
      val dst = TranslateLanguage.fromLanguageTag(to)
      if (src == null || dst == null) {
        promise.reject("ERR_LANGUAGE", "Language not supported: $from -> $to", null)
        return@AsyncFunction
      }
      val translator = Translation.getClient(TranslatorOptions.Builder().setSourceLanguage(src).setTargetLanguage(dst).build())
      val run = {
        translator.translate(text)
          .addOnSuccessListener { promise.resolve(it); translator.close() }
          .addOnFailureListener { promise.reject("ERR_TRANSLATE", it.message ?: "translation failed", it); translator.close() }
      }
      if (allowDownload) {
        translator.downloadModelIfNeeded(DownloadConditions.Builder().build())
          .addOnSuccessListener { run() }
          .addOnFailureListener { promise.reject("ERR_MODEL", it.message ?: "model download failed", it); translator.close() }
      } else {
        run()
      }
    }

    // Language codes whose ML Kit model is on the phone.
    AsyncFunction("downloadedModels") { promise: Promise ->
      RemoteModelManager.getInstance().getDownloadedModels(TranslateRemoteModel::class.java)
        .addOnSuccessListener { models -> promise.resolve(models.map { it.language }) }
        .addOnFailureListener { promise.reject("ERR_MODELS", it.message ?: "could not list models", it) }
    }

    AsyncFunction("ocr") { imageUri: String, dataPath: String, lang: String ->
      val path = if (imageUri.startsWith("file:")) Uri.parse(imageUri).path ?: imageUri else imageUri
      val src = BitmapFactory.decodeFile(path) ?: throw Exception("Cannot read the image")
      val bmp = binarize(src)
      if (bmp !== src) src.recycle()
      val tess = TessBaseAPI()
      try {
        if (!tess.init(dataPath, lang)) throw Exception("Tesseract could not start (missing $lang.traineddata?)")
        tess.setImage(bmp)
        tess.getUTF8Text() ?: ""
      } finally {
        tess.recycle()
        bmp.recycle()
      }
    }

    // Draws the first pages of a PDF as pictures (white background, 1600 px wide) into outDir, for text recognition.
    AsyncFunction("pdfPages") { pdfUri: String, outDir: String, maxPages: Int ->
      val path = if (pdfUri.startsWith("file:")) Uri.parse(pdfUri).path ?: pdfUri else pdfUri
      val dir = File(if (outDir.startsWith("file:")) Uri.parse(outDir).path ?: outDir else outDir)
      dir.mkdirs()
      val fd = ParcelFileDescriptor.open(File(path), ParcelFileDescriptor.MODE_READ_ONLY)
      val out = ArrayList<String>()
      try {
        val renderer = PdfRenderer(fd)
        try {
          val count = minOf(renderer.pageCount, maxPages)
          for (i in 0 until count) {
            val page = renderer.openPage(i)
            val w = 1600
            val h = maxOf(1, (page.height.toLong() * w / maxOf(1, page.width)).toInt())
            val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
            bmp.eraseColor(Color.WHITE)
            page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            page.close()
            val f = File(dir, "page-" + i + ".png")
            FileOutputStream(f).use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
            bmp.recycle()
            out.add("file://" + f.absolutePath)
          }
        } finally {
          renderer.close()
        }
      } finally {
        fd.close()
      }
      out
    }
  }

  // Grey scale and black/white with Otsu's threshold, so paper texture, shadows and colour do not become "letters".
  // Light text on a dark background is turned around (Tesseract expects dark text on light).
  private fun binarize(src: Bitmap): Bitmap {
    val w = src.width
    val h = src.height
    val px = IntArray(w * h)
    src.getPixels(px, 0, w, 0, 0, w, h)
    val hist = IntArray(256)
    val grey = IntArray(px.size)
    for (i in px.indices) {
      val c = px[i]
      val g = (((c shr 16) and 0xFF) * 299 + ((c shr 8) and 0xFF) * 587 + (c and 0xFF) * 114) / 1000
      grey[i] = g
      hist[g]++
    }
    val total = px.size
    var sum = 0.0
    for (t in 0..255) sum += t * hist[t].toDouble()
    var sumB = 0.0
    var wB = 0
    var best = 0.0
    var threshold = 128
    for (t in 0..255) {
      wB += hist[t]
      if (wB == 0) continue
      val wF = total - wB
      if (wF == 0) break
      sumB += t * hist[t].toDouble()
      val mB = sumB / wB
      val mF = (sum - sumB) / wF
      val between = wB.toDouble() * wF.toDouble() * (mB - mF) * (mB - mF)
      if (between > best) { best = between; threshold = t }
    }
    var dark = 0
    for (g in grey) if (g <= threshold) dark++
    val invert = dark > total / 2
    for (i in grey.indices) {
      val ink = if (invert) grey[i] > threshold else grey[i] <= threshold
      px[i] = if (ink) 0xFF000000.toInt() else 0xFFFFFFFF.toInt()
    }
    val out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
    out.setPixels(px, 0, w, 0, 0, w, h)
    return out
  }

  private fun emit(type: String, text: String = "", error: Int = 0) {
    sendEvent("onSpeech", mapOf("type" to type, "text" to text, "error" to error))
  }

  private fun startRecognizer(lang: String, onlyOnPhone: Boolean) {
    stopRecognizer()
    val c = try { ctx } catch (e: Exception) { emit("error", error = -1); return }
    val r = if (onlyOnPhone) {
      if (Build.VERSION.SDK_INT >= 31 && SpeechRecognizer.isOnDeviceRecognitionAvailable(c)) SpeechRecognizer.createOnDeviceSpeechRecognizer(c)
      else { emit("error", error = -2); return }
    } else {
      if (!SpeechRecognizer.isRecognitionAvailable(c)) { emit("error", error = -3); return }
      SpeechRecognizer.createSpeechRecognizer(c)
    }
    recognizer = r
    r.setRecognitionListener(object : RecognitionListener {
      override fun onReadyForSpeech(params: Bundle?) { emit("ready") }
      override fun onBeginningOfSpeech() {}
      override fun onRmsChanged(rmsdB: Float) {}
      override fun onBufferReceived(buffer: ByteArray?) {}
      override fun onEndOfSpeech() { emit("speechEnd") }
      override fun onError(error: Int) { emit("error", error = error); stopRecognizer() }
      override fun onResults(results: Bundle?) {
        emit("final", results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: "")
        stopRecognizer()
      }
      override fun onPartialResults(partialResults: Bundle?) {
        val t = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: ""
        if (t.isNotEmpty()) emit("partial", t)
      }
      override fun onEvent(eventType: Int, params: Bundle?) {}
    })
    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
      putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
      putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
      putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
      if (onlyOnPhone) putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
    }
    r.startListening(intent)
  }

  private fun stopRecognizer() {
    val r = recognizer ?: return
    recognizer = null
    try { r.stopListening() } catch (_: Exception) {}
    try { r.cancel() } catch (_: Exception) {}
    try { r.destroy() } catch (_: Exception) {}
    emit("closed")
  }
}
