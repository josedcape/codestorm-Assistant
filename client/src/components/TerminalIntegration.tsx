import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, XCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

interface TerminalIntegrationProps {
  onExecuteCommand?: (command: string) => Promise<string>;
}

const TerminalIntegration: React.FC<TerminalIntegrationProps> = ({ onExecuteCommand }) => {
  const { addTerminalLine, clearTerminal: clearAppTerminal } = useAppContext();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Array<{type: 'command' | 'response', content: string}>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleExecute = async () => {
    if (!command.trim() || isExecuting) return;

    try {
      setIsExecuting(true);

      // Add command to history
      setHistory(prev => [...prev, { type: 'command', content: command }]);
      addTerminalLine({ text: command, type: 'command' });

      if (onExecuteCommand) {
        const response = await onExecuteCommand(command);

        let formattedResponse = response;
        try {
          const parsedResponse = JSON.parse(response);
          formattedResponse = parsedResponse.output || response;
        } catch (e) {
          // If not JSON, use raw response
        }

        setHistory(prev => [...prev, { type: 'response', content: formattedResponse }]);
        addTerminalLine({ text: formattedResponse, type: 'output' });
      }

      setCommand('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setHistory(prev => [...prev, { type: 'response', content: `Error: ${errorMessage}` }]);
      addTerminalLine({ text: `Error: ${errorMessage}`, type: 'error' });

      toast({
        title: "Error al ejecutar comando",
        description: errorMessage,
        variant: "destructive"
      });
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

  const handleClearTerminal = () => {
    setHistory([]);
    clearAppTerminal();
  };

  const copyToClipboard = () => {
    const text = history
      .map(item => `${item.type === 'command' ? '$ ' : '> '}${item.content}`)
      .join('\n');

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
            onClick={handleClearTerminal}
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
          <p className="text-muted-foreground italic text-xs">Terminal lista para ejecutar comandos</p>
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