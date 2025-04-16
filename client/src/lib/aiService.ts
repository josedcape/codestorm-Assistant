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
    apiKeyType: 'GOOGLE_API_KEY',
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

// Este servicio manejaría las llamadas a la API de IA
export class AIService {
  private apiKey: string | null = null;
  private model: AIModel = 'gpt-4o';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  setModel(model: AIModel) {
    this.model = model;
  }

  async generateResponse(prompt: string, code?: string): Promise<string> {
    // Esta es una implementación simulada
    // En una aplicación real, aquí se conectaría con la API de IA
    if (!this.apiKey) {
      throw new Error("API key not set. Please configure your API key.");
    }

    // Simular una respuesta
    console.log(`Sending request to ${this.model} API with prompt: ${prompt.substring(0, 50)}...`);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `Respuesta simulada del modelo ${this.model}. En una implementación real, esto vendría de la API.`;
  }

  async executeCommand(command: string): Promise<string> {
    // Simular la ejecución de un comando
    console.log(`Executing command: ${command}`);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (command.toLowerCase().includes('error')) {
      throw new Error("Command execution failed");
    }
    
    return `Executed: ${command}\nOutput: Comando ejecutado con éxito.`;
  }
}

export const aiService = new AIService();