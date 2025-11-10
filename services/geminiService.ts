import { GoogleGenAI } from "@google/genai";

// FIX: The API key is now sourced from `process.env.API_KEY` to align with @google/genai coding guidelines.
if (!process.env.API_KEY) {
  // This log will appear in the browser console if the key is missing.
  console.error("API_KEY environment variable not set. AI features will fail.");
}

// FIX: Initialize the client with `process.env.API_KEY` as per the guidelines.
// The SDK is expected to handle cases where the key is missing.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateContent = async (prompt: string): Promise<string> => {
  // FIX: Switched to `process.env.API_KEY` for the check and updated the error message.
  if (!process.env.API_KEY) {
    return "**Error:** The `API_KEY` is not configured in the site's deployment settings. Please contact the site administrator.";
  }

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
      if (error.message.includes('API key not valid')) {
        // FIX: Updated the error message to reference `API_KEY`.
        return `**Error:** The API key is not valid. Please ensure the \`API_KEY\` environment variable is set correctly in your deployment settings.`;
      }
      return `**Error:** The AI service failed to respond. Details: ${error.message}`;
    }
    return "**Error:** An unknown error occurred while contacting the AI service.";
  }
};
