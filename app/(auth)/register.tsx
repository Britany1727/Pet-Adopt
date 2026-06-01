import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { UserRole } from '@features/auth/domain/entities/User';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const C = {
  primary: '#b3006a', onPrimary: '#ffffff', background: '#f9f9ff',
  surface: '#ffffff', onSurface: '#151c27', onSurfaceVariant: '#5b3f49',
  outlineVariant: '#e3bdc8', outline: '#e3bdc8',
};

function SentScreen({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.ambientContainer} pointerEvents="none">
        <View style={[styles.ambientGlow, { top: -80, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.ambientGlow, { bottom: -60, right: -40, width: 180, height: 180 }]} />
        <LottieView
          source={require('../../src/assets/lotties/huellas.json')}
          autoPlay loop
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.06 }}
        />
      </View>

      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.card}>
        <View style={styles.stitchBar} />
        <View style={styles.lottieWrapper}>
          <LottieView
            source={require('../../src/assets/lotties/send.json')}
            autoPlay loop
            style={styles.lottie}
          />
        </View>
        <Text style={styles.title}>Revisa tu correo</Text>
        <Text style={styles.sub}>
          Enviamos un enlace de confirmación a{' '}
          <Text style={{ fontWeight: '700', color: C.primary }}>{email}</Text>.
          {'\n\n'}Haz clic en el enlace para activar tu cuenta y luego inicia sesión.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Volver a inicio de sesión →</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bottomBrand}>
        <Text style={styles.paw}>🐾</Text>
        <Text style={styles.brandText}>Mascotas · Adopción Responsable</Text>
      </View>
      <View style={styles.bottomLine} />
    </View>
  );
}

export default function RegisterScreen() {
  const { registerAsync, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole]         = useState<UserRole>('cliente');
  const [sent, setSent]         = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      Alert.alert('Error', 'La contraseña debe contener al menos una mayúscula');
      return;
    }
    if (!/[^a-zA-Z0-9\s]/.test(password)) {
      Alert.alert('Error', 'La contraseña debe contener al menos un símbolo especial');
      return;
    }
    try {
      await registerAsync({ email, password, username, role });
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.toLowerCase().includes('correo') || msg.toLowerCase().includes('confirmación')) {
        setSentEmail(email);
        setSent(true);
      } else {
        Alert.alert('Error', msg || 'Ocurrió un error al registrarte');
      }
    }
  };

  if (sent) {
    return <SentScreen email={sentEmail} onBack={() => router.replace('/(auth)/login')} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.ambientContainer} pointerEvents="none">
        <View style={[styles.ambientGlow, { top: -80, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.ambientGlow, { bottom: -60, right: -40, width: 180, height: 180 }]} />
        <LottieView
          source={require('../../src/assets/lotties/huellas.json')}
          autoPlay loop
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.06 }}
        />
      </View>

      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.card}>
        <View style={styles.stitchBar} />

        <View style={styles.lottieWrapper}>
          <LottieView
            source={require('../../src/assets/lotties/pet5.json')}
            autoPlay loop
            style={styles.lottie}
          />
        </View>

        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.sub}>Únete a nuestra comunidad</Text>

        <Text style={styles.sectionLabel}>TIPO DE CUENTA</Text>
        <View style={styles.roleTabRow}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'cliente' && styles.roleTabActive]}
            onPress={() => setRole('cliente')}
          >
            <Text style={[styles.roleTabText, role === 'cliente' && styles.roleTabTextActive]}>
              Adoptante
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
            <LottieView
              source={require('../../src/assets/lotties/user.json')}
              autoPlay loop
              style={styles.roleLottie}
            />
            <Text style={[styles.roleText, role === 'cliente' ? styles.roleTextActive : styles.roleTextInactive]}>
              Adoptante
            </Text>
            <Text style={[styles.roleDesc, role === 'cliente' ? styles.roleDescActive : styles.roleDescInactive]}>
              Adopta mascotas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'refugio' ? styles.roleBtnActive : styles.roleBtnInactive]}
            onPress={() => setRole('refugio')}
          >
            <LottieView
              source={require('../../src/assets/lotties/pet4.json')}
              autoPlay loop
              style={styles.roleLottie}
            />
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
      </Animated.View>

      <View style={styles.bottomBrand}>
        <Text style={styles.paw}>🐾</Text>
        <Text style={styles.brandText}>Mascotas · Adopción Responsable</Text>
      </View>
      <View style={styles.bottomLine} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    padding: 24, backgroundColor: C.background,
  },
  ambientContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  ambientGlow: {
    position: 'absolute', borderRadius: 100,
    backgroundColor: C.primary, opacity: 0.04,
  },
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 24, padding: 28, overflow: 'hidden',
  },
  stitchBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 4, backgroundColor: C.outlineVariant, opacity: 0.5,
  },
  lottieWrapper: {
    width: 90, height: 90, alignSelf: 'center', marginBottom: 8,
  },
  lottie: { width: '100%', height: '100%' },
  title: {
    fontSize: 22, fontWeight: '700', color: C.primary,
    textAlign: 'center', marginBottom: 4,
  },
  sub: {
    fontSize: 14, color: C.onSurfaceVariant,
    textAlign: 'center', marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant,
    letterSpacing: 0.8, marginBottom: 6,
  },
  roleTabRow: {
    flexDirection: 'row', backgroundColor: '#e7eefe',
    borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 10, padding: 4, gap: 4, marginBottom: 14,
  },
  roleTab: { flex: 1, paddingVertical: 8, borderRadius: 7, alignItems: 'center' },
  roleTabActive: { backgroundColor: C.primary },
  roleTabText: { fontSize: 13, fontWeight: '600', color: C.onSurfaceVariant },
  roleTabTextActive: { color: '#fff' },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleBtn: {
    flex: 1, borderWidth: 2,
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: C.primary,
    backgroundColor: '#fff0f6',
  },
  roleBtnInactive: {
    borderColor: C.outlineVariant,
    backgroundColor: '#fdf5f7',
  },
  roleLottie: { width: 40, height: 40, marginBottom: 4 },
  roleText: { fontSize: 13, fontWeight: '700' },
  roleTextActive: { color: C.primary },
  roleTextInactive: { color: C.onSurfaceVariant },
  roleDesc: { fontSize: 11, marginTop: 2 },
  roleDescActive: { color: C.primary },
  roleDescInactive: { color: C.onSurfaceVariant },
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
  btn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    justifyContent: 'center', marginBottom: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: C.onPrimary, fontWeight: '700', fontSize: 15 },
  stitch: {
    width: '100%', height: 1, backgroundColor: C.outlineVariant,
    marginVertical: 16, opacity: 0.6,
  },
  footerText: { textAlign: 'center', fontSize: 13, color: C.onSurfaceVariant },
  footerLink: { color: C.primary, fontWeight: '700' },
  bottomBrand: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginTop: 20, opacity: 0.6,
  },
  paw: { fontSize: 16 },
  brandText: { fontSize: 12, color: C.onSurfaceVariant },
  bottomLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3, backgroundColor: C.primary,
  },
});
