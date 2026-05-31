// app/(auth)/login.tsx
import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, isLoading, isGoogleLoading, error } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.topGradient} pointerEvents="none" />
      <View style={styles.card}>
        <View style={styles.stitchBar} />

        <View style={styles.brand}>
          <Image
            source={require('../../src/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>Mascotas</Text>
          <Text style={styles.brandSub}>Adopción responsable</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="rgba(143,110,121,0.5)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contraseña</Text>
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

        {/* Botón email/password */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={() => login({ email, password })}
          disabled={isLoading || isGoogleLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Iniciar Sesión →</Text>}
        </TouchableOpacity>

        {/* Divisor */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botón Google */}
        <TouchableOpacity
          style={[styles.googleButton, isGoogleLoading && styles.buttonDisabled]}
          onPress={() => loginWithGoogle()}
          disabled={isLoading || isGoogleLoading}
          activeOpacity={0.85}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color="#b3006a" />
          ) : (
            <View style={styles.googleInner}>
              {/* Ícono G de Google con colores */}
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleText}>Continuar con Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <Link href="/(auth)/register" style={styles.link}>
            Regístrate gratis
          </Link>
        </View>
      </View>

      <View style={styles.footerNav}>
        <Text style={styles.footerNavLink}>Soporte</Text>
        <Text style={styles.footerNavLink}>Términos</Text>
        <Text style={styles.footerNavLink}>Privacidad</Text>
      </View>
      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f9f9ff',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
    backgroundColor: 'rgba(255, 217, 228, 0.35)',
  },
  bottomLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3, backgroundColor: '#b3006a',
  },
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: '#f9f9ff',
    borderWidth: 1, borderColor: 'rgba(227, 189, 200, 0.4)',
    borderRadius: 24, padding: 28, overflow: 'hidden',
  },
  stitchBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 4, backgroundColor: '#e3bdc8', opacity: 0.5,
  },
  brand: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  logo: { width: 80, height: 80, marginBottom: 12 },
  brandTitle: {
    fontSize: 26, fontWeight: '700', color: '#b3006a',
    letterSpacing: -0.5, textAlign: 'center',
  },
  brandSub: { fontSize: 13, color: '#5f5e5e', marginTop: 4 },
  errorBox: {
    backgroundColor: '#ffdad6',
    borderWidth: 1, borderColor: 'rgba(186, 26, 26, 0.3)',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14,
  },
  errorText: { color: '#93000a', fontSize: 13, textAlign: 'center' },
  label: {
    fontSize: 12, fontWeight: '600', color: '#5b3f49',
    letterSpacing: 0.5, marginBottom: 5,
  },
  input: {
    width: '100%', backgroundColor: '#f9f9ff',
    borderWidth: 1, borderColor: '#e3bdc8',
    borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16,
    fontSize: 15, color: '#151c27', marginBottom: 14,
  },
  button: {
    backgroundColor: '#b3006a', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
    justifyContent: 'center', marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },

  // Divisor
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 16, gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e3bdc8' },
  dividerText: { fontSize: 12, color: '#8f6e79', fontWeight: '500' },

  // Google
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: '#e3bdc8',
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
  googleText: { color: '#151c27', fontWeight: '600', fontSize: 14 },

  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 20, flexWrap: 'wrap',
  },
  footerText: { color: '#5f5e5e', fontSize: 14 },
  link: { color: '#b3006a', fontWeight: '700', fontSize: 14 },
  forgotLink: {
    color: '#b3006a', fontSize: 13, fontWeight: '600',
    textAlign: 'right', marginBottom: 16, marginTop: -8,
  },
  footerNav: { flexDirection: 'row', gap: 20, marginTop: 16 },
  footerNavLink: { color: '#8f6e79', fontSize: 12 },
});