import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Trash2, Edit2, Save, Plus, Search, ChevronRight, ChevronDown } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  date: Date;
  preview: string;
}

interface ConversationManagerProps {
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  currentConversationId?: string;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  currentConversationId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Datos de ejemplo
  const conversations: Conversation[] = [
    {
      id: '1',
      title: 'Implementación de autenticación',
      date: new Date(2025, 3, 10),
      preview: 'Cómo implementar JWT en una API REST'
    },
    {
      id: '2',
      title: 'Optimización de rendimiento',
      date: new Date(2025, 3, 8),
      preview: 'Técnicas para mejorar el rendimiento de React'
    },
    {
      id: '3',
      title: 'Diseño responsive',
      date: new Date(2025, 3, 5),
      preview: 'Media queries y flexbox para diseño adaptable'
    }
  ];
  
  const filteredConversations = conversations.filter(
    conv => conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEditStart = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };
  
  const handleEditSave = (id: string) => {
    // Aquí se guardaría el título actualizado
    console.log(`Guardando nuevo título para conversación ${id}: ${editTitle}`);
    setEditingId(null);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <aside className="futuristic-container border-r silver-border w-72 flex-shrink-0 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b silver-border flex items-center justify-between bg-slate-800">
        <div className="flex items-center">
          <MessageSquare size={16} className="mr-2 text-amber-400" />
          <h3 className="text-sm font-medium">Conversaciones</h3>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-slate-400 hover:text-white rounded-sm hover:bg-slate-700"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="p-2 border-b silver-border">
            <div className="relative">
              <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Buscar conversaciones..."
                className="pl-8 bg-slate-800 border-slate-700 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    className={`p-2 rounded-md transition-colors ${
                      currentConversationId === conversation.id 
                        ? 'bg-slate-700 border border-amber-500' 
                        : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    {editingId === conversation.id ? (
                      <div className="flex items-center mb-1">
                        <Input
                          className="flex-1 bg-slate-900 border-slate-600 h-6 text-xs"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 ml-1 text-green-500 hover:text-green-400"
                          onClick={() => handleEditSave(conversation.id)}
                        >
                          <Save size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mb-1">
                        <h4 
                          className="text-sm font-medium truncate cursor-pointer"
                          onClick={() => onSelectConversation(conversation.id)}
                        >
                          {conversation.title}
                        </h4>
                        <div className="flex space-x-1">
                          <button
                            className="text-slate-400 hover:text-white p-0.5"
                            onClick={() => handleEditStart(conversation)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="text-slate-400 hover:text-red-400 p-0.5"
                            onClick={() => onDeleteConversation(conversation.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <div>{formatDate(conversation.date)}</div>
                    </div>
                    
                    <p 
                      className="text-xs text-slate-300 mt-1 truncate cursor-pointer"
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      {conversation.preview}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400">
                  {searchQuery 
                    ? 'No se encontraron conversaciones' 
                    : 'No hay conversaciones guardadas'
                  }
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-2 border-t silver-border">
            <Button 
              className="futuristic-button w-full flex items-center justify-center"
              onClick={onNewConversation}
            >
              <Plus size={16} className="mr-2" />
              Nueva Conversación
            </Button>
          </div>
        </>
      )}
    </aside>
  );
};

export default ConversationManager;