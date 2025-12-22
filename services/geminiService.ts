import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { OutfitOccasion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GEN_AI_API_KEY || '' });

export const generateOutfitSuggestion = async (
  baseImageBase64: string,
  occasion: OutfitOccasion
): Promise<{ imageUrl: string; description: string }> => {
  const ai = getAI();
  const mimeType = baseImageBase64.split(';')[0].split(':')[1];
  const base64Data = baseImageBase64.split(',')[1];

  const prompt = `Act as a world-class fashion stylist. Look at the item in this image. 
  Create a complete, high-end "flat-lay" outfit for a ${occasion} occasion featuring this exact item.
  The resulting image should show the item styled with matching shoes, accessories, and complementary garments.
  Style: Clean, professional fashion photography, minimalist aesthetic, white or neutral background.
  Respond with ONLY the generated image. If you provide a description, keep it brief and separate.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
  });

  let imageUrl = '';
  let description = `A curated ${occasion} look featuring your item.`;

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      description = part.text.trim();
    }
  }

  if (!imageUrl) {
    throw new Error("Model failed to generate an image for the outfit.");
  }

  return { imageUrl, description };
};

export const editImageWithPrompt = async (
  currentImageBase64: string,
  userPrompt: string
): Promise<string> => {
  const ai = getAI();
  const mimeType = currentImageBase64.split(';')[0].split(':')[1];
  const base64Data = currentImageBase64.split(',')[1];

  const systemPrompt = `You are a professional image editor. Apply the following modification to the fashion flat-lay image provided: "${userPrompt}". 
  Maintain the high-end aesthetic. Focus on fashion-specific edits like lighting, filters, adding accessories, or changing backgrounds.
  Respond with ONLY the modified image.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: systemPrompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to edit the image.");
};
