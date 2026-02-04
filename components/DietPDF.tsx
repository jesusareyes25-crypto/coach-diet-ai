import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { DietPlan, Client, Meal } from '@/types';

// Register Oswald font
Font.register({
    family: 'Oswald',
    src: 'https://fonts.gstatic.com/s/oswald/v49/TK3iWkUHHAIjg75uhkjgl20.ttf'
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2px solid #000000',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Oswald',
        color: '#000000',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        color: '#666666',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    section: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderLeft: '4px solid #ccff00', // Neon highlight
    },
    mealTitle: {
        fontSize: 16,
        fontFamily: 'Oswald',
        color: '#0a0a0a',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    dishName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        fontSize: 10,
        color: '#444444',
        marginBottom: 8,
        lineHeight: 1.4,
    },
    macros: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 5,
        borderTop: '1px solid #e0e0e0',
        paddingTop: 5,
    },
    macroItem: {
        fontSize: 9,
        color: '#666666',
        fontFamily: 'Courier',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 10,
        color: '#999999',
        textAlign: 'center',
        borderTop: '1px solid #eeeeee',
        paddingTop: 10,
    }
});

interface DietPDFProps {
    plan: DietPlan;
    client: Client;
}

const MealSection = ({ title, meal }: { title: string, meal: Meal }) => (
    <View style={styles.section}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.dishName}>{meal.name}</Text>
        <Text style={styles.description}>{meal.description}</Text>
        <View style={styles.macros}>
            <Text style={styles.macroItem}>CAL: {meal.calories}</Text>
            <Text style={styles.macroItem}>PRO: {meal.protein}g</Text>
            <Text style={styles.macroItem}>CAR: {meal.carbs}g</Text>
            <Text style={styles.macroItem}>GRASA: {meal.fat}g</Text>
        </View>
    </View>
);

export const DietPDF = ({ plan, client }: DietPDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Plan Nutricional Personalizado</Text>
                <View style={styles.subtitle}>
                    <Text>Cliente: {client.name.toUpperCase()}</Text>
                    <Text>{new Date().toLocaleDateString()}</Text>
                </View>
                <Text style={{ fontSize: 10, color: '#888', marginTop: 5 }}>
                    Objetivo: {client.goal} | {plan.dailyCalories} KCAL Diarias
                </Text>
            </View>

            <MealSection title="Desayuno" meal={plan.meals.breakfast} />
            <MealSection title="Almuerzo" meal={plan.meals.lunch} />
            <MealSection title="Cena" meal={plan.meals.dinner} />

            {plan.meals.snacks && plan.meals.snacks.map((snack, i) => (
                <MealSection key={i} title={`Snack ${i + 1}`} meal={snack} />
            ))}

            <View style={styles.footer}>
                <Text>Generado por Coach Pro AI • Entrenador Personal</Text>
            </View>
        </Page>
    </Document>
);
