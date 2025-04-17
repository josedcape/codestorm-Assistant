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