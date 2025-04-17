
export async function processWithGemini(prompt: string, apiKey: string) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
  
  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "Eres CODESTORM AI, un agente de desarrollo autónomo especializado en generación de código y desarrollo de software. Proporciona respuestas específicas y prácticas con muestras de código precisas cuando sea necesario. Responde a esta solicitud: " + prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Empty response from Gemini API");
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(`Error with Gemini API: ${error.message || 'Unknown error'}`);
  }
}

export async function generateCodeSamples(specification: string, apiKey: string) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
  
  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `Como CODESTORM AI, genera muestras de código basadas en esta especificación: ${specification}. IMPORTANTE: Devuelve SOLO un JSON con la siguiente estructura sin explicaciones adicionales: {"files": [{"path": "ruta/archivo.ext", "content": "contenido del archivo", "language": "lenguaje"}], "instructions": "breves instrucciones"}` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Empty response from Gemini API");
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(`Error generating code samples: ${error.message || 'Unknown error'}`);
  }
}
