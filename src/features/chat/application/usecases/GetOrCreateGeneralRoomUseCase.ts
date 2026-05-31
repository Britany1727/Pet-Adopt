import { IChatRepository } from '@features/chat/domain/repositories/IChatRepository';
import { Room } from '@features/chat/domain/entities/Message';

export class GetOrCreateGeneralRoomUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(userId: string): Promise<Room> {
    return this.chatRepo.getOrCreateGeneralRoom(userId);
  }
}
