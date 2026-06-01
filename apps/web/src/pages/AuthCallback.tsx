import { useEffect, useState } from 'react';

function getTokens() {
  const raw = window.location.hash || window.location.search || '';
  const params = new URLSearchParams(raw.startsWith('#') || raw.startsWith('?') ? raw.slice(1) : raw);
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token') ?? '',
    type: params.get('type') ?? 'oauth',
  };
}

export default function AuthCallback() {
  const [tried, setTried] = useState(false);
  const { accessToken, refreshToken, type } = getTokens();

  const q = new URLSearchParams(window.location.search);
  const devHost = q.get('dev_host');

  const deepLink = devHost
    ? `exp://${devHost}?access_token=${accessToken}&refresh_token=${refreshToken}&type=${type}`
    : `petadoptapp://auth-callback#access_token=${accessToken}&refresh_token=${refreshToken}&type=${type}`;

  useEffect(() => {
    if (!accessToken) return;
    window.location.replace(deepLink);
    setTimeout(() => setTried(true), 1500);
  }, []);

  if (!accessToken) return <TokensError />;

  return (
    <div style={containerStyle}>
      <p style={{ fontSize: '64px', margin: '0 0 8px' }}>🐾</p>
      <h2 style={{ color: '#b3006a', margin: '0 0 8px' }}>¡Login exitoso!</h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Toca el botón para volver a la app:
      </p>
      <button
        onClick={() => { window.location.href = deepLink; }}
        style={{
          padding: '16px 32px', fontSize: '18px', fontWeight: 700,
          background: '#b3006a', color: '#fff', borderRadius: 14,
          border: 'none', cursor: 'pointer', marginBottom: 16,
        }}>
        Abrir PetAdopt
      </button>
      {tried && (
        <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: 12, maxWidth: 300, textAlign: 'center' }}>
          Si no se abre, asegúrate de tener la app instalada y vuelve a intentarlo.
        </p>
      )}
    </div>
  );
}

function TokensError() {
  return (
    <div style={containerStyle}>
      <p style={{ fontSize: '48px', margin: '0 0 16px' }}>❌</p>
      <p style={{ fontSize: '16px', color: '#6b7280' }}>No se recibieron los tokens.</p>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  fontFamily: 'system-ui',
  padding: '0 16px',
  textAlign: 'center',
};