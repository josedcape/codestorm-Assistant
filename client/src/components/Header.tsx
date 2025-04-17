import React from 'react';
import { Button } from '@/components/ui/button';
import { RobotLogo } from './RobotLogo';
import { useAppContext } from '@/context/AppContext';
import { 
  FolderOpen, 
  Bot, 
  EyeIcon, 
  Settings, 
  MenuIcon,
  Code,
  Terminal,
  Braces,
  ExternalLink,
  PackageIcon
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface HeaderProps {
  toggleFileExplorer?: () => void;
  toggleAIAssistant?: () => void;
  togglePreview?: () => void;
  toggleSettings?: () => void;
  toggleWebView?: () => void;
  toggleTerminal?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleFileExplorer,
  toggleAIAssistant,
  togglePreview,
  toggleSettings,
  toggleWebView,
  toggleTerminal,
}) => {
  const { 
    showFileExplorer, 
    showAIAssistant, 
    setShowFileExplorer, 
    setShowAIAssistant,
    setShowProjectPlanner
  } = useAppContext();

  const isMobile = useIsMobile();

  const handleToggleFileExplorer = () => {
    if (toggleFileExplorer) {
      toggleFileExplorer();
    } else if (setShowFileExplorer) {
      setShowFileExplorer(!showFileExplorer);
    }
  };

  const handleToggleAIAssistant = () => {
    if (toggleAIAssistant) {
      toggleAIAssistant();
    } else if (setShowAIAssistant) {
      setShowAIAssistant(!showAIAssistant);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white py-2 px-4">
      <div className="flex items-center justify-between">
        {/* Logo y nombre */}
        <div className="flex items-center">
          <motion.div 
            className="h-8 w-8 mr-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <RobotLogo />
          </motion.div>
          <motion.h1 
            className="text-xl font-bold futuristic-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            CODESTORM
          </motion.h1>
        </div>

        {/* Botones de navegación */}
        {!isMobile && (
          <div className="flex items-center space-x-1">
            <Button
              variant={showFileExplorer ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFileExplorer}
              className="gap-1"
            >
              <FolderOpen size={16} />
              {!isMobile && <span>Explorer</span>}
            </Button>

            <Button
              variant={showAIAssistant ? "default" : "outline"}
              size="sm"
              onClick={handleToggleAIAssistant}
              className="gap-1"
            >
              <Bot size={16} />
              {!isMobile && <span>Asistente</span>}
            </Button>

            {togglePreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreview}
                className="gap-1"
              >
                <EyeIcon size={16} />
                {!isMobile && <span>Vista Previa</span>}
              </Button>
            )}

            {toggleSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSettings}
                className="gap-1"
              >
                <Settings size={16} />
                {!isMobile && <span>Configuración</span>}
              </Button>
            )}
            {toggleWebView && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleWebView}
                className="gap-1"
              >
                <ExternalLink size={16} />
                {!isMobile && <span>WebView</span>}
              </Button>
            )}
            {toggleTerminal && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTerminal}
                className="gap-1"
              >
                <Terminal size={16} />
                {!isMobile && <span>Terminal</span>}
              </Button>
            )}
            <Button 
              variant="ghost" 
              title="Planificador de Proyectos" 
              onClick={() => setShowProjectPlanner(true)}
            >
              <PackageIcon size={20} />
            </Button>
          </div>
        )}

        {/* Botón de menú móvil */}
        {isMobile && (
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon size={20} />
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;