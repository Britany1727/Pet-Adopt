import { useState, useEffect } from 'react';
import { supabase } from '../shared/supabaseClient';
import { S } from '../shared/styles';

type Status = 'verifying' | 'ready' | 'success' | 'error';

export default function UpdatePassword() {
  const [status,   setStatus]   = useState<Status>('verifying');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(
        window.location.hash.replace('#', '')
      );
      const type         = params.get('type');
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token') ?? '';

      if (type !== 'recovery' || !accessToken) {
        setError('Link inválido o expirado. Solicita uno nuevo desde la app.');
        setStatus('error');
        return;
      }

      const { error } = await supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken });

      if (error) {
        setError('El link expiró. Solicita un nuevo correo de recuperación.');
        setStatus('error');
        return;
      }

      setStatus('ready');
    };

    run();
  }, []);

  const handleSubmit = async () => {
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe contener al menos una mayúscula');
      return;
    }
    if (!/[^a-zA-Z0-9\s]/.test(password)) {
      setError('La contraseña debe contener al menos un símbolo especial');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) setError(error.message);
    else       setStatus('success');
  };

  // ── Éxito ────────────────────────────────────────────────────────────────
  if (status === 'success') return (
    <div style={S.successContainer}>
      <div style={S.successCard}>
        <p style={S.successIcon}>🎉</p>
        <h2 style={S.successTitle}>¡Contraseña actualizada!</h2>
        <p style={S.successText}>
          Tu contraseña se cambió correctamente.
        </p>
        <p style={S.hint}>
          Abre la app <strong>PetAdopt</strong> e inicia sesión con tu nueva contraseña.
        </p>
      </div>
    </div>
  );

  // ── Error / Link inválido ─────────────────────────────────────────────────
  if (status === 'error') return (
    <div style={S.successContainer}>
      <div style={S.successCard}>
        <p style={S.successIcon}>❌</p>
        <h2 style={{ ...S.successTitle, color: '#93000a' }}>Link inválido</h2>
        <p style={S.successText}>{error}</p>
        <p style={S.hint}>Desde la app PetAdopt toca "¿Olvidaste tu contraseña?" para solicitar uno nuevo.</p>
      </div>
    </div>
  );

  // ── Verificando ───────────────────────────────────────────────────────────
  if (status === 'verifying') return (
    <div style={S.successContainer}>
      <div style={S.successCard}>
        <p style={S.successIcon}>🔐</p>
        <p style={S.hint}>Verificando tu link...</p>
      </div>
    </div>
  );

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div style={S.container}>
      <div style={S.card}>

        <div style={S.cardHeader}>
          <p style={S.logo}>🐾</p>
          <h1 style={S.title}>PetAdopt</h1>
          <p style={S.subtitle}>Ingresa tu nueva contraseña</p>
        </div>

        <div style={S.cardBody}>
          {error && <div style={S.errorBox}>{error}</div>}

          <span style={S.label}>NUEVA CONTRASEÑA</span>
          <input
            style={S.input}
            type="password"
            placeholder="Mín. 8 caracteres, 1 mayúscula, 1 símbolo"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <span style={S.label}>CONFIRMAR CONTRASEÑA</span>
          <input
            style={S.input}
            type="password"
            placeholder="Repite la contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />

          <button
            style={{ ...S.button, ...(loading ? S.buttonDisabled : {}) }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña →'}
          </button>
        </div>

      </div>
    </div>
  );
}