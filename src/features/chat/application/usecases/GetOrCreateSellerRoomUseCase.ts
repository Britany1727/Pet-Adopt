import { Room } from '@features/chat/domain/entities/Message';
import { IChatRepository } from '@features/chat/domain/repositories/IChatRepository';

export class GetOrCreateSellerRoomUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(sellerId: string, clientId: string): Promise<Room> {
    return this.chatRepo.getOrCreateSellerRoom(sellerId, clientId);
  }
}
