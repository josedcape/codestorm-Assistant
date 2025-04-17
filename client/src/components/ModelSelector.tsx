
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
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

interface ModelSelectorProps {
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  currentModel?: AIModel;
  onDevelopmentModeChange?: (mode: DevelopmentMode) => void;
  developmentMode?: DevelopmentMode;
  showNoApiWarning?: boolean;
}

export default function ModelSelector({
  currentModel = 'gpt-4o',
  onModelChange,
  developmentMode = 'interactive',
  onDevelopmentModeChange,
  showNoApiWarning = false,
}: ModelSelectorProps) {
  const handleModelChange = (value: string) => {
    if (onModelChange) {
      onModelChange(value);
      
      // Mostrar notificación
      const { toast } = useToast();
      const modelInfo = MODEL_INFO[value as AIModel];
      toast({
        title: "Modelo actualizado",
        description: `Ahora estás usando ${modelInfo?.name || value}`,
        variant: "default",
      });
    }
  };

  const toggleDevelopmentMode = () => {
    if (onDevelopmentModeChange) {
      const newMode = developmentMode === 'interactive' ? 'autonomous' : 'interactive';
      onDevelopmentModeChange(newMode);
      
      // Mostrar notificación
      const { toast } = useToast();
      toast({
        title: "Modo de desarrollo cambiado",
        description: `Modo ${newMode === 'autonomous' ? 'autónomo' : 'interactivo'} activado`,
        variant: "default",
      });
    }
  };

  // Verificar el estado de las claves API
  const apiKeyStatus: Record<string, boolean> = {
    'gpt-4o': !!localStorage.getItem('openai_api_key'),
    'gemini-2.5': !!localStorage.getItem('google_api_key'),
    'claude-3-7': !!localStorage.getItem('anthropic_api_key'),
    'claude-3-5-sonnet-v2': !!localStorage.getItem('anthropic_api_key'),
    'qwen-2.5-omni-7b': true
  };

  const currentModelInfo = MODEL_INFO[currentModel as AIModel];

  return (
    <div className="space-y-4 p-4 bg-slate-900 rounded-lg">
      <div>
        <Label htmlFor="model-select" className="text-sm font-medium mb-2 block text-slate-200">
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
              <SelectLabel className="text-slate-400">OpenAI</SelectLabel>
              <SelectItem value="gpt-4o" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span>GPT-4.0</span>
                  {!apiKeyStatus['gpt-4o'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel className="text-slate-400">Google</SelectLabel>
              <SelectItem value="gemini-2.5" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span>Gemini 2.5 Pro</span>
                  {!apiKeyStatus['gemini-2.5'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-slate-400">Anthropic</SelectLabel>
              <SelectItem value="claude-3-7" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span>Claude 3.7</span>
                  {!apiKeyStatus['claude-3-7'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
              <SelectItem value="claude-3-5-sonnet-v2" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span>Claude 3.5 Sonnet V2</span>
                  {!apiKeyStatus['claude-3-5-sonnet-v2'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-slate-400">Local</SelectLabel>
              <SelectItem value="qwen-2.5-omni-7b" className="text-white hover:bg-slate-700">
                <span>Qwen 2.5 Omni 7B</span>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {currentModelInfo && (
          <div className="mt-2 text-xs text-slate-400">
            {currentModelInfo.description}
          </div>
        )}
      </div>

      {showNoApiWarning && !apiKeyStatus[currentModel] && (
        <Alert variant="warning" className="bg-amber-900/30 border-amber-700">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="flex flex-col space-y-2">
            <span>No hay clave API configurada para {currentModelInfo?.name || currentModel}.</span>
            <Button 
              size="sm" 
              variant="outline"
              className="mt-2 text-amber-400 border-amber-400 hover:bg-amber-400/10"
              onClick={() => {
                const apiSection = document.getElementById('api-keys-section');
                if (apiSection) apiSection.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Configurar API Key
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
        <div>
          <Label htmlFor="autonomous-mode" className="text-sm font-medium text-slate-200">
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
