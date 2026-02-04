import { supabase } from "./supabase";
import { Client, DietPlan } from "@/types";

// Helper to map DB snake_case to TS camelCase
const mapClientFromDB = (data: any): Client => ({
    id: data.id,
    name: data.name,
    age: data.age,
    weight: data.weight,
    height: data.height,
    gender: data.gender,
    goal: data.goal,
    activityLevel: data.activity_level,
    dietaryRestrictions: data.dietary_restrictions,
    mealsPerDay: data.meals_per_day || 3,
    plans: [], // Plans handled separately or via join
});

export const getClientsSupabase = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*, diet_plans(*)');

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }

    return data.map((c: any) => ({
        ...mapClientFromDB(c),
        plans: c.diet_plans.map((p: any) => ({
            ...p.content_json,
            id: p.id,
            createdAt: p.created_at
        }))
    }));
};

export const saveClientSupabase = async (client: Partial<Client>) => {
    const payload = {
        name: client.name,
        age: client.age,
        weight: client.weight,
        height: client.height,
        gender: client.gender,
        goal: client.goal,
        activity_level: client.activityLevel,
        dietary_restrictions: client.dietaryRestrictions,
        meals_per_day: client.mealsPerDay || 3
    };

    const { data, error } = await supabase
        .from('clients')
        .upsert(client.id ? { id: client.id, ...payload } : payload)
        .select()
        .single();

    if (error) throw error;
    return mapClientFromDB(data);
};

export const deleteClientSupabase = async (id: string) => {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

export const saveDietPlanSupabase = async (clientId: string, plan: DietPlan) => {
    const { error } = await supabase
        .from('diet_plans')
        .insert({
            client_id: clientId,
            title: plan.title,
            daily_calories: plan.dailyCalories,
            content_json: plan
        });
    if (error) throw error;
};
