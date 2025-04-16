import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw, Maximize2, Minimize2, X, Code, ExternalLink } from 'lucide-react';

interface PreviewPaneProps {
  onClose: () => void;
  currentCode: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({
  onClose,
  currentCode,
  isExpanded,
  onToggleExpand
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const refreshPreview = () => {
    setIsLoading(true);
    setError(null);
    
    // Simular carga
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className={`flex flex-col border-l silver-border bg-slate-900 ${
      isExpanded ? 'w-1/2' : 'w-96'
    } transition-all duration-300`}>
      <div className="p-2 border-b silver-border flex items-center justify-between bg-slate-800">
        <div className="flex items-center">
          <Code size={16} className="mr-2 text-amber-400" />
          <h3 className="text-sm font-medium">Vista Previa</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={refreshPreview}
            className="p-1 text-slate-400 hover:text-white rounded-sm hover:bg-slate-700"
            title="Refrescar vista previa"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <button
            onClick={onToggleExpand}
            className="p-1 text-slate-400 hover:text-white rounded-sm hover:bg-slate-700"
            title={isExpanded ? "Contraer" : "Expandir"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-red-400 rounded-sm hover:bg-slate-700"
            title="Cerrar vista previa"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw size={24} className="animate-spin mx-auto text-amber-400 mb-2" />
              <p className="text-sm text-slate-400">Cargando vista previa...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-400 bg-red-900 bg-opacity-20 m-3 rounded-md border border-red-800">
            <p className="font-medium mb-1">Error al cargar la vista previa</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <iframe 
            title="Vista previa"
            className="w-full h-full bg-white"
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .preview-container { 
                      max-width: 100%; 
                      overflow: auto;
                      border: 1px solid #e0e0e0;
                      border-radius: 4px;
                      padding: 10px;
                    }
                  </style>
                </head>
                <body>
                  <div class="preview-container">
                    <div id="preview-content">
                      <h3>Vista previa del código</h3>
                      <p>El código se está ejecutando en este entorno seguro.</p>
                      <div id="output"></div>
                    </div>
                  </div>
                  <script>
                    try {
                      // Un entorno seguro para ejecutar código
                      const execute = () => {
                        ${currentCode}
                      };
                      
                      // Ejecutar el código con captura de errores
                      try {
                        execute();
                      } catch (error) {
                        document.getElementById('output').innerHTML = 
                          '<div style="color: red; margin-top: 10px;">' + 
                          '<strong>Error:</strong> ' + error.message + '</div>';
                      }
                    } catch (e) {
                      console.error("Error ejecutando el código:", e);
                    }
                  </script>
                </body>
              </html>
            `}
            sandbox="allow-scripts"
          />
        )}
      </div>
      
      <div className="p-2 border-t silver-border bg-slate-800 flex justify-between items-center">
        <Button 
          className="futuristic-button py-1 px-3 text-xs"
          onClick={refreshPreview}
          disabled={isLoading}
        >
          <Play size={12} className="mr-1" />
          Ejecutar
        </Button>
        
        <button className="text-xs text-slate-400 hover:text-amber-400 flex items-center">
          <ExternalLink size={12} className="mr-1" />
          Abrir en ventana nueva
        </button>
      </div>
    </div>
  );
};

export default PreviewPane;