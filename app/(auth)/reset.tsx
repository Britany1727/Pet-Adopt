import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@shared/infrastructure/supabase/client';
import LottieView from 'lottie-react-native';

const C = {
  primary: '#b3006a', onPrimary: '#ffffff', background: '#f9f9ff',
  surface: '#ffffff', onSurface: '#151c27', onSurfaceVariant: '#5b3f49',
  outlineVariant: '#e3bdc8', outline: '#e3bdc8',
};

export default function ResetScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'petadoptapp://(auth)/update-password',
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.stitchBar} />
          <Text style={styles.emoji}>📬</Text>
          <Text style={styles.title}>Correo enviado</Text>
          <Text style={styles.sub}>
            Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contraseña.
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Volver a inicio de sesión →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomBrand}>
          <Text style={styles.paw}>🐾</Text>
          <Text style={styles.brandText}>Mascotas · Adopción Responsable</Text>
        </View>
        <View style={styles.bottomLine} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.stitchBar} />

        <View style={styles.lottieWrapper}>
          <LottieView
            source={require('../../src/assets/lotties/huellas.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>

        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.sub}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </Text>

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

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleReset}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Enviar enlace →</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Recordaste tu contraseña? </Text>
          <Link href="/(auth)/login" style={styles.footerLink}>
            Inicia sesión
          </Link>
        </View>
      </View>

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
  lottieWrapper: {
    width: 100, height: 100, alignSelf: 'center', marginBottom: 8,
  },
  lottie: { width: '100%', height: '100%' },
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
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 16, flexWrap: 'wrap',
  },
  footerText: { fontSize: 13, color: C.onSurfaceVariant },
  footerLink: { fontSize: 13, color: C.primary, fontWeight: '700' },
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
