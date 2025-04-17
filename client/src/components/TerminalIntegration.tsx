import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, XCircle, Copy, Check, SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

interface TerminalIntegrationProps {
  onExecuteCommand?: (command: string) => Promise<string>;
}

const TerminalIntegration: React.FC<TerminalIntegrationProps> = ({ onExecuteCommand }) => {
  const { addTerminalLine, clearTerminal: clearAppTerminal, executeCommand: executeAppCommand } = useAppContext();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Array<{type: 'command' | 'response', content: string}>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
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

  // Función para detectar si es una instrucción en lenguaje natural
  const isNaturalLanguageCommand = (cmd: string): boolean => {
    const naturalLanguagePatterns = [
      /instala|instalar|agregar|añadir|agrega/i,
      /crear|crea|genera|generar|nuevo|nueva/i,
      /ejecuta|ejecutar|corre|correr|inicia|iniciar/i,
      /elimina|eliminar|borra|borrar|quita|quitar/i,
      /busca|buscar|encuentra|encontrar/i,
      /muestra|mostrar|listar|lista/i,
      /cambia|cambiar|modifica|modificar/i,
      /configura|configurar|establece|establecer/i
    ];
    
    return naturalLanguagePatterns.some(pattern => pattern.test(cmd));
  };
  
  // Función para convertir lenguaje natural a comando
  const convertToTerminalCommand = async (naturalCommand: string): Promise<string> => {
    try {
      const { currentAgent } = useAppContext();
      
      // Usamos el servicio de IA para convertir la instrucción
      const aiService = new AIService();
      const prompt = `Convierte esta instrucción en lenguaje natural a un comando de terminal Linux válido, 
                     devuelve SOLO el comando sin explicaciones adicionales: "${naturalCommand}"`;
      
      const response = await aiService.generateResponse(prompt, undefined, currentAgent);
      
      // Limpiamos la respuesta para obtener solo el comando
      const cleanedResponse = response
        .replace(/```bash|```sh|```/g, '')  // Eliminar bloques de código markdown
        .replace(/^\s*\$\s*/, '')           // Eliminar símbolo $ al inicio
        .trim();
      
      return cleanedResponse;
    } catch (error) {
      console.error('Error al convertir lenguaje natural a comando:', error);
      throw new Error('No se pudo convertir la instrucción a un comando válido');
    }
  };

  const handleExecute = async () => {
    if (!command.trim() || isExecuting) return;
    
    try {
      setIsExecuting(true);
      
      let commandToExecute = command;
      let originalCommand = command;
      
      // Detectar si es lenguaje natural y convertir a comando
      if (isNaturalLanguageCommand(command)) {
        addTerminalLine({
          text: `Interpretando: "${command}"`,
          type: 'output'
        });
        
        try {
          commandToExecute = await convertToTerminalCommand(command);
          addTerminalLine({
            text: `Comando interpretado: ${commandToExecute}`,
            type: 'success'
          });
        } catch (conversionError) {
          console.error('Error en conversión:', conversionError);
          addTerminalLine({
            text: 'No se pudo interpretar la instrucción como un comando válido.',
            type: 'error'
          });
          setIsExecuting(false);
          return;
        }
      }
      
      // Añadir comando original al historial
      setHistory(prev => [...prev, { type: 'command', content: originalCommand }]);
      
      // Añadir comando ejecutado al contexto de terminal
      addTerminalLine({
        text: commandToExecute,
        type: 'command'
      });
      
      if (onExecuteCommand) {
        // Ejecutar el comando a través del servicio de IA
        const response = await onExecuteCommand(commandToExecute);
        
        // Analizar y manejar la respuesta
        let formattedResponse = response;
        try {
          const parsedResponse = JSON.parse(response);
          formattedResponse = parsedResponse.output || response;
        } catch (e) {
          // Si no es JSON, usar respuesta sin procesar
        }
        
        // Añadir respuesta al historial
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: formattedResponse
        }]);
        
        // Añadir al contexto de terminal
        addTerminalLine({
          text: formattedResponse,
          type: 'output'
        });
      } else {
        // No hay función de ejecución proporcionada
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: 'La ejecución de comandos no está disponible en este contexto'
        }]);
        
        // Añadir al contexto de terminal
        addTerminalLine({
          text: 'La ejecución de comandos no está disponible en este contexto',
          type: 'error'
        });
      }
      
      // Limpiar comando
      setCommand('');
    } catch (error) {
      console.error('Error ejecutando comando:', error);
      
      const errorMessage = `Error: ${error instanceof Error ? error.message : 'Ocurrió un error desconocido'}`;
      
      setHistory(prev => [...prev, { 
        type: 'response', 
        content: errorMessage
      }]);
      
      // Añadir al contexto de terminal
      addTerminalLine({
        text: errorMessage,
        type: 'error'
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