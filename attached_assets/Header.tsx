<<<<<<< HEAD
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useCodeExecution from '@/hooks/useCodeExecution';
import { 
  Play, 
  Cog, 
  FolderOpen, 
  Code, 
  Zap, 
  Save, 
  FileIcon, 
  Download, 
  Upload, 
  Scissors, 
  Copy, 
  Clipboard, 
  Eye, 
  Bot,
  Sparkles,
  Settings
} from 'lucide-react';

interface HeaderProps {
  toggleFileExplorer: () => void;
  toggleAIAssistant?: () => void;
  togglePreview?: () => void;
  toggleSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  toggleFileExplorer,
  toggleAIAssistant,
  togglePreview,
  toggleSettings
}) => {
  const { executeCode, isExecuting } = useCodeExecution();
  const [showTutorialTip, setShowTutorialTip] = useState(false);

  const handleExecuteCode = (e: React.MouseEvent) => {
    e.preventDefault();
    executeCode();
  };

  return (
    <header className="bg-slate-900 border-b silver-border py-2 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="futuristic-title flex items-center">
          <Zap className="mr-2 text-amber-400" />
          CODESTORM
        </div>
        <nav className="hidden md:flex space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="futuristic-button px-3 py-1 text-sm">
                Archivo
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={() => console.log('Nuevo archivo')}>
                <FileIcon size={16} className="mr-2" />
                Nuevo archivo
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={() => console.log('Guardar')}>
                <Save size={16} className="mr-2" />
                Guardar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={() => console.log('Exportar proyecto')}>
                <Download size={16} className="mr-2" />
                Exportar proyecto
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={() => console.log('Importar archivo')}>
                <Upload size={16} className="mr-2" />
                Importar archivo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="futuristic-button px-3 py-1 text-sm">
                Editar
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={() => console.log('Cortar')}>
                <Scissors size={16} className="mr-2" />
                Cortar
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={() => console.log('Copiar')}>
                <Copy size={16} className="mr-2" />
                Copiar
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={() => console.log('Pegar')}>
                <Clipboard size={16} className="mr-2" />
                Pegar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="futuristic-button px-3 py-1 text-sm">
                Ver
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuItem 
                className="hover:bg-slate-700 cursor-pointer" 
                onClick={toggleFileExplorer}
              >
                <FolderOpen size={16} className="mr-2" />
                Explorador de archivos
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-slate-700 cursor-pointer" 
                onClick={toggleAIAssistant}
              >
                <Bot size={16} className="mr-2" />
                Asistente IA
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-slate-700 cursor-pointer" 
                onClick={togglePreview}
              >
                <Eye size={16} className="mr-2" />
                Vista previa
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                className="hover:bg-slate-700 cursor-pointer" 
                onClick={() => setShowTutorialTip(!showTutorialTip)}
              >
                <Sparkles size={16} className="mr-2" />
                Mostrar consejos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button className="futuristic-button px-3 py-1 text-sm" onClick={toggleFileExplorer}>
            <FolderOpen size={16} className="mr-1 inline" />
            Archivos
          </button>
        </nav>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={handleExecuteCode}
          disabled={isExecuting}
          className="futuristic-button px-4 py-2 flex items-center"
        >
          <Play size={16} className="mr-2" />
          {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
        </Button>
        
        <button 
          className="futuristic-button p-2 rounded-full pulse-animation"
          title="Configuración"
          onClick={toggleSettings}
        >
          <Settings size={18} />
        </button>
      </div>
      
      {showTutorialTip && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-blue-900 p-3 rounded shadow-lg border silver-border text-sm max-w-sm text-center">
          <p>¡Consejo! Puedes usar los botones de la barra lateral para acceder rápidamente a diferentes funciones.</p>
          <button 
            onClick={() => setShowTutorialTip(false)}
            className="mt-2 text-xs underline text-blue-300 hover:text-blue-200"
          >
            Cerrar
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
=======
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Settings, Rocket } from "lucide-react";
import { RobotLogo } from './RobotLogo';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAppContext } from '@/context/AppContext';

const SettingsDialog = () => {
  const { toast } = useToast();
  const { settings, refreshSettings } = useAppContext();
  const [openAIKey, setOpenAIKey] = useState(settings?.api_keys?.openai || '');
  const [anthropicKey, setAnthropicKey] = useState(settings?.api_keys?.anthropic || '');
  const [geminiKey, setGeminiKey] = useState(settings?.api_keys?.gemini || '');
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSaveSettings = async () => {
    try {
      await apiRequest('PATCH', '/api/settings', {
        api_keys: {
          openai: openAIKey,
          anthropic: anthropicKey,
          gemini: geminiKey
        }
      });
      
      await refreshSettings();
      
      toast({
        title: "Configuración guardada",
        description: "Tus claves de API han sido actualizadas.",
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 bg-navy-700 rounded-md text-sm hover:bg-navy-800 transition-colors flex items-center gap-2">
          <Settings className="h-4 w-4" /> Configuración
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-navy-800 text-white border-navy-700">
        <DialogHeader>
          <DialogTitle className="font-['Orbitron']">Configuración de API</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input
              id="openai-key"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="sk-..."
              className="bg-navy-900 border-navy-700"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="anthropic-key">Anthropic API Key</Label>
            <Input
              id="anthropic-key"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="bg-navy-900 border-navy-700"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gemini-key">Google Gemini API Key</Label>
            <Input
              id="gemini-key"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              className="bg-navy-900 border-navy-700"
            />
          </div>
          <Button onClick={handleSaveSettings} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600">
            Guardar Configuración
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Header() {
  const { toast } = useToast();
  const { startNewProject } = useAppContext();
  
  const handleNewProject = () => {
    startNewProject();
    toast({
      title: "Nuevo proyecto iniciado",
      description: "Describe los requisitos en el chat.",
    });
  };

  return (
    <header className="relative py-4 px-6 bg-navy-800 shadow-lg z-10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="flex items-center space-x-4 mb-4 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RobotLogo />
            <div>
              <motion.h1 
                className="font-['Orbitron'] text-2xl font-bold text-amber-500"
                style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.6)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                CODESTORM AI
              </motion.h1>
              <p className="text-sm text-gray-300">Agente autónomo especializado en desarrollo de software</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SettingsDialog />
            <Button 
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              onClick={handleNewProject}
            >
              <Rocket className="h-4 w-4" /> Nuevo Proyecto
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
>>>>>>> 132aeba36e2ea9de048066f0f5011c34e421d7d7
