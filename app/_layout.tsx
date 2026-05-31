// app/_layout.tsx
import { SupabaseAuthRepository } from '@features/auth/infraestructure/repositories/SupabaseAuthRepository';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { supabase } from '@shared/infrastructure/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});
const authRepo = new SupabaseAuthRepository();

function AuthGuard() {
  const { user, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    authRepo.getCurrentUser()
      .then(setUser)
      .finally(() => setIsAuthReady(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          let user = await authRepo.getCurrentUser();
          // Google sign-in: el trigger crea el perfil con role='cliente',
          // forzamos 'pending' para que el usuario elija su rol
          if (event === 'SIGNED_IN' && user.role === 'cliente') {
            user = await authRepo.updateRole(user.id, 'pending');
          }
          setUser(user);
        } else {
          setUser(null);
        }
        setIsAuthReady(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const t = setTimeout(() => {
      // Cast único aquí — segs se usa en todas las comparaciones
      const segs = segments as unknown as string[];
      const inAuth      = segs[0] === '(auth)';
      const inSelectRole = segs.includes('select-role');

      if (!user && !inAuth) {
        router.replace('/(auth)/login');
      } else if (user && user.role === 'pending' && !inSelectRole) {
        router.replace('/(auth)/select-role' as any);
      } else if (user && user.role !== 'pending' && inAuth) {
        router.replace('/(app)');
      }
    }, 0);

    return () => clearTimeout(t);
  }, [user, segments, isAuthReady]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}