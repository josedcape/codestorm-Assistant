import React, { useState } from 'react';
import { Mic, Send, X, Settings, MessageSquare, History, Cog, Play } from 'lucide-react';

// Tipos para los mensajes y modelos de IA
interface Message {
  id: string;
  content: string;
  role: 'assistant' | 'user';
  timestamp: Date;
}

type AIModel = 'gpt' | 'gemini' | 'claude' | 'custom';

interface ModelOption {
  id: AIModel;
  name: string;
  version: string;
  date: string;
}

const CodestormAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'settings' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente CODESTORM AI. ¿Cómo puedo ayudarte con tu código hoy?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [autoMode, setAutoMode] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Opciones de modelos disponibles
  const availableModels: ModelOption[] = [
    { id: 'gpt', name: 'API GPT', version: '4.0', date: 'Mayo 2024' },
    { id: 'gemini', name: 'Gemini 2.5', version: 'Marzo 2025', date: 'Marzo 2025' },
    { id: 'claude', name: 'Claude 3.5', version: 'Sonnet', date: 'Febrero 2025' },
    { id: 'custom', name: 'API Custom', version: 'Personal', date: '' },
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simular respuesta del asistente (en una aplicación real, aquí iría la llamada a la API)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Estoy procesando tu solicitud. En un momento tendré una respuesta para ti.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className={`codestorm-assistant-panel ${!isOpen ? 'codestorm-assistant-collapsed' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-blue-500">
        <h3 className="font-bold text-lg">CODESTORM AI</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-blue-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-blue-500">
        <div 
          className={`codestorm-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </div>
        <div 
          className={`codestorm-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Avanzado
        </div>
        <div 
          className={`codestorm-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="codestorm-chat-container">
            <div className="codestorm-messages">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`codestorm-message ${message.role === 'assistant' 
                    ? 'codestorm-message-assistant' 
                    : 'codestorm-message-user'}`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            
            <div className="codestorm-input">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
              />
              <button 
                className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSendMessage}
              >
                <Send size={16} />
              </button>
              <button className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                <Mic size={16} />
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="p-4 space-y-6">
            <h4 className="font-semibold text-sm text-muted-foreground">Configuración del Asistente</h4>
            
            {/* Selección de modelo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Modelo AI</label>
              <div className="grid grid-cols-2 gap-2">
                {availableModels.map(model => (
                  <div 
                    key={model.id}
                    className={`border ${selectedModel === model.id 
                      ? 'border-primary bg-blue-900/20' 
                      : 'border-border'} 
                      rounded-md p-2 cursor-pointer text-xs`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="font-semibold">{model.name}</div>
                    <div className="text-muted-foreground">{model.version}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modo autónomo */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Modo autónomo (sin confirmaciones)
              </label>
              <div 
                className={`w-10 h-5 rounded-full ${autoMode ? 'bg-blue-600' : 'bg-muted'} 
                  relative cursor-pointer transition-colors`}
                onClick={() => setAutoMode(!autoMode)}
              >
                <div 
                  className={`absolute top-0.5 ${autoMode ? 'right-0.5' : 'left-0.5'} 
                    w-4 h-4 rounded-full bg-white transition-all`}
                />
              </div>
            </div>
            
            {/* API Key */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">API Key personalizada</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu API key"
                className="w-full p-2 border border-border rounded-md bg-card text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Opcional: Configura tu propia API key para utilizar tu cuenta de OpenAI/API.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-4">Historial de Conversaciones</h4>
            
            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">
                No hay conversaciones guardadas en el historial.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente botón para abrir el asistente
export const CodestormAssistantButton: React.FC<{onClick: () => void}> = ({ onClick }) => {
  return (
    <button 
      className="codestorm-button"
      onClick={onClick}
    >
      <Play className="mr-2" size={16} />
      Ejecutar
    </button>
  );
};

export default CodestormAssistant;