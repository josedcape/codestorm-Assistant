import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Compass, Sparkles } from 'lucide-react';

export type AgentType = 'dev' | 'arch' | 'adv';

interface AgentSelectorProps {
  onAgentChange: (agent: AgentType) => void;
  currentAgent: AgentType;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ 
  onAgentChange, 
  currentAgent 
}) => {
  const agents = [
    {
      id: 'dev',
      name: 'Agente de Desarrollo',
      icon: <Code className="mr-2" size={18} />,
      description: 'Especializado en correcciones y edición de código en tiempo real.',
      color: 'bg-blue-900 hover:bg-blue-800'
    },
    {
      id: 'arch',
      name: 'Agente de Arquitectura',
      icon: <Compass className="mr-2" size={18} />,
      description: 'Especializado en planificación inicial y estructura del proyecto.',
      color: 'bg-amber-900 hover:bg-amber-800'
    },
    {
      id: 'adv',
      name: 'Agente Avanzado de Software',
      icon: <Sparkles className="mr-2" size={18} />,
      description: 'Especializado en gestión de integraciones y funciones complejas.',
      color: 'bg-purple-900 hover:bg-purple-800'
    }
  ];

  return (
    <div className="w-full">
      <h3 className="text-primary mb-3 font-semibold">Agentes Especializados</h3>
      
      <div className="space-y-3">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className={`p-3 rounded-lg border border-muted transition-all duration-300 relative ${
              currentAgent === agent.id 
                ? 'border-primary shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                : 'hover:border-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {agent.icon}
                <span className="font-medium">{agent.name}</span>
              </div>
              {currentAgent === agent.id && (
                <Badge 
                  className="bg-primary text-xs font-normal"
                  variant="outline"
                >
                  Activo
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-slate-400 mt-2 mb-3">{agent.description}</p>
            
            <Button 
              className={`text-xs py-1 px-3 w-full ${agent.color}`}
              onClick={() => onAgentChange(agent.id as AgentType)}
              disabled={currentAgent === agent.id}
            >
              {currentAgent === agent.id ? 'Seleccionado' : 'Seleccionar'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentSelector;