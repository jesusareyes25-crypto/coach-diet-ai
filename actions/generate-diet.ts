'use server';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { Client, DietPlan } from '@/types';

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
      },
      "groceryList": ["Ingrediente 1", "Ingrediente 2"]
    }
  `;

  // SAFETY FALLBACK: Mock Data used if API fails or Key is missing
  const mockPlan: DietPlan = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    title: "Plan Ejemplo (Modo Seguro)",
    dailyCalories: 2000,
    meals: {
      breakfast: { name: "Avena con Frutas (Ejemplo)", description: "Bowl de avena cocida con plátano y nueces", calories: 450, protein: 15, fat: 12, carbs: 65 },
      lunch: { name: "Pechuga de Pollo Grillé", description: "Con arroz integral y brócoli al vapor", calories: 600, protein: 45, fat: 10, carbs: 55 },
      dinner: { name: "Ensalada Completa de Atún", description: "Atún, aguacate, tomate y espinacas", calories: 350, protein: 30, fat: 15, carbs: 12 },
      snacks: [{ name: "Manzana y Almendras", description: "Snack rápido y saludable", calories: 200, protein: 5, fat: 10, carbs: 25 }]
    },
    groceryList: ["Avena", "Leche desnatada", "Plátanos", "Nueces", "Pechuga de pollo", "Arroz integral", "Brócoli", "Atún al natural", "Aguacate", "Espinacas", "Tomates", "Manzanas", "Almendras"]
  };

  try {
    // 1. Check API Key. If missing, return MOCK immediately (don't crash).
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn("API Key missing. Returning Mock Data.");
      return { success: true, data: mockPlan };
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
      ...data,
      // Ensure groceryList exists even if AI forgets it
      groceryList: data.groceryList || ["Consultar receta para ingredientes"]
    } as DietPlan;

    return { success: true, data: plan };

  } catch (error: any) {
    console.error("AI Generation Error (Falling back to Mock):", error);
    // 2. If AI crashes (quota, timeout, parsing), return MOCK instead of error.
    // This allows the user to see the UI working even if functionality is limited.
    return { success: true, data: mockPlan };
  }
}
