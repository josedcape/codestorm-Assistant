import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import EditorContainer from '@/components/EditorContainer';
import { EditorProvider } from '@/hooks/useEditor';

const Home: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
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
      <div className="h-screen flex flex-col">
        <TopBar toggleSidebar={toggleSidebar} />
        
        <div 
          className={`flex flex-1 overflow-hidden ${sidebarOpen ? 'sidebar-open' : ''}`} 
          id="main-container"
        >
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <EditorContainer />
        </div>
      </div>
    </EditorProvider>
  );
};

export default Home;
