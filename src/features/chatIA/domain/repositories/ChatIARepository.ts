import { MessageIA } from "../entities/MessageIA";


//Contrato - define Que se puede hacer, no como 
export interface ChatIARepository {
    sendMessage(userMessage: string, history: MessageIA[]):Promise<string>;
}