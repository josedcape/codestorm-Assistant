
import React, { useState } from 'react';
import { PackageIcon, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import ProjectChecklist, { ChecklistItem } from './ProjectChecklist';
import FileGenerationSuggestion, { FileSuggestion } from './FileGenerationSuggestion';
import { useAppContext } from '@/context/AppContext';

interface ProjectPlannerProps {
  onComplete: () => void;
}

type PlannerStep = 'info' | 'checklist' | 'files' | 'generating';

const ProjectPlanner: React.FC<ProjectPlannerProps> = ({ onComplete }) => {
  const [step, setStep] = useState<PlannerStep>('info');
  const [projectType, setProjectType] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [suggestedFiles, setSuggestedFiles] = useState<FileSuggestion[]>([]);
  
  const { toast } = useToast();
  const { executeCommand } = useAppContext();
  
  const handleNextStep = async () => {
    if (step === 'info') {
      if (!projectType.trim()) {
        toast({
          title: "Tipo de proyecto requerido",
          description: "Por favor, ingresa el tipo de proyecto",
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/project/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectType,
            description: projectDescription,
            techStack: techStack.length > 0 ? techStack : undefined
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al generar sugerencias');
        }
        
        if (data.projectStructure) {
          setChecklist(data.projectStructure.checklist || []);
          setSuggestedFiles(data.projectStructure.files || []);
          setStep('checklist');
        } else {
          throw new Error('No se recibió una estructura de proyecto válida');
        }
      } catch (error) {
        console.error('Error al obtener sugerencias:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else if (step === 'checklist') {
      setStep('files');
    }
  };
  
  const handleAddTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };
  
  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };
  
  const handleChecklistComplete = () => {
    setStep('files');
  };
  
  const handleGenerateFiles = async (selectedFiles: FileSuggestion[]) => {
    setStep('generating');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/project/create-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: selectedFiles
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear archivos');
      }
      
      const successCount = data.results.filter((r: any) => r.success).length;
      
      toast({
        title: "Archivos creados",
        description: `Se han creado ${successCount} de ${selectedFiles.length} archivos correctamente`,
      });
      
      // Ejecutar comando para listar los archivos creados
      try {
        await executeCommand('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | sort');
      } catch (cmdError) {
        console.error('Error al listar archivos:', cmdError);
      }
      
      onComplete();
    } catch (error) {
      console.error('Error al crear archivos:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      setStep('files');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 'info':
        return (
          <>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-type">Tipo de Proyecto *</Label>
                <Input 
                  id="project-type"
                  placeholder="Ej: Chatbot, E-commerce, Blog, API REST..."
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-description">Descripción (opcional)</Label>
                <Textarea 
                  id="project-description"
                  placeholder="Describe las funcionalidades y objetivos de tu proyecto..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="min-h-[100px] bg-slate-800 border-slate-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Stack Tecnológico (opcional)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ej: React, Node.js, MongoDB..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTech()}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Button
                    onClick={handleAddTech}
                    disabled={!techInput.trim()}
                    variant="outline"
                  >
                    Agregar
                  </Button>
                </div>
                
                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {techStack.map(tech => (
                      <div 
                        key={tech}
                        className="bg-slate-800 text-slate-200 px-2 py-1 rounded-md text-sm flex items-center"
                      >
                        {tech}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={() => handleRemoveTech(tech)}
                        >
                          <ChevronDown size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleNextStep}
                disabled={!projectType.trim() || isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <ChevronRight size={16} className="mr-2" />
                )}
                {isLoading ? 'Generando...' : 'Continuar'}
              </Button>
            </CardFooter>
          </>
        );
        
      case 'checklist':
        return (
          <ProjectChecklist
            title="Planificación del Proyecto"
            description="Completa los siguientes pasos para preparar tu proyecto"
            items={checklist}
            onComplete={handleChecklistComplete}
            onSave={(items) => setChecklist(items)}
          />
        );
        
      case 'files':
        return (
          <FileGenerationSuggestion
            files={suggestedFiles}
            onAccept={handleGenerateFiles}
            onCancel={() => setStep('checklist')}
          />
        );
        
      case 'generating':
        return (
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium">Generando archivos...</h3>
            <p className="text-slate-400 text-sm mt-2">
              Esto puede tomar unos momentos, estamos creando tu proyecto...
            </p>
          </CardContent>
        );
    }
  };
  
  return (
    <Card className="w-full border-slate-800 bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PackageIcon className="mr-2 h-5 w-5" />
          {step === 'info' ? 'Planificador de Proyecto' : 
           step === 'checklist' ? 'Lista de Verificación' :
           step === 'files' ? 'Generación de Archivos' : 'Generando Proyecto'}
        </CardTitle>
      </CardHeader>
      
      {renderStep()}
    </Card>
  );
};

export default ProjectPlanner;
