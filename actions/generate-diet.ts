'use server';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { Client, DietPlan } from '@/types';

// user-provided pattern: return { message, statusCode, data? }
type ActionResponse = {
  message: string;
  statusCode: number;
  data?: DietPlan;
};

// Generic Server Error Handler (Adapted from User's Snippet)
async function handleServerError(error: any): Promise<ActionResponse> {
  console.error("Server Action Error:", error);

  try {
    // Check for specific known errors
    if (error.message?.includes('API key')) {
      return { message: "Configuration Error: Google API Key missing or invalid.", statusCode: 401 };
    }

    // Default fallback
    return { message: error.message || "Unknown server error", statusCode: 500 };

  } catch (catchError: any) {
    return { message: catchError.message, statusCode: 500 };
  }
}

export async function generateDietPlan(client: Client): Promise<ActionResponse> {
  try {
    console.log("Starting Diet Generation for:", client.name);

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn("API Key missing. Triggering Mock Fallback internally (or throwing error handling).");
      // For this pattern, we can treat missing key as an error handled by handleServerError logic 
      // OR we can do the Mock logic here if we still want fail-safe.
      // User asked to 'solve the error', so let's be strict but safe.
      // Let's THROW so handleServerError catches it and formats it.
      throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    }

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
        },
        "groceryList": ["Ingrediente 1", "Ingrediente 2"]
      }
    `;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
    });

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);

    // Create Plain Object (POJO) to ensure serialization
    const plan: DietPlan = {
      id: crypto.randomUUID(), // Assuming this works, if not we catch it.
      createdAt: new Date().toISOString(),
      title: data.title || "Plan Generado",
      dailyCalories: data.dailyCalories || 2000,
      meals: data.meals,
      groceryList: data.groceryList || []
    };

    return { message: "Success", statusCode: 200, data: plan };

  } catch (error: any) {
    // Use the User's Error Handler Pattern
    return await handleServerError(error);
  }
}
