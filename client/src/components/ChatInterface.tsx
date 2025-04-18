import React, { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Mic, MicOff, Play, Terminal } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import VoiceRecognition from './VoiceRecognition';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

// Función para detectar comandos en el texto
const detectCommands = (text: string): string[] => {
  // Patrón para detectar comandos de terminal comunes
  const commandPatterns = [
    /`\$?\s*(npm|yarn|pnpm)\s+.*?`/g,
    /`\$?\s*(mkdir|touch|rm|cp|mv|cd|ls|cat|echo|git|node)\s+.*?`/g,
    /^```bash\n\$?\s*(.*?)```/gms,
    /^```sh\n\$?\s*(.*?)```/gms,
    /```\n\$?\s*(.*?)```/gms,
  ];

  let commands: string[] = [];

  // Buscar comandos usando los patrones
  for (const pattern of commandPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      let cmd = match[1] || match[0];
      // Limpiar el comando
      cmd = cmd.replace(/^`\$?\s*|\s*`$/g, '');
      cmd = cmd.replace(/^```(bash|sh)?\n\$?\s*|\s*```$/g, '');

      if (cmd && !commands.includes(cmd)) {
        commands.push(cmd);
      }
    }
  }

  return commands;
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = 'Mensaje al asistente...'
}) => {
  const [input, setInput] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { executeCommand } = useAppContext();

  // Scroll al final cuando cambian los mensajes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() !== '') {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
  };

  const executeDetectedCommand = async (command: string) => {
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
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-md bg-sidebar">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {messages.map((message, index) => {
          // Detectar comandos en mensajes del asistente
          const detectedCommands = message.role === 'assistant' ? detectCommands(message.content) : [];

          return (
            <div key={index} className="mb-4">
              <div className="flex items-start">
                <Avatar className="h-8 w-8 mr-2">
                  <div className={`h-full w-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-blue-500' : 'bg-purple-600'
                  }`}>
                    {message.role === 'user' ? 'U' : 'AI'}
                  </div>
                </Avatar>
                <div className="flex-1">
                  <ReactMarkdown
                    className="prose prose-sm dark:prose-invert max-w-none"
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
                    {message.content}
                  </ReactMarkdown>

                  {/* Botones para ejecutar comandos detectados */}
                  {detectedCommands.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {detectedCommands.map((cmd, cmdIndex) => (
                        <Button
                          key={cmdIndex}
                          variant="outline"
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={() => executeDetectedCommand(cmd)}
                        >
                          <Terminal size={12} />
                          <span className="max-w-[200px] truncate">{cmd}</span>
                          <Play size={12} />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center">
            <div className="ml-10 bg-muted-foreground/20 rounded px-2 py-1">
              <span className="animate-pulse">Pensando...</span>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-2 border-t border-border">
        <div className="flex items-end">
          <Textarea
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2 ml-2">
            <Button 
              size="icon" 
              variant={isVoiceActive ? "destructive" : "outline"} 
              className="h-8 w-8" 
              onClick={() => setIsVoiceActive(!isVoiceActive)}
            >
              {isVoiceActive ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
            <Button 
              size="icon" 
              variant="default" 
              className="h-8 w-8" 
              onClick={handleSendMessage}
              disabled={input.trim() === '' || isLoading}
            >
              <SendHorizonal size={16} />
            </Button>
          </div>
        </div>

        {isVoiceActive && (
          <VoiceRecognition 
            onTranscript={handleVoiceTranscript} 
            onCommand={() => {}} 
          />
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState, useRef, useEffect } from 'react';
import { useChat, Message } from '@/hooks/useChat';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Upload, Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={`${isUser ? 'bg-blue-600/30 rounded-tr-none' : 'bg-blue-900/70 rounded-tl-none'} rounded-lg p-4 max-w-[85%]`}>
        <p className="text-sm">{message.content}</p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export interface ChatInterfaceProps {
  onVoiceInput?: () => void;
  onFileUpload?: () => void;
}

export default function ChatInterface({ onVoiceInput, onFileUpload }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, messages, isProcessing } = useChat();
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, verifica la configuración del API.",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (onVoiceInput) {
      onVoiceInput();
    } else {
      toast({
        title: "Entrada por voz",
        description: "Esta función estará disponible próximamente.",
      });
    }
  };

  const handleFileUpload = () => {
    if (onFileUpload) {
      onFileUpload();
    } else {
      toast({
        title: "Subida de archivos",
        description: "Esta función estará disponible próximamente.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
        <div className="space-y-4">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isProcessing && (
            <div className="flex items-center justify-center py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleVoiceInput}>
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleFileUpload}>
            <Upload className="h-4 w-4" />
          </Button>
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}