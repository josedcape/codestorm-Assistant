<<<<<<< HEAD
import React from 'react';

interface StatusBarProps {
  line: number;
  column: number;
  language: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ line, column, language }) => {
  const formatLanguage = (lang: string): string => {
    if (!lang) return "Plain Text";
    
    const langMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'markdown': 'Markdown',
      'python': 'Python',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'csharp': 'C#',
    };
    
    return langMap[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  return (
    <div className="border-t border-editor-border bg-editor-sidebar text-xs flex items-center justify-between py-1 px-2">
      <div className="flex items-center space-x-3">
        <span><i className="fas fa-code-branch mr-1"></i>main</span>
        <span><i className="fas fa-sync-alt mr-1"></i>0 ↓ 2 ↑</span>
        <span>Ln {line}, Col {column}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span>{formatLanguage(language)}</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
      </div>
    </div>
  );
};

export default StatusBar;
=======
import { Database, GitBranch, Package, Server } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";

export default function StatusBar() {
  const { currentProject } = useAppContext();
  
  const projectName = currentProject?.name || "Sin proyecto";
  const techStack = currentProject?.tech_stack || [];
  
  // Determine technologies based on tech stack
  const hasMongoDB = techStack.some(tech => tech.toLowerCase().includes('mongo'));
  const hasReact = techStack.some(tech => tech.toLowerCase().includes('react'));
  const hasNode = techStack.some(tech => tech.toLowerCase().includes('node') || tech.toLowerCase().includes('express'));
  const hasOtherDb = techStack.some(tech => 
    tech.toLowerCase().includes('postgres') || 
    tech.toLowerCase().includes('mysql') || 
    tech.toLowerCase().includes('sqlite')
  );
  
  // Determine version numbers for display
  const reactVersion = "18.2.0";
  const nodeVersion = "16.14.2";
  
  return (
    <motion.div 
      className="bg-navy-800 border-t border-navy-700 py-3 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-blue-400" />
            <span>Proyecto: <span className="text-white">{projectName}</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-blue-400" />
            <span>Rama: <span className="text-white">main</span></span>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm">
          {(hasMongoDB || hasOtherDb) && (
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" />
              <span>{hasMongoDB ? 'MongoDB' : 'Database'}</span>
            </div>
          )}
          
          {hasReact && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>React {reactVersion}</span>
            </div>
          )}
          
          {hasNode && (
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              <span>Node {nodeVersion}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
>>>>>>> 132aeba36e2ea9de048066f0f5011c34e421d7d7
