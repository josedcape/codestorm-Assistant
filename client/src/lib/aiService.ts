import { useState } from 'react';

export type AIModel = 'gpt-4o' | 'gemini-2.5' | 'claude-3-7' | 'claude-3-5-sonnet-v2' | 'qwen-2.5-omni-7b';

interface AIServiceProps {
  model?: AIModel;
}

export const useAIService = (props?: AIServiceProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApiKeyForModel = (model: AIModel): string | null => {
    switch (model) {
      case 'gpt-4o':
        return localStorage.getItem('openai_api_key');
      case 'gemini-2.5':
        return localStorage.getItem('google_api_key');
      case 'claude-3-7':
      case 'claude-3-5-sonnet-v2':
        return localStorage.getItem('anthropic_api_key');
      case 'qwen-2.5-omni-7b':
        return localStorage.getItem('alibaba_api_key');
      default:
        return null;
    }
  };

  const generateResponse = async (
    prompt: string, 
    model: AIModel = props?.model || 'gpt-4o',
    options?: {
      temperature?: number;
      systemPrompt?: string;
      maxTokens?: number;
    }
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiKey = getApiKeyForModel(model);
      
      if (!apiKey) {
        setError(`No se ha configurado una API key para el modelo ${model}`);
        return null;
      }

      // En un entorno real, aquí se realizaría la llamada a la API correspondiente
      // Por ahora, simulamos una respuesta
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Respuesta simulada
      return {
        text: `Esta es una respuesta simulada para el prompt: ${prompt.substring(0, 50)}...`,
        model,
        usage: {
          promptTokens: Math.floor(prompt.length / 4),
          completionTokens: 150,
          totalTokens: Math.floor(prompt.length / 4) + 150
        }
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al generar respuesta';
      setError(errorMessage);
      console.error('Error en la generación de respuesta:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const executeCode = async (code: string, language: string = 'javascript') => {
    try {
      setIsLoading(true);
      setError(null);

      // En un entorno real, aquí se realizaría la ejecución del código
      // Por ahora, simulamos una respuesta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Respuesta simulada
      return {
        result: `Resultado de la ejecución de ${language}: Código ejecutado correctamente`,
        logs: ['Console output line 1', 'Console output line 2'],
        error: null
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al ejecutar código';
      setError(errorMessage);
      console.error('Error en la ejecución de código:', err);
      return {
        result: null,
        logs: [],
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const checkApiKeyStatus = (model: AIModel): boolean => {
    const apiKey = getApiKeyForModel(model);
    return !!apiKey && apiKey.length > 10; // Verificación simple
  };

  return {
    generateResponse,
    executeCode,
    checkApiKeyStatus,
    isLoading,
    error
  };
};