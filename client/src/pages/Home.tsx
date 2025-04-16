import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import FileExplorer from '@/components/FileExplorer';
import EditorContainer from '@/components/EditorContainer';
import { EditorProvider } from '@/hooks/useEditor';
import CodestormAssistant from '@/components/CodestormAssistant';
import StatusBar from '@/components/StatusBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppContext } from '@/context/AppContext';
import { Bot, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import WebView from '@/components/WebView'; // Added
import TerminalView from '@/components/TerminalView'; // Added

const Home: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const { 
    showWebView, 
    setShowWebView, 
    isWebViewMaximized, 
    setIsWebViewMaximized,
    showTerminal,
    setShowTerminal,
    isTerminalMaximized,
    setIsTerminalMaximized,
    startNewProject
  } = useAppContext(); // Added useAppContext

  // Simulación de inicio de proyecto
  const projectInitializedRef = useRef(false);

  useEffect(() => {
    if (!projectInitializedRef.current) {
      projectInitializedRef.current = true;
      // Inicializar proyecto si fuera necesario
      if (startNewProject) {
        startNewProject();
      }
    }
  }, [startNewProject]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAssistant = () => {
    setAssistantOpen(!assistantOpen);
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Simulación de abrir un archivo
  const handleOpenFile = (path: string, name: string) => {
    console.log(`Abriendo archivo ${name} en ${path}`);
  };

  return (
    <EditorProvider>
      <div className="h-screen flex flex-col bg-slate-950 text-white min-h-screen scroll-container">
        <Header 
          toggleFileExplorer={toggleSidebar} 
          toggleAIAssistant={toggleAssistant}
          onToggleWebView={() => setShowWebView(!showWebView)} // Added
          onToggleTerminal={() => setShowTerminal(!showTerminal)} // Added
        />

        <div className="flex flex-1 scroll-container">
          {sidebarOpen && !isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FileExplorer onOpenFile={handleOpenFile} />
            </motion.div>
          )}

          <div className="flex-grow scroll-container">
            <EditorContainer />
          </div>

          <AnimatePresence>
            {assistantOpen && !isMobile && (
              <CodestormAssistant 
                isOpen={assistantOpen} 
                onClose={() => setAssistantOpen(false)} 
              />
            )}
          </AnimatePresence>
        </div>

        <StatusBar 
          showTerminal={terminalVisible}
          toggleTerminal={() => setTerminalVisible(!terminalVisible)}
          language="javascript"
          line={10}
          column={25}
        />

        {showWebView && isWebViewMaximized && (
          <div className="fixed inset-0 bg-black/50 z-40">
            <div className="w-4/5 h-4/5 mx-auto mt-20 relative">
              <WebView 
                onClose={() => setShowWebView(false)}
                onMinimize={() => setIsWebViewMaximized(false)}
              />
            </div>
          </div>
        )}

        {showTerminal && isTerminalMaximized && (
          <div className="fixed inset-0 bg-black/50 z-40">
            <div className="w-4/5 h-4/5 mx-auto mt-20 relative">
              <TerminalView 
                onClose={() => setShowTerminal(false)}
                onMinimize={() => setIsTerminalMaximized(false)}
              />
            </div>
          </div>
        )}


        {showWebView && !isWebViewMaximized && (
          <div className="fixed bottom-4 left-4 z-50">
            <WebView 
              isMinimized 
              onMaximize={() => setIsWebViewMaximized(true)} 
            />
          </div>
        )}

        {showTerminal && !isTerminalMaximized && (
          <div className="fixed bottom-4 right-4 z-50">
            <TerminalView 
              isMinimized 
              onMaximize={() => setIsTerminalMaximized(true)} 
            />
          </div>
        )}

        {isMobile && (
          <>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  className="fixed top-16 left-4 h-10 w-10 rounded-full bg-blue-600 shadow-lg md:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] p-0 bg-slate-900 border-r border-slate-800">
                <FileExplorer 
                  onOpenFile={(path, name) => {
                    handleOpenFile(path, name);
                    setMobileMenuOpen(false);
                  }} 
                />
              </SheetContent>
            </Sheet>

            <Button 
              className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
              onClick={toggleAssistant}
            >
              {assistantOpen ? <X size={20} /> : <Bot size={20} />}
            </Button>

            <AnimatePresence>
              {assistantOpen && isMobile && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-hidden"
                >
                  <div className="h-full w-full flex flex-col">
                    <div className="flex items-center justify-end p-2 bg-slate-800">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setAssistantOpen(false)}
                        className="h-8 w-8"
                      >
                        <X size={18} />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <CodestormAssistant 
                        isOpen={true}
                        onClose={() => setAssistantOpen(false)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </EditorProvider>
  );
};

export default Home;