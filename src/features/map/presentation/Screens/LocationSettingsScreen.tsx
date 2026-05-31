import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Modal,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useMap } from '../hooks/useMap';
import { useRouter } from 'expo-router';
import { MapPickerView } from '../components/MapPickerView';

const C = {
  primary: '#b3006a', onPrimary: '#ffffff', background: '#f9f9ff',
  surface: '#ffffff', onSurface: '#151c27', onSurfaceVariant: '#5b3f49',
  outlineVariant: '#e3bdc8', outline: '#e3bdc8',
};

export function LocationSettingsScreen() {
  const user = useAuthStore(s => s.user);
  const { userLocation, updateLocation, isUpdating } = useMap(user?.id);
  const router = useRouter();

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (userLocation) {
      setLatitude(userLocation.latitude.toString());
      setLongitude(userLocation.longitude.toString());
    }
  }, [userLocation]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se puede obtener la ubicación sin permiso.');
      return;
    }
    setGpsLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLatitude(loc.coords.latitude.toString());
      setLongitude(loc.coords.longitude.toString());
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo obtener la ubicación');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setShowMapPicker(false);
  };

  const handleSave = async () => {
    if (!user) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Ingresa coordenadas válidas');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Error', 'Coordenadas fuera de rango');
      return;
    }
    try {
      await updateLocation({ userId: user.id, latitude: lat, longitude: lng });
      Alert.alert('Guardado', 'Ubicación actualizada correctamente');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar');
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Configurar ubicación</Text>
        <Text style={styles.subtitle}>
          Ingresa la ubicación de tu refugio para que los clientes puedan encontrarte
        </Text>

        <TouchableOpacity
          style={styles.mapPickerBtn}
          onPress={() => setShowMapPicker(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.mapPickerBtnText}>🗺️ Seleccionar en el mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={getCurrentLocation}
          disabled={gpsLoading}
          activeOpacity={0.85}
        >
          {gpsLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.gpsBtnText}>📍 Usar mi ubicación actual</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O ingrésalas manualmente</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>LATITUD</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. -0.2105"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="decimal-pad"
          placeholderTextColor="rgba(91,63,73,0.5)"
        />

        <Text style={styles.label}>LONGITUD</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. -78.4891"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="decimal-pad"
          placeholderTextColor="rgba(91,63,73,0.5)"
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isUpdating}
          activeOpacity={0.85}
        >
          {isUpdating
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Guardar ubicación →</Text>}
        </TouchableOpacity>
      </ScrollView>

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
          initialLat={parseFloat(latitude) || -0.2105}
          initialLng={parseFloat(longitude) || -78.4891}
          onLocationSelect={handleMapSelect}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: C.background },
  container: { flexGrow: 1, padding: 24 },
  title: { fontSize: 26, fontWeight: '700', color: C.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: C.onSurfaceVariant, marginVertical: 12, lineHeight: 20 },
  mapPickerBtn: {
    backgroundColor: C.primary, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 12,
  },
  mapPickerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  gpsBtn: {
    backgroundColor: '#2c7a4a', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 16,
  },
  gpsBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.outlineVariant },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: C.onSurfaceVariant, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant, letterSpacing: 0.6, marginBottom: 5 },
  input: {
    width: '100%', backgroundColor: C.surface, borderWidth: 1, borderColor: C.outline,
    borderRadius: 10, padding: 14, fontSize: 14, color: C.onSurface, marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: C.onPrimary, fontWeight: '700', fontSize: 15 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: C.outlineVariant,
  },
  modalBack: { padding: 8 },
  modalBackText: { fontSize: 16, color: C.primary, fontWeight: '600' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface },
});
