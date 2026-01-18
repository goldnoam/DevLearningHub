
import { GoogleGenAI } from "@google/genai";

export const askGemini = async (prompt: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
        systemInstruction: "You are a senior software engineering tutor. Provide clear, concise explanations of code snippets. Use markdown for your response."
    }
  });

  return response.text || "No explanation generated.";
};
