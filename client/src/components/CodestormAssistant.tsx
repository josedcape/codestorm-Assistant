import React, { useState, useRef } from 'react';
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
  Terminal
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
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
    currentConversation
  } = useAppContext();

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
      
      // Simular respuesta del asistente después de 1 segundo
      setTimeout(() => {
        addMessage(
          `Esta es una respuesta simulada del asistente de IA. En una implementación real, esto sería generado por ${MODEL_INFO[selectedModel].name}.`,
          'assistant'
        );
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
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
      file.type.includes('css') ? 'css' : 'text'
    );
    
    setShowFileUpload(false);
  };

  // Verificar si hay mensajes en la conversación actual
  const hasMessages = currentConversation?.messages && currentConversation.messages.length > 0;

  // Auto-scroll cuando se agregan nuevos mensajes
  React.useEffect(() => {
    if (chatContainerRef.current && hasMessages) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [hasMessages, currentConversation?.messages]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full max-w-[400px] bg-slate-900 border-l border-slate-800 h-full"
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
        <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={18} />
        </Button>
      </div>
      
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
          {/* Configuración del modelo */}
          <div className="mb-4 pb-4 border-b border-slate-800">
            <ModelSelector 
              currentModel={selectedModel}
              onModelChange={(model) => setSelectedModel(model as AIModel)}
              developmentMode={developmentMode}
              onDevelopmentModeChange={setDevelopmentMode}
            />
          </div>
          
          {/* Selector de agente */}
          <div className="mb-4">
            <AgentSelector 
              currentAgent={currentAgent}
              onAgentChange={setCurrentAgent}
            />
          </div>
          
          {/* Mensajes */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
          >
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm px-4 text-center">
                <Bot size={36} className="mb-2 text-slate-500" />
                <p>Inicia una nueva conversación con el asistente de CODESTORM AI.</p>
                <p className="mt-2">Puedes pedirme ayuda con tu código, resolver dudas o sugerir mejoras.</p>
              </div>
            ) : (
              currentConversation?.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[80%] rounded-lg p-3
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
                      {msg.content}
                    </div>
                    
                    {msg.code && (
                      <div className="mt-2 bg-slate-950 rounded p-2 text-xs font-mono overflow-x-auto">
                        <pre>{msg.code}</pre>
                      </div>
                    )}
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
                >
                  <Upload size={16} />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isProcessing}
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-blue-600 text-white"
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
                <div className="text-xs text-slate-400 mb-1">
                  {editorTab.filepath}
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
            <h4 className="font-medium mb-2">Terminal</h4>
            <div className="flex-1">
              <TerminalView lines={terminalLines} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export const CodestormAssistantButton: React.FC<{onClick: () => void}> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 fixed bottom-6 right-6 shadow-lg"
    >
      <Bot size={20} />
    </Button>
  );
};

export default CodestormAssistant;