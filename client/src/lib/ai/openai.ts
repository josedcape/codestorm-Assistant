import OpenAI from "openai";

export async function processWithOpenAI(prompt: string, apiKey: string) {
  try {
    if (!apiKey) {
      throw new Error("La clave API de OpenAI no está configurada");
    }

    // Validar formato de la API key
    if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
      throw new Error("La clave API de OpenAI debe comenzar con 'sk-' y tener al menos 40 caracteres");
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Eres un asistente de programación experto. Responde en español." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    if (!response.choices[0].message.content) {
      throw new Error("No se recibió respuesta del modelo");
    }

    return response.choices[0].message.content;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Error de autenticación: La clave API proporcionada no es válida");
    }
    throw new Error(`Error en la API de OpenAI: ${error.message}`);
  }
}

export async function generateProjectStructure(description: string, apiKey: string) {
  try {
    const openai = new OpenAI({ apiKey });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a code structure expert. Generate a clear, minimal file structure for the described project. Return only JSON without comments or explanations." 
        },
        { 
          role: "user", 
          content: `Create a file structure for this project: ${description}. Return a JSON array with objects containing path and type (file/directory). Format your response as JSON.` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      return {};
    }
    return JSON.parse(content);
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Error generating project structure: ${error.message}`);
  }
}