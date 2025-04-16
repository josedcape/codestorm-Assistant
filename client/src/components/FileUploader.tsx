import React, { useState, useRef } from 'react';
import { Upload, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFileUploaded: (file: File, content: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await readFileContent(file);
      setSelectedFile(file);
      onFileUploaded(file, content);
    } catch (err) {
      setError('Error al leer el archivo. Intenta de nuevo.');
      console.error('Error al leer el archivo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Error al leer el contenido del archivo'));
        }
      };
      
      reader.onerror = () => {
        reject(reader.error);
      };
      
      reader.readAsText(file);
    });
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };

  return (
    <div className="border border-muted rounded-md p-4">
      <h3 className="text-primary mb-2 font-semibold">Carga de Archivos</h3>
      
      {!selectedFile ? (
        <div 
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
              : 'border-muted hover:border-muted-foreground'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".js,.html,.css,.json,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rb,.php,.md,.txt"
          />
          
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload size={36} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arrastra un archivo o haz clic para seleccionarlo
            </p>
            <Button 
              onClick={handleButtonClick}
              className="mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Seleccionar Archivo'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card p-3 rounded-md border border-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileIcon size={24} className="text-blue-500" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {getFileExtension(selectedFile.name)}
                </p>
              </div>
            </div>
            <button 
              onClick={clearSelection}
              className="p-1 hover:bg-muted rounded"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="mt-3">
            <p className="text-xs text-muted-foreground">
              Archivo cargado correctamente. Puedes proceder a utilizarlo en tu proyecto.
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;