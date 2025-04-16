import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, X, Settings, MessageSquare, History, ChevronDown, Play, Bot, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RobotLogo } from './RobotLogo';
import ModelSelector, { AIModel } from './ModelSelector';
import VoiceRecognition from './VoiceRecognition';
import FileUploader from './FileUploader';
import ApiKeyConfig from './ApiKeyConfig';
import ChatInterface from './ChatInterface';
import TerminalIntegration from './TerminalIntegration';
import AgentSelector, { AgentType } from './AgentSelector';
import { useToast } from '@/hooks/use-toast';

export interface CodestormAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const CodestormAssistant: React.FC<CodestormAssistantProps> = ({ 
  isOpen = true,
  onClose = () => {}
}) => {
  const [visible, setVisible] = useState(isOpen);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.5');
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>('dev');
  const { toast } = useToast();
  
  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const handleVoiceTranscript = (text: string) => {
    toast({
      title: "Transcripción recibida",
      description: "Procesando: " + (text.length > 50 ? text.substring(0, 50) + "..." : text),
    });
  };

  const handleFileUpload = (file: File, content: string) => {
    toast({
      title: "Archivo subido",
      description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
    });
  };

  const handleExecuteCommand = async (command: string): Promise<string> => {
    // Simulación de ejecución
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Ejecutado: ${command}\nResultado simulado para demostración.`;
  };

  return (
    <div className={`codestorm-assistant-panel ${!visible ? 'codestorm-assistant-collapsed' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-blue-500 bg-card">
        <div className="flex items-center">
          <RobotLogo />
          <h3 className="font-bold text-lg ml-2">CODESTORM AI</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="rounded-full hover:bg-blue-700/20"
        >
          <X size={18} />
        </Button>
      </div>
      
      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <TabsList className="flex justify-start bg-card border-b border-blue-500/30 rounded-none px-2">
          <TabsTrigger value="chat" className="codestorm-tab data-[state=active]:border-primary data-[state=active]:text-primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="terminal" className="codestorm-tab data-[state=active]:border-primary data-[state=active]:text-primary">
            <Bot className="h-4 w-4 mr-2" />
            Terminal
          </TabsTrigger>
          <TabsTrigger value="settings" className="codestorm-tab data-[state=active]:border-primary data-[state=active]:text-primary">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="chat" className="p-0 m-0 h-full flex flex-col">
            <div className="p-4 border-b border-blue-500/20 bg-card/50">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 text-primary mr-2" />
                <h3 className="text-sm font-medium">Agente Activo: {currentAgent === 'dev' ? 'Desarrollo' : currentAgent === 'arch' ? 'Arquitectura' : 'Avanzado'}</h3>
              </div>
            </div>
            <div className="flex-1">
              <ChatInterface 
                onVoiceInput={() => setActiveTab('voice')} 
                onFileUpload={() => setActiveTab('upload')} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="terminal" className="p-4 m-0">
            <TerminalIntegration onExecuteCommand={handleExecuteCommand} />
          </TabsContent>
          
          <TabsContent value="voice" className="p-4 m-0">
            <VoiceRecognition onTranscript={handleVoiceTranscript} />
            <div className="mt-4">
              <Button onClick={() => setActiveTab('chat')} className="w-full">
                Volver al chat
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="p-4 m-0">
            <FileUploader onFileUploaded={handleFileUpload} />
            <div className="mt-4">
              <Button onClick={() => setActiveTab('chat')} className="w-full">
                Volver al chat
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="p-4 m-0">
            <div className="space-y-6">
              <ModelSelector 
                currentModel={selectedModel}
                onModelChange={(model) => setSelectedModel(model as AIModel)}
                autonomousMode={autonomousMode}
                onAutonomousModeChange={setAutonomousMode}
              />
              
              <div className="border-t border-blue-500/20 pt-6">
                <AgentSelector 
                  currentAgent={currentAgent} 
                  onAgentChange={setCurrentAgent} 
                />
              </div>
              
              <div className="border-t border-blue-500/20 pt-6">
                <ApiKeyConfig />
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
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