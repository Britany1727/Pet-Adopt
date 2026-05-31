import { ChatError } from "../../../../shared/domain/errors/AppError";
import {Room} from "../../domain/entities/Message"
import { IChatRepository } from "../../domain/repositories/IChatRepository";

export class CreateRoomUseCase{
    constructor(private readonly chatRepo: IChatRepository){}
        async execute(mascotaId: string, sellerId: string, clientId: string):Promise<Room>{
            if(!mascotaId || !sellerId || !clientId) throw new ChatError("Faltan datos para crear la sala");
            return this.chatRepo.createRoom(mascotaId, sellerId, clientId);
        }
}