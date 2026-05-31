import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@shared/infrastructure/supabase/client';

const C = {
  primary: '#b3006a', onPrimary: '#ffffff', background: '#f9f9ff',
  onSurface: '#151c27', onSurfaceVariant: '#5b3f49',
  outlineVariant: '#e3bdc8', outline: '#e3bdc8',
};

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setUpdated(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (updated) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.stitchBar} />
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.title}>Contraseña actualizada</Text>
          <Text style={styles.sub}>Tu contraseña se ha cambiado correctamente.</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Ir a iniciar sesión →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomLine} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.stitchBar} />
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.sub}>Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.</Text>

        <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
        <TextInput
          style={styles.input}
          placeholder="Mín. 6 caracteres"
          placeholderTextColor="rgba(143,110,121,0.5)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
        <TextInput
          style={styles.input}
          placeholder="Repite la contraseña"
          placeholderTextColor="rgba(143,110,121,0.5)"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Actualizar contraseña →</Text>}
        </TouchableOpacity>
      </View>
      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.background,
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 24, padding: 28, overflow: 'hidden',
  },
  stitchBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 4, backgroundColor: C.outlineVariant, opacity: 0.5,
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  title: {
    fontSize: 22, fontWeight: '700', color: C.primary,
    textAlign: 'center', marginBottom: 8,
  },
  sub: {
    fontSize: 14, color: C.onSurfaceVariant,
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  label: {
    fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant,
    letterSpacing: 0.6, marginBottom: 5,
  },
  input: {
    width: '100%', backgroundColor: '#fff',
    borderWidth: 1, borderColor: C.outline,
    borderRadius: 10, padding: 14,
    fontSize: 14, color: C.onSurface, marginBottom: 16,
  },
  btn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: C.onPrimary, fontWeight: '700', fontSize: 15 },
  bottomLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3, backgroundColor: C.primary,
  },
});
