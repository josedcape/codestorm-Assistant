import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

interface TerminalViewProps {
  isMinimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

const TerminalView: React.FC<TerminalViewProps> = ({
  isMinimized = false,
  onMinimize,
  onMaximize,
  onClose
}) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<{type: 'command' | 'output', content: string}[]>([
    { type: 'output', content: '🚀 Terminal conectada. Escribe los comandos a ejecutar.' }
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll al fondo cuando se añada una nueva salida
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }

    // Dar foco al input cuando el componente se monte
    inputRef.current?.focus();
  }, [output]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      e.preventDefault();

      // Agregar el comando al historial
      const newHistory = [...history, command];
      if (newHistory.length > 50) newHistory.shift(); // Limitar historial a 50 comandos
      setHistory(newHistory);
      setHistoryIndex(-1);

      // Mostrar el comando en la terminal
      setOutput(prev => [...prev, { type: 'command', content: `$ ${command}` }]);

      // Procesar comando especial "clear"
      if (command.toLowerCase() === 'clear') {
        setOutput([]);
        setCommand('');
        return;
      }

      // Ejecutar el comando
      executeCommand(command);
      setCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navegar hacia atrás en el historial
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navegar hacia adelante en el historial
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const executeCommand = async (cmd: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/terminal/execute', { command: cmd });
      const result = response.data.output || 'Comando ejecutado.';

      // Mostrar la salida en la terminal
      setOutput(prev => [...prev, { type: 'output', content: result }]);
      // Check if command creates a file
      if (cmd.startsWith('touch ') || cmd.includes(' > ')) {
        const fileName = cmd.startsWith('touch ')
          ? cmd.split(' ')[1]
          : cmd.split(' > ')[0].trim();

        const event = new CustomEvent('fileCreated', {
          detail: {
            name: fileName,
            path: `/${fileName}`,
            content: ''
          }
        });
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al ejecutar el comando';
      setOutput(prev => [...prev, { type: 'output', content: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-slate-800 p-2 rounded-full shadow-lg cursor-pointer z-50" onClick={onMaximize}>
        <TerminalIcon className="h-6 w-6 text-green-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-md shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between bg-slate-800 px-3 py-2 border-b border-slate-700">
        <div className="flex items-center">
          <TerminalIcon className="h-4 w-4 text-green-400 mr-2" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMaximize}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea 
        ref={terminalRef} 
        className="flex-grow p-3 font-mono text-sm overflow-auto"
        style={{ maxHeight: "calc(100% - 36px)" }}
      >
        {output.map((line, index) => (
          <div 
            key={index} 
            className={line.type === 'command' ? 'text-green-400' : 'text-white'}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {line.content}
          </div>
        ))}
        <div className="flex items-center mt-1">
          <span className="text-green-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none flex-grow text-white"
            placeholder={isLoading ? "Ejecutando..." : "Escribe un comando..."}
            disabled={isLoading}
            autoFocus
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default TerminalView;