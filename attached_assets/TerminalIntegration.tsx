import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, PlayIcon, XCircleIcon, CopyIcon, CheckIcon } from 'lucide-react';

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
    <div className="futuristic-container silver-border">
      <div className="flex items-center mb-2 justify-between">
        <div className="flex items-center">
          <TerminalIcon size={18} className="mr-2 gold-accent" />
          <h3 className="gold-accent font-semibold">Terminal</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="futuristic-button p-1 rounded text-xs"
            title="Copiar al portapapeles"
          >
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          </button>
          <button
            onClick={clearTerminal}
            className="futuristic-button p-1 rounded text-xs bg-red-900 hover:bg-red-800"
            title="Limpiar terminal"
          >
            <XCircleIcon size={14} />
          </button>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="bg-slate-950 border border-slate-800 rounded-md p-3 h-60 overflow-y-auto font-mono text-sm"
      >
        {history.length === 0 ? (
          <p className="text-slate-500 italic text-xs">Escribe comandos o usa la asistencia por voz</p>
        ) : (
          history.map((item, index) => (
            <div key={index} className="mb-1">
              {item.type === 'command' ? (
                <div className="flex">
                  <span className="text-blue-500 mr-2">$</span>
                  <span className="text-white">{item.content}</span>
                </div>
              ) : (
                <div className="flex">
                  <span className="text-green-500 mr-2">{'>'}</span>
                  <span className="text-slate-300 whitespace-pre-wrap">{item.content}</span>
                </div>
              )}
            </div>
          ))
        )}
        {isExecuting && (
          <div className="flex items-center text-yellow-500 animate-pulse">
            <span className="mr-2">{'>'}</span>
            <span>Ejecutando...</span>
          </div>
        )}
      </div>
      
      <div className="flex mt-2">
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un comando..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-l-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          disabled={isExecuting}
        />
        <button
          onClick={handleExecute}
          disabled={!command.trim() || isExecuting}
          className={`futuristic-button rounded-l-none px-3 ${
            !command.trim() || isExecuting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <PlayIcon size={16} />
        </button>
      </div>
      
      <div className="mt-2 text-xs text-slate-400">
        Ejecuta comandos directamente o usa el asistente para generar comandos automáticamente.
      </div>
    </div>
  );
};

export default TerminalIntegration;