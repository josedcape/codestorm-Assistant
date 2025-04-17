import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RobotLogo } from './RobotLogo';
import { useAppContext } from '@/context/AppContext';
import { 
  FolderOpen, 
  Bot, 
  EyeIcon, 
  Settings, 
  Menu as MenuIcon,
  Code,
  Terminal,
  ExternalLink,
  PackageIcon,
  X
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const handleToggleFileExplorer = () => {
    if (toggleFileExplorer) {
      toggleFileExplorer();
    } else if (setShowFileExplorer) {
      setShowFileExplorer(!showFileExplorer);
    }
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleToggleAIAssistant = () => {
    if (toggleAIAssistant) {
      toggleAIAssistant();
    } else if (setShowAIAssistant) {
      setShowAIAssistant(!showAIAssistant);
    }
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Cierra el menú móvil cuando cambia el tamaño de la pantalla a desktop
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <header className="w-full bg-slate-800 border-b border-slate-700 py-2 px-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="flex items-center"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <RobotLogo />
            <motion.span 
              className="codestorm-logo ml-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              CODESTORM
            </motion.span>
          </motion.div>
        </div>

        {/* Botones de navegación para desktop */}
        {!isMobile && (
          <div className="flex items-center space-x-1">
            <Button
              variant={showFileExplorer ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFileExplorer}
              className="gap-1"
            >
              <FolderOpen size={16} />
              <span>Explorer</span>
            </Button>

            <Button
              variant={showAIAssistant ? "default" : "outline"}
              size="sm"
              onClick={handleToggleAIAssistant}
              className="gap-1"
            >
              <Bot size={16} />
              <span>Asistente</span>
            </Button>

            {togglePreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreview}
                className="gap-1"
              >
                <EyeIcon size={16} />
                <span>Vista Previa</span>
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
                <span>Configuración</span>
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
                <span>WebView</span>
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
                <span>Terminal</span>
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

        {/* Menú móvil */}
        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] p-0">
              <div className="flex flex-col h-full bg-slate-800">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <span className="font-semibold text-gold-400">Menú</span>
                  <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                    <X size={18} />
                  </Button>
                </div>
                <div className="p-3 flex flex-col space-y-2">
                  <Button
                    variant={showFileExplorer ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={handleToggleFileExplorer}
                  >
                    <FolderOpen size={16} className="mr-2" />
                    Explorer
                  </Button>
                  <Button
                    variant={showAIAssistant ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={handleToggleAIAssistant}
                  >
                    <Bot size={16} className="mr-2" />
                    Asistente
                  </Button>
                  
                  {togglePreview && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        togglePreview();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <EyeIcon size={16} className="mr-2" />
                      Vista Previa
                    </Button>
                  )}
                  
                  {toggleSettings && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toggleSettings();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Settings size={16} className="mr-2" />
                      Configuración
                    </Button>
                  )}
                  
                  {toggleWebView && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toggleWebView();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <ExternalLink size={16} className="mr-2" />
                      WebView
                    </Button>
                  )}
                  
                  {toggleTerminal && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toggleTerminal();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Terminal size={16} className="mr-2" />
                      Terminal
                    </Button>
                  )}
                  
                  <Button 
                    variant="default"
                    className="w-full justify-start text-amber-300"
                    onClick={() => {
                      setShowProjectPlanner(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <PackageIcon size={16} className="mr-2" />
                    Planificador de Proyectos
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};

export default Header;