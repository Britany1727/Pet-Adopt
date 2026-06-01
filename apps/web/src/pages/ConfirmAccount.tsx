import { useState, useEffect } from 'react';
import { supabase } from '../shared/supabaseClient';
import { S, theme } from '../shared/styles';
import Lottie from '../components/Lottie';

type Status = 'verifying' | 'success' | 'error';

export default function ConfirmAccount() {
  const [status, setStatus] = useState<Status>('verifying');
  const [email,  setEmail]  = useState('');

  useEffect(() => {
    const run = async () => {
      // Leer tanto del hash como de los query params
      const hashParams   = new URLSearchParams(window.location.hash.replace('#', ''));
      const searchParams = new URLSearchParams(window.location.search);

      const type        = hashParams.get('type')         || searchParams.get('type');
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = (hashParams.get('refresh_token') || searchParams.get('refresh_token')) ?? '';
      const tokenHash   = hashParams.get('token_hash')   || searchParams.get('token_hash');

      // Nuevo formato Supabase — token_hash corto
      if (tokenHash && (type === 'signup' || type === 'email_change')) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type === 'email_change' ? 'email_change' : 'signup',
        });
        if (error || !data.session) {
          setStatus('error');
          return;
        }
        setEmail(data.session.user.email ?? '');
        await supabase.auth.signOut();
        setStatus('success');
        return;
      }

      // Formato antiguo — access_token JWT largo
      if (accessToken && (type === 'signup' || type === 'email_change')) {
        const { data, error } = await supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error || !data.session) {
          setStatus('error');
          return;
        }
        setEmail(data.session.user.email ?? '');
        await supabase.auth.signOut();
        setStatus('success');
        return;
      }

      setStatus('error');
    };

    run();
  }, []);

  // ── Verificando ───────────────────────────────────────────────────────────
  if (status === 'verifying') return (
    <div style={S.container}>
      <div style={{ ...S.ambientGlow, top: -80, left: -60, width: 200, height: 200 }} />
      <div style={S.card}>
        <div style={S.stitchBar} />
        <div style={S.lottieWrapper}>
          <Lottie src="/lotties/huellas.json" />
        </div>
        <p style={{ ...S.title, marginTop: 16 }}>Verificando cuenta</p>
        <p style={S.subtitle}>Por favor espera un momento...</p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status === 'error') return (
    <div style={S.successContainer}>
      <div style={S.successCard}>
        <div style={{ width: 80, height: 80, margin: '0 auto 16px' }}>
          <Lottie src="/lotties/cat2.json" />
        </div>
        <p style={{ fontSize: '48px', margin: '0 0 8px' }}>❌</p>
        <h2 style={{ ...S.successTitle, color: theme.onErrorContainer }}>
          Link inválido
        </h2>
        <p style={S.successText}>El link expiró o ya fue usado.</p>
        <p style={S.hint}>Regresa a la app PetAdopt e intenta registrarte de nuevo.</p>
      </div>
    </div>
  );

  // ── Éxito ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.successContainer}>
      <div style={S.successCard}>
        <p style={S.paw}>🐾</p>
        <div style={{ width: 100, height: 100, margin: '0 auto 16px' }}>
          <Lottie src="/lotties/pet5.json" />
        </div>
        <h1 style={S.successTitle}>¡Cuenta confirmada!</h1>
        <p style={S.successText}>
          Tu cuenta <strong>{email}</strong> está activa.
        </p>
        <p style={S.hint}>
          Abre la app <strong>PetAdopt</strong> e inicia sesión.
        </p>
      </div>
    </div>
  );
}