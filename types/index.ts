export interface Meal {
    name: string;
    description: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

export interface DietPlan {
    id: string;
    createdAt: string;
    title: string;
    dailyCalories: number;
    meals: {
        breakfast: Meal;
        lunch: Meal;
        dinner: Meal;
        snacks: Meal[];
    };
    groceryList: string[]; // Added for Competition Requirements
}

export interface Client {
    id: string;
    name: string;
    age: number;
    weight: number; // kg
    height: number; // cm
    gender: 'male' | 'female' | 'other';
    goal: string;
    dietaryRestrictions: string;
    activityLevel: string;
    mealsPerDay: number;
    plans: DietPlan[];
}
