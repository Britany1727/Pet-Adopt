import { INotificationRepository } from '@features/chat/domain/repositories/INotificationRepository';
// Este archivo define el caso de uso RequestNotificationPermissionUseCase, que se encarga de solicitar permisos de notificación al usuario.

export class RequestNotificationPermissionUseCase {
  constructor(private readonly notifRepo: INotificationRepository) {}

  async execute(): Promise<boolean> {
    return this.notifRepo.requestPermissions();
  }
}