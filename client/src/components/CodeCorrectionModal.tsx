
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CodeCorrectionResponse } from "@shared/schema";
import { Loader2, Check, X, GitCompare, Code as CodeIcon } from "lucide-react";
import axios from "axios";

interface CodeCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    content: string;
    path: string;
    language: string;
  } | null;
  onApplyChanges: (path: string, content: string) => Promise<void>;
}

const CodeCorrectionModal: React.FC<CodeCorrectionModalProps> = ({
  isOpen,
  onClose,
  file,
  onApplyChanges
}) => {
  const [instructions, setInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [correctionResult, setCorrectionResult] = useState<CodeCorrectionResponse | null>(null);
  const [viewMode, setViewMode] = useState<'code' | 'diff'>('code');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, file?.path]);

  const resetState = () => {
    setCorrectionResult(null);
    setInstructions("");
    setViewMode('code');
  };

  const requestCorrection = async () => {
    if (!file) return;
    
    if (!instructions.trim()) {
      toast({
        title: "Error",
        description: "Por favor, describe las correcciones que necesitas",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post('/api/correct', {
        content: file.content,
        instructions,
        language: file.language || getLanguageFromFileName(file.name),
        filePath: file.path
      });

      setCorrectionResult(response.data);
    } catch (error) {
      console.error("Error al corregir el código:", error);
      toast({
        title: "Error",
        description: "No se pudo corregir el código. Intente con instrucciones más claras.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!correctionResult || !file) return;

    try {
      await onApplyChanges(file.path, correctionResult.correctedCode);
      toast({
        title: "Correcciones aplicadas",
        description: "El código ha sido actualizado con éxito",
      });
      onClose();
    } catch (error) {
      console.error("Error al aplicar correcciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron aplicar las correcciones",
        variant: "destructive"
      });
    }
  };

  const getLanguageFromFileName = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    const extToLanguage: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'py': 'python',
      'rb': 'ruby',
      'php': 'php',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'md': 'markdown'
    };

    return extToLanguage[extension] || 'text';
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Corrección de Código: {file.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 min-h-[60vh]">
          {!correctionResult ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Instrucciones para la corrección:</label>
                <Textarea
                  placeholder="Describe qué correcciones necesitas en el código. Por ejemplo: 'Corrige el manejo de errores y optimiza el rendimiento'"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Código actual:</label>
                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-md overflow-auto max-h-[300px] text-sm">
                  <pre>
                    <code>{file.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Tabs defaultValue="code" onValueChange={(v) => setViewMode(v as 'code' | 'diff')}>
                <TabsList className="mb-4">
                  <TabsTrigger value="code" className="flex items-center gap-1">
                    <CodeIcon size={16} />
                    Código Corregido
                  </TabsTrigger>
                  <TabsTrigger value="diff" className="flex items-center gap-1">
                    <GitCompare size={16} />
                    Cambios Realizados
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="code" className="m-0">
                  <div>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-md overflow-auto max-h-[400px] text-sm">
                      <pre>
                        <code>{correctionResult.correctedCode}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="diff" className="m-0">
                  <div>
                    {correctionResult.changes && correctionResult.changes.length > 0 ? (
                      <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-md overflow-auto max-h-[400px]">
                        {correctionResult.changes.map((change, idx) => (
                          <div key={idx} className="mb-3 border-l-2 border-blue-500 pl-2">
                            <p className="font-medium text-sm">{change.description}</p>
                            {change.lineNumbers && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Líneas: {change.lineNumbers.join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                        
                        {correctionResult.explanation && (
                          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                            <h4 className="text-sm font-medium mb-2">Explicación general:</h4>
                            <p className="text-sm whitespace-pre-wrap">{correctionResult.explanation}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-md">
                        <p className="text-sm italic text-slate-600 dark:text-slate-400">
                          No se especificaron cambios detallados.
                        </p>
                        
                        {correctionResult.explanation && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Explicación general:</h4>
                            <p className="text-sm whitespace-pre-wrap">{correctionResult.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <DialogFooter>
          {!correctionResult ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={requestCorrection} 
                disabled={isLoading || !instructions.trim()}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Corrigiendo...
                  </>
                ) : "Corregir código"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setCorrectionResult(null)}>
                Volver a editar
              </Button>
              <Button onClick={handleApplyChanges} className="gap-2">
                <Check className="h-4 w-4" />
                Aplicar cambios
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CodeCorrectionModal;
