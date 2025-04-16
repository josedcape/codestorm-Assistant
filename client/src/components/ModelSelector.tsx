import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type AIModel = 'gpt-4o' | 'gemini-2.5' | 'claude-3-7' | 'claude-3-5-sonnet-v2' | 'qwen-2.5-omni-7b';

interface ModelInfo {
  id: AIModel;
  name: string;
  description: string;
  apiKeyType: string;
  releaseDate: string;
}

interface ModelSelectorProps {
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  currentModel?: AIModel;
  onDevelopmentModeChange?: (mode: 'interactive' | 'autonomous') => void;
  developmentMode?: 'interactive' | 'autonomous';
  autonomousMode?: boolean;
  onAutonomousModeChange?: (enabled: boolean) => void;
}

// Información detallada de los modelos
const modelList: ModelInfo[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4.0',
    description: 'Modelo multimodal y multilingüe para texto, imágenes y audio',
    apiKeyType: 'openai_api_key',
    releaseDate: 'Mayo 2024'
  },
  {
    id: 'gemini-2.5',
    name: 'Gemini 2.5',
    description: 'Modelo avanzado para texto, audio, imágenes, video y código',
    apiKeyType: 'google_api_key',
    releaseDate: 'Marzo 2025'
  },
  {
    id: 'claude-3-7',
    name: 'Claude 3.7',
    description: 'Modelo híbrido para codificación y resolución de problemas complejos',
    apiKeyType: 'anthropic_api_key',
    releaseDate: 'Febrero 2025'
  },
  {
    id: 'claude-3-5-sonnet-v2',
    name: 'Claude 3.5 Sonnet V2',
    description: 'Equilibrio entre rendimiento y velocidad',
    apiKeyType: 'anthropic_api_key',
    releaseDate: 'Enero 2025'
  },
  {
    id: 'qwen-2.5-omni-7b',
    name: 'Qwen 2.5-Omni-7B',
    description: 'Modelo multimodal para texto, imagen, audio y video',
    apiKeyType: 'alibaba_api_key',
    releaseDate: 'Marzo 2025'
  }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  selectedModel,
  onModelChange,
  autonomousMode = false,
  onAutonomousModeChange = () => {},
  developmentMode,
  onDevelopmentModeChange
}) => {
  const [apiKeyStatus, setApiKeyStatus] = useState<{[key: string]: boolean}>({});
  const currentModelValue = selectedModel || currentModel || 'gpt-4o';

  // Verificar si hay claves API configuradas
  useEffect(() => {
    const checkApiKeys = () => {
      const status: {[key: string]: boolean} = {};
      modelList.forEach(model => {
        const key = localStorage.getItem(model.apiKeyType);
        status[model.id] = !!key && key.length > 10;
      });
      setApiKeyStatus(status);
    };

    checkApiKeys();
    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkApiKeys);
    return () => window.removeEventListener('storage', checkApiKeys);
  }, []);

  // Encontrar el modelo actual
  const currentModelInfo = modelList.find(m => m.id === currentModelValue);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm">Modelo AI</label>
        <Select 
          value={currentModelValue} 
          onValueChange={val => {
            if (onModelChange) onModelChange(val);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un modelo" />
          </SelectTrigger>
          <SelectContent>
            {modelList.map(model => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center">
                  <span>{model.name}</span>
                  {!apiKeyStatus[model.id] && (
                    <AlertCircle size={14} className="ml-2 text-amber-400" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentModelInfo && !apiKeyStatus[currentModelInfo.id] && (
        <Alert variant="destructive" className="bg-amber-900/30 border-amber-700">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription>
            Es necesario configurar una API key para {currentModelInfo.name}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autonomous-mode">Modo autónomo</Label>
            <div className="text-xs text-muted-foreground">
              Permite al asistente ejecutar acciones sin confirmación
            </div>
          </div>
          <Switch
            id="autonomous-mode"
            checked={autonomousMode}
            onCheckedChange={onAutonomousModeChange}
          />
        </div>
      </div>

      {currentModelInfo && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Descripción:</strong> {currentModelInfo.description}</p>
          <p><strong>Fecha de publicación:</strong> {currentModelInfo.releaseDate}</p>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;