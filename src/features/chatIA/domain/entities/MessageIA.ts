export type MessageRole = 'user' | 'assistant';

export interface MessageIA {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
}

export const createMessage = (
    role: MessageRole,
    content: string
): MessageIA => ({
    id: Date.now().toString(),
    role,
    content,
    timestamp: new Date(),
})