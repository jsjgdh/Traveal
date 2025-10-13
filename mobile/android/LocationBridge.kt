package com.traveal.mobile

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONException
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.roundToInt

class LocationBridge(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), LocationListener {

    companion object {
        private const val LOCATION_UPDATE_INTERVAL = 5000L // 5 seconds
        private const val LOCATION_MIN_DISTANCE = 10f // 10 meters
        private const val NOTIFICATION_CHANNEL_ID = "trip_tracking"
        private const val NOTIFICATION_CHANNEL_NAME = "Trip Tracking"
        private const val NOTIFICATION_ID = 1001
    }

    private var locationManager: LocationManager? = null
    private var vibrator: Vibrator? = null
    private var isTrackingTrip = false
    private var currentTripId: String? = null
    private var lastLocationUpdate = System.currentTimeMillis()

    override fun getName(): String = "LocationBridge"

    init {
        setupLocationManager()
        setupVibrator()
        createNotificationChannel()
    }

    private fun setupLocationManager() {
        locationManager = reactContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    private fun setupVibrator() {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = reactContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            reactContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                NOTIFICATION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notifications for trip tracking"
                setShowBadge(false)
            }

            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    @ReactMethod
    fun requestLocationPermission(callback: Callback) {
        val activity = currentActivity
        if (activity == null) {
            callback.invoke("Activity not available", null)
            return
        }

        when {
            ContextCompat.checkSelfPermission(reactContext, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED -> {
                if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(null, "always")
                } else {
                    callback.invoke(null, "when_in_use")
                }
            }
            else -> {
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION,
                        Manifest.permission.ACCESS_BACKGROUND_LOCATION
                    ),
                    1001
                )
                callback.invoke(null, "requesting")
            }
        }
    }

    @ReactMethod
    fun getCurrentLocation(callback: Callback) {
        if (!hasLocationPermission()) {
            callback.invoke("Location permission not granted", null)
            return
        }

        try {
            val locationProvider = LocationManager.GPS_PROVIDER
            if (locationManager?.isProviderEnabled(locationProvider) != true) {
                callback.invoke("GPS not enabled", null)
                return
            }

            locationManager?.requestSingleUpdate(locationProvider, object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    val locationData = createLocationData(location)
                    callback.invoke(null, locationData.toMap())
                }

                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                override fun onProviderEnabled(provider: String) {}
                override fun onProviderDisabled(provider: String) {
                    callback.invoke("GPS disabled", null)
                }
            }, Looper.getMainLooper())

        } catch (e: SecurityException) {
            callback.invoke("Security exception: ${e.message}", null)
        } catch (e: Exception) {
            callback.invoke("Error getting location: ${e.message}", null)
        }
    }

    @ReactMethod
    fun startTripTracking(tripId: String, callback: Callback) {
        if (!hasLocationPermission()) {
            callback.invoke("Location permission required for trip tracking", null)
            return
        }

        try {
            currentTripId = tripId
            isTrackingTrip = true

            locationManager?.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                LOCATION_UPDATE_INTERVAL,
                LOCATION_MIN_DISTANCE,
                this
            )

            // Also request network provider as backup
            if (locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true) {
                locationManager?.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    LOCATION_UPDATE_INTERVAL,
                    LOCATION_MIN_DISTANCE * 2, // Less frequent updates for network
                    this
                )
            }

            playHapticFeedback(HapticType.TRIP_START)
            showTripNotification("Trip Started", "Traveal is now tracking your journey")

            callback.invoke(null, "Trip tracking started")

        } catch (e: SecurityException) {
            callback.invoke("Security exception: ${e.message}", null)
        } catch (e: Exception) {
            callback.invoke("Error starting trip tracking: ${e.message}", null)
        }
    }

    @ReactMethod
    fun stopTripTracking(callback: Callback) {
        try {
            isTrackingTrip = false
            currentTripId = null
            locationManager?.removeUpdates(this)

            playHapticFeedback(HapticType.TRIP_END)
            showTripNotification("Trip Completed", "Your journey has been recorded")

            // Clear the persistent notification
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.cancel(NOTIFICATION_ID)

            callback.invoke(null, "Trip tracking stopped")

        } catch (e: Exception) {
            callback.invoke("Error stopping trip tracking: ${e.message}", null)
        }
    }

    @ReactMethod
    fun getLocationAccuracy(callback: Callback) {
        callback.invoke(null, LOCATION_MIN_DISTANCE.toDouble())
    }

    @ReactMethod
    fun setLocationAccuracy(accuracy: Double, callback: Callback) {
        // Note: Android doesn't allow runtime changes to location accuracy like iOS
        // This is mainly for compatibility with iOS interface
        callback.invoke(null, "Accuracy noted (Android manages accuracy automatically)")
    }

    @ReactMethod
    fun playHaptic(type: String, callback: Callback) {
        val hapticType = when (type.lowercase()) {
            "trip_start" -> HapticType.TRIP_START
            "trip_end" -> HapticType.TRIP_END
            "waypoint" -> HapticType.WAYPOINT
            "validation" -> HapticType.VALIDATION
            "achievement" -> HapticType.ACHIEVEMENT
            "error" -> HapticType.ERROR
            else -> HapticType.WAYPOINT
        }

        playHapticFeedback(hapticType)
        callback.invoke(null, "Haptic played")
    }

    // MARK: - Haptic Feedback
    enum class HapticType {
        TRIP_START, TRIP_END, WAYPOINT, VALIDATION, ACHIEVEMENT, ERROR
    }

    private fun playHapticFeedback(type: HapticType) {
        if (vibrator?.hasVibrator() != true) return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val pattern = createVibrationPattern(type)
                val effect = VibrationEffect.createWaveform(pattern.timings, pattern.amplitudes, -1)
                vibrator?.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                val pattern = createLegacyVibrationPattern(type)
                vibrator?.vibrate(pattern, -1)
            }
        } catch (e: Exception) {
            // Fallback to simple vibration
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(200)
            }
        }
    }

    private data class VibrationPattern(val timings: LongArray, val amplitudes: IntArray)

    private fun createVibrationPattern(type: HapticType): VibrationPattern {
        return when (type) {
            HapticType.TRIP_START -> VibrationPattern(
                longArrayOf(0, 200, 100, 200),
                intArrayOf(0, 200, 0, 200)
            )
            HapticType.TRIP_END -> VibrationPattern(
                longArrayOf(0, 150, 75, 150, 75, 150),
                intArrayOf(0, 150, 0, 150, 0, 150)
            )
            HapticType.WAYPOINT -> VibrationPattern(
                longArrayOf(0, 100),
                intArrayOf(0, 100)
            )
            HapticType.VALIDATION -> VibrationPattern(
                longArrayOf(0, 300),
                intArrayOf(0, 120)
            )
            HapticType.ACHIEVEMENT -> VibrationPattern(
                longArrayOf(0, 100, 50, 100, 50, 100, 50, 100, 50, 100),
                intArrayOf(0, 180, 0, 180, 0, 180, 0, 180, 0, 180)
            )
            HapticType.ERROR -> VibrationPattern(
                longArrayOf(0, 500),
                intArrayOf(0, 255)
            )
        }
    }

    private fun createLegacyVibrationPattern(type: HapticType): LongArray {
        return when (type) {
            HapticType.TRIP_START -> longArrayOf(0, 200, 100, 200)
            HapticType.TRIP_END -> longArrayOf(0, 150, 75, 150, 75, 150)
            HapticType.WAYPOINT -> longArrayOf(0, 100)
            HapticType.VALIDATION -> longArrayOf(0, 300)
            HapticType.ACHIEVEMENT -> longArrayOf(0, 100, 50, 100, 50, 100, 50, 100, 50, 100)
            HapticType.ERROR -> longArrayOf(0, 500)
        }
    }

    // MARK: - Notifications
    private fun showTripNotification(title: String, content: String) {
        val notificationBuilder = NotificationCompat.Builder(reactContext, NOTIFICATION_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_dialog_info) // Replace with your app icon
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(isTrackingTrip)
            .setAutoCancel(!isTrackingTrip)

        val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notificationBuilder.build())
    }

    // MARK: - Location Utilities
    private fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun createLocationData(location: Location): LocationData {
        return LocationData(
            latitude = location.latitude,
            longitude = location.longitude,
            accuracy = location.accuracy.toDouble(),
            altitude = location.altitude,
            speed = if (location.hasSpeed()) location.speed.toDouble() else 0.0,
            timestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).format(Date(location.time)),
            course = if (location.hasBearing()) location.bearing.toDouble() else 0.0
        )
    }

    data class LocationData(
        val latitude: Double,
        val longitude: Double,
        val accuracy: Double,
        val altitude: Double,
        val speed: Double,
        val timestamp: String,
        val course: Double
    ) {
        fun toMap(): WritableMap {
            return Arguments.createMap().apply {
                putDouble("latitude", latitude)
                putDouble("longitude", longitude)
                putDouble("accuracy", accuracy)
                putDouble("altitude", altitude)
                putDouble("speed", speed)
                putString("timestamp", timestamp)
                putDouble("course", course)
            }
        }
    }

    // MARK: - LocationListener Implementation
    override fun onLocationChanged(location: Location) {
        val currentTime = System.currentTimeMillis()
        
        // Rate limiting - don't send updates too frequently
        if (currentTime - lastLocationUpdate < LOCATION_UPDATE_INTERVAL) {
            return
        }

        lastLocationUpdate = currentTime
        val locationData = createLocationData(location)

        if (isTrackingTrip && currentTripId != null) {
            // Send location update to JavaScript
            sendLocationUpdate(currentTripId!!, locationData)

            // Send gentle haptic feedback for waypoints (every 10th update)
            if ((currentTime / 1000) % 10 == 0L) {
                playHapticFeedback(HapticType.WAYPOINT)
            }

            // Update persistent notification
            showTripNotification(
                "Trip in Progress", 
                "Speed: ${(locationData.speed * 3.6).roundToInt()} km/h"
            )
        }
    }

    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
    override fun onProviderEnabled(provider: String) {}
    override fun onProviderDisabled(provider: String) {
        playHapticFeedback(HapticType.ERROR)
    }

    // MARK: - JavaScript Communication
    private fun sendLocationUpdate(tripId: String, location: LocationData) {
        try {
            val params = Arguments.createMap().apply {
                putString("type", "location_update")
                putString("tripId", tripId)
                putMap("location", location.toMap())
            }

            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("LocationUpdate", params)

        } catch (e: Exception) {
            println("Failed to send location update: ${e.message}")
        }
    }
}

// MARK: - React Native Package
class LocationBridgePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(LocationBridge(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext) = emptyList<ViewManager<*, *>>()
}