import { INotificationRepository } from '@features/chat/domain/repositories/INotificationRepository';
import { Message } from '@features/chat/domain/entities/Message';

// Este archivo define el caso de uso NotifyNewMessageUseCase, que se encarga de gestionar 
// la lógica para notificar al usuario cuando llega un nuevo mensaje en una sala de chat.
// El caso de uso utiliza un repositorio de notificaciones para programar una notificación local
export class NotifyNewMessageUseCase {
  constructor(private readonly notifRepo: INotificationRepository) {}

  async execute(
    message: Message,
    currentUserId: string,
    roomName: string,
  ): Promise<void> {
    // No notificar los propios mensajes
    if (message.userId === currentUserId) return;

    const senderName = message.authorUsername ?? 'Alguien';
    const body = message.imageUrl ? '📷 Imagen' : message.content;

    await this.notifRepo.scheduleMessageNotification(senderName, body, roomName);
  }
}