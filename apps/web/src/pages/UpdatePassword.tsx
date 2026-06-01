import { useState, useEffect } from 'react';
import { supabase } from '../shared/supabaseClient';
import { S, theme } from '../shared/styles';
import Lottie from '../components/Lottie';

type Status = 'verifying' | 'ready' | 'success' | 'error';

export default function UpdatePassword() {
  const [status,   setStatus]   = useState<Status>('verifying');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const run = async () => {
      // Leer tanto del hash como de los query params
      const hashParams   = new URLSearchParams(window.location.hash.replace('#', ''));
      const searchParams = new URLSearchParams(window.location.search);

      const type         = hashParams.get('type')         || searchParams.get('type');
      const accessToken  = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = (hashParams.get('refresh_token') || searchParams.get('refresh_token')) ?? '';
      const tokenHash    = hashParams.get('token_hash')   || searchParams.get('token_hash');

      if (type !== 'recovery') {
        setError('Link inválido o expirado. Solicita uno nuevo desde la app.');
        setStatus('error');
        return;
      }

      // Nuevo formato de Supabase — token_hash corto numérico
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (error) {
          setError('El link expiró. Solicita un nuevo correo de recuperación.');
          setStatus('error');
          return;
        }
        setStatus('ready');
        return;
      }

      // Formato antiguo — access_token JWT largo
      if (accessToken) {
        const { error } = await supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) {
          setError('El link expiró. Solicita un nuevo correo de recuperación.');
          setStatus('error');
          return;
        }
        setStatus('ready');
        return;
      }

      setError('Link inválido o expirado.');
      setStatus('error');
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
        <p style={S.paw}>🐾</p>
        <div style={{ width: 100, height: 100, margin: '0 auto 16px' }}>
          <Lottie src="/lotties/pet.json" />
        </div>
        <h2 style={S.successTitle}>¡Contraseña actualizada!</h2>
        <p style={S.successText}>Tu contraseña se cambió correctamente.</p>
        <p style={S.hint}>
          Abre la app <strong>PetAdopt</strong> e inicia sesión con tu nueva contraseña.
        </p>
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
        <p style={S.successText}>{error}</p>
        <p style={S.hint}>
          Desde la app PetAdopt toca "¿Olvidaste tu contraseña?" para solicitar uno nuevo.
        </p>
      </div>
    </div>
  );

  // ── Verificando ───────────────────────────────────────────────────────────
  if (status === 'verifying') return (
    <div style={S.container}>
      <div style={{ ...S.ambientGlow, top: -80, left: -60, width: 200, height: 200 }} />
      <div style={S.card}>
        <div style={S.stitchBar} />
        <div style={S.lottieWrapper}>
          <Lottie src="/lotties/huellas.json" />
        </div>
        <p style={{ ...S.title, marginTop: 16 }}>Verificando link</p>
        <p style={S.subtitle}>Por favor espera un momento...</p>
      </div>
    </div>
  );

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div style={S.container}>
      <div style={{ ...S.ambientGlow, top: -80, left: -60, width: 200, height: 200 }} />
      <div style={S.card}>
        <div style={S.stitchBar} />

        <div style={S.lottieWrapper}>
          <Lottie src="/lotties/locker.json" />
        </div>

        <p style={S.title}>Nueva contraseña</p>
        <p style={S.subtitle}>Ingresa tu nueva contraseña</p>

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

        <p style={S.brand}>🐾 Mascotas · Adopción Responsable</p>
      </div>
    </div>
  );
}