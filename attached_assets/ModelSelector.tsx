<<<<<<< HEAD
import React, { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Alert, AlertCircle, AlertDescription } from "./ui/alert";


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
  const [apiKeyStatus, setApiKeyStatus] = React.useState<{[key: string]: boolean}>({});
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
        <label className="text-sm text-slate-300">Modelo AI</label>
        <Select 
          value={currentModelValue} 
          onValueChange={val => {
            if (onModelChange) onModelChange(val);
          }}
        >
          <SelectTrigger className="w-full bg-slate-700">
            <SelectValue placeholder="Selecciona un modelo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800">
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
        <Alert variant="warning" className="bg-amber-900/30 border-amber-700">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription>
            No hay clave API configurada para {currentModelInfo.name}. 
            Configúrala en la pestaña API Keys.
          </AlertDescription>
        </Alert>
      )}

      {currentModelInfo && (
        <div className="bg-slate-700 p-2 rounded text-sm">
          <p className="font-medium mb-1">{currentModelInfo.name}</p>
          <p className="text-slate-300 text-xs">{currentModelInfo.description}</p>
          <p className="text-slate-400 text-xs mt-1">Lanzamiento: {currentModelInfo.releaseDate}</p>
        </div>
      )}

      {developmentMode !== undefined && onDevelopmentModeChange && (
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Modo de desarrollo</label>
          <Select 
            value={developmentMode} 
            onValueChange={(val: 'interactive' | 'autonomous') => onDevelopmentModeChange(val)}
          >
            <SelectTrigger className="w-full bg-slate-700">
              <SelectValue placeholder="Selecciona un modo" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800">
              <SelectItem value="interactive">Interactivo (con confirmaciones)</SelectItem>
              <SelectItem value="autonomous">Autónomo (sin confirmaciones)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {autonomousMode !== undefined && onAutonomousModeChange && (
        <div className="flex items-center space-x-2 mt-4">
          <Switch 
            id="autonomous-mode" 
            checked={autonomousMode}
            onCheckedChange={onAutonomousModeChange}
          />
          <Label htmlFor="autonomous-mode" className="text-sm">
            Modo autónomo (sin confirmaciones)
          </Label>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
=======
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Brain, Bot, Cpu } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { ModelProvider } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ModelOption {
  id: ModelProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const modelOptions: ModelOption[] = [
  {
    id: "openai",
    name: "GPT-4",
    description: "Mayor precisión, código avanzado",
    icon: <Brain className="h-5 w-5" />,
    color: "bg-green-500"
  },
  {
    id: "anthropic",
    name: "Claude 3",
    description: "Explicaciones detalladas",
    icon: <Bot className="h-5 w-5" />,
    color: "bg-purple-500"
  },
  {
    id: "gemini",
    name: "Gemini Pro",
    description: "Balanceado para código",
    icon: <Cpu className="h-5 w-5" />,
    color: "bg-blue-500"
  }
];

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedModel, setSelectedModel } = useAppContext();
  const { toast } = useToast();
  const [tempModel, setTempModel] = useState<ModelProvider>(selectedModel);
  
  const handleConfirm = () => {
    setSelectedModel(tempModel);
    setIsOpen(false);
    toast({
      title: "Modelo cambiado",
      description: `Ahora usando ${modelOptions.find(m => m.id === tempModel)?.name}.`,
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-navy-800 text-white border-navy-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Orbitron'] text-xl">Seleccionar Modelo IA</DialogTitle>
        </DialogHeader>
        
        <RadioGroup value={tempModel} onValueChange={(v) => setTempModel(v as ModelProvider)} className="space-y-4 mt-4">
          {modelOptions.map((option) => (
            <div 
              key={option.id}
              className={`p-4 border border-navy-700 rounded-lg hover:bg-navy-700/50 cursor-pointer transition-colors ${tempModel === option.id ? 'bg-navy-700/50' : ''}`}
            >
              <RadioGroupItem 
                value={option.id} 
                id={option.id}
                className="hidden"
              />
              <Label 
                htmlFor={option.id}
                className="flex justify-between items-center cursor-pointer w-full"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${option.color} flex items-center justify-center`}>
                    {option.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{option.name}</h4>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${tempModel === option.id ? `border-${option.color.replace('bg-', '')}` : 'border-gray-500'} flex items-center justify-center`}>
                  {tempModel === option.id && (
                    <div className={`w-3 h-3 ${option.color} rounded-full`}></div>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <Button 
          className="w-full py-3 mt-6 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={handleConfirm}
        >
          Confirmar Selección
        </Button>
      </DialogContent>
    </Dialog>
  );
}
>>>>>>> 132aeba36e2ea9de048066f0f5011c34e421d7d7
