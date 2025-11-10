import { GoogleGenAI } from "@google/genai";

// WARNING: Hardcoding API keys is not recommended for production applications.
// This is done to ensure functionality in the Netlify deployment environment.
const API_KEY = "AIzaSyB_3W1y8RqPr9Pzw2g46jk865g7aGtrgNU";

if (!API_KEY) {
  // This check is unlikely to fail now but kept as a safeguard.
  console.error("API_KEY is not set. AI features will fail.");
  throw new Error("API_KEY is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
      // Provide a more user-friendly error message that hints at the API key.
      if (error.message.includes('API key not valid')) {
         return `**Error:** The AI service failed to respond. The provided API key is not valid. Please check the key and try again.`;
      }
      return `**Error:** The AI service failed to respond. Details: ${error.message}`;
    }
    return "**Error:** An unknown error occurred while contacting the AI service.";
  }
};
