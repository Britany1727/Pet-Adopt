import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface MapPickerViewProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export function MapPickerView({
  initialLat = -0.2105,
  initialLng = -78.4891,
  onLocationSelect,
}: MapPickerViewProps) {
  const webViewRef = useRef<WebView>(null);
  const markerPlaced = useRef(false);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location-selected') {
        onLocationSelect(data.latitude, data.longitude);
      }
    } catch {}
  }, [onLocationSelect]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        .crosshair {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          font-size: 28px;
          pointer-events: none;
          text-shadow: 0 0 4px rgba(0,0,0,0.5);
          opacity: 0.7;
        }
        .confirm-btn {
          position: fixed; bottom: 24px; left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: #b3006a; color: #fff;
          border: none; border-radius: 24px;
          padding: 14px 36px; font-size: 16px; font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        .coords-info {
          position: fixed; top: 12px; left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: rgba(0,0,0,0.7); color: #fff;
          padding: 8px 16px; border-radius: 20px;
          font-size: 13px; font-family: monospace;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="crosshair">📍</div>
      <div class="coords-info" id="coords">${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}</div>
      <button class="confirm-btn" id="confirmBtn" onclick="confirmLocation()">✓ Confirmar ubicación</button>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${initialLat}, ${initialLng}], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        var marker = L.marker([${initialLat}, ${initialLng}], { draggable: true }).addTo(map);

        var currentLat = ${initialLat};
        var currentLng = ${initialLng};

        function updateCoords(lat, lng) {
          currentLat = lat;
          currentLng = lng;
          marker.setLatLng([lat, lng]);
          document.getElementById('coords').textContent = lat.toFixed(4) + ', ' + lng.toFixed(4);
        }

        map.on('click', function(e) {
          updateCoords(e.latlng.lat, e.latlng.lng);
        });

        marker.on('dragend', function(e) {
          var pos = marker.getLatLng();
          updateCoords(pos.lat, pos.lng);
        });

        function confirmLocation() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'location-selected',
              latitude: currentLat,
              longitude: currentLng
            }));
          }
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleMessage}
        renderLoading={() => <ActivityIndicator size="large" color="#b3006a" style={styles.loader} />}
        startInLoadingState={true}
        javaScriptEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webView: { flex: 1 },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9ff' }
});
