import React from 'react';

// Map of file extensions to icon components
// This centralizes our icon definitions for consistent use throughout the app

export const FileIcon: React.FC<{ filename: string; className?: string }> = ({ 
  filename, 
  className = "" 
}) => {
  const extension = filename.split('.').pop() || '';
  
  switch (extension.toLowerCase()) {
    case 'js':
      return <i className={`fas fa-file-code text-yellow-400 ${className}`}></i>;
    case 'ts':
      return <i className={`fas fa-file-code text-blue-400 ${className}`}></i>;
    case 'jsx':
    case 'tsx':
      return <i className={`fas fa-file-code text-blue-500 ${className}`}></i>;
    case 'css':
      return <i className={`fas fa-file-code text-purple-400 ${className}`}></i>;
    case 'html':
      return <i className={`fas fa-file-code text-orange-400 ${className}`}></i>;
    case 'json':
      return <i className={`fas fa-file-code text-yellow-300 ${className}`}></i>;
    case 'md':
      return <i className={`fas fa-file-alt text-gray-300 ${className}`}></i>;
    case 'py':
      return <i className={`fas fa-file-code text-green-400 ${className}`}></i>;
    case 'java':
      return <i className={`fas fa-file-code text-red-400 ${className}`}></i>;
    case 'php':
      return <i className={`fas fa-file-code text-purple-500 ${className}`}></i>;
    case 'rb':
      return <i className={`fas fa-file-code text-red-500 ${className}`}></i>;
    case 'go':
      return <i className={`fas fa-file-code text-blue-300 ${className}`}></i>;
    case 'rs':
      return <i className={`fas fa-file-code text-orange-500 ${className}`}></i>;
    case 'c':
    case 'cpp':
    case 'h':
      return <i className={`fas fa-file-code text-blue-600 ${className}`}></i>;
    case 'sh':
      return <i className={`fas fa-terminal text-gray-400 ${className}`}></i>;
    case 'svg':
      return <i className={`fas fa-file-image text-green-300 ${className}`}></i>;
    case 'gitignore':
    case 'env':
      return <i className={`fas fa-file-alt text-gray-400 ${className}`}></i>;
    default:
      return <i className={`fas fa-file text-gray-300 ${className}`}></i>;
  }
};

export const FolderIcon: React.FC<{ isOpen?: boolean; className?: string }> = ({ 
  isOpen = false, 
  className = "" 
}) => {
  return isOpen 
    ? <i className={`fas fa-folder-open text-editor-warning ${className}`}></i>
    : <i className={`fas fa-folder text-editor-warning ${className}`}></i>;
};

export const ChevronIcon: React.FC<{ isOpen?: boolean; className?: string }> = ({ 
  isOpen = false, 
  className = "" 
}) => {
  return isOpen 
    ? <i className={`fas fa-chevron-down fa-xs text-editor-text ${className}`}></i>
    : <i className={`fas fa-chevron-right fa-xs text-editor-text ${className}`}></i>;
};

export const GitStatusIcon: React.FC<{ status: string; className?: string }> = ({ 
  status, 
  className = "" 
}) => {
  switch (status) {
    case 'added':
      return <i className={`fas fa-plus text-editor-success ${className}`}></i>;
    case 'modified':
      return <i className={`fas fa-pen text-editor-warning ${className}`}></i>;
    case 'deleted':
      return <i className={`fas fa-trash text-editor-error ${className}`}></i>;
    case 'renamed':
      return <i className={`fas fa-exchange-alt text-editor-text ${className}`}></i>;
    case 'untracked':
      return <i className={`fas fa-question text-editor-text ${className}`}></i>;
    default:
      return <i className={`fas fa-circle text-editor-text ${className}`}></i>;
  }
};
