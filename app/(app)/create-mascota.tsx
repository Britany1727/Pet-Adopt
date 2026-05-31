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
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const C = {
  primary: '#b3006a',
  onPrimary: '#ffffff',
  primaryFixed: '#ffd9e4',
  background: '#f9f9ff',
  surface: '#ffffff',
  onSurface: '#151c27',
  onSurfaceVariant: '#5b3f49',
  outlineVariant: '#e3bdc8',
  outline: '#e3bdc8',
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
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View entering={FadeInDown.duration(400).springify()}>
        <Text style={styles.title}>Nueva mascota</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).springify().delay(100)}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            : (
              <View style={styles.imagePlaceholder}>
                <LottieView
                  source={require('../../src/assets/lotties/Camera Pop-Up (2).json')}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
                <Text style={styles.imagePlaceholderText}>Agregar foto</Text>
              </View>
            )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).springify().delay(200)}>
        <Text style={styles.label}>NOMBRE</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Luna"
          value={name}
          onChangeText={setName}
          placeholderTextColor="rgba(91,63,73,0.5)"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).springify().delay(250)}>
        <Text style={styles.label}>ESPECIE</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Perro, Gato"
          value={especie}
          onChangeText={setEspecie}
          placeholderTextColor="rgba(91,63,73,0.5)"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).springify().delay(300)}>
        <Text style={styles.label}>RAZA</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Labrador, Persa"
          value={raza}
          onChangeText={setRaza}
          placeholderTextColor="rgba(91,63,73,0.5)"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).springify().delay(350)}>
        <Text style={styles.label}>EDAD (años)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 2"
          value={edad}
          onChangeText={setEdad}
          keyboardType="numeric"
          placeholderTextColor="rgba(91,63,73,0.5)"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).springify().delay(400)}>
        <Text style={styles.label}>TAMAÑO</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Pequeño, Mediano, Grande"
          value={tamaño}
          onChangeText={setTamaño}
          placeholderTextColor="rgba(91,63,73,0.5)"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).springify().delay(450)}>
        <Text style={styles.label}>DESCRIPCIÓN</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe a la mascota..."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={3}
          placeholderTextColor="rgba(91,63,73,0.5)"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).springify().delay(500)}>
        <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading || uploadingImg} activeOpacity={0.85}>
          {loading || uploadingImg
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Publicar mascota →</Text>}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, padding: 24,
    backgroundColor: C.background,
  },
  title: {
    fontSize: 26, fontWeight: '700',
    color: C.primary, marginBottom: 20,
    letterSpacing: -0.5,
  },
  imagePicker: {
    width: '100%', height: 180,
    borderRadius: 14, backgroundColor: C.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.outlineVariant,
    borderStyle: 'dashed',
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: {
    justifyContent: 'center', alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 13, color: C.onSurfaceVariant,
    marginTop: 8, fontWeight: '500',
  },
  label: {
    fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant,
    letterSpacing: 0.6, marginBottom: 5,
  },
  input: {
    width: '100%', backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.outline,
    borderRadius: 10, padding: 14,
    fontSize: 14, color: C.onSurface, marginBottom: 12,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  btn: {
    backgroundColor: C.primary, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: C.onPrimary, fontWeight: '700', fontSize: 15 },
});
