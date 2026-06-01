import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const C = {
  primary: '#b3006a', onPrimary: '#ffffff', background: '#f9f9ff',
  surface: '#ffffff', onSurface: '#151c27', onSurfaceVariant: '#5b3f49',
  outlineVariant: '#e3bdc8', outline: '#e3bdc8',
};

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, isLoading, isGoogleLoading, error } = useAuth();

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
            source={require('../../src/assets/lotties/pet.json')}
            autoPlay loop
            style={styles.lottie}
          />
        </View>

        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.sub}>Ingresa a tu cuenta para continuar</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="rgba(143,110,121,0.5)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.labelRow}>
          <LottieView
            source={require('../../src/assets/lotties/locker.json')}
            autoPlay loop
            style={styles.labelLottie}
          />
          <Text style={styles.label}>CONTRASEÑA</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="rgba(143,110,121,0.5)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Link href="/(auth)/reset" style={styles.forgotLink}>
          ¿Olvidaste tu contraseña?
        </Link>

        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={() => login({ email, password })}
          disabled={isLoading || isGoogleLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Iniciar Sesión →</Text>}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleBtn, isGoogleLoading && styles.btnDisabled]}
          onPress={() => loginWithGoogle()}
          disabled={isLoading || isGoogleLoading}
          activeOpacity={0.85}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color="#b3006a" />
          ) : (
            <View style={styles.googleInner}>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleText}>Continuar con Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <Link href="/(auth)/register" style={styles.footerLink}>
            Regístrate gratis
          </Link>
        </View>
      </Animated.View>

      <View style={styles.bottomBrand}>
        <Text style={styles.paw}>🐾</Text>
        <Text style={styles.brandText}>Mascotas · Adopción Responsable</Text>
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
  errorBox: {
    backgroundColor: '#ffdad6',
    borderWidth: 1, borderColor: 'rgba(186, 26, 26, 0.3)',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14,
  },
  errorText: { color: '#93000a', fontSize: 13, textAlign: 'center' },
  labelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5,
  },
  labelLottie: { width: 20, height: 20 },
  label: {
    fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  input: {
    width: '100%', backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.outline,
    borderRadius: 10, padding: 14,
    fontSize: 14, color: C.onSurface, marginBottom: 14,
  },
  forgotLink: {
    color: C.primary, fontSize: 13, fontWeight: '600',
    textAlign: 'right', marginBottom: 16, marginTop: -8,
  },
  btn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 16, gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.outlineVariant },
  dividerText: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '500' },
  googleBtn: {
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 10, paddingVertical: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  googleInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  googleIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#4285F4',
    justifyContent: 'center', alignItems: 'center',
  },
  googleIconText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  googleText: { color: C.onSurface, fontWeight: '600', fontSize: 14 },
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 20, flexWrap: 'wrap',
  },
  footerText: { color: C.onSurfaceVariant, fontSize: 14 },
  footerLink: { color: C.primary, fontWeight: '700', fontSize: 14 },
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
