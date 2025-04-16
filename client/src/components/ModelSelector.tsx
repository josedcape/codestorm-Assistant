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
                GPT-4o
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Google</SelectLabel>
              <SelectItem value="gemini-2.5" className="text-white focus:bg-slate-700 focus:text-white">
                Gemini 2.5 Pro
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Anthropic</SelectLabel>
              <SelectItem value="claude-3-7" className="text-white focus:bg-slate-700 focus:text-white">
                Claude 3.5 Sonnet
              </SelectItem>
              <SelectItem value="claude-3-5-sonnet-v2" className="text-white focus:bg-slate-700 focus:text-white">
                Claude 3.5 Sonnet v2
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