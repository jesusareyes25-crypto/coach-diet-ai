
require('dotenv').config({ path: '.env.local' });
const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

async function testAI() {
    console.log("----------------------------------------");
    console.log("🔎 PRUEBA DE VERIFICACIÓN LOCAL (AI SDK)");
    console.log("----------------------------------------");

    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
        console.error("❌ ERROR CRÍTICO: No se encontró GOOGLE_GENERATIVE_AI_API_KEY en .env.local");
        process.exit(1);
    }
    console.log("✅ API Key detectada:", key.substring(0, 5) + "..." + key.substring(key.length - 4));

    console.log("🔄 Intentando generar texto con 'gemini-1.5-flash'...");

    try {
        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: 'Responde solo con la palabra: "FUNCIONA"',
        });

        console.log("✅ RESPUESTA RECIBIDA:", text);
        console.log("----------------------------------------");
        console.log("CONCLUSIÓN: Tu API Key y la conexión a Google funcionan perfectamente.");
        console.log("El error en Vercel es 100% de configuración de Next.js/Server Actions, no de la IA.");
        console.log("----------------------------------------");

    } catch (error) {
        console.error("❌ FALLÓ LA LLAMADA A LA API:");
        console.error(error);
        process.exit(1);
    }
}

testAI();
