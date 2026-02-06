'use server';

import { Client, DietPlan } from '@/types';

// TEMPORARILY REMOVED AI IMPORTS to isolate the crash
// import { google } from '@ai-sdk/google';
// import { generateText } from 'ai';

type GenerateDietResult =
  | { success: true; data: DietPlan }
  | { success: false; error: string };

export async function generateDietPlan(client: Client): Promise<GenerateDietResult> {
  console.log("Server Action Started for:", client.name);

  // RETURN MOCK DATA DIRECTLY - NO AI CALLS
  // This proves if the "Server Action" mechanism itself is working.

  const mockPlan: DietPlan = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    title: "Plan de Prueba (Sin IA)",
    dailyCalories: 2000,
    meals: {
      breakfast: { name: "Prueba Desayuno", description: "Verificando conexión", calories: 400, protein: 20, fat: 10, carbs: 50 },
      lunch: { name: "Prueba Almuerzo", description: "Verificando conexión", calories: 600, protein: 40, fat: 15, carbs: 60 },
      dinner: { name: "Prueba Cena", description: "Verificando conexión", calories: 400, protein: 30, fat: 10, carbs: 20 },
      snacks: []
    },
    groceryList: ["Elemento 1", "Elemento 2"]
  };

  // Simulate a small delay like a real request
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log("Returning success response");
  return { success: true, data: mockPlan };
}
