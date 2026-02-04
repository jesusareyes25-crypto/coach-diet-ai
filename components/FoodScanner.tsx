"use client";

import { useState } from "react";
import { analyzeFoodImage } from "@/actions/analyze-food";
import { Loader2, Camera, Upload } from "lucide-react";
import Image from "next/image";

export default function FoodScanner() {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null); // Reset prev result
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsLoading(true);
        try {
            const data = await analyzeFoodImage(image);
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Error al analizar la imagen");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-dark-card border border-dark-border p-6 rounded-none relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4">
                <Camera className="text-neon" size={24} />
                <h3 className="text-xl font-oswald text-white uppercase">Food Scanner AI</h3>
            </div>

            {!image ? (
                <label className="border-2 border-dashed border-dark-border hover:border-neon h-48 flex flex-col items-center justify-center cursor-pointer transition-colors bg-dark-bg/50">
                    <Upload className="text-gray-500 mb-2" />
                    <span className="text-gray-400 text-sm">Subir foto de comida</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
            ) : (
                <div className="space-y-4">
                    <div className="relative h-48 w-full bg-black">
                        <Image src={image} alt="Preview" fill className="object-contain" />
                        <button
                            onClick={() => setImage(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 hover:bg-red-500 transition-colors"
                        >
                            X
                        </button>
                    </div>

                    {!result && (
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="w-full bg-neon text-dark-bg font-bold py-2 uppercase tracking-widest hover:bg-neon-hover transition-colors flex justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="animate-spin" />}
                            {isLoading ? "Analizando..." : "Analizar con IA"}
                        </button>
                    )}
                </div>
            )}

            {result && (
                <div className="mt-4 pt-4 border-t border-dark-border animate-in slide-in-from-bottom-2">
                    <h4 className="text-neon font-oswald text-lg mb-1">{result.foodName}</h4>
                    <p className="text-gray-400 text-sm mb-3 italic">"{result.suggestion}"</p>

                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-dark-bg p-2 rounded border border-dark-border">
                            <span className="block text-xs text-gray-500 uppercase">Kcal</span>
                            <span className="text-white font-bold">{result.calories}</span>
                        </div>
                        <div className="bg-dark-bg p-2 rounded border border-dark-border">
                            <span className="block text-xs text-gray-500 uppercase">Pro</span>
                            <span className="text-white font-bold">{result.protein}g</span>
                        </div>
                        <div className="bg-dark-bg p-2 rounded border border-dark-border">
                            <span className="block text-xs text-gray-500 uppercase">Carb</span>
                            <span className="text-white font-bold">{result.carbs}g</span>
                        </div>
                        <div className="bg-dark-bg p-2 rounded border border-dark-border">
                            <span className="block text-xs text-gray-500 uppercase">Grasa</span>
                            <span className="text-white font-bold">{result.fat}g</span>
                        </div>
                    </div>
                    <div className="mt-3 text-right">
                        <span className="text-xs text-gray-500">Score Saludable: </span>
                        <span className={`font-bold ${result.healthScore >= 7 ? 'text-neon' : 'text-red-500'}`}>{result.healthScore}/10</span>
                    </div>
                </div>
            )}
        </div>
    );
}
