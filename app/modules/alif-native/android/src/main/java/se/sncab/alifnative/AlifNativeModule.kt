package se.sncab.alifnative

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager
import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.TranslateRemoteModel
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions
import com.googlecode.tesseract.android.TessBaseAPI
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Free translation and text recognition that run on the phone:
//  - translate: Google ML Kit (Arabic <-> Swedish/English), works offline once the language models are downloaded
//  - ocr: Tesseract with the Arabic trained data that the app downloads into <dataPath>/tessdata
class AlifNativeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AlifNative")

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
}
