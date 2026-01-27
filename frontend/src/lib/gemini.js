import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateWorkoutPlan(apiKey, params) {
    if (!apiKey) {
        throw new Error("API Key is required");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
    You are an expert fitness coach. Create a customized workout plan based on the following parameters:
    - Goal: ${params.goal}
    - Focus Area: ${params.focus}
    - Days per week: ${params.days}
    - Time per workout: ${params.time} minutes
    - Experience Level: ${params.level}
    - Equipment Available: ${params.equipment || 'Gym'}

    Output ONLY raw CSV data compatible with the following columns:
    PlanName,Description,WorkoutName,ExerciseName,Sets,Reps,Type,Rest Type,Rest,Rest After

    Instructions:
    1. PlanName should be short and catchy (e.g., "${params.goal} - ${params.focus}").
    2. Description should be a brief summary of the plan strategy.
    3. WorkoutName should be specific (e.g., "Push Day", "Leg Day").
    4. Type should be 'Normal' (default) or 'Custom' (for pyramid or drop sets).
    5. Rest Type should be 'Normal' (default) or 'Custom (for specific rest times).
    6. Rest should be in seconds (e.g., 60, 90).
    7. Generate a complete routine for the specified number of days.
    8. Use standard exercise names.
    9. Reps should be a single number (e.g., "12")
    10. Do NOT include markdown code blocks (like \`\`\`csv). Just the raw CSV text.
    11. need to cointain headers: PlanName,Description,StartDate,Duration,Weight,Age,WorkoutName,ExerciseName,Sets,Type,Reps,Rest Type,Rest,Rest After,Rep 1,Rep 2,Rep 3,Rep 4, Rep n...,Rest 1,Rest 2,Rest 3,Rest 4, Rest n...
    12. The csv need de explicit header listed above.

    Example Line:
    PlanName,Description,StartDate,Duration,Weight,Age,WorkoutName,ExerciseName,Sets,Type,Reps,Rest Type,Rest,Rest After,Rep 1,Rep 2,Rep 3,Rep 4,Rest 1,Rest 2,Rest 3,Rest 4
Bulking,"","2026-01-27","","","","Ficha A","Puxada","4","Custom","","Normal","120","120","12","10","8","6","","","",""
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if present
        text = text.replace(/```csv/g, '').replace(/```/g, '').trim();

        return text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate plan. Please check your API Key and try again.");
    }
}
