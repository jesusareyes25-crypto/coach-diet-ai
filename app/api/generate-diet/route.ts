import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { DietPlan } from '@/types';

// Force dynamic to prevent static caching of the endpoint
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds for AI generation

export async function POST(req: Request) {
    try {
        const client = await req.json();

        if (!client) {
            return NextResponse.json(
                { success: false, error: "Datos del cliente no proporcionados" },
                { status: 400 }
            );
        }

        console.log("API Route Called for:", client.name);

        // --- MOCK MODE / FAIL-SAFE ---
        // Uncomment this block if you want to force mock data anytime
        /*
        const mockPlan: DietPlan = {
           id: crypto.randomUUID(),
           createdAt: new Date().toISOString(),
           title: "Dieta Mock (API Route)",
           dailyCalories: 2000,
           meals: {
               breakfast: { name: "Mock Breakfast", description: "Test", calories: 400, protein: 20, fat: 10, carbs: 50 },
               lunch: { name: "Mock Lunch", description: "Test", calories: 600, protein: 40, fat: 15, carbs: 60 },
               dinner: { name: "Mock Dinner", description: "Test", calories: 400, protein: 30, fat: 10, carbs: 20 },
               snacks: []
           },
           groceryList: ["Mock Item 1", "Mock Item 2"]
        };
        return NextResponse.json({ success: true, data: mockPlan });
        */
        // ----------------------------

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

        // 1. API Key Check
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.warn("API Key missing in API Route.");
            // Fallback or Error
            return NextResponse.json(
                { success: false, error: "API Key de Google no configurada en el servidor." },
                { status: 500 }
            );
        }

        // 2. AI Call
        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: prompt,
        });

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);

        const plan: DietPlan = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...data,
            groceryList: data.groceryList || []
        };

        return NextResponse.json({ success: true, data: plan });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Error interno del servidor" },
            { status: 500 }
        );
    }
}
