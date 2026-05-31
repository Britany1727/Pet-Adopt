import { useState, useCallback } from 'react';
import { MessageIA } from '@features/chatIA/domain/entities/MessageIA';
import { SendMessageIAUseCase } from '@features/chatIA/application/usecases/SendMessageIAUseCase';
import { ChatIARepositoryImpl } from '../../data/repositories/ChatRepositoryImpl';
import * as Speech from 'expo-speech';
import { Message } from '@features/chat/domain/entities/Message';

// Inyección de dependencias: el hook construye el grafo de objetos
const sendMessageUseCase = new SendMessageIAUseCase(new ChatIARepositoryImpl());

export const useChat = () => {
  const [messages, setMessages] = useState<MessageIA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userInput: string) => {
    
    setIsLoading(true);
    setError(null);
    try {
      const { userMessage, assistantMessage } =
        await sendMessageUseCase.execute(userInput, messages);
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      const cleanText = assistantMessage.content
        .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`[^`]*`/g, '')
        .replace(/[#*_`\[\]]/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      Speech.speak(cleanText, {
        language: 'es-ES',
        pitch: 1.0,
        rate: 1.0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
};
