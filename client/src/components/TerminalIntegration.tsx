import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, XCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TerminalIntegrationProps {
  onExecuteCommand: (command: string) => Promise<string>;
}

const TerminalIntegration: React.FC<TerminalIntegrationProps> = ({ onExecuteCommand }) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Array<{type: 'command' | 'response', content: string}>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleExecute = async () => {
    if (!command.trim() || isExecuting) return;
    
    try {
      setIsExecuting(true);
      
      // Add command to history
      setHistory(prev => [...prev, { type: 'command', content: command }]);
      
      // Execute command through the AI service
      const response = await onExecuteCommand(command);
      
      // Parse and handle the response
      let formattedResponse = response;
      try {
        const parsedResponse = JSON.parse(response);
        formattedResponse = parsedResponse.output || response;
      } catch (e) {
        // If not JSON, use raw response
      }
      
      // Add response to history
      setHistory(prev => [...prev, { 
        type: 'response', 
        content: formattedResponse
      }]);
      
      // Clear command
      setCommand('');
    } catch (error) {
      console.error('Error executing command:', error);
      setHistory(prev => [...prev, { 
        type: 'response', 
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
      }]);
    } finally {
      setIsExecuting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecute();
    }
  };

  const clearTerminal = () => {
    setHistory([]);
  };

  const copyToClipboard = () => {
    const text = history.map(item => {
      const prefix = item.type === 'command' ? '$ ' : '> ';
      return prefix + item.content;
    }).join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border border-muted rounded-md">
      <div className="flex items-center mb-2 p-2 justify-between border-b border-muted">
        <div className="flex items-center">
          <TerminalIcon size={18} className="mr-2 text-primary" />
          <h3 className="text-primary font-semibold">Terminal</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="h-8 w-8"
            title="Copiar al portapapeles"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearTerminal}
            className="h-8 w-8 text-red-500"
            title="Limpiar terminal"
          >
            <XCircle size={14} />
          </Button>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="bg-[#121212] border border-muted rounded-md m-2 p-3 h-60 overflow-y-auto font-mono text-sm"
      >
        {history.length === 0 ? (
          <p className="text-muted-foreground italic text-xs">Escribe comandos o usa la asistencia por voz</p>
        ) : (
          history.map((item, index) => (
            <div key={index} className="mb-2">
              {item.type === 'command' ? (
                <div className="text-green-400">$ {item.content}</div>
              ) : (
                <div className="text-gray-400 whitespace-pre-wrap">{item.content}</div>
              )}
            </div>
          ))
        )}
        {isExecuting && (
          <div className="text-yellow-400">Ejecutando comando...</div>
        )}
      </div>
      
      <div className="p-2 flex items-center border-t border-muted">
        <span className="text-green-400 font-mono mr-2">$</span>
        <Input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un comando..."
          className="flex-1 bg-transparent border-muted text-sm font-mono"
          disabled={isExecuting}
        />
        <Button
          variant="default"
          size="sm"
          onClick={handleExecute}
          className="ml-2"
          disabled={!command.trim() || isExecuting}
        >
          <Play size={16} className="mr-1" />
          Ejecutar
        </Button>
      </div>
    </div>
  );
};

export default TerminalIntegration;