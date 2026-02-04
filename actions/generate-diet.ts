'use server';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { Client, DietPlan } from '@/types';

// Allow longer timeout for AI generation (Vercel default is 10s)
// export const maxDuration = 60; // Commented out to fix build error

// Define return type
type GenerateDietResult =
  | { success: true; data: DietPlan }
  | { success: false; error: string };

export async function generateDietPlan(client: Client): Promise<GenerateDietResult> {
  const prompt = `
    Actúa como un nutricionista experto y entrenador personal.
    Crea un plan de dieta de 1 día detallado para el siguiente cliente:
    
    Perfil:
    - Nombre: ${client.name}
    - Edad: ${client.age}
    - Peso: ${client.weight}kg
    - Altura: ${client.height}cm
    - Género: ${client.gender}
    - Objetivo: ${client.goal}
    - Nivel de Actividad: ${client.activityLevel}
    - Restricciones: ${client.dietaryRestrictions}
    - Comidas al día: ${client.mealsPerDay || 3}

    Genera una respuesta EXCLUSIVAMENTE en formato JSON válido.
    IMPORTANTE: Si el cliente pide más de 3 comidas, añade los "snacks" necesarios en el array "snacks".
    Estructura JSON:
    {
      "title": "Nombre creativo para el plan",
      "dailyCalories": número estimado de calorías,
      "meals": {
        "breakfast": { "name": "Nombre del plato", "description": "Descripción breve", "calories": 0, "protein": 0, "fat": 0, "carbs": 0 },
        "lunch": { ... },
        "dinner": { ... },
        "snacks": [ { "name": "Snack 1", ... }, ... ]
      }
    }
  `;

  // MOCK MODE: Uncomment to test flow without AI
  // if (true) {
  //     console.log("MOCK MODE ENABLED");
  //     const mockPlan: DietPlan = {
  //         id: crypto.randomUUID(),
  //         createdAt: new Date().toISOString(),
  //         title: "Dieta Ejemplo (Mock)",
  //         dailyCalories: 2000,
  //         meals: {
  //             breakfast: { name: "Avena con frutas", description: "Bowl de avena", calories: 350, protein: 12, fat: 6, carbs: 60 },
  //             lunch: { name: "Pollo a la plancha", description: "Con arroz y verduras", calories: 600, protein: 45, fat: 12, carbs: 50 },
  //             dinner: { name: "Ensalada de Atún", description: "Ligera y proteica", calories: 300, protein: 25, fat: 10, carbs: 15 },
  //             snacks: []
  //         }
  //     };
  //     return { success: true, data: mockPlan };
  // }

  try {
    // Explicitly check for API Key before calling
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return { success: false, error: "API Key de Google no encontrada en el servidor." };
    }

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
    });

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);

    const plan = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data
    } as DietPlan;

    return { success: true, data: plan };

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    // Return specific error if API key is missing or quota exceeded
    if (error.message?.includes('API key')) {
      return { success: false, error: "Error de configuración: API Key inválida o faltante." };
    }
    return { success: false, error: `Error generando dieta: ${error.message || 'Desconocido'}` };
  }
}
