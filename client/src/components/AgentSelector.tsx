import React from 'react';
import { AgentType } from '@/lib/aiService';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bot, Terminal, Code, Workflow, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AgentSelectorProps {
  onAgentChange: (agent: AgentType) => void;
  currentAgent: AgentType;
}

const agentConfig = {
  dev: {
    icon: <Code className="h-5 w-5 text-blue-400" />,
    title: 'Desarrollo',
    description: 'Especialista en escribir código y solucionar errores',
    color: 'from-blue-600 to-indigo-600',
    hoverColor: 'from-blue-500 to-indigo-500',
  },
  arch: {
    icon: <Workflow className="h-5 w-5 text-purple-400" />,
    title: 'Arquitectura',
    description: 'Especialista en diseño de sistemas y estructura de código',
    color: 'from-purple-600 to-pink-600',
    hoverColor: 'from-purple-500 to-pink-500',
  },
  adv: {
    icon: <Terminal className="h-5 w-5 text-green-400" />,
    title: 'Avanzado',
    description: 'Capacidades completas para tareas complejas',
    color: 'from-emerald-600 to-green-600',
    hoverColor: 'from-emerald-500 to-green-500',
  },
};

export default function AgentSelector({ onAgentChange, currentAgent }: AgentSelectorProps) {
  const { toast } = useToast();
  
  const handleAgentChange = (agent: AgentType) => {
    onAgentChange(agent);
    
    // Mostrar notificación
    const agentInfo = agentConfig[agent];
    toast({
      title: "Agente cambiado",
      description: `Agente de ${agentInfo.title} activado`,
      variant: "default",
    });
  };
  
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Tipo de agente</div>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(agentConfig).map(([key, agent]) => (
          <AgentCard
            key={key}
            agent={key as AgentType}
            icon={agent.icon}
            title={agent.title}
            description={agent.description}
            color={agent.color}
            hoverColor={agent.hoverColor}
            isSelected={currentAgent === key}
            onClick={() => handleAgentChange(key as AgentType)}
          />
        ))}
      </div>
    </div>
  );
}

interface AgentCardProps {
  agent: AgentType;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  hoverColor: string;
  isSelected: boolean;
  onClick: () => void;
}

const AgentCard = ({
  agent,
  icon,
  title,
  description,
  color,
  hoverColor,
  isSelected,
  onClick,
}: AgentCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-md cursor-pointer border transition duration-200
        ${isSelected 
          ? `border-b-4 border-b-${color.split(' ')[0].replace('from-', '')} shadow-md bg-gradient-to-r ${color}` 
          : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}
      `}
    >
      <Card className="border-0 bg-transparent">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`mr-3 ${isSelected ? 'text-white' : ''}`}>
              {icon}
            </div>
            <div>
              <h3 className={`font-medium text-sm ${isSelected ? 'text-white' : ''}`}>
                {title}
              </h3>
              <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                {description}
              </p>
            </div>
          </div>
          
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-shrink-0"
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};