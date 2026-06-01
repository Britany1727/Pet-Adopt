// app/_layout.tsx
import { SupabaseAuthRepository } from '@features/auth/infraestructure/repositories/SupabaseAuthRepository';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { supabase } from '@shared/infrastructure/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as WebBrowser from "expo-web-browser";
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});
const authRepo = new SupabaseAuthRepository();

async function registerPushToken(userId: string) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificaciones',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  console.log('📱 Push permission status:', status);
  if (status !== 'granted') return;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('📱 Expo push token:', tokenData.data);
    const { error } = await supabase.from('profiles').update({ expo_push_token: tokenData.data }).eq('id', userId);
    if (error) console.error('❌ Error saving push token:', error.message);
    else console.log('✅ Push token saved to profiles');
  } catch (e: any) {
    console.warn('⚠️ Push token registration skipped:', e?.message ?? e);
  }
}

function AuthGuard() {
  const { user, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const registeredToken = useRef(false);

  useEffect(() => {
    authRepo.getCurrentUser()
      .then((u) => {
        setUser(u);
        if (u && !registeredToken.current) {
          registeredToken.current = true;
          registerPushToken(u.id);
        }
      })
      .finally(() => setIsAuthReady(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const u = await authRepo.getCurrentUser();
          setUser(u);
          if (u && !registeredToken.current) {
            registeredToken.current = true;
            registerPushToken(u.id);
          }
        } else {
          setUser(null);
          registeredToken.current = false;
        }
        setIsAuthReady(true);
      }
    );

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      if (data?.screen === 'adoption-requests') {
        router.push('/(app)/adoption-request' as any);
      } else if (data?.roomId) {
        router.push(`/(app)/chat/${data.roomId}` as any);
      }
    });

    return () => {
      subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  const inChatRoom = segments[0] === '(app)' && segments[1] === 'chat' && !!segments[2];

  useEffect(() => {
    if (!user || inChatRoom) return;

    const channel = supabase
      .channel('global-chat-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, async (payload) => {
        if (payload.new.user_id === user.id) return;

        try {
          const [roomRes, profileRes] = await Promise.all([
            supabase.from('rooms').select('name, seller_id, client_id').eq('id', payload.new.room_id).single(),
            supabase.from('profiles').select('username').eq('id', payload.new.user_id).single(),
          ]);

          const senderName = profileRes.data?.username ?? 'Alguien';
          const roomName = roomRes.data?.name ?? 'Chat';
          const msgContent = payload.new.content || '';
          const body = msgContent.length > 80 ? `${msgContent.slice(0, 80)}...` : msgContent || '📷 Imagen';

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `💬 ${senderName}`,
              body,
              subtitle: roomName,
              sound: 'default',
              badge: 1,
              data: { roomId: payload.new.room_id },
              ...(Platform.OS === 'android' && { channelId: 'chat-messages' }),
            },
            trigger: null,
          });
        } catch (e) {
          console.warn('❌ Global notification error:', e);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, inChatRoom]);

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