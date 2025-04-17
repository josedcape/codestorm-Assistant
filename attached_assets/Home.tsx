import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatInterface from '@/components/ChatInterface';
import DevEnvironment from '@/components/DevEnvironment';
import Header from '@/components/Header';
import StatusBar from '@/components/StatusBar';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Home() {
  const { startNewProject, currentProject } = useAppContext();
  const initializedRef = useRef(false);
  
  // Initialize app with a new project if none exists, but only once
  useEffect(() => {
    if (!currentProject && !initializedRef.current) {
      initializedRef.current = true;
      startNewProject();
    }
  }, [currentProject]);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <motion.main 
        className="flex-grow container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Panel - Chat Interface */}
        <div className="lg:col-span-5">
          <ChatInterface />
        </div>
        
        {/* Right Panel - Development Environment */}
        <div className="lg:col-span-7">
          <DevEnvironment />
        </div>
      </motion.main>
      
      {/* Status Bar */}
      <StatusBar />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={startNewProject}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
