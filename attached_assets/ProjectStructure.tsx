import { FolderIcon, FileIcon, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

// Helper function to build the file tree structure
const buildFileTree = (files: { path: string }[]): FileNode[] => {
  const root: FileNode[] = [];
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let currentLevel = root;
    
    parts.forEach((part, index) => {
      // Skip empty parts
      if (!part) return;
      
      // Find if this part already exists at the current level
      const existing = currentLevel.find(node => node.name === part);
      
      if (index === parts.length - 1) {
        // This is a file
        if (!existing) {
          currentLevel.push({
            name: part,
            path: file.path,
            type: 'file'
          });
        }
      } else {
        // This is a directory
        if (existing && existing.type === 'directory') {
          currentLevel = existing.children!;
        } else {
          const newDir: FileNode = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: 'directory',
            children: []
          };
          currentLevel.push(newDir);
          currentLevel = newDir.children!;
        }
      }
    });
  });
  
  return root;
};

interface TreeNodeProps {
  node: FileNode;
  level: number;
}

const TreeNode = ({ node, level }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  
  const toggleOpen = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    }
  };
  
  const isDirectory = node.type === 'directory';
  
  // Determine file icon based on extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Default file icon color
    let iconColor = 'text-blue-400';
    
    switch (extension) {
      case 'js':
      case 'jsx':
        iconColor = 'text-yellow-400';
        break;
      case 'ts':
      case 'tsx':
        iconColor = 'text-blue-400';
        break;
      case 'css':
      case 'scss':
        iconColor = 'text-blue-500';
        break;
      case 'html':
        iconColor = 'text-orange-400';
        break;
      case 'json':
        iconColor = 'text-yellow-300';
        break;
      case 'md':
        iconColor = 'text-gray-400';
        break;
      default:
        iconColor = 'text-blue-400';
    }
    
    return <FileIcon className={`h-4 w-4 ${iconColor}`} />;
  };
  
  return (
    <div>
      <div 
        className="flex items-center py-1 px-2 hover:bg-navy-700/40 cursor-pointer rounded-sm"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={toggleOpen}
      >
        {isDirectory ? (
          <>
            {isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            <FolderIcon className="h-4 w-4 text-yellow-400 mr-2" />
          </>
        ) : (
          <>
            <div className="w-4 mr-1"></div>
            {getFileIcon(node.name)}
            <span className="ml-2"></span>
          </>
        )}
        <span className="text-sm">{node.name}</span>
      </div>
      
      <AnimatePresence>
        {isOpen && isDirectory && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child, index) => (
              <TreeNode key={`${child.path}-${index}`} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProjectStructure() {
  const { currentProject } = useAppContext();
  
  if (!currentProject || currentProject.files.length === 0) {
    return (
      <div className="h-full bg-navy-900 flex items-center justify-center p-4">
        <p className="text-gray-400 text-center">No hay estructura de proyecto definida todavía.</p>
      </div>
    );
  }
  
  const fileTree = buildFileTree(currentProject.files);
  
  // Create a project root node
  const projectRoot: FileNode = {
    name: currentProject.name || 'Proyecto',
    path: '/',
    type: 'directory',
    children: fileTree
  };
  
  return (
    <div className="h-full bg-navy-900 p-4 overflow-y-auto">
      <h3 className="font-['Orbitron'] text-lg mb-3">Estructura del Proyecto</h3>
      <div className="text-sm">
        <TreeNode node={projectRoot} level={0} />
      </div>
    </div>
  );
}
