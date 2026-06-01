import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { CreateMascotasUseCase } from '@features/mascotas/aplication/usecases/CreateMascotasUseCase';
import { SupabaseMascotasRepository } from '@features/mascotas/infrastructure/repositories/SupabaseMacotasRepository';
import { supabase } from '@shared/infrastructure/supabase/client';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const C = {
  primary: '#ac2a5d',
  onPrimary: '#ffffff',
  primaryFixed: '#ffd9e4',
  secondary: '#8a7176',
  background: '#f9f9ff',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#161c28',
  onSurfaceVariant: '#574146',
  outlineVariant: '#e3bdc8',
  outline: '#ddbfc5',
};

const mascotasRepo = new SupabaseMascotasRepository();
const createMascota = new CreateMascotasUseCase(mascotasRepo);

export default function CreateMascotaScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [especie, setEspecie] = useState('');
  const [edad, setEdad] = useState('');
  const [tamaño, setTamaño] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [raza, setRaza] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    Alert.alert('Foto de la mascota', 'Elige una opción', [
      {
        text: 'Cámara',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) { Alert.alert('Permiso denegado'); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
          if (!result.canceled) setImageUri(result.assets[0].uri);
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) { Alert.alert('Permiso denegado'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
          if (!result.canceled) setImageUri(result.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const extMatch = uri.match(/\.(\w+)(?:\?\w+=.*)?$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const fileName = `mascotas/${user!.id}/${Date.now()}.${ext}`;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No hay sesión activa');

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      name: `image.${ext}`,
    } as any);

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/chat-images/${fileName}`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData as any,
      },
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error al subir imagen: ${text}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);
    return publicUrl;
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!name.trim()) { Alert.alert('Error', 'El nombre es requerido'); return; }
    if (!especie.trim()) { Alert.alert('Error', 'La especie es requerida'); return; }
    const edadNum = parseInt(edad, 10);
    if (isNaN(edadNum) || edadNum < 0) { Alert.alert('Error', 'Ingresa una edad válida'); return; }
    if (!tamaño.trim()) { Alert.alert('Error', 'El tamaño es requerido'); return; }
    if (!raza.trim()) { Alert.alert('Error', 'La raza es requerida'); return; }

    setLoading(true);
    try {
      let imageUrl: string | undefined;
      if (imageUri) {
        setUploadingImg(true);
        imageUrl = await uploadImage(imageUri);
      }
      await createMascota.execute(name, especie, edadNum, tamaño, descripcion, raza, user.id, imageUrl);
      queryClient.invalidateQueries({ queryKey: ['mascotas'] });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo crear la mascota');
    } finally {
      setUploadingImg(false);
      setLoading(false);
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
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.headerSection}>
          <LottieView
            source={require('../../src/assets/lotties/pet.json')}
            autoPlay loop
            style={{ width: 90, height: 90, alignSelf: 'center' }}
          />
          <Text style={styles.title}>Nueva mascota</Text>
          <Text style={styles.subtitle}>Completa los datos para encontrar un hogar</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).springify().delay(100)} style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="camera-alt" size={18} color={C.primary} />
            <Text style={styles.cardHeaderText}>FOTO</Text>
          </View>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
            {imageUri
              ? <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              : (
                <View style={styles.imagePlaceholder}>
                  <LottieView
                    source={require('../../src/assets/lotties/Camera Pop-Up (2).json')}
                    autoPlay loop
                    style={{ width: 80, height: 80 }}
                  />
                  <Text style={styles.imagePlaceholderText}>Toca para agregar foto</Text>
                </View>
              )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).springify().delay(200)} style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="pets" size={18} color={C.primary} />
            <Text style={styles.cardHeaderText}>INFORMACIÓN</Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>NOMBRE</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Luna"
                value={name}
                onChangeText={setName}
                placeholderTextColor="rgba(87,65,70,0.4)"
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>EDAD</Text>
              <TextInput
                style={styles.input}
                placeholder="Años"
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
                placeholderTextColor="rgba(87,65,70,0.4)"
              />
            </View>
          </View>

          <Text style={styles.label}>ESPECIE</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Perro, Gato"
            value={especie}
            onChangeText={setEspecie}
            placeholderTextColor="rgba(87,65,70,0.4)"
          />

          <Text style={styles.label}>RAZA</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Labrador, Persa"
            value={raza}
            onChangeText={setRaza}
            placeholderTextColor="rgba(87,65,70,0.4)"
          />

          <Text style={styles.label}>TAMAÑO</Text>
          <View style={styles.chipRow}>
            {['Pequeño', 'Mediano', 'Grande'].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.tamañoChip, tamaño === opt && styles.tamañoChipActive]}
                onPress={() => setTamaño(opt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tamañoChipText, tamaño === opt && styles.tamañoChipTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>DESCRIPCIÓN</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe a la mascota, su personalidad, historial..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={3}
            placeholderTextColor="rgba(87,65,70,0.4)"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).springify().delay(300)} style={styles.submitSection}>
          <TouchableOpacity
            style={styles.publishBtn}
            onPress={handleCreate}
            disabled={loading || uploadingImg}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#ac2a5d', '#c84e6e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientFill}
            >
              {loading || uploadingImg
                ? <ActivityIndicator color="#fff" />
                : (
                  <View style={styles.publishBtnContent}>
                    <MaterialIcons name="pets" size={20} color="#fff" />
                    <Text style={styles.publishBtnText}>Publicar mascota</Text>
                  </View>
                )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: { padding: 20, paddingTop: 12 },
  headerSection: { marginBottom: 20, alignItems: 'center' },
  title: {
    fontSize: 26, fontWeight: '800',
    color: C.onSurface, letterSpacing: -0.5,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14, color: C.onSurfaceVariant,
    marginTop: 2, fontWeight: '500',
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
    marginBottom: 14,
  },
  cardHeaderText: {
    fontSize: 12, fontWeight: '700', color: C.primary,
    letterSpacing: 0.8,
  },
  imagePicker: {
    width: '100%', height: 180,
    borderRadius: 14,
    backgroundColor: 'rgba(249, 249, 255, 0.5)',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: C.outline,
    borderStyle: 'dashed',
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: {
    fontSize: 13, color: C.onSurfaceVariant,
    marginTop: 8, fontWeight: '500',
  },
  fieldRow: { flexDirection: 'row', gap: 12 },
  fieldHalf: { flex: 1 },
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tamañoChip: {
    flex: 1, paddingVertical: 12, borderRadius: 999,
    backgroundColor: 'rgba(249, 249, 255, 0.7)',
    borderWidth: 1, borderColor: C.outline,
    alignItems: 'center',
  },
  tamañoChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  tamañoChipText: { fontSize: 13, fontWeight: '600', color: C.onSurfaceVariant },
  tamañoChipTextActive: { color: '#fff' },
  submitSection: { marginTop: 4 },
  publishBtn: { borderRadius: 16, overflow: 'hidden', height: 54 },
  gradientFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  publishBtnContent: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  publishBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
