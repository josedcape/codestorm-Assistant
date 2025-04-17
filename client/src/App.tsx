import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AppProvider, useAppContext } from "./context/AppContext";
import CodeCorrectionModal from './components/CodeCorrectionModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ProjectPlanner from '@/components/ProjectPlanner';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

const AppWithProviders = () => {
  const { selectedModel, setSelectedModel, showProjectPlanner, setShowProjectPlanner, isCodeCorrectionModalOpen, selectedFileForCorrection, closeCodeCorrectionModal, applyCodeCorrection } = useAppContext();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen overflow-y-auto"
    >
      <Router />
      <Toaster />

      {/* Diálogo del Planificador de Proyectos */}
      <Dialog open={showProjectPlanner} onOpenChange={setShowProjectPlanner}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <div className="p-6 h-full overflow-y-auto">
            <ProjectPlanner onComplete={() => setShowProjectPlanner(false)} />
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de corrección de código */}
      <CodeCorrectionModal 
        isOpen={isCodeCorrectionModalOpen}
        onClose={closeCodeCorrectionModal}
        file={selectedFileForCorrection}
        onApplyChanges={applyCodeCorrection}
      />
    </motion.div>
  );
}

function App() {
  // Set theme on component mount
  useEffect(() => {
    document.documentElement.classList.add("dark");

    // Create grid pattern background
    const body = document.body;
    body.style.backgroundColor = "#0A1929";
    body.style.backgroundImage = `
      radial-gradient(circle at 20% 20%, rgba(14, 42, 71, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(14, 42, 71, 0.4) 0%, transparent 40%)
    `;
    body.style.minHeight = "100vh";
    body.style.overflowX = "auto";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppWithProviders />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;