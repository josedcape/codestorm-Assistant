
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface WebViewProps {
  isMinimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

const WebView: React.FC<WebViewProps> = ({
  isMinimized = false,
  onMinimize,
  onMaximize,
  onClose
}) => {
  const [url, setUrl] = useState<string>('http://localhost:5000');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const handleRefresh = () => {
    setIsLoading(true);
    // Forzar recarga del iframe cambiando su key
    setIframeKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 left-4 bg-blue-600 p-2 rounded-full shadow-lg cursor-pointer z-50" 
        onClick={onMaximize}
      >
        <ExternalLink className="h-6 w-6 text-white" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-300 rounded-md shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between bg-slate-100 px-3 py-2 border-b border-slate-300">
        <div className="flex items-center flex-1 mr-2">
          <div className="flex bg-white rounded-md border border-slate-300 flex-1 items-center">
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border-0 h-7 focus-visible:ring-0"
              placeholder="Escribe una URL..."
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-1"
            onClick={handleOpenExternal}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMaximize}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow">
        <iframe
          key={iframeKey}
          src={url}
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          title="Web Preview"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default WebView;
