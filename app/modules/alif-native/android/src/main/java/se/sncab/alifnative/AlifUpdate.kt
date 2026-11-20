package se.sncab.alifnative

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import java.io.File
import java.security.MessageDigest

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

  /**
   * Checks a downloaded update before Android's installer gets it (as in CamOne): the file matches the published
   * SHA-256 (when there is one), it is Alif, it is newer than the installed version, and it is signed with the same
   * key. Returns "ok", "ok-verified" (checksum matched), "checksum", "package", "older" or "signature".
   */
  fun verify(ctx: Context, path: String, sha256: String?): String {
    val file = File(path.removePrefix("file://"))
    if (!sha256.isNullOrBlank()) {
      val md = MessageDigest.getInstance("SHA-256")
      file.inputStream().use { ins -> val buf = ByteArray(64 * 1024); while (true) { val n = ins.read(buf); if (n < 0) break; md.update(buf, 0, n) } }
      val hex = md.digest().joinToString("") { "%02x".format(it) }
      if (hex != sha256.lowercase()) { file.delete(); return "checksum" }
    }
    val pm = ctx.packageManager
    val archive = archiveInfo(pm, file.path)
    if (archive == null || archive.packageName != ctx.packageName) { file.delete(); return "package" }
    val installed = installedInfo(ctx, pm)
    if (installed != null && versionCode(archive) <= versionCode(installed)) { file.delete(); return "older" }
    if (installed != null && !sameSigner(archive, installed)) return "signature"
    return if (sha256.isNullOrBlank()) "ok" else "ok-verified"
  }

  /** Whether Android lets Alif install apps ("Install unknown apps"). */
  fun canInstall(ctx: Context): Boolean = Build.VERSION.SDK_INT < 26 || ctx.packageManager.canRequestPackageInstalls()

  /** Opens Android's "Install unknown apps" switch for Alif. */
  fun openInstallPermission(ctx: Context) {
    if (Build.VERSION.SDK_INT < 26) return
    try {
      ctx.startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:${ctx.packageName}")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: Exception) {}
  }

  /** Removes the "Alif is updated" notification – Alif is open already. */
  fun clearNotice(ctx: Context) {
    try { (ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(7320) } catch (_: Exception) {}
  }

  @Suppress("DEPRECATION")
  private fun versionCode(p: PackageInfo): Long = if (Build.VERSION.SDK_INT >= 28) p.longVersionCode else p.versionCode.toLong()

  @Suppress("DEPRECATION")
  private fun archiveInfo(pm: PackageManager, path: String): PackageInfo? = try {
    if (Build.VERSION.SDK_INT >= 33) pm.getPackageArchiveInfo(path, PackageManager.PackageInfoFlags.of(PackageManager.GET_SIGNING_CERTIFICATES.toLong()))
    else pm.getPackageArchiveInfo(path, if (Build.VERSION.SDK_INT >= 28) PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES)
  } catch (_: Exception) { null }

  @Suppress("DEPRECATION")
  private fun installedInfo(ctx: Context, pm: PackageManager): PackageInfo? = try {
    if (Build.VERSION.SDK_INT >= 33) pm.getPackageInfo(ctx.packageName, PackageManager.PackageInfoFlags.of(PackageManager.GET_SIGNING_CERTIFICATES.toLong()))
    else pm.getPackageInfo(ctx.packageName, if (Build.VERSION.SDK_INT >= 28) PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES)
  } catch (_: Exception) { null }

  @Suppress("DEPRECATION")
  private fun signerDigests(p: PackageInfo): Set<String>? {
    val sigs = if (Build.VERSION.SDK_INT >= 28) {
      val si = p.signingInfo ?: return null
      if (si.hasMultipleSigners()) si.apkContentsSigners else si.signingCertificateHistory
    } else p.signatures
    if (sigs.isNullOrEmpty()) return null
    return sigs.map { s -> MessageDigest.getInstance("SHA-256").digest(s.toByteArray()).joinToString("") { "%02x".format(it) } }.toSet()
  }

  /** If the key cannot be read from the file, Android's installer decides. */
  private fun sameSigner(a: PackageInfo, b: PackageInfo): Boolean {
    val x = signerDigests(a) ?: return true
    val y = signerDigests(b) ?: return true
    return x.intersect(y).isNotEmpty()
  }
}
