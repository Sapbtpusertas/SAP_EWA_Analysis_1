
import { GoogleGenAI } from "@google/genai";

// FIX: The API key must be obtained from `process.env.API_KEY` as per the coding guidelines, not `import.meta.env.VITE_API_KEY`. The original comments regarding Vite have been updated.
// The API key is obtained from the environment variable `process.env.API_KEY`.
// This variable is assumed to be pre-configured and accessible in the execution environment.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // This warning is helpful for developers running the app locally
  // if they haven't set up their .env file correctly.
  // FIX: Updated warning message to reflect the use of `API_KEY`.
  console.warn("API_KEY environment variable not set. AI features will fail.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

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
