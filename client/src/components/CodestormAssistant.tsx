import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIModel, MODEL_INFO } from '@/lib/aiService';
import { 
  Bot, 
  X, 
  Mic, 
  Upload, 
  Send, 
  Code,
  MessageSquare,
  Terminal,
  Copy,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Settings,
  Trash2,
  Save,
  Maximize2,
  Minimize2,
  List,
  MessageCircle,
  PlusCircle,
  FilePlus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { RobotLogo } from './RobotLogo';
import VoiceRecognition from './VoiceRecognition';
import FileUploader from './FileUploader';
import TerminalView from './TerminalView';
import ModelSelector from './ModelSelector';
import AgentSelector from './AgentSelector';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';

// Interfaces
interface Conversation {
  id: string;
  title: string;
  date: Date;
  messages: Message[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  language?: string;
  timestamp?: Date;
}

export interface CodestormAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const CodestormAssistant: React.FC<CodestormAssistantProps> = ({ 
  isOpen = false, 
  onClose = () => {} 
}) => {
  // Estados
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showFileCreateDialog, setShowFileCreateDialog] = useState(false);
  const [newFileData, setNewFileData] = useState<{
    content: string;
    language: string;
    suggestedName: string;
  }>({ content: '', language: '', suggestedName: '' });
  const [files, setFiles] = useState<string[]>([]); // Add state for files

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();

  // Contexto
  const { 
    selectedModel, 
    setSelectedModel,
    currentAgent,
    setCurrentAgent,
    developmentMode,
    setDevelopmentMode,
    addMessage,
    terminalLines,
    activeTab: editorTab,
    currentConversation,
    clearConversation,
    executeCommand
  } = useAppContext();

  // Cargar conversaciones guardadas
  useEffect(() => {
    const savedConversations = localStorage.getItem('codestorm_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Convertir las fechas de string a Date
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          date: new Date(conv.date),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }))
        }));
        setConversations(conversationsWithDates);
      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
      }
    }
  }, []);

  // Guardar conversaciones cuando cambian
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('codestorm_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Handlers
  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      // Agregar mensaje del usuario
      const userContent = message;
      addMessage(
        userContent, 
        'user', 
        editorTab?.content,
        editorTab?.language
      );

      setMessage('');

      // Enviar petición a la API según el modelo seleccionado
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userContent,
          model: selectedModel,
          code: editorTab?.content,
          agent: currentAgent
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Agregar respuesta del asistente
        addMessage(
          data.response, 
          'assistant'
        );
      } else {
        // Agregar mensaje de error
        addMessage(
          `⚠️ **Error**: ${data.error || 'Hubo un problema al conectar con el asistente de IA.'}`,
          'assistant'
        );
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      addMessage(
        '⚠️ **Error de conexión**: No se pudo conectar con el servicio. Por favor, intenta nuevamente más tarde.',
        'assistant'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setMessage(prev => prev + ' ' + transcript);
    setShowVoiceInput(false);
  };

  const handleFileUpload = (file: File, content: string) => {
    // Agregar mensaje con el archivo
    addMessage(
      `He subido un archivo: ${file.name}`,
      'user',
      content,
      file.type.includes('javascript') ? 'javascript' : 
      file.type.includes('typescript') ? 'typescript' :
      file.type.includes('python') ? 'python' :
      file.type.includes('html') ? 'html' :
      file.type.includes('css') ? 'css' : 
      file.type.includes('markdown') || file.type.includes('md') ? 'markdown' :
      file.type.includes('json') ? 'json' :
      file.type.includes('xml') ? 'xml' :
      'text'
    );

    setShowFileUpload(false);
  };

  const handleCopyMessage = (messageContent: string, messageId: string) => {
    navigator.clipboard.writeText(messageContent)
      .then(() => {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
        toast({
          title: "Copiado al portapapeles",
          description: "El mensaje ha sido copiado correctamente",
        });
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar el mensaje",
          variant: "destructive"
        });
      });
  };

  const handleSaveConversation = () => {
    if (!currentConversation || !currentConversation.messages || currentConversation.messages.length === 0) {
      toast({
        title: "No hay conversación para guardar",
        description: "Inicia una conversación primero",
        variant: "destructive"
      });
      return;
    }

    setNewConversationTitle(
      `Conversación ${new Date().toLocaleString('es-ES', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })}`
    );
    setShowSaveDialog(true);
  };

  const saveConversation = () => {
    if (!newConversationTitle.trim()) return;

    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: newConversationTitle,
      date: new Date(),
      messages: currentConversation?.messages || []
    };

    setConversations(prev => [newConversation, ...prev]);
    setShowSaveDialog(false);

    toast({
      title: "Conversación guardada",
      description: "La conversación se ha guardado correctamente"
    });
  };

  const loadConversation = (conversation: Conversation) => {
    // Implementar lógica para cargar conversación
    if (conversation.messages.length > 0) {
      clearConversation();
      conversation.messages.forEach(msg => {
        addMessage(
          msg.content,
          msg.role,
          msg.code,
          msg.language
        );
      });
      setShowConversations(false);
      toast({
        title: "Conversación cargada",
        description: `${conversation.title} cargada correctamente`
      });
    }
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(conv => conv.id !== id));
    toast({
      title: "Conversación eliminada",
      description: "La conversación ha sido eliminada"
    });
  };

  const handleCreateFile = () => {
    // Placeholder for creating a file and updating the file explorer.  Replace with actual file system interaction
    const fileName = `new_file_${Date.now()}.txt`;
    const newFileContent = message.content; // Assuming message.content holds the content to save

    //Simulate adding the file
    setFiles([...files, fileName]);

    console.log(`Created file: ${fileName} with content: ${newFileContent}`);
    toast({
      title: "Archivo creado",
      description: `El archivo ${fileName} se ha creado correctamente`
    });
  };


  // Verificar si hay mensajes en la conversación actual
  const hasMessages = currentConversation?.messages && currentConversation.messages.length > 0;

  // Auto-scroll cuando se agregan nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current && hasMessages) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [hasMessages, currentConversation?.messages]);

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isMobile ? 0 : 300 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col bg-slate-900 border-l border-slate-800 h-full transition-all duration-300 ${
        expanded ? 'expanded-chat' : isMobile ? 'w-full' : 'max-w-[400px]'
      }`}
      style={{ width: isMobile ? '100%' : 'auto' }}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center">
          <div className="h-8 w-8 mr-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <RobotLogo />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            CODESTORM AI
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowConversations(!showConversations)}
            className="text-slate-400 hover:text-white"
            title="Mostrar conversaciones"
          >
            <List size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-white"
            title={expanded ? "Reducir panel" : "Expandir panel"}
          >
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white"
            title="Cerrar asistente"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Panel lateral de conversaciones */}
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {showConversations && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: isMobile ? '100%' : 250 }}
              exit={{ opacity: 0, width: 0 }}
              className="border-r border-slate-800 overflow-hidden flex flex-col"
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              <div className="p-3 border-b border-slate-800">
                <h3 className="font-medium mb-2">Conversaciones</h3>
                <div className="relative">
                  <Input
                    placeholder="Buscar conversación..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">
                      {searchQuery ? "No se encontraron resultados" : "No hay conversaciones guardadas"}
                    </div>
                  ) : (
                    filteredConversations.map(conv => (
                      <div 
                        key={conv.id}
                        onClick={() => loadConversation(conv)}
                        className="p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="truncate pr-2 flex-1">
                            <div className="font-medium text-sm">{conv.title}</div>
                            <div className="text-xs text-slate-400">
                              {conv.date.toLocaleDateString('es-ES', { 
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit'
                              })}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-red-400"
                            onClick={(e) => deleteConversation(conv.id, e)}
                            title="Eliminar conversación"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-slate-800">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs flex items-center"
                  onClick={handleSaveConversation}
                >
                  <Save size={14} className="mr-1" />
                  Guardar actual
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Pestañas */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-3 mx-4 mt-2">
              <TabsTrigger value="chat" className="text-xs">
                <MessageSquare size={14} className="mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs">
                <Code size={14} className="mr-1" />
                Código
              </TabsTrigger>
              <TabsTrigger value="terminal" className="text-xs">
                <Terminal size={14} className="mr-1" />
                Terminal
              </TabsTrigger>
            </TabsList>

            {/* Contenido de Chat */}
            <TabsContent value="chat" className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* Panel flotante de configuración */}
              <div className={`agent-panel ${showAgentPanel ? 'visible' : ''}`}>
                <div className="mb-4 pb-4 border-b border-slate-800">
                  <ModelSelector 
                    currentModel={selectedModel}
                    onModelChange={(model) => setSelectedModel(model as AIModel)}
                    developmentMode={developmentMode}
                    onDevelopmentModeChange={setDevelopmentMode}
                  />
                </div>

                <div className="mb-4">
                  <AgentSelector 
                    currentAgent={currentAgent}
                    onAgentChange={setCurrentAgent}
                  />
                </div>
              </div>

              {/* Botón flotante para mostrar/ocultar panel */}
              <button 
                className="agent-panel-toggle"
                onClick={() => setShowAgentPanel(!showAgentPanel)}
                title={showAgentPanel ? "Ocultar configuración" : "Mostrar configuración"}
              >
                {showAgentPanel ? <ChevronUp size={20} /> : <Settings size={20} />}
              </button>

              {/* Mensajes */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
              >
                {!hasMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm px-4 text-center">
                    <Bot size={36} className="mb-2 text-slate-500" />
                    <p>Inicia una nueva conversación con el asistente de CODESTORM AI.</p>
                    <p className="mt-2">Puedes pedirme ayuda con tu código, resolver dudas, crear archivos o ejecutar comandos.</p>
                  </div>
                ) : (
                  currentConversation?.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`
                        max-w-[80%] rounded-lg p-3 group relative
                        ${msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none'}
                      `}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center mb-1">
                            <Avatar className="h-6 w-6 mr-2 bg-slate-700">
                              <RobotLogo />
                            </Avatar>
                            <span className="text-xs font-medium">CODESTORM AI</span>
                          </div>
                        )}

                        <div className="text-sm whitespace-pre-wrap">
                          <ReactMarkdown
                            components={{
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {msg.code && (
                          <div className="mt-2 bg-slate-950 rounded p-2 text-xs font-mono overflow-x-auto">
                            <pre>{msg.code}</pre>
                          </div>
                        )}

                        {/* Botón de copiar */}
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 bg-slate-700"
                            onClick={() => handleCopyMessage(msg.content, msg.id)}
                            title="Copiar mensaje"
                          >
                            {copiedMessageId === msg.id ? (
                              <CheckCircle size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </Button>

                          {msg.role === 'assistant' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={handleCreateFile}
                              className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 bg-slate-700"
                              title="Crear archivo con este contenido"
                            >
                              <FilePlus size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-lg p-3 max-w-[80%] rounded-tl-none">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2 bg-slate-700">
                          <RobotLogo />
                        </Avatar>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Entrada de texto */}
              <div className="mt-4">
                <AnimatePresence>
                  {showVoiceInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 bg-slate-800 rounded-lg p-4"
                    >
                      <VoiceRecognition onTranscript={handleVoiceInput} />
                    </motion.div>
                  )}

                  {showFileUpload && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 bg-slate-800 rounded-lg p-4"
                    >
                      <FileUploader onFileUploaded={handleFileUpload} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="min-h-[80px] pr-[90px] bg-slate-800 border-slate-700 resize-none"
                    disabled={isProcessing}
                  />

                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    <Button
                      onClick={() => {
                        setShowVoiceInput(!showVoiceInput);
                        setShowFileUpload(false);
                      }}
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${showVoiceInput ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                      title="Entrada por voz"
                    >
                      <Mic size={16} />
                    </Button>

                    <Button
                      onClick={() => {
                        setShowFileUpload(!showFileUpload);
                        setShowVoiceInput(false);
                      }}
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${showFileUpload ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                      title="Subir archivo"
                    >
                      <Upload size={16} />
                    </Button>

                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isProcessing}
                      variant="default"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-blue-600 text-white"
                      title="Enviar mensaje"
                    >
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Contenido de Código */}
            <TabsContent value="code" className="flex-1 overflow-hidden p-4">
              <div className="flex flex-col h-full">
                <h4 className="font-medium mb-2">Código Actual</h4>
                {editorTab ? (
                  <div className="flex-1 bg-slate-800 rounded-lg p-4 overflow-y-auto">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <div>{editorTab.filepath}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          navigator.clipboard.writeText(editorTab.content);
                          toast({
                            title: "Código copiado",
                            description: "El código ha sido copiado al portapapeles"
                          });
                        }}
                        title="Copiar código"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                    <pre className="text-sm font-mono overflow-x-auto">
                      {editorTab.content}
                    </pre>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-center p-4 bg-slate-800 rounded-lg">
                    <p>No hay ningún archivo abierto en el editor</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Contenido de Terminal */}
            <TabsContent value="terminal" className="flex-1 overflow-hidden p-4">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Terminal</h4>
                  <div className="flex space-x-1">
                    <Input 
                      placeholder="Ejecutar comando..." 
                      className="h-8 text-xs bg-slate-800 border-slate-700"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          const command = e.currentTarget.value;
                          e.currentTarget.value = '';
                          try {
                            await executeCommand(command);
                            toast({
                              title: "Comando ejecutado",
                              description: `"${command}" se ha ejecutado correctamente`
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "No se pudo ejecutar el comando",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="default"
                      className="h-8 px-2"
                    >
                      <Terminal size={14} />
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <TerminalView lines={terminalLines} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Diálogo para guardar conversación */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>Guardar conversación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Título de la conversación"
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveConversation} disabled={!newConversationTitle.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export const CodestormAssistantButton: React.FC<{onClick: () => void}> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 fixed bottom-6 right-6 shadow-lg z-50"
    >
      <Bot size={24} />
    </Button>
  );
};

export default CodestormAssistant;