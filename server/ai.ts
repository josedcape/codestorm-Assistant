
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

  return response.data.choices[0].message.content;
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

  return response.data.candidates[0].content.parts[0].text;
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
      system: "Eres un asistente de programación experto. Responde en español.",
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

  return response.data.content[0].text;
}

// Ruta para manejar la generación de respuestas
export async function handleAIGenerate(req: Request, res: Response) {
  try {
    const { model, prompt, code } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Se requiere un prompt' });
    }

    let response: string;

    switch (model) {
      case 'gpt-4o':
        response = await generateOpenAIResponse(prompt, code);
        break;
      case 'gemini-2.5':
        response = await generateGeminiResponse(prompt, code);
        break;
      case 'claude-3-7':
      case 'claude-3-5-sonnet-v2':
        response = await generateClaudeResponse(prompt, code, model === 'claude-3-7' ? 'claude-3-opus-20240229' : 'claude-3-sonnet-20240229');
        break;
      case 'qwen-2.5-omni-7b':
        // Para modelos locales, podríamos implementar una solución diferente
        // Por ahora, usamos OpenAI como fallback
        response = await generateOpenAIResponse(prompt, code);
        break;
      default:
        response = await generateOpenAIResponse(prompt, code);
    }

    res.json({ response });
  } catch (error: any) {
    console.error('Error al generar respuesta de IA:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
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
