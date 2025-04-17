
import React from 'react';
import { AgentType } from '@/lib/aiService';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bot, Terminal, Code, Compass, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
    badge: 'Optimización de código'
  },
  architect: {
    icon: <Compass className="h-5 w-5 text-amber-400" />,
    title: 'Arquitectura',
    description: 'Especialista en diseño de sistemas y estructura de proyectos',
    color: 'from-amber-600 to-orange-600',
    hoverColor: 'from-amber-500 to-orange-500',
    badge: 'Planificación'
  },
  advanced: {
    icon: <Sparkles className="h-5 w-5 text-green-400" />,
    title: 'Avanzado',
    description: 'Capacidades completas para tareas complejas e integraciones',
    color: 'from-emerald-600 to-green-600',
    hoverColor: 'from-emerald-500 to-green-500',
    badge: 'Multitarea'
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
            badge={agent.badge}
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
  badge?: string;
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
  badge,
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
              <div className="flex items-center">
                <h3 className={`font-medium text-sm ${isSelected ? 'text-white' : ''}`}>
                  {title}
                </h3>
                {badge && (
                  <Badge className={`ml-2 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-700'}`} variant="outline">
                    {badge}
                  </Badge>
                )}
              </div>
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
