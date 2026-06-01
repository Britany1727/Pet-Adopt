import { useState, useEffect } from 'react';
import { supabase } from '../shared/supabaseClient';
import { S } from '../shared/styles';

type Status = 'verifying' | 'success' | 'error';

export default function ConfirmAccount() {
  const [status, setStatus] = useState<Status>('verifying');
  const [email,  setEmail]  = useState('');

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(
        window.location.hash.replace('#', '')
      );
      const type         = params.get('type');
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token') ?? '';

      if ((type !== 'signup' && type !== 'email_change') || !accessToken) {
        setStatus('error');
        return;
      }

      const { data, error } = await supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken });

      if (error || !data.session) {
        setStatus('error');
        return;
      }

      setEmail(data.session.user.email ?? '');
      await supabase.auth.signOut();
      setStatus('success');
    };

    run();
  }, []);

  if (status === 'verifying') return (
    <div style={S.successContainer}>
      <div style={S.successCard}>
        <p style={S.successIcon}>📧</p>
        <p style={S.hint}>Confirmando tu cuenta...</p>
      </div>
    </div>
  );

  if (status === 'error') return (
    <div style={S.successContainer}>
      <div style={S.successCard}>
        <p style={S.successIcon}>❌</p>
        <h2 style={{ ...S.successTitle, color: '#93000a' }}>Link inválido</h2>
        <p style={S.successText}>
          El link expiró o ya fue usado.
        </p>
        <p style={S.hint}>Regresa a la app PetAdopt e intenta registrarte de nuevo.</p>
      </div>
    </div>
  );

  return (
    <div style={S.successContainer}>
      <div style={S.successCard}>
        <p style={S.successIcon}>✅</p>
        <p style={{ fontSize: '48px', margin: '0 0 12px' }}>🐾</p>
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