// Este archivo define la interfaz INotificationRepository, 
// que es un contrato para la implementación de un repositorio de notificaciones en la aplicación de chat. 
// Esta interfaz incluye métodos para solicitar permisos de notificación, programar notificaciones de mensajes y cancelar todas las notificaciones.
export interface INotificationRepository {
  requestPermissions(): Promise<boolean>;
  scheduleMessageNotification(
    senderName: string,
    message: string,
    roomName: string,
  ): Promise<void>;
  cancelAllNotifications(): Promise<void>;
}