import { Message } from "@features/chat/domain/entities/Message";
import { IChatRepository } from "@features/chat/domain/repositories/IChatRepository";

export class SubscribeToRoomUseCase {
    constructor(private readonly chatRepo: IChatRepository){}
    execute(roomId:string, onMessage: (msg: Message) => void): () => void {
        return this.chatRepo.subscribeToRoom(roomId, onMessage);
    }
}