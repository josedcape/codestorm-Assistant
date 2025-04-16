import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceRecognitionProps {
  onTranscript: (text: string) => void;
}

export default function VoiceRecognition({ onTranscript }: VoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
        
        setTranscript(finalTranscript || interimTranscript);
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

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      
      // Enviar transcripción final si hay contenido
      if (transcript.trim()) {
        onTranscript(transcript);
        setTranscript('');
      }
    } else {
      setTranscript('');
      setError(null);
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