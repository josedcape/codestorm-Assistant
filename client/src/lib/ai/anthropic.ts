import Anthropic from '@anthropic-ai/sdk';

export async function processWithAnthropic(prompt: string) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Anthropic API key no configurada");
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2500,
      system: "You are CODESTORM AI, an autonomous development agent specializing in code generation and software development. Provide specific, actionable responses with accurate code samples when needed. Keep responses concise and direct.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });

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