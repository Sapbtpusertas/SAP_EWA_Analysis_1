import { GoogleGenAI } from "@google/genai";

// FIX: Switched from `import.meta.env.VITE_API_KEY` to `process.env.API_KEY` to align with Gemini guidelines
// and resolve the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
// The API key is expected to be available in the environment as API_KEY.
if (!process.env.API_KEY) {
  // In a real app, you'd handle this more gracefully, but for this environment,
  // we assume the key is present. This check helps during local development.
  console.warn("API_KEY environment variable not set. AI features will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // The 'contents' property for a single text prompt should be a simple string.
      contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
      return `**Error:** The AI service failed to respond. Details: ${error.message}`;
    }
    return "**Error:** An unknown error occurred while contacting the AI service.";
  }
};
