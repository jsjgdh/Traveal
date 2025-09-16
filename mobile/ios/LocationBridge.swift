import Foundation
import CoreLocation
import CoreHaptics
import UserNotifications
import WebKit

// MARK: - Location Manager Bridge for React Native/Web
@objc(LocationBridge)
class LocationBridge: NSObject, CLLocationManagerDelegate {
    
    private var locationManager: CLLocationManager!
    private var hapticEngine: CHHapticEngine?
    private var isTrackingTrip = false
    private var currentTripId: String?
    private var lastLocationUpdate: Date = Date()
    private let locationUpdateInterval: TimeInterval = 5.0 // 5 seconds
    
    override init() {
        super.init()
        setupLocationManager()
        setupHapticEngine()
    }
    
    // MARK: - Setup Methods
    private func setupLocationManager() {
        locationManager = CLLocationManager()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 10 // Update every 10 meters
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
    }
    
    private func setupHapticEngine() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        
        do {
            hapticEngine = try CHHapticEngine()
            try hapticEngine?.start()
        } catch {
            print("Haptic engine failed to start: \(error)")
        }
    }
    
    // MARK: - JavaScript Interface Methods
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc func requestLocationPermission(_ callback: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            switch self.locationManager.authorizationStatus {
            case .notDetermined:
                self.locationManager.requestWhenInUseAuthorization()
                callback([NSNull(), "requesting"])
            case .denied, .restricted:
                callback(["Permission denied", NSNull()])
            case .authorizedWhenInUse:
                // Request always authorization for trip tracking
                self.locationManager.requestAlwaysAuthorization()
                callback([NSNull(), "when_in_use"])
            case .authorizedAlways:
                callback([NSNull(), "always"])
            @unknown default:
                callback(["Unknown permission state", NSNull()])
            }
        }
    }
    
    @objc func getCurrentLocation(_ callback: @escaping RCTResponseSenderBlock) {
        guard locationManager.authorizationStatus == .authorizedWhenInUse || 
              locationManager.authorizationStatus == .authorizedAlways else {
            callback(["Location permission not granted", NSNull()])
            return
        }
        
        locationManager.requestLocation()
        
        // Store callback for use in delegate method
        self.locationCallback = callback
    }
    
    private var locationCallback: RCTResponseSenderBlock?
    
    @objc func startTripTracking(_ tripId: String, callback: @escaping RCTResponseSenderBlock) {
        guard locationManager.authorizationStatus == .authorizedAlways else {
            callback(["Always location permission required for trip tracking", NSNull()])
            return
        }
        
        currentTripId = tripId
        isTrackingTrip = true
        locationManager.startUpdatingLocation()
        
        // Send haptic feedback for trip start
        playHapticFeedback(type: .tripStart)
        
        // Send local notification
        sendTripNotification(title: "Trip Started", 
                           body: "Traveal is now tracking your journey")
        
        callback([NSNull(), "Trip tracking started"])
    }
    
    @objc func stopTripTracking(_ callback: @escaping RCTResponseSenderBlock) {
        isTrackingTrip = false
        currentTripId = nil
        locationManager.stopUpdatingLocation()
        
        // Send haptic feedback for trip end
        playHapticFeedback(type: .tripEnd)
        
        // Send local notification
        sendTripNotification(title: "Trip Completed", 
                           body: "Your journey has been recorded")
        
        callback([NSNull(), "Trip tracking stopped"])
    }
    
    @objc func getLocationAccuracy(_ callback: @escaping RCTResponseSenderBlock) {
        let accuracy = locationManager.desiredAccuracy
        callback([NSNull(), accuracy])
    }
    
    @objc func setLocationAccuracy(_ accuracy: Double, callback: @escaping RCTResponseSenderBlock) {
        locationManager.desiredAccuracy = accuracy
        callback([NSNull(), "Accuracy updated"])
    }
    
    // MARK: - Haptic Feedback Methods
    enum HapticType {
        case tripStart, tripEnd, waypoint, validation, achievement, error
    }
    
    private func playHapticFeedback(type: HapticType) {
        guard let hapticEngine = hapticEngine else {
            // Fallback to system haptics
            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
            impactFeedback.impactOccurred()
            return
        }
        
        do {
            let pattern = createHapticPattern(for: type)
            let player = try hapticEngine.makePlayer(with: pattern)
            try player.start(atTime: 0)
        } catch {
            print("Haptic feedback failed: \(error)")
        }
    }
    
    private func createHapticPattern(for type: HapticType) -> CHHapticPattern {
        var events: [CHHapticEvent] = []
        
        switch type {
        case .tripStart:
            // Double tap pattern
            events.append(CHHapticEvent(eventType: .hapticTransient, 
                                      parameters: [
                                        CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.8),
                                        CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)
                                      ], 
                                      relativeTime: 0))
            events.append(CHHapticEvent(eventType: .hapticTransient, 
                                      parameters: [
                                        CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.8),
                                        CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)
                                      ], 
                                      relativeTime: 0.2))
            
        case .tripEnd:
            // Triple tap pattern
            for i in 0..<3 {
                events.append(CHHapticEvent(eventType: .hapticTransient, 
                                          parameters: [
                                            CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.6),
                                            CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.3)
                                          ], 
                                          relativeTime: Double(i) * 0.15))
            }
            
        case .waypoint:
            // Single gentle tap
            events.append(CHHapticEvent(eventType: .hapticTransient, 
                                      parameters: [
                                        CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.4),
                                        CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.2)
                                      ], 
                                      relativeTime: 0))
            
        case .validation:
            // Success pattern - rising intensity
            events.append(CHHapticEvent(eventType: .hapticContinuous, 
                                      parameters: [
                                        CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.3),
                                        CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.1)
                                      ], 
                                      relativeTime: 0, 
                                      duration: 0.3))
            
        case .achievement:
            // Celebration pattern
            for i in 0..<5 {
                events.append(CHHapticEvent(eventType: .hapticTransient, 
                                          parameters: [
                                            CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.7),
                                            CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.8)
                                          ], 
                                          relativeTime: Double(i) * 0.1))
            }
            
        case .error:
            // Error pattern - sharp decline
            events.append(CHHapticEvent(eventType: .hapticTransient, 
                                      parameters: [
                                        CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0),
                                        CHHapticEventParameter(parameterID: .hapticSharpness, value: 1.0)
                                      ], 
                                      relativeTime: 0))
        }
        
        do {
            return try CHHapticPattern(events: events, parameters: [])
        } catch {
            print("Failed to create haptic pattern: \(error)")
            // Return empty pattern as fallback
            return try! CHHapticPattern(events: [], parameters: [])
        }
    }
    
    @objc func playHaptic(_ type: String, callback: @escaping RCTResponseSenderBlock) {
        let hapticType: HapticType
        
        switch type.lowercased() {
        case "trip_start": hapticType = .tripStart
        case "trip_end": hapticType = .tripEnd
        case "waypoint": hapticType = .waypoint
        case "validation": hapticType = .validation
        case "achievement": hapticType = .achievement
        case "error": hapticType = .error
        default: hapticType = .waypoint
        }
        
        playHapticFeedback(type: hapticType)
        callback([NSNull(), "Haptic played"])
    }
    
    // MARK: - Notification Methods
    private func sendTripNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, 
                                          content: content, 
                                          trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Notification error: \(error)")
            }
        }
    }
    
    // MARK: - CLLocationManagerDelegate
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        // Rate limiting - don't send updates too frequently
        if Date().timeIntervalSince(lastLocationUpdate) < locationUpdateInterval {
            return
        }
        
        lastLocationUpdate = Date()
        
        let locationData: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "altitude": location.altitude,
            "speed": location.speed >= 0 ? location.speed : 0,
            "timestamp": ISO8601DateFormatter().string(from: location.timestamp),
            "course": location.course >= 0 ? location.course : 0
        ]
        
        if isTrackingTrip, let tripId = currentTripId {
            // Send location update to JavaScript
            sendLocationUpdate(tripId: tripId, location: locationData)
            
            // Send gentle haptic feedback for waypoints (every 10th update)
            if Int(Date().timeIntervalSince1970) % 10 == 0 {
                playHapticFeedback(type: .waypoint)
            }
        }
        
        // Handle single location request callback
        if let callback = locationCallback {
            callback([NSNull(), locationData])
            locationCallback = nil
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location manager failed: \(error)")
        
        if let callback = locationCallback {
            callback([error.localizedDescription, NSNull()])
            locationCallback = nil
        }
        
        playHapticFeedback(type: .error)
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        print("Location authorization changed: \(status.rawValue)")
    }
    
    // MARK: - JavaScript Communication
    private func sendLocationUpdate(tripId: String, location: [String: Any]) {
        // This would typically use React Native's event emitter
        // For web integration, we'll use postMessage to the WebView
        let updateData: [String: Any] = [
            "type": "location_update",
            "tripId": tripId,
            "location": location
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: updateData),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            // Send to WebView JavaScript
            postMessageToWebView(message: jsonString)
        }
    }
    
    private func postMessageToWebView(message: String) {
        DispatchQueue.main.async {
            // Assuming we have a reference to the WKWebView
            if let webView = self.getWebView() {
                webView.evaluateJavaScript("window.postMessage(\(message), '*');") { _, error in
                    if let error = error {
                        print("Failed to post message to WebView: \(error)")
                    }
                }
            }
        }
    }
    
    private func getWebView() -> WKWebView? {
        // This would return the current WKWebView instance
        // Implementation depends on your app structure
        return nil
    }
}

// MARK: - React Native Module Export
@objc(LocationBridgeModule)
class LocationBridgeModule: NSObject {
    private let locationBridge = LocationBridge()
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc func requestLocationPermission(_ callback: @escaping RCTResponseSenderBlock) {
        locationBridge.requestLocationPermission(callback)
    }
    
    @objc func getCurrentLocation(_ callback: @escaping RCTResponseSenderBlock) {
        locationBridge.getCurrentLocation(callback)
    }
    
    @objc func startTripTracking(_ tripId: String, callback: @escaping RCTResponseSenderBlock) {
        locationBridge.startTripTracking(tripId, callback: callback)
    }
    
    @objc func stopTripTracking(_ callback: @escaping RCTResponseSenderBlock) {
        locationBridge.stopTripTracking(callback)
    }
    
    @objc func playHaptic(_ type: String, callback: @escaping RCTResponseSenderBlock) {
        locationBridge.playHaptic(type, callback: callback)
    }
    
    @objc func getLocationAccuracy(_ callback: @escaping RCTResponseSenderBlock) {
        locationBridge.getLocationAccuracy(callback)
    }
    
    @objc func setLocationAccuracy(_ accuracy: Double, callback: @escaping RCTResponseSenderBlock) {
        locationBridge.setLocationAccuracy(accuracy, callback: callback)
    }
}