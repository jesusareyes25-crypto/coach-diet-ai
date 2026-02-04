"use client";

import { useEffect, useState } from "react";
import { Client, DietPlan } from "@/types";
import { getClientsSupabase, saveClientSupabase, deleteClientSupabase, saveDietPlanSupabase } from "@/lib/data-service";
import { Plus, User, Trash2, Zap, Loader2, Download } from "lucide-react";
import { generateDietPlan } from "@/actions/generate-diet";
import FoodScanner from "./FoodScanner";
import dynamic from "next/dynamic";

// Dynamic import for PDF Button to avoid build errors with @react-pdf
const DownloadDietButton = dynamic(
    () => import("./DownloadDietButton"),
    { ssr: false, loading: () => null }
);

export default function DashboardClient() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<DietPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Client>>({
        name: "",
        age: 30,
        weight: 70,
        height: 170,
        gender: "male",
        goal: "Perder peso",
        activityLevel: "Moderado",
        dietaryRestrictions: "Ninguna",
        mealsPerDay: 3,
    });

    useEffect(() => {
        refreshClients();
    }, []);

    const refreshClients = async () => {
        const data = await getClientsSupabase();
        setClients(data);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await saveClientSupabase(formData);
            setIsModalOpen(false);
            refreshClients();
            // Reset form
            setFormData({
                name: "",
                age: 30,
                weight: 70,
                height: 170,
                gender: "male",
                goal: "Perder peso",
                activityLevel: "Moderado",
                dietaryRestrictions: "Ninguna",
                mealsPerDay: 3,
            });
        } catch (error) {
            alert("Error al guardar cliente");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("¿Estás seguro de eliminar este cliente?")) {
            await deleteClientSupabase(id);
            refreshClients();
        }
    };

    const handleGenerateDiet = async (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedClient(client);
        setIsLoading(true);
        try {
            // Logic for various meals is handled in prompt inside generate-diet, 
            // but we need to pass mealsPerDay to it. 
            // V1 action might need update or prompt tweaking.
            // For now, let's keep it simple, expecting the prompt to handle it if we modify it later.
            const plan = await generateDietPlan(client);
            setGeneratedPlan(plan);

            // Save plan to Supabase
            await saveDietPlanSupabase(client.id, plan);
            refreshClients();
            setIsDietModalOpen(true);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Error al generar la dieta. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const openLatestPlan = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        if (client.plans && client.plans.length > 0) {
            setGeneratedPlan(client.plans[0]);
            setSelectedClient(client);
            setIsDietModalOpen(true);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-4xl font-bold font-oswald text-white mb-2 tracking-wide uppercase">
                                Coach Pro <span className="text-neon">AI</span>
                            </h1>
                            <p className="text-gray-400">Total Clientes: {clients.length}</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-neon text-dark-bg px-6 py-3 rounded-none font-bold hover:bg-neon-hover transition-all uppercase tracking-wider"
                        >
                            <Plus size={20} />
                            Nuevo Cliente
                        </button>
                    </div>
                </div>
                <div>
                    <FoodScanner />
                </div>
            </div>

            {clients.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-dark-border rounded-lg lg:col-span-3">
                    <User size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl text-gray-300 font-oswald mb-2">No hay clientes aún</h3>
                    <p className="text-gray-500">Añade tu primer cliente en Supabase para comenzar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <div
                            key={client.id}
                            onClick={(e) => openLatestPlan(client, e)}
                            className="group bg-dark-card border border-dark-border p-6 hover:border-neon transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-neon opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-oswald text-white mb-1">{client.name}</h3>
                                    <div className="flex gap-2 text-xs">
                                        <span className="text-neon bg-neon/10 px-2 py-0.5 rounded">{client.goal}</span>
                                        <span className="text-gray-400 border border-dark-border px-2 py-0.5 rounded">{client.mealsPerDay} comidas</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(client.id, e)}
                                    className="text-gray-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-6 font-mono">
                                <div>
                                    <span className="block text-gray-600 text-xs">EDAD</span>
                                    {client.age} años
                                </div>
                                <div>
                                    <span className="block text-gray-600 text-xs">PESO</span>
                                    {client.weight} kg
                                </div>
                            </div>

                            {client.plans && client.plans.length > 0 ? (
                                <div className="mb-4 text-xs text-green-500 flex items-center gap-1">
                                    <Zap size={12} fill="currentColor" /> Dieta Activa
                                </div>
                            ) : (
                                <div className="mb-4 text-xs text-gray-600">Sin dieta generada</div>
                            )}

                            <button
                                onClick={(e) => handleGenerateDiet(client, e)}
                                disabled={isLoading}
                                className="w-full bg-dark-bg border border-dark-border hover:border-neon text-gray-300 hover:text-neon py-2 flex items-center justify-center gap-2 transition-all uppercase text-sm font-bold tracking-wider disabled:opacity-50"
                            >
                                {isLoading && selectedClient?.id === client.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Zap size={16} />
                                )}
                                {isLoading && selectedClient?.id === client.id ? "Generando..." : "Nueva Dieta"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Diet Plan Modal */}
            {isDietModalOpen && generatedPlan && selectedClient && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-card border border-neon w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-8 relative shadow-[0_0_30px_rgba(204,255,0,0.1)] scrollbar-hide">
                        <button
                            onClick={() => setIsDietModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            CERRAR
                        </button>

                        <div className="flex justify-between items-start mb-6 pr-8">
                            <div>
                                <h2 className="text-3xl font-oswald text-neon mb-2">{generatedPlan.title}</h2>
                                <div className="text-gray-400 flex gap-4 text-sm font-mono">
                                    <span>{generatedPlan.dailyCalories} KCAL</span>
                                    <span>•</span>
                                    <span>{new Date(generatedPlan.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* PDF Download Button */}
                            <DownloadDietButton plan={generatedPlan} client={selectedClient} />
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Desayuno', data: generatedPlan.meals.breakfast },
                                { label: 'Almuerzo', data: generatedPlan.meals.lunch },
                                { label: 'Cena', data: generatedPlan.meals.dinner }
                            ].map((meal) => (
                                <div key={meal.label} className="bg-dark-bg p-4 border-l-2 border-neon">
                                    <h4 className="text-neon font-bold uppercase text-sm mb-1">{meal.label}</h4>
                                    <h3 className="text-white text-xl font-oswald mb-2">{meal.data.name}</h3>
                                    <p className="text-gray-400 text-sm mb-3">{meal.data.description}</p>
                                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-mono">
                                        <div>CAL: {meal.data.calories}</div>
                                        <div>PRO: {meal.data.protein}g</div>
                                        <div>CAR: {meal.data.carbs}g</div>
                                        <div>GRA: {meal.data.fat}g</div>
                                    </div>
                                </div>
                            ))}

                            {generatedPlan.meals.snacks && generatedPlan.meals.snacks.map((snack, idx) => (
                                <div key={idx} className="bg-dark-bg p-4 border-l-2 border-gray-600">
                                    <h4 className="text-gray-400 font-bold uppercase text-sm mb-1">Snack {idx + 1}</h4>
                                    <h3 className="text-white text-xl font-oswald mb-2">{snack.name}</h3>
                                    <p className="text-gray-400 text-sm mb-3">{snack.description}</p>
                                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-mono">
                                        <div>CAL: {snack.calories}</div>
                                        <div>PRO: {snack.protein}g</div>
                                        <div>CAR: {snack.carbs}g</div>
                                        <div>GRA: {snack.fat}g</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-card border border-dark-border w-full max-w-md p-8 relative shadow-2xl shadow-neon/10 modal-animate">
                        <h2 className="text-3xl font-oswald text-white mb-6 uppercase">Nuevo Cliente</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Nombre</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-dark-bg border border-dark-border text-white px-4 py-2 focus:border-neon focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Edad</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                                        className="w-full bg-dark-bg border border-dark-border text-white px-4 py-2 focus:border-neon focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Género</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                                        className="w-full bg-dark-bg border border-dark-border text-white px-4 py-2 focus:border-neon focus:outline-none transition-colors"
                                    >
                                        <option value="male">Hombre</option>
                                        <option value="female">Mujer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Peso (kg)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                                        className="w-full bg-dark-bg border border-dark-border text-white px-4 py-2 focus:border-neon focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Altura (cm)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.height}
                                        onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                                        className="w-full bg-dark-bg border border-dark-border text-white px-4 py-2 focus:border-neon focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Objetivo</label>
                                <input
                                    type="text"
                                    value={formData.goal}
                                    onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                    className="w-full bg-dark-bg border border-dark-border text-white px-4 py-2 focus:border-neon focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Comidas al día</label>
                                <select
                                    value={formData.mealsPerDay}
                                    onChange={e => setFormData({ ...formData, mealsPerDay: Number(e.target.value) })}
                                    className="w-full bg-dark-bg border border-dark-border text-white px-4 py-2 focus:border-neon focus:outline-none transition-colors"
                                >
                                    <option value={3}>3 Comidas (D/A/C)</option>
                                    <option value={4}>4 Comidas (+1 Snack)</option>
                                    <option value={5}>5 Comidas (+2 Snacks)</option>
                                    <option value={6}>6 Comidas (+3 Snacks)</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-neon text-dark-bg font-bold py-2 hover:bg-neon-hover transition-colors uppercase tracking-wider disabled:opacity-50"
                                >
                                    {isLoading ? "Guardando..." : "GUARDAR"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
