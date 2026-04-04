const WGER_BASE = 'https://wger.de/api/v2';
const WGER_TOKEN = '7ce551b575049ec5bc4e46021b9b54fc3a73bd4a';
const ENGLISH_LANGUAGE_ID = 2;
const CACHE_KEY = 'wger_exercises_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

const HEADERS = {
    'Authorization': `Token ${WGER_TOKEN}`,
    'Accept': 'application/json'
};

function getCachedData() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age > CACHE_DURATION) {
            console.log('⏰ Cache expirado');
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        console.log(`✅ Cache válido (${Math.round(age / 1000)}s atrás)`);
        return data;
    } catch (err) {
        console.warn('❌ Erro ao ler cache:', err);
        return null;
    }
}

function setCachedData(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        console.log('💾 Cache salvo');
    } catch (err) {
        console.warn('❌ Erro ao salvar cache:', err);
    }
}

async function fetchAllPages(url) {
    const results = [];
    let next = url;
    let pageCount = 0;
    while (next) {
        pageCount++;
        console.log(`📄 Página ${pageCount}: ${next.substring(0, 80)}...`);
        try {
            const res = await fetch(next, {
                headers: HEADERS,
                signal: AbortSignal.timeout(30000) // 30s timeout por página
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            const pageSize = data.results?.length || 0;
            results.push(...(data.results ?? []));
            console.log(`  ✓ ${pageSize} itens (total: ${results.length})`);
            next = data.next ?? null;
        } catch (err) {
            console.error(`  ❌ Erro na página ${pageCount}:`, err.message);
            throw err;
        }
    }
    console.log(`🏁 Total de ${pageCount} páginas, ${results.length} resultados`);
    return results;
}

export async function fetchWgerExercises() {
    try {
        console.log('🔄 Buscando exercícios WGER...');

        // Tenta usar cache primeiro
        const cached = getCachedData();
        if (cached) {
            console.log(`✅ Retornando ${cached.exercises.length} exercícios do cache`);
            return cached;
        }

        console.log('📡 Cache não encontrado, buscando da API...');
        console.log('🔄 Iniciando busca de exercícios WGER...');
        // exerciseinfo retorna objetos com translations[], category{} e equipment[]
        const raw = await fetchAllPages(
            `${WGER_BASE}/exerciseinfo/?format=json&language=${ENGLISH_LANGUAGE_ID}&limit=100`
        );
        console.log(`✅ Raw data recebido: ${raw.length} exercícios`);

        if (!raw.length) {
            console.warn('⚠️  Nenhum exercício retornado da API');
            return { exercises: [], categories: [], equipments: [] };
        }

        const categoriesMap = new Map();
        const equipmentsMap = new Map();

        const exercises = raw
            .map(ex => {
                // O nome fica dentro do array translations, filtrado por language id
                const translation =
                    ex.translations?.find(t => t.language === ENGLISH_LANGUAGE_ID)
                    ?? ex.translations?.[0];

                if (!translation?.name?.trim()) {
                    console.debug(`⚠️  Exercício ${ex.id} sem nome válido`);
                    return null;
                }

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

        const result = { exercises, categories, equipments };

        console.log(`✅ Processado: ${exercises.length} exercícios, ${categories.length} categorias, ${equipments.length} equipamentos`);

        // Salva no cache
        setCachedData(result);

        return result;
    } catch (error) {
        console.error('❌ WGER API Error:', error);
        return { exercises: [], categories: [], equipments: [] };
    }
}

export async function fetchWgerCategories() {
    // Reuse full cache if available — avoids a separate request
    const cached = getCachedData();
    if (cached?.categories?.length) return cached.categories;

    try {
        const res = await fetch(`${WGER_BASE}/exercisecategory/?format=json&limit=100`, {
            headers: HEADERS,
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return (data.results ?? []).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('❌ WGER Categories Error:', error);
        return [];
    }
}

export async function fetchWgerExerciseDetail(exerciseId) {
    try {
        const res = await fetch(`${WGER_BASE}/exerciseinfo/${exerciseId}/?format=json`, {
            headers: HEADERS,
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error('❌ WGER Exercise Detail Error:', error);
        return null;
    }
}

export function clearWgerCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
        console.log('🧹 Cache limpo');
    } catch (err) {
        console.warn('❌ Erro ao limpar cache:', err);
    }
}
