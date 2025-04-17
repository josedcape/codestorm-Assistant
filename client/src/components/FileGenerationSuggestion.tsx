
import React, { useState } from 'react';
import { File, Check, X, Code, FileText, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface FileSuggestion {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  description: string;
  isDirectory?: boolean;
}

interface FileGenerationSuggestionProps {
  files: FileSuggestion[];
  onAccept: (files: FileSuggestion[]) => void;
  onCancel: () => void;
}

const FileGenerationSuggestion: React.FC<FileGenerationSuggestionProps> = ({
  files,
  onAccept,
  onCancel
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileSuggestion[]>(files);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const { toast } = useToast();
  
  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev => {
      const fileExists = prev.some(file => file.id === id);
      if (fileExists) {
        return prev.filter(file => file.id !== id);
      } else {
        const fileToAdd = files.find(file => file.id === id);
        if (fileToAdd) {
          return [...prev, fileToAdd];
        }
        return prev;
      }
    });
  };
  
  const isSelected = (id: string) => selectedFiles.some(file => file.id === id);
  
  const handleAccept = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Ningún archivo seleccionado",
        description: "Debes seleccionar al menos un archivo para continuar",
        variant: "destructive"
      });
      return;
    }
    
    onAccept(selectedFiles);
  };
  
  const getFileIcon = (file: FileSuggestion) => {
    if (file.isDirectory) return <FolderPlus size={16} className="text-yellow-400" />;
    
    switch (file.language) {
      case 'javascript':
      case 'typescript':
      case 'jsx':
      case 'tsx':
        return <Code size={16} className="text-blue-400" />;
      case 'html':
        return <Code size={16} className="text-orange-400" />;
      case 'css':
      case 'scss':
        return <Code size={16} className="text-purple-400" />;
      default:
        return <FileText size={16} className="text-slate-400" />;
    }
  };
  
  return (
    <Card className="w-full border-slate-800 bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center">
          <File className="mr-2 h-5 w-5" />
          Sugerencia de archivos ({files.length})
        </CardTitle>
        <p className="text-sm text-slate-400">
          El agente sugiere los siguientes archivos para tu proyecto.
          Selecciona los que deseas generar.
        </p>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] pr-3">
          <div className="space-y-3">
            {files.map(file => (
              <div key={file.id} className="space-y-2">
                <div className={`
                  p-3 rounded-md border flex items-start justify-between 
                  cursor-pointer hover:bg-slate-800/70 transition-colors
                  ${isSelected(file.id) ? 'border-blue-500 bg-slate-800/50' : 'border-slate-700'}
                `}>
                  <div 
                    className="flex-1 flex items-start"
                    onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
                  >
                    <div className="h-6 w-6 mr-2 flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-white">{file.name}</h4>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {file.language}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{file.description}</p>
                      <p className="text-xs text-slate-500 mt-1">Ruta: {file.path}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 ${isSelected(file.id) ? 'text-blue-400' : 'text-slate-400'}`}
                    onClick={() => toggleFileSelection(file.id)}
                    title={isSelected(file.id) ? "Deseleccionar" : "Seleccionar"}
                  >
                    {isSelected(file.id) ? <Check size={16} /> : <Check size={16} />}
                  </Button>
                </div>
                
                {expandedFile === file.id && (
                  <div className="border border-slate-800 rounded-md overflow-hidden">
                    <div className="text-xs p-2 bg-slate-800 text-slate-300 font-mono flex justify-between items-center">
                      <span>Vista previa</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => setExpandedFile(null)}
                        title="Cerrar vista previa"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      language={file.language}
                      style={oneDark}
                      customStyle={{ margin: 0, maxHeight: '300px' }}
                    >
                      {file.content}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X size={16} className="mr-2" />
          Cancelar
        </Button>
        
        <Button variant="default" size="sm" onClick={handleAccept}>
          <Check size={16} className="mr-2" />
          Generar {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileGenerationSuggestion;
