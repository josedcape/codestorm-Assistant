
// AI Service types and implementation

export type AIModel = 'gpt-4o' | 'gemini-2.5' | 'claude-3-7' | 'claude-3-5-sonnet-v2' | 'qwen-2.5-omni-7b';
export type AgentType = 'dev' | 'arch' | 'adv';
export type DevelopmentMode = 'interactive' | 'autonomous';

export interface ModelInfo {
  id: AIModel;
  name: string;
  description: string;
  apiKeyType: string;
  releaseDate: string;
}

export const MODEL_INFO: Record<AIModel, ModelInfo> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Modelo multimodal avanzado de OpenAI con comprensión de código mejorada',
    apiKeyType: 'OPENAI_API_KEY',
    releaseDate: '2024'
  },
  'gemini-2.5': {
    id: 'gemini-2.5',
    name: 'Gemini 2.5 Pro',
    description: 'Modelo multimodal de Google con excelente comprensión de contexto',
    apiKeyType: 'GEMINI_API_KEY',
    releaseDate: '2024'
  },
  'claude-3-7': {
    id: 'claude-3-7',
    name: 'Claude 3.5 Sonnet',
    description: 'Modelo de alto rendimiento de Anthropic con comprensión de documentos avanzada',
    apiKeyType: 'ANTHROPIC_API_KEY',
    releaseDate: '2024'
  },
  'claude-3-5-sonnet-v2': {
    id: 'claude-3-5-sonnet-v2',
    name: 'Claude 3.5 Sonnet v2',
    description: 'Versión mejorada del modelo Sonnet de Anthropic',
    apiKeyType: 'ANTHROPIC_API_KEY',
    releaseDate: '2024'
  },
  'qwen-2.5-omni-7b': {
    id: 'qwen-2.5-omni-7b',
    name: 'Qwen 2.5 Omni 7B',
    description: 'Modelo open source optimizado para tareas de código',
    apiKeyType: 'LOCAL',
    releaseDate: '2024'
  }
};

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  date: Date;
  model: AIModel;
}

// Implementación real con conexión a APIs
export class AIService {
  private model: AIModel = 'gpt-4o';

  setModel(model: AIModel) {
    this.model = model;
  }

  async generateResponse(prompt: string, code?: string): Promise<string> {
    try {
      console.log(`AIService: Enviando prompt al servidor usando modelo ${this.model}`);
      
      // Obtener API key del backend para mantenerla segura
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          code,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error del servidor:', data);
        throw new Error(data.error || 'Error al comunicarse con la API de IA');
      }

      if (data.warning) {
        console.warn('Advertencia del servidor:', data.warning);
      }
      
      if (!data.response) {
        throw new Error('La respuesta del servidor no contiene el campo "response"');
      }
      
      console.log('AIService: Respuesta recibida correctamente');
      return data.response;
    } catch (error: any) {
      console.error('Error en generación de respuesta:', error);
      // Devolver un mensaje de error más amigable para el usuario
      return `Lo siento, ha ocurrido un error al procesar tu solicitud: ${error.message || 'Error desconocido'}. Por favor, verifica que las claves API estén configuradas correctamente e intenta de nuevo.`;
    }
  }

  async executeCommand(command: string): Promise<string> {
    try {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al ejecutar el comando');
      }

      const data = await response.json();
      return data.output;
    } catch (error) {
      console.error('Error ejecutando comando:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
