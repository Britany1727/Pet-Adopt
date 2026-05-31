import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { UserRole } from '@features/auth/domain/entities/User';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';

export default function RegisterScreen() {
  const { register, isLoading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole]         = useState<UserRole>('cliente');

  useEffect(() => {
    if (error) Alert.alert('Error', error);
  }, [error]);

  const handleRegister = () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    register({ email, password, username, role });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.blob1} pointerEvents="none" />
      <View style={styles.blob2} pointerEvents="none" />
      <View style={styles.card}>
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>Bienvenida</Text>
          <Text style={styles.brandSub}>Únete a nuestra comunidad creativa</Text>
        </View>
        <Text style={styles.sectionLabel}>TIPO DE CUENTA</Text>
        <View style={styles.roleTabRow}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'cliente' && styles.roleTabActive]}
            onPress={() => setRole('cliente')}
          >
            <Text style={[styles.roleTabText, role === 'cliente' && styles.roleTabTextActive]}>
              Cliente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleTab, role === 'refugio' && styles.roleTabActive]}
            onPress={() => setRole('refugio')}
          >
            <Text style={[styles.roleTabText, role === 'refugio' && styles.roleTabTextActive]}>
              Refugio
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'cliente' ? styles.roleBtnActive : styles.roleBtnInactive]}
            onPress={() => setRole('cliente')}
          >
            <Text style={styles.roleEmoji}>🛍️</Text>
            <Text style={[styles.roleText, role === 'cliente' ? styles.roleTextActive : styles.roleTextInactive]}>
              Cliente
            </Text>
            <Text style={[styles.roleDesc, role === 'cliente' ? styles.roleDescActive : styles.roleDescInactive]}>
              Adopta mascotas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'refugio' ? styles.roleBtnActive : styles.roleBtnInactive]}
            onPress={() => setRole('refugio')}
          >
            <Text style={styles.roleEmoji}>🏡</Text>
            <Text style={[styles.roleText, role === 'refugio' ? styles.roleTextActive : styles.roleTextInactive]}>
              Refugio
            </Text>
            <Text style={[styles.roleDesc, role === 'refugio' ? styles.roleDescActive : styles.roleDescInactive]}>
              Publica mascotas
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>NOMBRE DE USUARIO</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. María Fernández"
          placeholderTextColor="rgba(143,110,121,0.5)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <TextInput
          style={styles.input}
          placeholder="hola@ejemplo.com"
          placeholderTextColor="rgba(143,110,121,0.5)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>CONTRASEÑA</Text>
        <TextInput
          style={styles.input}
          placeholder="Min. 8 caracteres"
          placeholderTextColor="rgba(143,110,121,0.5)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Crear cuenta →</Text>}
        </TouchableOpacity>
        <View style={styles.stitch} />
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.trust}>
        <Text style={styles.trustText}>🐾 Adopción Responsable</Text>
        <View style={styles.trustDivider} />
        <Text style={styles.trustText}>❤️ Amor Animal</Text>
      </View>
      <View style={styles.bottomLine} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    padding: 24, backgroundColor: '#f9f9ff',
  },
  blob1: {
    position: 'absolute', top: '-5%', right: '-5%',
    width: 200, height: 200,
    backgroundColor: 'rgba(255,217,228,0.25)', borderRadius: 100,
  },
  blob2: {
    position: 'absolute', bottom: '-5%', left: '-5%',
    width: 160, height: 160,
    backgroundColor: 'rgba(234,224,230,0.35)', borderRadius: 80,
  },
  bottomLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3, backgroundColor: '#b3006a',
  },
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e3bdc8',
    borderRadius: 16, padding: 24,
  },
  brand: { alignItems: 'center', marginBottom: 20 },
  brandTitle: { fontSize: 22, fontWeight: '700', color: '#b3006a' },
  brandSub: { fontSize: 13, color: '#5f5e5e', marginTop: 4 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#5b3f49',
    letterSpacing: 0.8, marginBottom: 6,
  },
  roleTabRow: {
    flexDirection: 'row', backgroundColor: '#e7eefe',
    borderWidth: 1, borderColor: '#e3bdc8',
    borderRadius: 10, padding: 4, gap: 4, marginBottom: 14,
  },
  roleTab: { flex: 1, paddingVertical: 8, borderRadius: 7, alignItems: 'center' },
  roleTabActive: { backgroundColor: '#e00086' },
  roleTabText: { fontSize: 13, fontWeight: '600', color: '#5b3f49' },
  roleTabTextActive: { color: '#fff' },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleBtn: {
    flex: 1, borderWidth: 2,
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: '#b3006a',
    backgroundColor: '#fff0f6',
  },
  roleBtnInactive: {
    borderColor: '#e3bdc8',
    backgroundColor: '#fdf5f7',
  },
  roleEmoji: { fontSize: 24, marginBottom: 4 },
  roleText: { fontSize: 13, fontWeight: '700' },
  roleTextActive: { color: '#b3006a' },
  roleTextInactive: { color: '#5b3f49' },
  roleDesc: { fontSize: 11, marginTop: 2 },
  roleDescActive: { color: '#b3006a' },
  roleDescInactive: { color: '#8f6e79' },
  label: {
    fontSize: 11, fontWeight: '700', color: '#5b3f49',
    letterSpacing: 0.6, marginBottom: 5,
  },
  input: {
    width: '100%', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e3bdc8',
    borderRadius: 10, padding: 14,
    fontSize: 14, color: '#151c27', marginBottom: 12,
  },
  btn: {
    backgroundColor: '#b3006a', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    justifyContent: 'center', marginBottom: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  stitch: {
    width: '100%', height: 1, backgroundColor: '#e3bdc8',
    marginVertical: 16, opacity: 0.6,
  },
  footerText: { textAlign: 'center', fontSize: 13, color: '#5b3f49' },
  footerLink: { color: '#b3006a', fontWeight: '700' },
  trust: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    marginTop: 14, opacity: 0.65,
  },
  trustText: { fontSize: 12, color: '#5b3f49' },
  trustDivider: { width: 1, height: 14, backgroundColor: '#e3bdc8' },
});
