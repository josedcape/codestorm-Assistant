import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIService } from '@/lib/aiService';
import { MessageSquare, Code, Upload, Settings, X, Send, Loader2, User, Bot, Plus, Trash, Save, RotateCcw, AlertCircle } from 'lucide-react';
import ModelSelector, { AIModel } from './ModelSelector';
import VoiceRecognition from './VoiceRecognition';
import FileUploader from './FileUploader';
import TerminalIntegration from './TerminalIntegration';
import ApiKeyConfig from './ApiKeyConfig';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  language?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  date: Date;
  model: AIModel;
}

interface AIAssistantProps {
  onClose: () => void;
  currentCode: string;
  currentLanguage: string;
  developmentMode: 'interactive' | 'autonomous';
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  onClose, 
  currentCode, 
  currentLanguage,
  developmentMode = 'interactive'
}) => {
  const [pendingAction, setPendingAction] = useState<{
    type: 'install' | 'create' | 'modify';
    description: string;
    execute: () => Promise<void>;
  } | null>(null);

  const [currentDevelopmentMode, setCurrentDevelopmentMode] = useState<'interactive' | 'autonomous'>(developmentMode);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "¡Hola! Soy tu asistente CODESTORM AI. ¿Cómo puedo ayudarte con tu código hoy?"
    }
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [currentModel, setCurrentModel] = useState<AIModel>('gpt-4o');
  const [uploadedFile, setUploadedFile] = useState<{name: string, content: string} | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateResponse, isLoading } = useAIService();

  // Cargar conversaciones guardadas cuando se monte el componente
  useEffect(() => {
    const savedConversations = localStorage.getItem('codestorm_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Convertir las fechas de string a Date
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          date: new Date(conv.date)
        }));
        setConversations(conversationsWithDates);
      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Asegurar que el componente sea visible cuando se monte
    const element = document.querySelector('.ai-assistant-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Actualizar el modo de desarrollo cuando cambia el prop
  useEffect(() => {
    setCurrentDevelopmentMode(developmentMode);
  }, [developmentMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const executeAction = async (action: typeof pendingAction) => {
    if (!action) return;
    try {
      await action.execute();
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Acción completada: ${action.description}`
      }]);
    } catch (error) {
      console.error('Error executing action:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Error al ejecutar la acción: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }]);
    }
    setPendingAction(null);
  };

  const handleSendMessage = async (inputPrompt?: string) => {
    const messageToSend = inputPrompt || prompt;
    if (!messageToSend.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');

    try {
      // Verificar si hay clave API configurada para el modelo actual
      const apiKey = localStorage.getItem(`${currentModel.split('-')[0]}_api_key`);
      if (!apiKey) {
        setMessages(prev => [
          ...prev, 
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Por favor, configura tu clave API para ${currentModel} en el panel de Configuración > API Keys para poder usar este modelo.`
          }
        ]);
        return;
      }

      // Use AI service to generate response
      const codeContext = currentCode.length > 0 
        ? `Usuario está trabajando con este código:\n\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\``
        : '';

      const fileContext = uploadedFile 
        ? `\n\nEl usuario ha subido un archivo llamado "${uploadedFile.name}" con el siguiente contenido:\n\n\`\`\`\n${uploadedFile.content}\n\`\`\``
        : '';

      const modelContext = `Eres un asistente de programación experto usando el modelo ${currentModel}. Responde en español.`;

      const fullContext = modelContext + (codeContext ? `\n\n${codeContext}` : '') + (fileContext ? `\n\n${fileContext}` : '');

      const response = await generateResponse(messageToSend, fullContext, '', currentModel);

      // Parse response to extract code blocks if present
      let mainContent = response;
      let codeContent = '';
      let codeLang = '';

      // Extract code blocks from markdown
      const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
      const match = codeBlockRegex.exec(response);

      if (match) {
        codeLang = match[1] || currentLanguage;
        codeContent = match[2];
        mainContent = response.replace(codeBlockRegex, '');
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mainContent.trim()
      };

      if (codeContent) {
        aiMessage.code = codeContent.trim();
        aiMessage.language = codeLang;
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Add error message
      setMessages(prev => [
        ...prev, 
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Lo siento, encontré un error al procesar tu solicitud. Por favor, intenta de nuevo.'
        }
      ]);
    }
  };

  const handleTerminalCommand = async (command: string): Promise<string> => {
    try {
      // Enviar el comando al servidor para ejecución real
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error('Error al ejecutar el comando');
      }

      const result = await response.json();
      return result.output;
    } catch (error) {
      console.error('Error executing command:', error);
      return `Error: No se pudo ejecutar el comando "${command}"`;
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setPrompt(transcript);
    // Uncomment to auto-send voice commands
    // handleSendMessage(transcript);
  };

  const handleFileUpload = (file: File, content: string) => {
    setUploadedFile({
      name: file.name,
      content: content
    });

    // Notify the user that the file was uploaded
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Archivo "${file.name}" cargado correctamente. Puedes hacer preguntas sobre este archivo.`
      }
    ]);
  };

  const saveCurrentConversation = () => {
    if (messages.length <= 1) {
      return; // No guardar si solo está el mensaje inicial
    }

    const title = newConversationTitle.trim() || `Conversación ${new Date().toLocaleString()}`;

    const conversation: Conversation = {
      id: currentConversationId || Date.now().toString(),
      title,
      messages,
      date: new Date(),
      model: currentModel
    };

    setConversations(prev => {
      // Si ya existe, actualizarlo
      if (currentConversationId) {
        return prev.map(conv => 
          conv.id === currentConversationId ? conversation : conv
        );
      }
      // Si es nuevo, agregarlo al inicio
      return [conversation, ...prev];
    });

    // Guardar en localStorage
    const updatedConversations = currentConversationId 
      ? conversations.map(conv => conv.id === currentConversationId ? conversation : conv)
      : [conversation, ...conversations];

    localStorage.setItem('codestorm_conversations', JSON.stringify(updatedConversations));

    setCurrentConversationId(conversation.id);
    setShowSaveDialog(false);
    setNewConversationTitle('');
  };

  const loadConversation = (conversation: Conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setCurrentModel(conversation.model);
    setActiveTab('chat');
  };

  const startNewConversation = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "¡Hola! Soy tu asistente CODESTORM AI. ¿Cómo puedo ayudarte con tu código hoy?"
    }]);
    setCurrentConversationId(null);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.id !== id);
      localStorage.setItem('codestorm_conversations', JSON.stringify(filtered));
      return filtered;
    });

    if (currentConversationId === id) {
      startNewConversation();
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="futuristic-container border-l silver-border w-80 flex-shrink-0 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b silver-border flex justify-between items-center bg-slate-800">
        <h1 className="futuristic-title text-xl">CODESTORM AI</h1>
        <button 
          className="p-1 hover:text-red-400 transition-colors"
          onClick={onClose}
          title="Cerrar asistente"
        >
          <X size={18} />
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger 
              value="chat" 
              className="flex-1 py-2 data-[state=active]:bg-slate-700 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-amber-400"
            >
              <MessageSquare size={16} className="mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="flex-1 py-2 data-[state=active]:bg-slate-700 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-amber-400"
            >
              <Bot size={16} className="mr-1" />
              Asistente
            </TabsTrigger>
            <TabsTrigger 
              value="convos" 
              className="flex-1 py-2 data-[state=active]:bg-slate-700 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-amber-400"
            >
              <MessageSquare size={16} className="mr-1" />
              Historial
            </TabsTrigger>
          </TabsList>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white"
          >
            <Settings size={16} />
          </Button>
        </div>

        {showSettings && (
          <div className="p-3 mb-3 bg-slate-800 rounded-md border border-slate-700">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Configuración del Asistente</h3>
            <Tabs defaultValue="model" className="w-full">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="model">Modelo</TabsTrigger>
                <TabsTrigger value="api">API Keys</TabsTrigger>
              </TabsList>
              <TabsContent value="model">
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  autonomousMode={autonomousMode}
                  onAutonomousModeChange={setAutonomousMode}
                />
              </TabsContent>
              <TabsContent value="api">
                <ApiKeyConfig />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
          <ScrollArea className="flex-1 p-3 h-[calc(100vh-250px)]" style={{ overflow: 'auto' }}>
            <div className="space-y-4 min-h-full">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="rounded-full bg-blue-800 w-8 h-8 flex items-center justify-center flex-shrink-0 silver-border">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}

                  <div 
                    className={`${
                      message.role === 'user' 
                        ? 'mr-2 bg-slate-700' 
                        : 'ml-2 futuristic-container'
                    } rounded-lg p-2 max-w-[85%]`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                    {message.code && (
                      <div className="bg-slate-950 p-2 rounded text-xs font-mono mt-2 border border-slate-800">
                        <ScrollArea className="w-full" style={{ overflow: 'auto' }}>
                          <pre className="text-green-400">{message.code}</pre>
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="rounded-full bg-slate-600 w-8 h-8 flex items-center justify-center flex-shrink-0 silver-border">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-3 border-t silver-border">
            <div className="flex justify-between mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSaveDialog(true)}
                className="text-xs"
              >
                <Save size={14} className="mr-1" />
                Guardar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startNewConversation}
                className="text-xs"
              >
                <Plus size={14} className="mr-1" />
                Nuevo
              </Button>
            </div>
            <div className="flex">
              <Textarea
                className="flex-1 bg-slate-800 border silver-border rounded-l p-2 text-sm resize-none"
                placeholder="Escribe tu mensaje..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                className="futuristic-button rounded-l-none px-3"
                onClick={() => handleSendMessage()}
                disabled={!prompt.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>

            {/* Dialog para guardar conversación */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogContent className="bg-slate-800 border silver-border">
                <DialogHeader>
                  <DialogTitle>Guardar Conversación</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Título</label>
                    <Input 
                      value={newConversationTitle} 
                      onChange={(e) => setNewConversationTitle(e.target.value)}
                      placeholder="Nombre de la conversación"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={saveCurrentConversation}>Guardar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="convos" className="flex-1 overflow-y-auto p-3 m-0">
          <div className="mb-4">
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div className="space-y-3">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conversation => (
                <div 
                  key={conversation.id} 
                  className="futuristic-container p-3 silver-border cursor-pointer transition-colors hover:bg-slate-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => loadConversation(conversation)}>
                      <h3 className="text-sm font-medium text-white">{conversation.title}</h3>
                      <p className="text-xs text-slate-400">
                        {new Date(conversation.date).toLocaleString()} • {conversation.model}
                      </p>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {conversation.messages[conversation.messages.length - 1].content}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-red-400"
                      onClick={() => deleteConversation(conversation.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-400">
                <p>No hay conversaciones guardadas</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="voice" className="flex-1 overflow-y-auto p-3 m-0 space-y-4">
          <VoiceRecognition onTranscript={handleVoiceTranscript} />

          <div className="futuristic-container p-3">
            <h3 className="gold-accent mb-2 font-semibold">Comandos de Ejemplo</h3>
            <ul className="text-sm space-y-2">
              <li className="p-2 bg-slate-800 rounded-md hover:bg-slate-700 cursor-pointer transition-colors">
                "Crea un componente React para mostrar una galería de imágenes"
              </li>
              <li className="p-2 bg-slate-800 rounded-md hover:bg-slate-700 cursor-pointer transition-colors">
                "Genera una función para ordenar un array de objetos por fecha"
              </li>
              <li className="p-2 bg-slate-800 rounded-md hover:bg-slate-700 cursor-pointer transition-colors">
                "Explica cómo funcionan los hooks en React"
              </li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="terminal" className="flex-1 overflow-y-auto p-3 m-0">
          {/* Confirmation Dialog */}
          {currentDevelopmentMode === 'interactive' && pendingAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-slate-800 p-4 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-2">Confirmar Acción</h3>
                <p className="text-sm mb-4">{pendingAction.description}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    onClick={() => setPendingAction(null)}
                  >
                    Denegar
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    onClick={() => executeAction(pendingAction)}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}

          <TerminalIntegration onExecuteCommand={handleTerminalCommand} />
        </TabsContent>

        <TabsContent value="files" className="flex-1 overflow-y-auto p-3 m-0">
          <FileUploader onFileUploaded={handleFileUpload} />

          {uploadedFile && (
            <div className="mt-4 futuristic-container p-3">
              <h3 className="gold-accent mb-2 font-semibold">Archivo Cargado</h3>
              <div className="bg-slate-800 p-2 rounded-md">
                <div className="font-medium text-sm">{uploadedFile.name}</div>
                <div className="mt-2 text-xs">
                  <Button 
                    className="futuristic-button text-xs py-1"
                    onClick={() => {
                      setPrompt(`Analiza el contenido del archivo ${uploadedFile.name}`);
                      setActiveTab('chat');
                    }}
                  >
                    Analizar contenido
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assistant" className="flex-1 overflow-y-auto p-3 m-0 space-y-4">
          <div className="futuristic-container silver-border p-3">
            <h3 className="gold-accent mb-2 font-semibold">Asistente de Desarrollo</h3>
            <p className="text-sm mb-3">Selecciona el modo de desarrollo y el modelo de AI que deseas utilizar.</p>

            <ModelSelector 
              currentModel={currentModel} 
              onModelChange={setCurrentModel}
              developmentMode={currentDevelopmentMode}
              onDevelopmentModeChange={setCurrentDevelopmentMode}
            />
          </div>

          <div className="futuristic-container silver-border">
            <h3 className="gold-accent mb-2 font-semibold">Comandos Rápidos</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  setPrompt("Explica el código seleccionado");
                  setActiveTab('chat');
                }}
              >
                <Code size={14} className="mr-2" /> Explicar código
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  setPrompt("Optimiza el rendimiento de este código");
                  setActiveTab('chat');
                }}
              >
                <RotateCcw size={14} className="mr-2" /> Optimizar código
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  setPrompt("Encuentra y corrige errores en este código");
                  setActiveTab('chat');
                }}
              >
                <Code size={14} className="mr-2" /> Depurar código
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default AIAssistant;