import { ChatIARepository } from "@features/chatIA/domain/repositories/ChatIARepository";
// Importamos MessageIA Y TAMBIÉN la función createMessage desde tu entidad
import { MessageIA, createMessage } from "@features/chatIA/domain/entities/MessageIA";

export class SendMessageIAUseCase {
    constructor(private readonly chatRepository: ChatIARepository) {}

    async execute(
        userInput: string,
        history: MessageIA[]
    ): Promise<{ userMessage: MessageIA; assistantMessage: MessageIA }> { 

        // 1. Validación de negocio
        if (!userInput.trim()) {
            throw new Error('El mensaje no puede estar vacío');
        }

        const cleanInput = userInput.trim();

        // 2. Creamos los mensajes usando tu fábrica 'createMessage'
        // (¡Ahora TypeScript sabe que 'content' es lo correcto internamente!)
        const userMessage = createMessage('user', cleanInput);
        
        // 3. Enviamos el texto al repositorio de la IA
        const responseText = await this.chatRepository.sendMessage(cleanInput, history);
        
        // 4. Creamos el mensaje de respuesta de la IA
        const assistantMessage = createMessage('assistant', responseText);

        // 5. Devolvemos el resultado listo para tu UI
        return { userMessage, assistantMessage };
    }
}