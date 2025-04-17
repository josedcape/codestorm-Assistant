import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle, Terminal, FileCode, FolderPlus, File, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

interface VoiceRecognitionProps {
  onTranscript: (text: string) => void;
}

export default function VoiceRecognition({ onTranscript }: VoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTerminalCommand, setIsTerminalCommand] = useState(false);
  const { addTerminalLine } = useAppContext();

  useEffect(() => {
    // Verificar soporte para reconocimiento de voz
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    try {
      // Crear instancia de reconocimiento
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES'; // Español por defecto
      
      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }
        
        const text = finalTranscript || interimTranscript;
        setTranscript(text);
        
        // Detectar comandos en tiempo real
        detectCommand(text);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        // Si estaba escuchando pero terminó automáticamente, reiniciar
        if (isListening) {
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
    } catch (err) {
      console.error('Error al inicializar reconocimiento de voz:', err);
      setError('No se pudo inicializar el reconocimiento de voz');
    }
    
    // Limpiar al desmontar
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // Detecta si el texto contiene un comando para la terminal
  const detectCommand = (text: string) => {
    const normalizedText = text.toLowerCase();
    const commandPrefixes = [
      'crear', 'generar', 'nueva', 'nuevo', 'haz', 
      'ejecutar', 'corre', 'crea', 'instalar', 'instala',
      'eliminar', 'borra', 'quita', 'elimina'
    ];
    
    // Verificar si la transcripción comienza con alguno de los prefijos de comando
    const isCommand = commandPrefixes.some(prefix => normalizedText.startsWith(prefix));
    setIsTerminalCommand(isCommand);
  };

  // Procesa los comandos detectados
  const processCommand = (text: string) => {
    const normalizedText = text.toLowerCase();
    
    // Comandos para crear páginas web o proyectos
    if (normalizedText.includes('crear') && 
        (normalizedText.includes('página') || normalizedText.includes('pagina') || 
         normalizedText.includes('web') || normalizedText.includes('proyecto'))) {
      
      // Determinar tipo de proyecto
      let projectType = 'landing';
      if (normalizedText.includes('ventas') || normalizedText.includes('tienda') || normalizedText.includes('ecommerce')) {
        projectType = 'ecommerce';
      } else if (normalizedText.includes('blog')) {
        projectType = 'blog';
      }
      
      // Enviar comando a la terminal
      const command = `npx create-next-app my-${projectType}-app --typescript --tailwind`;
      executeTerminalCommand(command);
      
      // También notificar al asistente
      onTranscript(`Necesito crear una página web de tipo: ${projectType}. Por favor genera los archivos necesarios.`);
      
      return true;
    }
    
    // Comandos para crear archivos
    if ((normalizedText.includes('crear') || normalizedText.includes('nuevo')) && 
        (normalizedText.includes('archivo') || normalizedText.includes('fichero'))) {
      
      // Intentar extraer nombre de archivo
      let fileName = extractFileName(normalizedText);
      if (fileName) {
        const command = `touch ${fileName}`;
        executeTerminalCommand(command);
        return true;
      }
    }
    
    // Comandos para crear carpetas
    if ((normalizedText.includes('crear') || normalizedText.includes('nueva')) && 
        normalizedText.includes('carpeta')) {
      
      // Intentar extraer nombre de carpeta
      let folderName = extractFolderName(normalizedText);
      if (folderName) {
        const command = `mkdir -p ${folderName}`;
        executeTerminalCommand(command);
        return true;
      }
    }
    
    // Comandos para instalar paquetes
    if (normalizedText.includes('instalar') || normalizedText.includes('instala')) {
      let packageName = extractPackageName(normalizedText);
      if (packageName) {
        const command = `npm install ${packageName}`;
        executeTerminalCommand(command);
        return true;
      }
    }
    
    // Comando para ejecutar scripts
    if (normalizedText.includes('ejecutar') || normalizedText.includes('corre')) {
      let scriptName = extractScriptName(normalizedText);
      if (scriptName) {
        const command = `npm run ${scriptName}`;
        executeTerminalCommand(command);
        return true;
      }
    }
    
    // Comandos para eliminar archivos/carpetas
    if (normalizedText.includes('eliminar') || normalizedText.includes('borrar') || 
        normalizedText.includes('quitar')) {
      
      let target = '';
      if (normalizedText.includes('archivo')) {
        target = extractFileName(normalizedText);
        if (target) {
          const command = `rm ${target}`;
          executeTerminalCommand(command);
          return true;
        }
      } else if (normalizedText.includes('carpeta')) {
        target = extractFolderName(normalizedText);
        if (target) {
          const command = `rm -rf ${target}`;
          executeTerminalCommand(command);
          return true;
        }
      }
    }
    
    // Si no se detectó un comando específico pero parece un comando
    if (isTerminalCommand) {
      // Extraer el posible comando (todo lo que viene después del prefijo)
      const commandPrefixes = ['ejecutar', 'corre', 'crea', 'hacer', 'haz'];
      let command = '';
      
      for (const prefix of commandPrefixes) {
        if (normalizedText.startsWith(prefix)) {
          command = normalizedText.substring(prefix.length).trim();
          break;
        }
      }
      
      if (command) {
        executeTerminalCommand(command);
        return true;
      }
    }
    
    return false;
  };
  
  // Extrae el nombre del archivo del comando
  const extractFileName = (command: string): string => {
    const words = command.split(' ');
    const fileIndex = words.findIndex(word => 
      word === 'archivo' || word === 'fichero');
    
    if (fileIndex !== -1 && fileIndex < words.length - 1) {
      return words[fileIndex + 1];
    }
    
    return '';
  };
  
  // Extrae el nombre de la carpeta del comando
  const extractFolderName = (command: string): string => {
    const words = command.split(' ');
    const folderIndex = words.findIndex(word => word === 'carpeta');
    
    if (folderIndex !== -1 && folderIndex < words.length - 1) {
      return words[folderIndex + 1];
    }
    
    return '';
  };
  
  // Extrae el nombre del paquete a instalar
  const extractPackageName = (command: string): string => {
    const words = command.split(' ');
    const installIndex = words.findIndex(word => 
      word === 'instalar' || word === 'instala');
    
    if (installIndex !== -1 && installIndex < words.length - 1) {
      return words[installIndex + 1];
    }
    
    return '';
  };
  
  // Extrae el nombre del script a ejecutar
  const extractScriptName = (command: string): string => {
    const words = command.split(' ');
    const runIndex = words.findIndex(word => 
      word === 'ejecutar' || word === 'corre');
    
    if (runIndex !== -1 && runIndex < words.length - 1) {
      return words[runIndex + 1];
    }
    
    return '';
  };
  
  // Ejecuta un comando en la terminal
  const executeTerminalCommand = (command: string) => {
    // Agregar comando a la terminal con marca de que proviene de voz
    addTerminalLine({
      text: command,
      type: 'command',
      fromVoice: true
    });
    
    // Simular respuesta
    setTimeout(() => {
      addTerminalLine({
        text: `Ejecutando: ${command}`,
        type: 'success'
      });
    }, 300);
    
    // Para comandos de creación de archivos, simular contenido de ejemplo
    if (command.startsWith('touch') || command.includes('archivo')) {
      const fileName = command.split(' ').pop();
      if (fileName && fileName.includes('.')) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        
        setTimeout(() => {
          if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') {
            addTerminalLine({
              text: `Creando archivo ${fileName} con contenido de ejemplo`,
              type: 'output'
            });
            
            const exampleContent = ext.includes('tsx') || ext.includes('jsx') ?
              `import React from 'react';\n\nexport default function Component() {\n  return (\n    <div>\n      <h1>Nuevo Componente</h1>\n    </div>\n  );\n}` :
              `// Archivo creado por comando de voz\n\nfunction main() {\n  console.log("Archivo creado exitosamente");\n}\n\nmain();`;
              
            addTerminalLine({
              text: exampleContent,
              type: 'code',
              language: ext
            });
          }
        }, 1000);
      }
    }
    
    // Notificar al usuario
    toast({
      title: "Comando ejecutado por voz",
      description: `Se ha enviado el comando "${command}" a la terminal`
    });
  };

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      
      // Enviar transcripción final si hay contenido
      if (transcript.trim()) {
        const wasCommand = processCommand(transcript);
        if (!wasCommand) {
          // Si no fue un comando para la terminal, enviar al asistente
          onTranscript(transcript);
        }
        setTranscript('');
        setIsTerminalCommand(false);
      }
    } else {
      setTranscript('');
      setError(null);
      setIsTerminalCommand(false);
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Reconocimiento de Voz</h3>
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          size="sm"
          disabled={!!error && !isListening}
          className="gap-1"
        >
          {isListening ? (
            <>
              <MicOff size={16} />
              Detener
            </>
          ) : (
            <>
              <Mic size={16} />
              Iniciar
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="flex items-center text-red-500 text-sm mb-2">
          <AlertCircle size={14} className="mr-1" />
          {error}
        </div>
      )}
      
      <div className="relative border border-slate-700 bg-slate-900 rounded-md p-2 min-h-[60px] text-sm">
        {transcript ? (
          <p>{transcript}</p>
        ) : (
          <p className="text-slate-500 italic">
            {isListening ? 'Escuchando...' : 'Presiona "Iniciar" para comenzar a hablar'}
          </p>
        )}
        
        {isListening && (
          <motion.div 
            className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </div>
    </div>
  );
}

// Tipos para window
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}