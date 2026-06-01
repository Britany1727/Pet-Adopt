import { supabase } from '@shared/infrastructure/supabase/client';

export async function sendPushToUser(recipientId: string, title: string, body: string, data?: Record<string, string>) {
  console.log('🔔 sendPushToUser → recipient:', recipientId, 'title:', title);
  const { data: profile, error: selectError } = await supabase
    .from('profiles')
    .select('expo_push_token')
    .eq('id', recipientId)
    .single();
  if (selectError) {
    console.error('❌ Error fetching recipient push token:', selectError.message);
    return;
  }
  if (!profile?.expo_push_token) {
    console.warn('⚠️ Recipient has no expo_push_token saved');
    return;
  }
  console.log('🔔 Sending push via Expo API...');
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: profile.expo_push_token,
      title,
      body,
      data: data ?? {},
      sound: 'default',
    }),
  });
  const result = await res.json();
  console.log('🔔 Expo push response:', JSON.stringify(result));
}
