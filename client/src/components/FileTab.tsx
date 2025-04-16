import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTabProps {
  id: string;
  name: string;
  isActive: boolean;
  isDirty: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
}

const FileTab: React.FC<FileTabProps> = ({
  id,
  name,
  isActive,
  isDirty,
  onActivate,
  onClose,
}) => {
  const handleTabClick = () => {
    onActivate(id);
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id);
  };

  return (
    <div
      className={cn(
        "px-4 py-2 flex items-center border-r border-border cursor-pointer",
        isActive ? "bg-sidebar text-foreground" : "text-muted-foreground hover:bg-muted/50"
      )}
      onClick={handleTabClick}
    >
      <span className="text-sm truncate max-w-[100px]">{name}</span>
      {isDirty && <span className="ml-1 text-muted-foreground">•</span>}
      <button
        className="ml-2 text-muted-foreground hover:text-foreground"
        onClick={handleCloseClick}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FileTab;
