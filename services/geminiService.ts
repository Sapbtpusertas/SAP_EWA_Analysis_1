import { GoogleGenAI } from "@google/genai";

// FIX: Switched to process.env.API_KEY as per the guidelines.
// The API key is obtained from the environment variable `process.env.API_KEY`.
// This variable is assumed to be pre-configured, valid, and accessible.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

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
      // FIX: Updated error message to refer to the correct environment variable.
      if (error.message.includes('API key not valid')) {
        return `**Error:** The API key is not valid. Please ensure the \`API_KEY\` environment variable is set correctly.`;
      }
      return `**Error:** The AI service failed to respond. Details: ${error.message}`;
    }
    return "**Error:** An unknown error occurred while contacting the AI service.";
  }
};
