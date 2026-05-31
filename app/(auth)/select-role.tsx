// app/(auth)/select-role.tsx
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { SupabaseAuthRepository } from '@features/auth/infraestructure/repositories/SupabaseAuthRepository';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { UserRole } from '@features/auth/domain/entities/User';

const authRepo = new SupabaseAuthRepository();

export default function SelectRoleScreen() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selected || !user) return;
    setLoading(true);
    try {
      const updated = await authRepo.updateRole(user.id, selected);
      setUser(updated);
      router.replace('/(app)');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>¿Cómo quieres usar la app?</Text>
        <Text style={styles.sub}>Elige tu tipo de cuenta para continuar</Text>

        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, selected === 'cliente' && styles.roleBtnActive]}
            onPress={() => setSelected('cliente')}
            activeOpacity={0.85}
          >
            <Text style={styles.roleEmoji}>🐾</Text>
            <Text style={[styles.roleTitle, selected === 'cliente' && styles.roleTitleActive]}>
              Cliente
            </Text>
            <Text style={[styles.roleDesc, selected === 'cliente' && styles.roleDescActive]}>
              Quiero adoptar una mascota
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, selected === 'refugio' && styles.roleBtnActive]}
            onPress={() => setSelected('refugio')}
            activeOpacity={0.85}
          >
            <Text style={styles.roleEmoji}>🏡</Text>
            <Text style={[styles.roleTitle, selected === 'refugio' && styles.roleTitleActive]}>
              Refugio
            </Text>
            <Text style={[styles.roleDesc, selected === 'refugio' && styles.roleDescActive]}>
              Publico mascotas en adopción
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, (!selected || loading) && styles.btnDisabled]}
          onPress={handleConfirm}
          disabled={!selected || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Continuar →</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f9f9ff',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e3bdc8',
    borderRadius: 24, padding: 28,
  },
  title: {
    fontSize: 22, fontWeight: '700', color: '#b3006a',
    textAlign: 'center', marginBottom: 8,
  },
  sub: {
    fontSize: 14, color: '#5f5e5e',
    textAlign: 'center', marginBottom: 28,
  },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleBtn: {
    flex: 1, borderWidth: 2, borderColor: '#e3bdc8',
    borderRadius: 16, padding: 18, alignItems: 'center',
    backgroundColor: '#fdf5f7',
  },
  roleBtnActive: {
    borderColor: '#b3006a',
    backgroundColor: '#fff0f6',
  },
  roleEmoji: { fontSize: 32, marginBottom: 8 },
  roleTitle: {
    fontSize: 15, fontWeight: '700', color: '#5b3f49', marginBottom: 4,
  },
  roleTitleActive: { color: '#b3006a' },
  roleDesc: { fontSize: 11, color: '#8f6e79', textAlign: 'center' },
  roleDescActive: { color: '#b3006a' },
  btn: {
    backgroundColor: '#b3006a', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});