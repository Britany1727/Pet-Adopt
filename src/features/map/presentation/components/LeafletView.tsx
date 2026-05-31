import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SellerLocation } from '../../domain/entities/SellerLocation';
import { UserLocation } from '../../domain/entities/UserLocation';

interface LeafletWebViewProps {
  locations: SellerLocation[];
  userLocation?: UserLocation | null;
  targetLocation?: { lat: number; lng: number } | null;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function LeafletWebView({
  locations,
  userLocation,
  targetLocation,
  centerLat = -0.2105,
  centerLng = -78.4891,
  zoom = 12
}: LeafletWebViewProps) {

  const userLat = userLocation?.latitude;
  const userLng = userLocation?.longitude;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        .distance-popup .leaflet-popup-content-wrapper { background: #b3006a; color: #fff; border-radius: 8px; }
        .distance-popup .leaflet-popup-tip { background: #b3006a; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], ${zoom});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        var userIcon = L.divIcon({
          html: '<div style="background:#2563eb;width:24px;height:24px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;">📍</div>',
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        var shelterIcon = L.divIcon({
          html: '<div style="background:#b3006a;width:20px;height:20px;border-radius:4px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;">🏡</div>',
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        var targetIcon = L.divIcon({
          html: '<div style="background:#e65100;width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 12px rgba(230,81,0,0.6);display:flex;align-items:center;justify-content:center;font-size:14px;">🎯</div>',
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        var userLat = ${userLat ?? 'null'};
        var userLng = ${userLng ?? 'null'};
        var targetLat = ${targetLocation?.lat ?? 'null'};
        var targetLng = ${targetLocation?.lng ?? 'null'};

        if (userLat !== null && userLng !== null) {
          L.marker([userLat, userLng], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>📍 Mi ubicación</b>');
        }

        function toRad(deg) { return deg * (Math.PI / 180); }

        function calcDistance(lat1, lng1, lat2, lng2) {
          var R = 6371;
          var dLat = toRad(lat2 - lat1);
          var dLng = toRad(lng2 - lng1);
          var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
                  Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*
                  Math.sin(dLng/2)*Math.sin(dLng/2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        }

        function fmtDist(km) {
          if (km < 1) return Math.round(km*1000) + ' m';
          return km.toFixed(1) + ' km';
        }

        const markersData = ${JSON.stringify(locations)};

        markersData.forEach(function(loc) {
          if (loc.latitude && loc.longitude) {
            var popupText = '<b>🏡 ' + loc.username + '</b><br/>Refugio de Mascotas';
            if (userLat !== null && userLng !== null) {
              var dist = calcDistance(userLat, userLng, loc.latitude, loc.longitude);
              popupText += '<br/><b>Distancia:</b> ' + fmtDist(dist);
            }
            var isTarget = targetLat !== null && Math.abs(loc.latitude - targetLat) < 0.0001 && Math.abs(loc.longitude - targetLng) < 0.0001;
            var icon = isTarget ? targetIcon : shelterIcon;
            L.marker([loc.latitude, loc.longitude], { icon: icon })
              .addTo(map)
              .bindPopup(popupText);
          }
        });

        if (targetLat !== null && targetLng !== null && userLat !== null && userLng !== null) {
          L.polyline([[userLat, userLng], [targetLat, targetLng]], {
            color: '#e65100',
            weight: 2,
            dashArray: '8, 8',
            opacity: 0.7
          }).addTo(map);
          var midLat = (userLat + targetLat) / 2;
          var midLng = (userLng + targetLng) / 2;
          var dist = calcDistance(userLat, userLng, targetLat, targetLng);
          L.marker([midLat, midLng], {
            icon: L.divIcon({
              html: '<div style="background:#fff;border:1px solid #e65100;border-radius:12px;padding:4px 10px;font-size:13px;font-weight:700;color:#e65100;box-shadow:0 2px 6px rgba(0,0,0,0.2);white-space:nowrap;">' + fmtDist(dist) + '</div>',
              className: '',
              iconSize: [0, 0]
            })
          }).addTo(map);
          map.fitBounds([[userLat, userLng], [targetLat, targetLng]], { padding: [50, 50] });
        } else if (userLat !== null && userLng !== null && markersData.length > 0) {
          var allLats = [userLat];
          var allLngs = [userLng];
          markersData.forEach(function(loc) {
            if (loc.latitude && loc.longitude) {
              allLats.push(loc.latitude);
              allLngs.push(loc.longitude);
            }
          });
          var minLat = Math.min.apply(null, allLats);
          var maxLat = Math.max.apply(null, allLats);
          var minLng = Math.min.apply(null, allLngs);
          var maxLng = Math.max.apply(null, allLngs);
          var padding = 0.05;
          map.fitBounds([[minLat - padding, minLng - padding], [maxLat + padding, maxLng + padding]]);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        renderLoading={() => <ActivityIndicator size="large" color="#b3006a" style={styles.loader} />}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webView: { flex: 1 },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9ff' }
});
