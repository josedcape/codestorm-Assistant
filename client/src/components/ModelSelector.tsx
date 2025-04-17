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
import { AlertCircle, BrainCircuit, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ModelSelectorProps {
  currentModel: AIModel;
  onModelChange: (model: AIModel) => void;
  developmentMode: DevelopmentMode;
  onDevelopmentModeChange: (mode: DevelopmentMode) => void;
  showNoApiWarning?: boolean;
}

export default function ModelSelector({
  currentModel = 'gpt-4o',
  onModelChange,
  developmentMode = 'interactive',
  onDevelopmentModeChange,
  showNoApiWarning = false,
}: ModelSelectorProps) {
  const { toast } = useToast();

  const handleModelChange = (value: AIModel) => {
    if (onModelChange) {
      onModelChange(value);

      const modelInfo = MODEL_INFO[value];
      toast({
        title: "Modelo Actualizado",
        description: `${modelInfo?.name || value} activado correctamente`,
        variant: "default",
        className: "bg-slate-800 border-slate-700",
        duration: 3000,
      });
    }
  };

  const toggleDevelopmentMode = () => {
    if (onDevelopmentModeChange) {
      const newMode: DevelopmentMode = developmentMode === 'interactive' ? 'autonomous' : 'interactive';
      onDevelopmentModeChange(newMode);

      // Mostrar notificación
      toast({
        title: "Modo de desarrollo cambiado",
        description: `Modo ${newMode === 'autonomous' ? 'autónomo' : 'interactivo'} activado`,
        variant: "default",
      });
    }
  };

  // Verificar el estado de las claves API
  const apiKeyStatus: Record<AIModel, boolean> = {
    'gpt-4o': !!localStorage.getItem('openai_api_key'),
    'gpt-4': !!localStorage.getItem('openai_api_key'),
    'gpt-3.5-turbo': !!localStorage.getItem('openai_api_key'),
    'gemini-2.5-pro': !!localStorage.getItem('google_api_key'),
    'claude-3': !!localStorage.getItem('anthropic_api_key'),
    'claude-2.1': !!localStorage.getItem('anthropic_api_key'),
    'qwen-2.5-omni-7b': true
  };

  const currentModelInfo = MODEL_INFO[currentModel];

  return (
    <div className="space-y-4">
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
                  <span className="flex items-center">
                    <BrainCircuit size={14} className="mr-2 text-blue-400" />
                    GPT-4o
                  </span>
                  {!apiKeyStatus['gpt-4o'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
              <SelectItem value="gpt-4" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <BrainCircuit size={14} className="mr-2 text-blue-400" />
                    GPT-4
                  </span>
                  {!apiKeyStatus['gpt-4'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
              <SelectItem value="gpt-3.5-turbo" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <BrainCircuit size={14} className="mr-2 text-blue-400" />
                    GPT-3.5 Turbo
                  </span>
                  {!apiKeyStatus['gpt-3.5-turbo'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-slate-400">Google</SelectLabel>
              <SelectItem value="gemini-2.5-pro" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <Sparkles size={14} className="mr-2 text-emerald-400" />
                    Gemini 2.5 Pro
                  </span>
                  {!apiKeyStatus['gemini-2.5-pro'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-slate-400">Anthropic</SelectLabel>
              <SelectItem value="claude-3" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <Bot size={14} className="mr-2 text-purple-400" />
                    Claude 3
                  </span>
                  {!apiKeyStatus['claude-3'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
              <SelectItem value="claude-2.1" className="text-white hover:bg-slate-700">
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <Bot size={14} className="mr-2 text-purple-400" />
                    Claude 2.1
                  </span>
                  {!apiKeyStatus['claude-2.1'] && (
                    <AlertCircle size={14} className="text-amber-400" />
                  )}
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {currentModelInfo && (
          <motion.div 
            className="mt-2 text-xs text-slate-400 bg-slate-800 rounded-md p-2 border border-slate-700"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-200">{currentModelInfo.name}</span>
              <Badge variant="outline" className="text-[10px] py-0 h-5">
                {currentModelInfo.releaseDate || 'Latest'}
              </Badge>
            </div>
            <p className="mt-1">{currentModelInfo.description}</p>
          </motion.div>
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
            Permitir que el asistente ejecute comandos automáticamente
          </p>
        </div>
        <Switch
          id="autonomous-mode"
          checked={developmentMode === 'autonomous'}
          onCheckedChange={toggleDevelopmentMode}
        />
      </div>

      {developmentMode === 'autonomous' && (
        <motion.div 
          className="p-2 bg-blue-900/20 rounded-md border border-blue-800"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="text-xs text-slate-300">
            <span className="font-medium text-blue-400">Modo autónomo activado:</span> El asistente 
            ejecutará los comandos automáticamente sin pedir confirmación.
          </p>
        </motion.div>
      )}
    </div>
  );
}