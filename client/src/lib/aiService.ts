
// AI Service types and implementation

export type AIModel = 'gpt-4o' | 'gemini-2.5' | 'claude-3-7' | 'claude-3-5-sonnet-v2' | 'qwen-2.5-omni-7b';
export type AgentType = 'dev' | 'architect' | 'advanced';
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
    name: 'GPT-4.0',
    description: 'Modelo multimodal y multilingüe para texto, imágenes y audio',
    apiKeyType: 'OPENAI_API_KEY',
    releaseDate: 'Mayo 2024'
  },
  'gemini-2.5': {
    id: 'gemini-2.5',
    name: 'Gemini 2.5 Pro',
    description: 'Modelo avanzado para texto, audio, imágenes, video y código',
    apiKeyType: 'GEMINI_API_KEY',
    releaseDate: 'Marzo 2025'
  },
  'claude-3-7': {
    id: 'claude-3-7',
    name: 'Claude 3.7',
    description: 'Modelo híbrido para codificación y resolución de problemas complejos',
    apiKeyType: 'ANTHROPIC_API_KEY',
    releaseDate: 'Febrero 2025'
  },
  'claude-3-5-sonnet-v2': {
    id: 'claude-3-5-sonnet-v2',
    name: 'Claude 3.5 Sonnet V2',
    description: 'Equilibrio entre rendimiento y velocidad',
    apiKeyType: 'ANTHROPIC_API_KEY',
    releaseDate: 'Enero 2025'
  },
  'qwen-2.5-omni-7b': {
    id: 'qwen-2.5-omni-7b',
    name: 'Qwen 2.5 Omni 7B',
    description: 'Modelo multimodal para texto, imagen, audio y video',
    apiKeyType: 'LOCAL',
    releaseDate: 'Marzo 2025'
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

class AIService {
  private model: AIModel = 'gpt-4o';

  setModel(model: AIModel) {
    this.model = model;
  }

  async generateResponse(prompt: string, code?: string, agentType: AgentType = 'dev'): Promise<string> {
    try {
      console.log(`AIService: Enviando prompt al servidor usando modelo ${this.model} con agente ${agentType}`);

      // Construir instrucciones según el tipo de agente
      let systemPrompt = "Eres un asistente de programación experto. ";

      switch(agentType) {
        case 'dev':
          systemPrompt += "Especialízate en escribir código limpio y solucionar errores. " +
                         "Genera código sin comentarios y con sintaxis clara. ";
          break;
        case 'architect':
          systemPrompt += "Especialízate en diseñar sistemas y estructuras de código óptimas. " +
                         "Enfócate en patrones de diseño y arquitectura de software. ";
          break;
        case 'advanced':
          systemPrompt += "Tienes capacidades completas para tareas complejas de desarrollo. " +
                         "Puedes implementar soluciones avanzadas y optimizadas. ";
          break;
      }

      // Añadir instrucciones para formato y estilo
      systemPrompt += "Responde en español usando formato Markdown. Utiliza emojis para resaltar puntos importantes. " +
                     "Cuando generes código, hazlo sin comentarios, limpio y con resaltado de sintaxis en bloques de código. " +
                     "Cuando sea apropiado, convierte instrucciones en lenguaje natural a comandos de terminal que puedan ejecutarse.";

      const openaiKey = localStorage.getItem('openai_api_key');
      const anthropicKey = localStorage.getItem('anthropic_api_key');
      const geminiKey = localStorage.getItem('google_api_key');

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openai-key': openaiKey || '',
          'x-anthropic-key': anthropicKey || '',
          'x-gemini-key': geminiKey || ''
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          code,
          agentType,
          systemPrompt
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
      return `⚠️ **Error en la solicitud**\n\nLo siento, ha ocurrido un problema: ${error.message || 'Error desconocido'}. \n\nPor favor, verifica que las claves API estén configuradas correctamente e intenta de nuevo.`;
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

export async function generateAIResponse(
  model: AIModel,
  prompt: string,
  code?: string,
  agentType?: AgentType
): Promise<string> {
  try {
    const openaiKey = localStorage.getItem('openai_api_key');
    const anthropicKey = localStorage.getItem('anthropic_api_key');
    const geminiKey = localStorage.getItem('google_api_key');e.getItem('google_api_key');

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openai-key': openaiKey || '',
        'x-anthropic-key': anthropicKey || '',
        'x-gemini-key': geminiKey || ''
      },
      body: JSON.stringify({
        model,
        prompt,
        code,
        agentType
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la solicitud');
    }

    const data = await response.json();
    return data.response;
  } catch (error: any) {
    console.error('Error al generar respuesta:', error);
    return `Error: ${error.message}`;
  }
}
