import * as Notifications from 'expo-notifications';
import { INotificationRepository } from '@features/chat/domain/repositories/INotificationRepository';
import { Platform } from 'react-native';
// Configuración global para mostrar notificaciones incluso en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
// Esta clase implementa la interfaz INotificationRepository utilizando 
// las APIs de Expo Notifications para manejar las notificaciones locales en la aplicación de chat.
export class ExpoNotificationRepository implements INotificationRepository {
    // El método requestPermissions solicita permisos de notificación al usuario.
  async requestPermissions(): Promise<boolean> {
    // En Android se crea el canal de notificaciones
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('chat-messages', {
        name: 'Mensajes del chat',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    // Verificar permisos existentes
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
  // El método scheduleMessageNotification programa una notificación local para un nuevo mensaje recibido.
  async scheduleMessageNotification(
    senderName: string,
    message: string,
    roomName: string,
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💬 ${senderName}`,
        body: message.length > 60 ? `${message.slice(0, 60)}...` : message,
        subtitle: roomName,        // iOS
        sound: 'default',
        badge: 1,
        data: { roomName },
        // Android usa el canal definido arriba
        ...(Platform.OS === 'android' && { channelId: 'chat-messages' }),
      },
      trigger: null, // mostrar inmediatamente — NO requiere push token
    });
  }
  // El método cancelAllNotifications cancela todas las notificaciones programadas y borra el badge.

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  }
}