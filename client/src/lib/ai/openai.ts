
import OpenAI from "openai";

export async function processWithOpenAI(prompt: string, apiKey: string) {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const openai = new OpenAI({ apiKey });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are CODESTORM AI, an autonomous development agent specializing in code generation and software development. Provide specific, actionable responses with accurate code samples when needed. Be concise and direct. Return your response as JSON with minimal explanations." 
        },
        { role: "user", content: prompt + " (Responde en formato JSON)" }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2000,
    });
    
    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Error with OpenAI API: ${error.message}`);
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
