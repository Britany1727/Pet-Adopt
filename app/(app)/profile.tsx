import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { supabase } from '@shared/infrastructure/supabase/client';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { MapPickerView } from '@features/map/presentation/components/MapPickerView';

const C = {
  primary: '#ac2a5d',
  onPrimary: '#ffffff',
  background: '#f9f9ff',
  surface: '#ffffff',
  onSurface: '#161c28',
  onSurfaceVariant: '#574146',
  outline: '#ddbfc5',
};

export default function ProfileScreen() {
  const { user, updateProfile, isUpdatingProfile, logout } = useAuth();
  const router = useRouter();

  const isRefugio = user?.role === 'refugio';

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [shelterName, setShelterName] = useState(user?.username ?? '');
  const [identificacion, setIdentificacion] = useState(user?.identificacion ?? '');
  const [telefono, setTelefono] = useState(user?.telefono ?? '');
  const [ocupacion, setOcupacion] = useState(user?.ocupacion ?? '');
  const [descripcionHogar, setDescripcionHogar] = useState(user?.descripcionHogar ?? '');
  const [direccionTexto, setDireccionTexto] = useState(user?.direccionTexto ?? '');
  const [latitude, setLatitude] = useState(user?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(user?.longitude?.toString() ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl ?? null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const pickImage = () => {
    Alert.alert('Foto de perfil', 'Elige una opción', [
      {
        text: 'Cámara',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) { Alert.alert('Permiso denegado'); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
          if (!result.canceled) setAvatarUri(result.assets[0].uri);
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) { Alert.alert('Permiso denegado'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
          if (!result.canceled) setAvatarUri(result.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const uploadAvatar = async (uri: string): Promise<string> => {
    const extMatch = uri.match(/\.(\w+)(?:\?\w+=.*)?$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const fileName = `avatars/${user!.id}/${Date.now()}.${ext}`;

    const result = await fetch(uri);
    const blob = await result.blob();

    const { error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, blob, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);
    return publicUrl;
  };

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

    setUploadingImg(true);
    try {
      let avatarUrl = user.avatarUrl;
      if (avatarUri && avatarUri !== user.avatarUrl) {
        avatarUrl = await uploadAvatar(avatarUri);
      }

      await updateProfile({
        data: {
          username: isRefugio ? (shelterName.trim() || undefined) : undefined,
          fullName: isRefugio ? undefined : (fullName.trim() || undefined),
          identificacion: identificacion.trim() || undefined,
          telefono: telefono.trim() || undefined,
          ocupacion: isRefugio ? undefined : (ocupacion.trim() || undefined),
          descripcionHogar: isRefugio ? undefined : (descripcionHogar.trim() || undefined),
          direccionTexto: direccionTexto.trim() || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          avatarUrl,
        },
      });

      Alert.alert('Guardado', 'Perfil actualizado correctamente');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar');
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.ambientContainer} pointerEvents="none">
        <View style={[styles.ambientGlow, { top: -80, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.ambientGlow, { bottom: -60, right: -40, width: 180, height: 180 }]} />
        <LottieView
          source={require('../../src/assets/lotties/huellas.json')}
          autoPlay loop
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.06 }}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.85}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <LottieView
                source={require('../../src/assets/lotties/user.json')}
                autoPlay loop
                style={{ width: 80, height: 80 }}
              />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <MaterialIcons name="camera-alt" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {isRefugio ? (
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="home" size={18} color={C.primary} />
              <Text style={styles.cardHeaderText}>DATOS DEL REFUGIO</Text>
            </View>

            <Text style={styles.label}>NOMBRE DEL REFUGIO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Happy Tails Shelter"
              value={shelterName}
              onChangeText={setShelterName}
              placeholderTextColor="rgba(87,65,70,0.4)"
            />

            <Text style={styles.label}>IDENTIFICACIÓN (RUC)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 1234567890001"
              value={identificacion}
              onChangeText={setIdentificacion}
              placeholderTextColor="rgba(87,65,70,0.4)"
            />

            <Text style={styles.label}>TELÉFONO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 0991234567"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              placeholderTextColor="rgba(87,65,70,0.4)"
            />

            <Text style={styles.label}>CORREO</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{user?.email}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="person" size={18} color={C.primary} />
              <Text style={styles.cardHeaderText}>DATOS PERSONALES</Text>
            </View>

            <Text style={styles.label}>NOMBRE COMPLETO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="rgba(87,65,70,0.4)"
            />

            <Text style={styles.label}>CÉDULA / IDENTIFICACIÓN</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 1234567890"
              value={identificacion}
              onChangeText={setIdentificacion}
              placeholderTextColor="rgba(87,65,70,0.4)"
            />

            <Text style={styles.label}>OCUPACIÓN / PROFESIÓN</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Ingeniero, Estudiante..."
              value={ocupacion}
              onChangeText={setOcupacion}
              placeholderTextColor="rgba(87,65,70,0.4)"
            />

            <Text style={styles.label}>TELÉFONO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 0991234567"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              placeholderTextColor="rgba(87,65,70,0.4)"
            />

            <Text style={styles.label}>CORREO</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{user?.email}</Text>
            </View>

            <Text style={styles.label}>DESCRIPCIÓN DEL HOGAR</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu hogar, espacio disponible, patio..."
              value={descripcionHogar}
              onChangeText={setDescripcionHogar}
              multiline
              numberOfLines={3}
              placeholderTextColor="rgba(87,65,70,0.4)"
            />
          </View>
        )}

        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="location-on" size={18} color={C.primary} />
            <Text style={styles.cardHeaderText}>DIRECCIÓN Y UBICACIÓN</Text>
          </View>

          <Text style={styles.label}>DIRECCIÓN</Text>
          <TextInput
            style={styles.input}
            placeholder={isRefugio ? 'Ej. Av. Principal 123' : 'Ej. Calle 123, Casa #45'}
            value={direccionTexto}
            onChangeText={setDireccionTexto}
            placeholderTextColor="rgba(87,65,70,0.4)"
          />

          <TouchableOpacity
            style={styles.mapPickerBtn}
            onPress={() => setShowMapPicker(true)}
            activeOpacity={0.85}
          >
            <MaterialIcons name="map" size={18} color="#fff" />
            <Text style={styles.mapPickerBtnText}>Seleccionar en el mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gpsBtn}
            onPress={getCurrentLocation}
            disabled={gpsLoading}
            activeOpacity={0.85}
          >
            {gpsLoading
              ? <ActivityIndicator color="#fff" />
              : (
                <>
                  <MaterialIcons name="gps-fixed" size={18} color="#fff" />
                  <Text style={styles.mapPickerBtnText}>Usar ubicación actual</Text>
                </>
              )}
          </TouchableOpacity>

          <View style={styles.coordRow}>
            <View style={styles.coordField}>
              <Text style={styles.label}>LATITUD</Text>
              <TextInput
                style={styles.input}
                placeholder="-0.2105"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="decimal-pad"
                placeholderTextColor="rgba(87,65,70,0.4)"
              />
            </View>
            <View style={styles.coordField}>
              <Text style={styles.label}>LONGITUD</Text>
              <TextInput
                style={styles.input}
                placeholder="-78.4891"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="decimal-pad"
                placeholderTextColor="rgba(87,65,70,0.4)"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isUpdatingProfile || uploadingImg}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#ac2a5d', '#c84e6e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          >
            {isUpdatingProfile || uploadingImg
              ? <ActivityIndicator color="#fff" />
              : (
                <View style={styles.saveBtnContent}>
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>Guardar perfil</Text>
                </View>
              )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <MaterialIcons name="logout" size={18} color="#ba1a1a" />
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowMapPicker(false)} style={styles.modalBack}>
            <MaterialIcons name="arrow-back" size={24} color={C.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Selecciona tu ubicación</Text>
          <View style={{ width: 40 }} />
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
  root: { flex: 1, backgroundColor: C.background },
  ambientContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  ambientGlow: {
    position: 'absolute', borderRadius: 999,
    backgroundColor: '#ac2a5d', opacity: 0.08,
  },
  scrollContent: { padding: 20, paddingTop: 24 },
  avatarContainer: {
    alignSelf: 'center', width: 100, height: 100,
    borderRadius: 50, marginBottom: 20, position: 'relative',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50, resizeMode: 'cover' },
  avatarPlaceholder: {
    width: '100%', height: '100%', borderRadius: 50,
    backgroundColor: '#ffd9e4', justifyContent: 'center', alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: C.primary, borderRadius: 14,
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 16,
  },
  cardHeaderText: {
    fontSize: 12, fontWeight: '700', color: C.primary,
    letterSpacing: 0.8,
  },
  label: {
    fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant,
    letterSpacing: 0.6, marginBottom: 5, marginTop: 4,
  },
  input: {
    width: '100%', backgroundColor: 'rgba(249, 249, 255, 0.7)',
    borderWidth: 1, borderColor: C.outline,
    borderRadius: 12, padding: 14,
    fontSize: 14, color: C.onSurface, marginBottom: 10,
  },
  inputDisabled: {
    width: '100%', backgroundColor: 'rgba(221, 191, 197, 0.2)',
    borderWidth: 1, borderColor: C.outline,
    borderRadius: 12, padding: 14,
    marginBottom: 10,
  },
  inputDisabledText: { fontSize: 14, color: C.onSurfaceVariant },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  mapPickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.primary, borderRadius: 12, padding: 14,
    marginBottom: 10,
  },
  mapPickerBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2c7a4a', borderRadius: 12, padding: 14,
    marginBottom: 10,
  },
  coordRow: { flexDirection: 'row', gap: 12 },
  coordField: { flex: 1 },
  saveBtn: { borderRadius: 16, overflow: 'hidden', height: 54, marginBottom: 16 },
  gradientFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(186, 26, 26, 0.3)',
  },
  logoutBtnText: { color: '#ba1a1a', fontWeight: '700', fontSize: 15 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: C.outline,
  },
  modalBack: { padding: 8 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface },
});
