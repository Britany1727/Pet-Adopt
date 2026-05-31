import { Message } from "../../domain/entities/Message";
import { IChatRepository } from "../../domain/repositories/IChatRepository";

export class GetMessageUseCase{
    constructor(private readonly chatRepo: IChatRepository){}
    execute(roomId:string):Promise<Message[]>{
        return this.chatRepo.getMessages(roomId);
    }
}