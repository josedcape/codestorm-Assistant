import { Request, Response } from 'express';
import axios from 'axios';

// Función para generar una respuesta de OpenAI
async function generateOpenAIResponse(prompt: string, code?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key no configurada');
  }

  const messages = [
    { role: 'system', content: 'Eres un asistente de programación experto. Responde en español.' },
    { role: 'user', content: prompt }
  ];

  // Si hay código, añadirlo como contexto
  if (code) {
    messages.push({
      role: 'user',
      content: `Contexto de código:\n\`\`\`\n${code}\n\`\`\``
    });
  }

  try {
    console.log('Enviando solicitud a OpenAI...');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // Verificar que la respuesta tenga el formato esperado
    if (response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message && 
        response.data.choices[0].message.content) {
      console.log('Respuesta de OpenAI recibida correctamente');
      return response.data.choices[0].message.content;
    } else {
      console.error('Respuesta de OpenAI en formato inesperado:', response.data);
      throw new Error('Formato de respuesta de OpenAI inesperado');
    }
  } catch (error) {
    console.error('Error al llamar a la API de OpenAI:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Detalles de la respuesta de error:', error.response.data);
    }
    throw error;
  }
}

// Función para generar una respuesta de Gemini
async function generateGeminiResponse(prompt: string, code?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key no configurada');
  }

  const fullPrompt = code 
    ? `${prompt}\n\nContexto de código:\n\`\`\`\n${code}\n\`\`\``
    : prompt;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Eres un asistente de programación experto. Responde siempre en español.\n\n${fullPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      }
    );

    // Verificar que la respuesta tenga el formato esperado
    if (response.data.candidates && 
        response.data.candidates.length > 0 && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.error('Respuesta de Gemini en formato inesperado:', response.data);
      return "Lo siento, no pude procesar la respuesta de Gemini. Por favor intenta con otro modelo.";
    }
  } catch (error) {
    console.error('Error al llamar a la API de Gemini:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Detalles de la respuesta de error:', error.response.data);
    }
    throw error;
  }
}

// Función para generar una respuesta de Anthropic/Claude
async function generateClaudeResponse(prompt: string, code?: string, model: string = 'claude-3-sonnet-20240229') {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key no configurada');
  }

  const fullPrompt = code 
    ? `${prompt}\n\nContexto de código:\n\`\`\`\n${code}\n\`\`\``
    : prompt;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: model,
      max_tokens: 1000,
      temperature: 0.7,
      system: "Actúa como un desarrollador altamente capacitado que puede ayudar, hacer recomendaciones y sugerencias para desarrollar de la forma más eficiente aplicaciones según las indicaciones del usuario. Tienes la capacidad de crear archivos, carpetas y ejecutar comandos en la terminal. Ofrece siempre soluciones prácticas y eficientes. Responde siempre en español.",
      messages: [
        {
          role: "user",
          content: fullPrompt
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    }
  );

  // Claude devuelve la respuesta en un formato diferente
  if (response.data.content && response.data.content.length > 0) {
    return response.data.content[0].text;
  } else {
    console.error('Respuesta de Claude sin contenido:', response.data);
    throw new Error('Formato de respuesta de Claude inesperado');
  }
}

// Ruta para manejar la generación de respuestas
export async function handleAIGenerate(req: Request, res: Response) {
  try {
    const { model, prompt, code } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Se requiere un prompt' });
    }

    console.log(`Generando respuesta con modelo ${model}. Prompt: ${prompt.substring(0, 50)}...`);

    let response: string;

    try {
      switch (model) {
        case 'gpt-4o':
          if (!process.env.OPENAI_API_KEY) {
            return res.status(400).json({ error: 'API key de OpenAI no configurada' });
          }
          response = await generateOpenAIResponse(prompt, code);
          break;
        case 'gemini-2.5':
          if (!process.env.GEMINI_API_KEY) {
            return res.status(400).json({ error: 'API key de Gemini no configurada' });
          }
          response = await generateGeminiResponse(prompt, code);
          break;
        case 'claude-3-7':
        case 'claude-3-5-sonnet-v2':
          if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(400).json({ error: 'API key de Anthropic no configurada' });
          }
          const claudeModel = model === 'claude-3-7' ? 'claude-3-opus-20240229' : 'claude-3-sonnet-20240229';
          response = await generateClaudeResponse(prompt, code, claudeModel);
          break;
        case 'qwen-2.5-omni-7b':
          // Para modelos locales, podríamos implementar una solución diferente
          // Por ahora, usamos OpenAI como fallback si está configurado
          if (process.env.OPENAI_API_KEY) {
            response = await generateOpenAIResponse(prompt, code);
          } else {
            return res.status(400).json({ error: 'No hay un modelo disponible para usar como fallback' });
          }
          break;
        default:
          // Intentar usar OpenAI como fallback
          if (process.env.OPENAI_API_KEY) {
            response = await generateOpenAIResponse(prompt, code);
          } else {
            return res.status(400).json({ error: 'Modelo no válido y no hay fallback disponible' });
          }
      }

      console.log(`Respuesta generada exitosamente con modelo ${model}`);
      res.json({ response });
    } catch (modelError: any) {
      console.error(`Error específico del modelo ${model}:`, modelError);

      // Intentar con otro modelo si el principal falla
      if (model !== 'gpt-4o' && process.env.OPENAI_API_KEY) {
        console.log('Intentando con GPT-4o como fallback...');
        try {
          response = await generateOpenAIResponse(prompt, code);
          return res.json({ 
            response, 
            warning: `El modelo ${model} falló, usando GPT-4o como alternativa.` 
          });
        } catch (fallbackError) {
          console.error('El fallback a GPT-4o también falló:', fallbackError);
        }
      }

      // Si llegamos aquí, tanto el modelo original como el fallback fallaron
      throw modelError;
    }
  } catch (error: any) {
    console.error('Error al generar respuesta de IA:', error);
    let errorMessage = '⚠️ Error interno del servidor';

    if (error.response && error.response.data) {
      console.error('Detalles de la respuesta de error:', error.response.data);
      errorMessage = `⚠️ **Error**: ${error.message}\n\n**Detalles**: ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      errorMessage = `⚠️ **Error**: ${error.message}`;
    }

    res.status(500).json({ error: errorMessage });
  }
}

// Ruta para ejecutar comandos de terminal
export async function handleTerminalExecute(req: Request, res: Response) {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Se requiere un comando' });
    }

    // Implementación básica - en un entorno real deberías usar
    // medidas de seguridad adicionales antes de ejecutar comandos
    const { exec } = require('child_process');

    exec(command, (error: any, stdout: string, stderr: string) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (stderr) {
        return res.json({ output: stderr });
      }

      res.json({ output: stdout });
    });
  } catch (error: any) {
    console.error('Error al ejecutar comando:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}

// Función para manejar la corrección de código
export async function handleCodeCorrection(req: Request, res: Response) {
  try {
    const { content, instructions, language, fileId, projectId } = req.body;

    if (!content || !instructions) {
      return res.status(400).json({ error: 'Se requieren el contenido del código y las instrucciones' });
    }

    console.log(`Solicitando corrección de código. Lenguaje: ${language}, Instrucciones: ${instructions.substring(0, 50)}...`);

    // Construir un prompt específico para la corrección de código
    const prompt = `
Actúa como un experto en desarrollo de software, especializado en ${language}.
Por favor, revisa y corrige el siguiente código según estas instrucciones: "${instructions}"

Código a corregir:
\`\`\`${language}
${content}
\`\`\`

Proporciona el código corregido junto con una explicación de los cambios realizados.
Devuelve la respuesta en el siguiente formato:
1. El código corregido
2. Una lista de los cambios específicos realizados con números de línea
3. Una explicación general de las mejoras
`;

    // Usar el modelo de GPT-4 para obtener la mejor corrección
    const response = await generateOpenAIResponse(prompt);
    
    // Procesar la respuesta para extraer el código corregido y explicaciones
    const correctedCode = extractCorrectedCode(response, language);
    const changes = extractChanges(response);
    const explanation = extractExplanation(response);

    console.log("Corrección de código generada exitosamente");
    
    res.json({
      correctedCode: correctedCode || content,  // Si no se pudo extraer, devolver el código original
      changes,
      explanation
    });
  } catch (error: any) {
    console.error('Error al corregir código:', error);
    let errorMessage = 'Error interno al corregir el código';

    if (error.response && error.response.data) {
      errorMessage = `Error: ${error.message}. Detalles: ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }

    res.status(500).json({ error: errorMessage });
  }
}

// Función auxiliar para extraer el código corregido de la respuesta
function extractCorrectedCode(response: string, language: string): string | null {
  // Intentar encontrar el código entre bloques de código markdown
  const codeBlockRegex = new RegExp(\`\\\`\\\`\\\`(?:${language})?\\n([\\s\\S]*?)\\n\\\`\\\`\\\`\`, 'i');
  const match = response.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Si no hay bloques de código, intentar extraer de otras formas
  // Por ejemplo, buscar secciones que empiecen con "Código corregido:"
  const sectionRegex = /(?:Código corregido:|Código mejorado:|Aquí está el código corregido:)(?:\s*\n+)?([\s\S]+?)(?:\n\s*\n|$)/i;
  const sectionMatch = response.match(sectionRegex);
  
  if (sectionMatch && sectionMatch[1]) {
    return sectionMatch[1].trim();
  }
  
  return null;
}

// Función auxiliar para extraer los cambios realizados
function extractChanges(response: string): { description: string; lineNumbers?: number[] }[] {
  const changes: { description: string; lineNumbers?: number[] }[] = [];
  
  // Buscar patrones como "Línea 10: Cambié X por Y"
  const changeRegex = /(?:línea|líneas)\s+(\d+(?:\s*[-,]\s*\d+)*)\s*:\s*([^\n]+)/gi;
  let match;
  
  while ((match = changeRegex.exec(response)) !== null) {
    const lineNumbersText = match[1];
    const description = match[2].trim();
    
    // Procesar números de línea (puede ser "10", "10-15", "10, 11, 12", etc.)
    const lineNumbers = lineNumbersText.split(/\s*[-,]\s*/).map(n => parseInt(n.trim(), 10));
    
    changes.push({
      description,
      lineNumbers
    });
  }
  
  // Si no encontramos cambios con el patrón de línea, buscar listas
  if (changes.length === 0) {
    const listItemRegex = /(?:^|\n)(?:[*-]|\d+\.)\s*([^\n]+)/g;
    
    while ((match = listItemRegex.exec(response)) !== null) {
      const description = match[1].trim();
      if (description && !description.toLowerCase().includes("código corregido") && 
          !description.toLowerCase().includes("explicación")) {
        changes.push({ description });
      }
    }
  }
  
  return changes;
}

// Función auxiliar para extraer la explicación general
function extractExplanation(response: string): string | undefined {
  // Buscar secciones que parezcan explicaciones
  const explanationRegex = /(?:explicación general|explicación|mejoras realizadas|resumen de cambios):\s*\n+(.+(?:\n+(?!\n*(?:código|corrección|\d+\.|[*-]|\`\`\`)).+)*)/i;
  const match = response.match(explanationRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return undefined;
}