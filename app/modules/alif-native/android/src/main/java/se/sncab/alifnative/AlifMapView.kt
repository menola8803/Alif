package se.sncab.alifnative

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.drawable.BitmapDrawable
import android.view.ViewGroup
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay
import java.io.File

class MosquePin : Record {
  @Field val lat: Double = 0.0
  @Field val lng: Double = 0.0
  @Field val title: String = ""
}

/**
 * OpenStreetMap map (osmdroid, as in the Trace app) with a small mosque icon for each place. Tapping an icon sends
 * onMarkerPress with its index; the details are shown by the app. "Me" (the blue dot) is only shown when the app
 * passes showMe = true, which it does only when the person has turned location on.
 */
class AlifMapView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onMarkerPress by EventDispatcher<Map<String, Any>>()
  private val map: MapView
  private var me: MyLocationNewOverlay? = null
  private var lastCenter: List<Double>? = null
  private var pins: List<MosquePin> = emptyList()
  private var selected = -1

  init {
    Configuration.getInstance().apply {
      userAgentValue = context.packageName
      osmdroidBasePath = File(context.cacheDir, "osmdroid")
      osmdroidTileCache = File(context.cacheDir, "osmdroid/tiles")
    }
    map = MapView(context).apply {
      setTileSource(TileSourceFactory.MAPNIK)
      setTilesScaledToDpi(true)
      setMultiTouchControls(true)
      zoomController.setVisibility(CustomZoomButtonsController.Visibility.NEVER)
      minZoomLevel = 4.0
      maxZoomLevel = 19.0
      controller.setZoom(5.0)
      controller.setCenter(GeoPoint(62.0, 16.0))
    }
    addView(map, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    map.layout(0, 0, r - l, b - t)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    map.onResume()
    me?.enableMyLocation()
  }

  override fun onDetachedFromWindow() {
    me?.disableMyLocation()
    map.onPause()
    super.onDetachedFromWindow()
  }

  fun setPins(list: List<MosquePin>) {
    pins = list
    draw()
  }

  fun setSelected(i: Int) {
    if (i == selected) return
    selected = i
    draw()
  }

  /** [lat, lng, zoom, n]: moves the map when n changes (so the map is not pulled back while the person moves it). */
  fun setCenter(c: List<Double>) {
    if (c.size < 3 || c == lastCenter) return
    lastCenter = c
    map.controller.setZoom(c[2])
    map.controller.animateTo(GeoPoint(c[0], c[1]))
  }

  fun setShowMe(on: Boolean) {
    if (on && me == null) {
      me = MyLocationNewOverlay(GpsMyLocationProvider(context), map).also {
        it.enableMyLocation()
        map.overlays.add(it)
      }
    } else if (!on && me != null) {
      me?.disableMyLocation()
      map.overlays.remove(me)
      me = null
    }
    map.invalidate()
  }

  private fun draw() {
    map.overlays.removeAll { it is Marker }
    val normal = icon(false)
    val big = icon(true)
    pins.forEachIndexed { i, p ->
      val m = Marker(map)
      m.position = GeoPoint(p.lat, p.lng)
      m.icon = BitmapDrawable(resources, if (i == selected) big else normal)
      m.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
      m.title = p.title
      m.setInfoWindow(null)
      m.setOnMarkerClickListener { _, _ ->
        onMarkerPress(mapOf("index" to i))
        true
      }
      map.overlays.add(m)
    }
    me?.let { map.overlays.remove(it); map.overlays.add(it) }
    map.invalidate()
  }

  // A round dark badge with a gold ring and a small dome with a crescent.
  private fun icon(big: Boolean): Bitmap {
    val d = resources.displayMetrics.density
    val size = ((if (big) 40f else 28f) * d).toInt()
    val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val c = Canvas(bmp)
    val r = size / 2f
    val gold = Color.rgb(232, 176, 74)
    val p = Paint(Paint.ANTI_ALIAS_FLAG)
    p.color = Color.argb(80, 232, 176, 74)
    c.drawCircle(r, r, r, p)
    p.color = Color.argb(245, 23, 38, 41)
    c.drawCircle(r, r, r * 0.74f, p)
    p.style = Paint.Style.STROKE
    p.strokeWidth = 1.8f * d
    p.color = gold
    c.drawCircle(r, r, r * 0.74f, p)
    // dome
    p.style = Paint.Style.FILL
    val w = r * 0.62f
    val base = r + r * 0.30f
    val dome = Path()
    dome.moveTo(r - w, base)
    dome.lineTo(r - w, base - r * 0.10f)
    dome.arcTo(RectF(r - w, base - r * 0.10f - w * 1.2f, r + w, base - r * 0.10f + w * 0.8f), 180f, 180f)
    dome.lineTo(r + w, base)
    dome.close()
    c.drawPath(dome, p)
    // crescent on top
    val cy = base - r * 0.10f - w * 1.2f + w * 0.2f
    c.drawCircle(r, cy - r * 0.08f, r * 0.12f, p)
    p.color = Color.argb(255, 23, 38, 41)
    c.drawCircle(r + r * 0.05f, cy - r * 0.11f, r * 0.10f, p)
    return bmp
  }
}
