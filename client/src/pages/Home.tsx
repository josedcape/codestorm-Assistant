import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import EditorContainer from '@/components/EditorContainer';
import { EditorProvider } from '@/hooks/useEditor';
import CodestormAssistant from '@/components/CodestormAssistant';

const Home: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  
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
  
  return (
    <EditorProvider>
      <div className="h-screen flex flex-col bg-background">
        <TopBar toggleSidebar={toggleSidebar} />
        
        <div 
          className={`flex flex-1 overflow-hidden ${sidebarOpen ? 'sidebar-open' : ''}`} 
          id="main-container"
        >
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <EditorContainer />
          <CodestormAssistant />
        </div>
      </div>
    </EditorProvider>
  );
};

export default Home;
