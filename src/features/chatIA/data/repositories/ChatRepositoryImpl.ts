import { MessageIA } from "@features/chatIA/domain/entities/MessageIA";
import { ChatIARepository } from "@features/chatIA/domain/repositories/ChatIARepository";
import { GeminiDataSource } from "../datasources/GeminiDataSource";

// La palabra 'implements' garantiza en tiempo de compilación
//que esta clase cumple con el contrato del Domain
export class ChatIARepositoryImpl implements ChatIARepository {
    private dataSource: GeminiDataSource;

    constructor() {
        this.dataSource = new GeminiDataSource();
    }

    async sendMessage(userMessage: string, history: MessageIA[]): Promise<string> {
        return this.dataSource.generateResponse(userMessage,history);
    }
}