
import React, { useState } from 'react';
import { CheckSquare, Square, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface ProjectChecklistProps {
  title: string;
  description?: string;
  items: ChecklistItem[];
  onComplete: () => void;
  onSave?: (items: ChecklistItem[]) => void;
}

const ProjectChecklist: React.FC<ProjectChecklistProps> = ({
  title,
  description,
  items: initialItems,
  onComplete,
  onSave
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const { toast } = useToast();
  
  const toggleItem = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  const allCompleted = items.every(item => item.completed);
  
  const handleSave = () => {
    if (onSave) {
      onSave(items);
      toast({
        title: "Checklist guardada",
        description: "Tu progreso ha sido guardado"
      });
    }
  };
  
  const completionPercentage = Math.round(
    (items.filter(item => item.completed).length / items.length) * 100
  );
  
  return (
    <Card className="w-full border-slate-800 bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-slate-400">
            {completionPercentage}% completado
          </span>
        </CardTitle>
        {description && (
          <p className="text-sm text-slate-400">{description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.id}
              className={`p-3 rounded-md border flex items-start gap-3 transition-colors ${
                item.completed 
                  ? 'bg-slate-800/50 border-slate-700' 
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 mt-0.5" 
                onClick={() => toggleItem(item.id)}
              >
                {item.completed ? (
                  <CheckSquare size={18} className="text-green-500" />
                ) : (
                  <Square size={18} className="text-slate-400" />
                )}
              </Button>
              
              <div className="flex-1">
                <h4 className={`font-medium ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                  {item.title}
                </h4>
                <p className={`text-sm mt-1 ${item.completed ? 'text-slate-500' : 'text-slate-400'}`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {onSave && (
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save size={16} className="mr-2" />
            Guardar progreso
          </Button>
        )}
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={onComplete}
          disabled={!allCompleted}
          className={allCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {allCompleted ? 'Continuar' : 'Completar todos los items'}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectChecklist;
