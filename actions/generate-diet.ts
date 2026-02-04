'use server';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { Client, DietPlan } from '@/types';

export async function generateDietPlan(client: Client): Promise<DietPlan> {
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

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
    });

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);

    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data
    } as DietPlan;

  } catch (error) {
    console.error("Error generating diet:", error);
    throw new Error("No se pudo generar la dieta. Inténtalo de nuevo.");
  }
}
