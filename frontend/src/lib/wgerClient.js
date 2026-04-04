const WGER_TOKEN = '7ce551b575049ec5bc4e46021b9b54fc3a73bd4a';

export async function fetchWgerExercises() {
    try {
        const response = await fetch('https://wger.de/api/v2/exerciseinfo/?language=2&limit=1000', {
            headers: {
                'Authorization': `Token ${WGER_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch from WGER');
        const data = await response.json();
        
        const exercises = data.results || [];
        
        // Extract unique categories (Muscle Groups/Body parts)
        const categoriesMap = new Map();
        // Extract unique equipments
        const equipmentsMap = new Map();

        exercises.forEach(ex => {
            if (ex.category && ex.category.id) {
                categoriesMap.set(ex.category.id, ex.category);
            }
            if (ex.equipment && Array.isArray(ex.equipment)) {
                ex.equipment.forEach(eq => {
                    equipmentsMap.set(eq.id, eq);
                });
            }
        });

        const categories = Array.from(categoriesMap.values()).sort((a,b) => a.name.localeCompare(b.name));
        const equipments = Array.from(equipmentsMap.values()).sort((a,b) => a.name.localeCompare(b.name));

        return {
            exercises,
            categories,
            equipments
        };
    } catch (error) {
        console.error('WGER API Error:', error);
        return { exercises: [], categories: [], equipments: [] };
    }
}
