import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mic, Upload, Send, Bolt } from "lucide-react";
import { Bot, UserIcon } from "lucide-react";
import { useAppContext } from '@/context/AppContext';
import { ModelProvider } from '@shared/schema';

interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  analysis?: {
    frontend?: string;
    backend?: string;
    features?: string[];
    database?: string;
  };
}

const MessageBubble = ({ message }: { message: MessageProps }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      className={`flex items-start space-x-3 ${isUser ? 'justify-end' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4" />
        </div>
      )}
      
      <div className={`${isUser ? 'bg-blue-600/30 rounded-tr-none' : 'bg-navy-700/70 rounded-tl-none'} rounded-lg p-4 max-w-[85%]`}>
        <p className="text-sm">{message.content}</p>
        
        {message.analysis && (
          <div className="bg-navy-900/70 p-3 rounded-md text-xs mt-3">
            {message.analysis.frontend && (
              <div className="mb-2"><span className="text-green-400">✓</span> Frontend: <span className="text-cyan-400">{message.analysis.frontend}</span></div>
            )}
            {message.analysis.backend && (
              <div className="mb-2"><span className="text-green-400">✓</span> Backend: <span className="text-cyan-400">{message.analysis.backend}</span></div>
            )}
            {message.analysis.features && (
              <div className="mb-2"><span className="text-green-400">✓</span> Funcionalidades: <span className="text-cyan-400">{message.analysis.features.join(', ')}</span></div>
            )}
            {message.analysis.database && (
              <div><span className="text-green-400">✓</span> Base de datos: <span className="text-cyan-400">{message.analysis.database}</span></div>
            )}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center flex-shrink-0">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
};

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, messages, isProcessing } = useChat();
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { selectedModel, setSelectedModel } = useAppContext();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    sendMessage(inputValue);
    setInputValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleVoiceInput = () => {
    toast({
      title: "Entrada por voz",
      description: "Esta función estará disponible próximamente.",
    });
  };
  
  const handleFileUpload = () => {
    toast({
      title: "Subida de archivos",
      description: "Esta función estará disponible próximamente.",
    });
  };
  
  const handleModelChange = (value: string) => {
    setSelectedModel(value as ModelProvider);
    toast({
      title: "Modelo cambiado",
      description: `Ahora usando ${value}.`,
    });
  };

  return (
    <div className="flex flex-col bg-navy-800/50 rounded-xl overflow-hidden backdrop-blur-sm h-[calc(100vh-12rem)] border border-navy-700 border-opacity-30 relative">
      {/* Shiny border effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-sky-500/10 to-transparent absolute top-0 left-[-100%] animate-[shine_3s_infinite_linear]"></div>
      </div>
      
      <div className="px-6 py-4 bg-gradient-to-r from-navy-700 to-navy-800 border-b border-navy-700">
        <div className="flex items-center justify-between">
          <h2 className="font-['Orbitron'] text-xl">Asistente IA</h2>
          <div className="flex space-x-2">
            <div className="flex items-center gap-2 bg-navy-900 px-3 py-1 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>En línea</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Bolt className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comandos rápidos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-6 space-y-6 grid-pattern"
        style={{
          backgroundSize: '30px 30px',
          backgroundImage: `
            linear-gradient(to right, rgba(14, 42, 71, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(14, 42, 71, 0.1) 1px, transparent 1px)
          `
        }}
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              className="flex items-start space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-navy-700/70 rounded-lg rounded-tl-none p-4 max-w-[85%]">
                <p className="text-sm">Bienvenido a CODESTORM AI. Estoy aquí para ayudarte a desarrollar tu proyecto utilizando instrucciones en lenguaje natural. ¿Qué tipo de aplicación deseas crear hoy?</p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))
          )}
          
          {isProcessing && (
            <motion.div 
              className="flex items-start space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-navy-700/70 rounded-lg rounded-tl-none p-4 max-w-[85%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-4 bg-navy-800 border-t border-navy-700">
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe tu proyecto o solicita cambios..."
            className="w-full bg-white text-blue-900 font-medium rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <Button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            onClick={handleSendMessage}
            disabled={isProcessing || inputValue.trim() === ''}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between mt-2 px-1 text-xs text-gray-400">
          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              className="hover:text-white transition-colors flex items-center gap-1 px-2 py-1 h-auto text-xs"
              onClick={handleVoiceInput}
            >
              <Mic className="h-3 w-3" />
              <span>Voz</span>
            </Button>
            <Button 
              variant="ghost" 
              className="hover:text-white transition-colors flex items-center gap-1 px-2 py-1 h-auto text-xs"
              onClick={handleFileUpload}
            >
              <Upload className="h-3 w-3" />
              <span>Archivos</span>
            </Button>
          </div>
          
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="bg-transparent border-none focus:outline-none hover:text-white w-24 h-auto text-xs px-2">
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">GPT-4</SelectItem>
              <SelectItem value="anthropic">Claude 3</SelectItem>
              <SelectItem value="gemini">Gemini Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
