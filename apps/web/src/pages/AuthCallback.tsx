import { useEffect } from 'react';
import { supabase } from '../shared/supabaseClient';

export default function AuthCallback() {
  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(
        window.location.hash.replace('#', '')
      );
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token') ?? '';
      const type         = params.get('type');

      if (!accessToken) return;

      // Establece la sesión para que Supabase la reconozca
      await supabase.auth.setSession({
        access_token:  accessToken,
        refresh_token: refreshToken,
      });

      // Redirige a la app móvil con los tokens en el deep link
      const deepLink = `petadoptapp://auth-callback#access_token=${accessToken}&refresh_token=${refreshToken}&type=${type ?? 'oauth'}`;
      window.location.href = deepLink;
    };

    run();
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', fontFamily: 'system-ui',
    }}>
      <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🐾</p>
      <p style={{ fontSize: '16px', color: '#6b7280' }}>
        Abriendo PetAdopt...
      </p>
    </div>
  );
}