import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, File, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
  onFileUploaded: (file: File, content: string) => void;
}

export default function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const processFile = async (file: File) => {
    setError(null);

    // Validar tipo de archivo
    const validTypes = [
      'text/plain', 'text/javascript', 'application/javascript', 
      'application/json', 'text/html', 'text/css', 'text/typescript', 
      'application/typescript', 'text/markdown', 'text/csv', 'text/xml',
      'application/xml', 'application/x-yaml', 'text/yaml',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    // También permitir archivos por extensión para sistema operativos que no detectan bien el MIME type
    const validExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.txt', '.py',
      '.xml', '.svg', '.csv', '.yaml', '.yml', '.sh', '.bat', '.ps1', '.sql',
      '.c', '.cpp', '.h', '.cs', '.java', '.php', '.rb', '.go', '.rs', '.swift',
      '.dart', '.kt', '.lua', '.r', '.pl', '.dockerfile', '.gitignore',
      '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf'
    ];
    const fileExtension = '.' + file.name.split('.').pop();

    const isValidType = validTypes.includes(file.type) || 
                        validExtensions.some(ext => fileExtension.toLowerCase() === ext);

    if (!isValidType) {
      setError('Tipo de archivo no soportado. Por favor sube un archivo de texto o código.');
      return;
    }

    // Validar tamaño (máx. 1MB)
    if (file.size > 1024 * 1024) {
      setError('El archivo es demasiado grande. Límite: 1MB');
      return;
    }

    try {
      setIsLoading(true);
      setFile(file);

      // Leer contenido del archivo
      const content = await readFileContent(file);

      // Llamar callback
      onFileUploaded(file, content);

      // Reiniciar
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      setError('No se pudo leer el archivo. Intenta con otro archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Error al leer el archivo.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo.'));
      };

      reader.readAsText(file);
    });
  };

  const cancelUpload = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col">
      <h3 className="font-medium text-sm mb-3">Subir Archivo</h3>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".js,.jsx,.ts,.tsx,.html,.css,.json,.md,.txt,.py,.xml,.svg,.csv,.yaml,.yml,.sh,.bat,.ps1,.sql,.c,.cpp,.h,.cs,.java,.php,.rb,.go,.rs,.swift,.dart,.kt,.lua,.r,.pl,.dockerfile,.gitignore,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf"
      />

      <div
        className={`
          border-2 border-dashed rounded-md p-4 transition-colors text-center
          ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700'}
          ${error ? 'border-red-500' : ''}
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <FileText size={36} className="mb-2 text-blue-400" />
              <p className="text-sm mb-1">{file.name}</p>
              <p className="text-xs text-slate-400 mb-3">
                {(file.size / 1024).toFixed(2)} KB
              </p>

              {isLoading ? (
                <motion.div 
                  className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={cancelUpload}
                  className="gap-1"
                >
                  <X size={14} />
                  Cancelar
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4"
            >
              <Upload size={36} className="mb-2 text-slate-500" />
              <p className="text-sm mb-1">
                Arrastra un archivo aquí o
              </p>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleButtonClick}
                className="mt-2"
              >
                Seleccionar archivo
              </Button>
              <p className="text-xs text-slate-500 mt-3">
                Formatos: .js, .jsx, .ts, .tsx, .html, .css, .json, .md, .txt, .py, .xml, .svg, .csv, .yaml, .yml, .sh, .bat, .ps1, .sql, .c, .cpp, .h, .cs, .java, .php, .rb, .go, .rs, .swift, .dart, .kt, .lua, .r, .pl, .dockerfile, .gitignore, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="flex items-center text-red-500 text-sm mt-2">
          <AlertCircle size={14} className="mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}