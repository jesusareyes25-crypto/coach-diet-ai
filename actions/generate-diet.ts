'use server';

import { Client, DietPlan } from '@/types';

// TEMPORARILY REMOVED AI IMPORTS to isolate the crash
// import { google } from '@ai-sdk/google';
// import { generateText } from 'ai';

type GenerateDietResult =
  | { success: true; data: DietPlan }
  | { success: false; error: string };

export async function generateDietPlan(client: Client): Promise<GenerateDietResult> {
  console.log("Server Action Received Call");

  if (!client) {
    console.error("Received null client");
    return { success: false, error: "Client data is missing" };
  }

  // Debugging serialization
  try {
    console.log("Client Name:", client.name);
  } catch (e) {
    console.error("Error accessing client data:", e);
    return { success: false, error: "Invalid client data" };
  }

  // Simple ID generator to avoid crypto dependency issues
  const simpleId = Math.random().toString(36).substring(7);

  const mockPlan: DietPlan = {
    id: simpleId,
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

  // Simulate a small delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log("Returning success response");
  return { success: true, data: mockPlan };
}
