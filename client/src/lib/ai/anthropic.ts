
import Anthropic from '@anthropic-ai/sdk';

export async function processWithAnthropic(prompt: string, apiKey: string) {
  try {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2500,
      system: "You are CODESTORM AI, an autonomous development agent specializing in code generation and software development. Provide specific, actionable responses with accurate code samples when needed. Output in JSON format whenever possible. Keep responses concise and avoid unnecessary explanations.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });
    
    // Asegurar que obtenemos correctamente el contenido del mensaje, verificando el tipo
    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    return 'No se pudo obtener una respuesta de texto válida';
  } catch (error: any) {
    console.error("Anthropic API error:", error);
    throw new Error(`Error with Anthropic API: ${error.message}`);
  }
}

export async function analyzeCodeRequirements(prompt: string, apiKey: string) {
  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1500,
      system: "You are a technical architect specializing in analyzing software requirements. Extract key technical details and return a structured JSON response. Be concise and focus only on the essential information.",
      messages: [
        { 
          role: 'user', 
          content: `Analyze these software requirements and provide a technical breakdown in JSON format only: ${prompt}` 
        }
      ],
    });
    
    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    return 'No se pudo obtener una respuesta de texto válida';
  } catch (error: any) {
    console.error("Anthropic API error:", error);
    throw new Error(`Error analyzing requirements: ${error.message}`);
  }
}
