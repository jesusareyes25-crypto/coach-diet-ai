'use server';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function analyzeFoodImage(base64Image: string) {
    const prompt = `
    Analiza esta imagen de comida. Actúa como un nutricionista experto.
    Identifica los alimentos presentes y estima sus valores nutricionales.
    
    Responde EXCLUSIVAMENTE con un JSON válido con la siguiente estructura:
    {
      "foodName": "Nombre del plato/alimento",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "healthScore": 0, // Del 1-10 siendo 10 muy saludable
      "suggestion": "Breve consejo sobre si es adecuado para una dieta de pérdida de peso"
    }
  `;

    try {
        // Remove header if present (data:image/jpeg;base64,)
        const cleanBase64 = base64Image.split(',')[1] || base64Image;

        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image', image: cleanBase64 },
                    ],
                },
            ],
        });

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("No se pudo analizar la imagen.");
    }
}
