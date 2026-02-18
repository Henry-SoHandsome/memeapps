
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async editImage(base64Image: string, prompt: string): Promise<string | null> {
    // Remove the data:image/png;base64, prefix if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Transform this image according to this prompt for a high-quality meme: ${prompt}. Return only the edited image.`
    };

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
      });

      // Find the image part in candidates
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      
      console.warn("No image found in Gemini response", response);
      return null;
    } catch (error) {
      console.error("Gemini Image Editing Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
