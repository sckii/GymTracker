const WGER_BASE = 'https://wger.de/api/v2';
const WGER_TOKEN = '7ce551b575049ec5bc4e46021b9b54fc3a73bd4a';
const ENGLISH_LANGUAGE_ID = 2;

const HEADERS = {
    'Authorization': `Token ${WGER_TOKEN}`,
    'Accept': 'application/json'
};

async function fetchAllPages(url) {
    const results = [];
    let next = url;
    while (next) {
        const res = await fetch(next, { headers: HEADERS });
        if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar: ${next}`);
        const data = await res.json();
        results.push(...(data.results ?? []));
        next = data.next ?? null;
    }
    return results;
}

export async function fetchWgerExercises() {
    try {
        // exerciseinfo retorna objetos com translations[], category{} e equipment[]
        const raw = await fetchAllPages(
            `${WGER_BASE}/exerciseinfo/?format=json&language=${ENGLISH_LANGUAGE_ID}&limit=100`
        );

        const categoriesMap = new Map();
        const equipmentsMap = new Map();

        const exercises = raw
            .map(ex => {
                // O nome fica dentro do array translations, filtrado por language id
                const translation =
                    ex.translations?.find(t => t.language === ENGLISH_LANGUAGE_ID)
                    ?? ex.translations?.[0];

                if (!translation?.name?.trim()) return null;

                if (ex.category?.id) {
                    categoriesMap.set(ex.category.id, ex.category);
                }
                ex.equipment?.forEach(eq => {
                    if (eq?.id) equipmentsMap.set(eq.id, eq);
                });

                return {
                    id: ex.id,
                    name: translation.name.trim(),
                    category: ex.category ?? null,
                    equipment: ex.equipment ?? [],
                };
            })
            .filter(Boolean);

        const categories = [...categoriesMap.values()].sort((a, b) => a.name.localeCompare(b.name));
        const equipments = [...equipmentsMap.values()].sort((a, b) => a.name.localeCompare(b.name));

        return { exercises, categories, equipments };
    } catch (error) {
        console.error('WGER API Error:', error);
        return { exercises: [], categories: [], equipments: [] };
    }
}
