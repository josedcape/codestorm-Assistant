import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MicIcon, StopCircleIcon, CornerDownRightIcon } from 'lucide-react';

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
      setAnimationClass('pulse-animation');
    } else {
      setAnimationClass('');
    }
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="futuristic-container p-3 text-red-400">
        Tu navegador no soporta reconocimiento de voz.
      </div>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <div className="futuristic-container p-3 text-yellow-400">
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
    <div className="futuristic-container silver-border">
      <div className="flex items-center mb-2 justify-between">
        <h3 className="gold-accent font-semibold">Reconocimiento de Voz</h3>
        <div className="flex space-x-2">
          {!listening ? (
            <button
              onClick={startListening}
              className={`futuristic-button rounded-full p-2 ${animationClass}`}
              title="Iniciar reconocimiento de voz"
            >
              <MicIcon size={18} />
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="futuristic-button bg-red-700 hover:bg-red-600 rounded-full p-2"
              title="Detener reconocimiento de voz"
            >
              <StopCircleIcon size={18} />
            </button>
          )}
          <button
            onClick={sendTranscript}
            disabled={!transcript.trim()}
            className={`futuristic-button rounded-full p-2 ${!transcript.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Enviar transcripción"
          >
            <CornerDownRightIcon size={18} />
          </button>
        </div>
      </div>
      
      <div className={`relative min-h-[80px] p-3 rounded-md bg-slate-800 border ${listening ? 'border-blue-500' : 'border-slate-700'}`}>
        {transcript ? (
          <p className="text-sm text-white">{transcript}</p>
        ) : (
          <p className="text-sm text-slate-500">
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
      
      <div className="mt-2 text-xs text-slate-400">
        Habla claramente y revisa la transcripción antes de enviar.
      </div>
    </div>
  );
};

export default VoiceRecognition;