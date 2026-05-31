import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useMap } from '../hooks/useMap';
import { LeafletWebView } from '../components/LeafletView';
import { MapPickerView } from '../components/MapPickerView';

const C = { primary: '#b3006a', background: '#f9f9ff', surface: '#ffffff' };

function formatDistance(km: number | null): string {
  if (km === null) return '';
  if (km < 1) return `📍 a ${Math.round(km * 1000)} m`;
  return `📍 a ${km.toFixed(1)} km`;
}

interface MapScreenProps {
  targetSellerId?: string;
}

export function MapScreen({ targetSellerId }: MapScreenProps = {}) {
  const user = useAuthStore(s => s.user);
  const [gpsLoc, setGpsLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const { locations, userLocation, updateLocation, isUpdating, isLoading } = useMap(user?.id, gpsLoc);

  const activeLocation = userLocation ?? gpsLoc;

  const targetLocation = targetSellerId
    ? locations.find(l => l.id === targetSellerId) ?? null
    : null;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setGpsLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {}
    })();
  }, []);

  const handleGpsLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se puede obtener la ubicación sin permiso.');
      return;
    }
    setGpsLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setGpsLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (user) {
        await updateLocation({ userId: user.id, latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        Alert.alert('Guardado', 'Ubicación actualizada correctamente');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo obtener la ubicación');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleMapSelect = async (lat: number, lng: number) => {
    setShowMapPicker(false);
    setGpsLoc({ latitude: lat, longitude: lng });
    if (user) {
      try {
        await updateLocation({ userId: user.id, latitude: lat, longitude: lng });
        Alert.alert('Guardado', 'Ubicación actualizada correctamente');
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'No se pudo guardar');
      }
    }
  };

  if (isLoading && !gpsLoc) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {targetLocation ? (
        <View style={styles.targetBanner}>
          <Text style={styles.targetBannerTitle}>📍 {targetLocation.username}</Text>
          <Text style={styles.targetBannerSub}>
            {targetLocation.mascotasAsociadas?.length ?? 0} mascotas en adopción
          </Text>
        </View>
      ) : (
        <Text style={styles.title}>Refugios y Ubicaciones</Text>
      )}

      {user?.role === 'refugio' && !userLocation && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ No has configurado tu ubicación. Los clientes no podrán encontrarte en el mapa.
          </Text>
        </View>
      )}

      <View style={styles.refugioControls}>
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={handleGpsLocation}
          disabled={gpsLoading || isUpdating}
          activeOpacity={0.85}
        >
          {gpsLoading || isUpdating
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.gpsBtnText}>📍 Usar mi ubicación actual</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => setShowMapPicker(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.mapBtnText}>🗺️ Elegir en el mapa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrapper}>
        <LeafletWebView
          locations={locations}
          userLocation={activeLocation ? { id: user?.id ?? '', latitude: activeLocation.latitude, longitude: activeLocation.longitude } : undefined}
          targetLocation={targetLocation ? { lat: targetLocation.latitude, lng: targetLocation.longitude } : undefined}
        />
      </View>

      {activeLocation && (
        <View style={styles.userLocCard}>
          <Text style={styles.userLocTitle}>📍 Mi ubicación</Text>
          <Text style={styles.userLocCoords}>
            {activeLocation.latitude.toFixed(4)}, {activeLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const dist = (item as any).distance;
          return (
            <View style={styles.card}>
              <Text style={styles.sellerName}>🏡 {item.username}</Text>
              <Text style={styles.coords}>Ubicación: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>

              {dist !== undefined && dist !== null && (
                <Text style={styles.distance}>
                  {formatDistance(dist)}
                </Text>
              )}

              {!dist && (
                <Text style={styles.noDistHint}>
                  ⚠️ Activa tu ubicación para ver la distancia
                </Text>
              )}

              {item.mascotasAsociadas && item.mascotasAsociadas.length > 0 && (
                <View style={styles.petContainer}>
                  <Text style={styles.petTitle}>Mascotas en adopción aquí:</Text>
                  {item.mascotasAsociadas.map((mascota) => (
                    <Text key={mascota.id} style={styles.petItem}>
                      🐾 {mascota.name} ({mascota.especie})
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />

      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowMapPicker(false)} style={styles.modalBack}>
            <Text style={styles.modalBackText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Selecciona tu ubicación</Text>
          <View style={{ width: 70 }} />
        </View>
        <MapPickerView
          initialLat={activeLocation?.latitude ?? -0.2105}
          initialLng={activeLocation?.longitude ?? -78.4891}
          onLocationSelect={handleMapSelect}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: C.primary, marginBottom: 15 },
  targetBanner: {
    backgroundColor: '#f3e8ff', borderRadius: 10, padding: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#d4b0ff',
  },
  targetBannerTitle: { fontSize: 16, fontWeight: '700', color: '#6a1b9a' },
  targetBannerSub: { fontSize: 13, color: '#8e24aa', marginTop: 2 },
  warningBanner: {
    backgroundColor: '#fff3cd', borderRadius: 10, padding: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#ffc107',
  },
  warningText: { fontSize: 13, color: '#856404', fontWeight: '500' },
  refugioControls: {
    flexDirection: 'row', gap: 12, marginBottom: 12,
  },
  gpsBtn: {
    flex: 1, backgroundColor: '#2c7a4a', borderRadius: 12, padding: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  gpsBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  mapBtn: {
    flex: 1, backgroundColor: C.primary, borderRadius: 12, padding: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  mapBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  mapWrapper: { height: 220, width: '100%', borderRadius: 14, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#e3bdc8' },
  userLocCard: {
    backgroundColor: '#e8f4fd', borderRadius: 10, padding: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#90caf9',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  userLocTitle: { fontSize: 14, fontWeight: '600', color: '#1565c0' },
  userLocCoords: { fontSize: 12, color: '#1565c0' },
  card: { backgroundColor: C.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e3bdc8' },
  sellerName: { fontSize: 16, fontWeight: '700', color: '#151c27' },
  coords: { fontSize: 12, color: '#5b3f49', marginVertical: 4 },
  distance: { fontSize: 13, fontWeight: '600', color: '#2c7a4a', marginVertical: 2 },
  noDistHint: { fontSize: 12, color: '#999', fontStyle: 'italic', marginVertical: 2 },
  petContainer: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  petTitle: { fontSize: 13, fontWeight: '600', color: C.primary },
  petItem: { fontSize: 13, color: '#151c27', marginLeft: 6, marginTop: 2 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e3bdc8',
  },
  modalBack: { padding: 8 },
  modalBackText: { fontSize: 16, color: C.primary, fontWeight: '600' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#151c27' },
});
