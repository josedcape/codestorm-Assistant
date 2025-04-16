
import React from 'react';
import { AIModel, MODEL_INFO, DevelopmentMode } from '@/lib/aiService';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ModelSelectorProps {
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  currentModel?: AIModel;
  onDevelopmentModeChange?: (mode: DevelopmentMode) => void;
  developmentMode?: DevelopmentMode;
  autonomousMode?: boolean;
  onAutonomousModeChange?: (enabled: boolean) => void;
}

export default function ModelSelector({
  currentModel = 'gpt-4o',
  onModelChange,
  developmentMode = 'interactive',
  onDevelopmentModeChange,
}: ModelSelectorProps) {
  const handleModelChange = (value: string) => {
    if (onModelChange) {
      onModelChange(value);
    }
  };

  const toggleDevelopmentMode = () => {
    if (onDevelopmentModeChange) {
      const newMode = developmentMode === 'interactive' ? 'autonomous' : 'interactive';
      onDevelopmentModeChange(newMode);
    }
  };

  // Verificar el estado de las claves API
  const apiKeyStatus: Record<string, boolean> = {
    'gpt-4o': !!localStorage.getItem('openai_api_key'),
    'gemini-2.5': !!localStorage.getItem('google_api_key'),
    'claude-3-7': !!localStorage.getItem('anthropic_api_key'),
    'claude-3-5-sonnet-v2': !!localStorage.getItem('anthropic_api_key'),
    'qwen-2.5-omni-7b': true // Este es local, siempre disponible
  };

  // Obtener información del modelo actual
  const currentModelInfo = MODEL_INFO[currentModel as AIModel];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="model-select" className="text-sm font-medium mb-1.5 block">
          Modelo de IA
        </Label>
        <Select
          value={currentModel}
          onValueChange={handleModelChange}
        >
          <SelectTrigger id="model-select" className="w-full bg-slate-800 border-slate-700">
            <SelectValue placeholder="Seleccionar modelo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectGroup>
              <SelectLabel>OpenAI</SelectLabel>
              <SelectItem value="gpt-4o" className="text-white focus:bg-slate-700 focus:text-white">
                <div className="flex items-center">
                  <span>GPT-4.0</span>
                  {!apiKeyStatus['gpt-4o'] && (
                    <AlertCircle size={14} className="ml-2 text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Google</SelectLabel>
              <SelectItem value="gemini-2.5" className="text-white focus:bg-slate-700 focus:text-white">
                <div className="flex items-center">
                  <span>Gemini 2.5</span>
                  {!apiKeyStatus['gemini-2.5'] && (
                    <AlertCircle size={14} className="ml-2 text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Anthropic</SelectLabel>
              <SelectItem value="claude-3-7" className="text-white focus:bg-slate-700 focus:text-white">
                <div className="flex items-center">
                  <span>Claude 3.7</span>
                  {!apiKeyStatus['claude-3-7'] && (
                    <AlertCircle size={14} className="ml-2 text-amber-400" />
                  )}
                </div>
              </SelectItem>
              <SelectItem value="claude-3-5-sonnet-v2" className="text-white focus:bg-slate-700 focus:text-white">
                <div className="flex items-center">
                  <span>Claude 3.5 Sonnet V2</span>
                  {!apiKeyStatus['claude-3-5-sonnet-v2'] && (
                    <AlertCircle size={14} className="ml-2 text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Modelos locales</SelectLabel>
              <SelectItem value="qwen-2.5-omni-7b" className="text-white focus:bg-slate-700 focus:text-white">
                Qwen 2.5 Omni 7B
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <div className="text-xs text-slate-400 mt-1">
          {MODEL_INFO[currentModel as AIModel]?.description}
        </div>
      </div>
      
      {currentModelInfo && !apiKeyStatus[currentModelInfo.id] && (
        <Alert variant="warning" className="bg-amber-900/30 border-amber-700">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription>
            No hay clave API configurada para {currentModelInfo.name}. 
            Configúrala en la pestaña API Keys.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="autonomous-mode" className="text-sm font-medium">
            Modo Autónomo
          </Label>
          <p className="text-xs text-slate-400">
            Permitir que el asistente ejecute código automáticamente
          </p>
        </div>
        <Switch
          id="autonomous-mode"
          checked={developmentMode === 'autonomous'}
          onCheckedChange={toggleDevelopmentMode}
        />
      </div>
    </div>
  );
}
