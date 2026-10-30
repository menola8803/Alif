package se.sncab.alifnative

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
      val bmp = BitmapFactory.decodeFile(path) ?: throw Exception("Cannot read the image")
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
}
