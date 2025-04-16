import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, StopCircle, CornerDownRight } from 'lucide-react';

interface VoiceRecognitionProps {
  onTranscript: (text: string) => void;
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({ onTranscript }) => {
  const [isActive, setIsActive] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  useEffect(() => {
    if (listening) {
      setAnimationClass('animate-pulse');
    } else {
      setAnimationClass('');
    }
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-3 text-red-400">
        Tu navegador no soporta reconocimiento de voz.
      </div>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <div className="p-3 text-yellow-400">
        Por favor, permite el acceso al micrófono.
      </div>
    );
  }

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: 'es-ES' });
    setIsActive(true);
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsActive(false);
  };

  const sendTranscript = () => {
    if (transcript.trim()) {
      onTranscript(transcript);
      resetTranscript();
    }
  };

  return (
    <div className="border border-muted rounded-md p-3">
      <div className="flex items-center mb-2 justify-between">
        <h3 className="text-primary font-semibold">Reconocimiento de Voz</h3>
        <div className="flex space-x-2">
          {!listening ? (
            <button
              onClick={startListening}
              className={`bg-blue-700 hover:bg-blue-600 rounded-full p-2 ${animationClass}`}
              title="Iniciar reconocimiento de voz"
            >
              <Mic size={18} />
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="bg-red-700 hover:bg-red-600 rounded-full p-2"
              title="Detener reconocimiento de voz"
            >
              <StopCircle size={18} />
            </button>
          )}
          <button
            onClick={sendTranscript}
            disabled={!transcript.trim()}
            className={`bg-blue-700 hover:bg-blue-600 rounded-full p-2 ${!transcript.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Enviar transcripción"
          >
            <CornerDownRight size={18} />
          </button>
        </div>
      </div>
      
      <div className={`relative min-h-[80px] p-3 rounded-md bg-card border ${listening ? 'border-blue-500' : 'border-muted'}`}>
        {transcript ? (
          <p className="text-sm">{transcript}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {listening 
              ? "Estoy escuchando... Habla claramente" 
              : "Haz clic en el micrófono para comenzar a hablar"}
          </p>
        )}
        {listening && (
          <div className="absolute bottom-2 right-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        Habla claramente y revisa la transcripción antes de enviar.
      </div>
    </div>
  );
};

export default VoiceRecognition;