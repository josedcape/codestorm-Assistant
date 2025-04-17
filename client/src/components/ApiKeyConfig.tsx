import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ApiKeyConfig: React.FC = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
    alibaba: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Cargar claves API guardadas localmente
  useEffect(() => {
    const savedOpenaiKey = localStorage.getItem('openai_api_key');
    const savedAnthropicKey = localStorage.getItem('anthropic_api_key');
    const savedGoogleKey = localStorage.getItem('google_api_key');
    const savedAlibabaKey = localStorage.getItem('alibaba_api_key');

    setApiKeys({
      openai: savedOpenaiKey || '',
      anthropic: savedAnthropicKey || '',
      google: savedGoogleKey || '',
      alibaba: savedAlibabaKey || ''
    });
  }, []);

  const saveApiKeys = async () => {
    try {
      setIsSaving(true);

      // Guardar en localStorage para uso del cliente
      if (apiKeys.openai) localStorage.setItem('openai_api_key', apiKeys.openai);
      if (apiKeys.anthropic) localStorage.setItem('anthropic_api_key', apiKeys.anthropic);
      if (apiKeys.google) localStorage.setItem('google_api_key', apiKeys.google);
      if (apiKeys.alibaba) localStorage.setItem('alibaba_api_key', apiKeys.alibaba);

      toast({
        title: "Claves API guardadas",
        description: "Las claves API se han guardado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error('Error al guardar las claves API:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las claves API",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-md">
      <h2 className="text-lg font-medium">Configuración de Claves API</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="openai">
          <AccordionTrigger className="text-sm">OpenAI (GPT-4.0)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                placeholder="sk-..."
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Necesario para GPT-4.0</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="anthropic">
          <AccordionTrigger className="text-sm">Anthropic (Claude 3.7, Claude 3.5 Sonnet V2)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Label htmlFor="anthropic-key">Anthropic API Key</Label>
              <Input
                id="anthropic-key"
                type="password"
                value={apiKeys.anthropic}
                onChange={(e) => setApiKeys({...apiKeys, anthropic: e.target.value})}
                placeholder="sk-ant-..."
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Necesario para los modelos Claude</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="google">
          <AccordionTrigger className="text-sm">Google (Gemini 2.5)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Label htmlFor="google-key">Google API Key</Label>
              <Input
                id="google-key"
                type="password"
                value={apiKeys.google}
                onChange={(e) => setApiKeys({...apiKeys, google: e.target.value})}
                placeholder="AIza..."
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Necesario para el modelo Gemini</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="alibaba">
          <AccordionTrigger className="text-sm">Alibaba (Qwen)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Label htmlFor="alibaba-key">Alibaba API Key</Label>
              <Input
                id="alibaba-key"
                type="password"
                value={apiKeys.alibaba}
                onChange={(e) => setApiKeys({...apiKeys, alibaba: e.target.value})}
                placeholder="sk-qwen-..."
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Necesario para modelos Qwen</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Button 
        onClick={saveApiKeys} 
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? 'Guardando...' : 'Guardar claves API'}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        Las claves API se almacenan de forma segura en tu navegador y se envían con cada solicitud.
        Para un funcionamiento completo, también debes configurar estas claves en las variables de entorno del servidor.
      </p>
      <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
        <p className="font-medium mb-1">Variables de entorno del servidor:</p>
        <p><code>OPENAI_API_KEY</code> - Para GPT-4.0</p>
        <p><code>ANTHROPIC_API_KEY</code> - Para Claude</p>
        <p><code>GEMINI_API_KEY</code> - Para Gemini</p>
        <p className="mt-2">Estas deben configurarse en las variables de entorno (Secrets) del Repl.</p>
      </div>
    </div>
  );
};

export default ApiKeyConfig;