import { useState } from 'react';
import { aiService } from '@/lib/aiService';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente CODESTORM AI. ¿Cómo puedo ayudarte con tu proyecto hoy?',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = async (content: string, code?: string, language?: string) => {
    if (!content.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      code,
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Obtener el historial de mensajes para contexto
      const messageHistory = messages
        .slice(-10) // Limitar a los últimos 10 mensajes para no exceder límites
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Generar respuesta de la IA
      const responseText = await aiService.generateResponse(content, code);

      // Crear mensaje de respuesta
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      
      // Mensaje de error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeCommand = async (command: string) => {
    try {
      return await aiService.executeCommand(command);
    } catch (error) {
      console.error('Error ejecutando comando:', error);
      throw error;
    }
  };

  const clearMessages = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: '¡Hola! Soy tu asistente CODESTORM AI. ¿Cómo puedo ayudarte hoy?',
      timestamp: new Date()
    }]);
  };

  return {
    messages,
    sendMessage,
    clearMessages,
    isProcessing,
    executeCommand
  };
}