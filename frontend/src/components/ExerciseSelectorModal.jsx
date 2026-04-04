import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search, PlayCircle, Loader2 } from 'lucide-react';
import { fetchWgerExercises } from '../lib/wgerClient';

export default function ExerciseSelectorModal({ isOpen, onClose, onAddExercises }) {
    const [isLoading, setIsLoading] = useState(false);
    const [wgerExercises, setWgerExercises] = useState([]);
    const [wgerCategories, setWgerCategories] = useState([]);
    const [wgerEquipments, setWgerEquipments] = useState([]);

    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
    const [activeEquipmentFilter, setActiveEquipmentFilter] = useState('all');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExercises, setSelectedExercises] = useState([]);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchQuery('');
            setSelectedExercises([]);
            setActiveCategoryFilter('all');
            setActiveEquipmentFilter('all');

            const loadData = async () => {
                setIsLoading(true);
                const { exercises, categories, equipments } = await fetchWgerExercises();
                setWgerExercises(exercises);
                setWgerCategories(categories);
                setWgerEquipments(equipments);
                setIsLoading(false);
            };
            loadData();
        }
    }, [isOpen]);

    const timerRef = useRef(null);
    const isLongPressRef = useRef(false);

    const handlePointerDown = (ex) => {
        isLongPressRef.current = false;
        timerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(ex + " exercise tutorial")}`, '_blank');
        }, 500); 
    };

    const handlePointerUpOrLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleClick = (ex, e) => {
        e.preventDefault();
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (!isLongPressRef.current) {
            toggleExerciseSelection(ex);
        }
        isLongPressRef.current = false;
    };

    const handleCategorySelect = (categoryId) => {
        setActiveCategoryFilter(categoryId);
        setSearchQuery(''); 
    };

    const handleEquipmentSelect = (equipmentId) => {
        setActiveEquipmentFilter(equipmentId);
        setSearchQuery(''); 
    };

    const toggleExerciseSelection = (exerciseName) => {
        setSelectedExercises(prev => 
            prev.includes(exerciseName) 
            ? prev.filter(e => e !== exerciseName)
            : [...prev, exerciseName]
        );
    };

    const handleConfirm = () => {
        onAddExercises(selectedExercises);
        setSelectedExercises([]);
        onClose();
    };

    const handleClose = () => {
        setSelectedExercises([]);
        onClose();
    };

    const displayedExercises = useMemo(() => {
        let list = wgerExercises;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            list = list.filter(ex => ex.name.toLowerCase().includes(query));
        }

        if (activeCategoryFilter !== 'all') {
            list = list.filter(ex => ex.category && ex.category.id === activeCategoryFilter);
        }

        if (activeEquipmentFilter !== 'all') {
            list = list.filter(ex => ex.equipment && ex.equipment.some(eq => eq.id === activeEquipmentFilter));
        }

        return list.sort((a,b) => a.name.localeCompare(b.name));
    }, [wgerExercises, activeCategoryFilter, activeEquipmentFilter, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
            <div className="bg-brand-gray w-full h-full sm:h-[95%] max-w-5xl rounded-none sm:rounded-2xl flex flex-col shadow-2xl border-none sm:border sm:border-brand-border/50 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-brand-border/50 flex justify-between items-center bg-brand-light-gray shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        Exercise Library
                        {selectedExercises.length > 0 && (
                            <span className="bg-brand-primary text-black text-xs px-2 py-0.5 rounded-full font-bold ml-2 animate-in pop-in">
                                {selectedExercises.length} Selected
                            </span>
                        )}
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-brand-gray/50 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* Top Panel: Category & Equipment List (Composite & Wrap) */}
                    <div className="w-full border-b border-brand-border/30 bg-black/20 shrink-0 p-4">
                        <div className="flex flex-col gap-4">
                            {/* Muscle Group Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Muscle Group</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => handleCategorySelect('all')}
                                        className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm border ${
                                            activeCategoryFilter === 'all'
                                            ? 'bg-brand-primary text-black border-brand-primary' 
                                            : 'bg-brand-light-gray text-gray-400 border-brand-border hover:border-gray-500 hover:text-white'
                                        }`}
                                    >
                                        All Muscles
                                    </button>
                                    {wgerCategories.map(cat => (
                                        <button
                                            key={`cat-${cat.id}`}
                                            onClick={() => handleCategorySelect(cat.id)}
                                            className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm border ${
                                                activeCategoryFilter === cat.id
                                                ? 'bg-brand-primary text-black border-brand-primary' 
                                                : 'bg-brand-light-gray text-gray-400 border-brand-border hover:border-gray-500 hover:text-white'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Equipment Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Equipment</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => handleEquipmentSelect('all')}
                                        className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm border ${
                                            activeEquipmentFilter === 'all'
                                            ? 'bg-brand-primary text-black border-brand-primary' 
                                            : 'bg-brand-light-gray text-gray-400 border-brand-border hover:border-gray-500 hover:text-white'
                                        }`}
                                    >
                                        All Equipment
                                    </button>
                                    {wgerEquipments.map(eq => (
                                        <button
                                            key={`eq-${eq.id}`}
                                            onClick={() => handleEquipmentSelect(eq.id)}
                                            className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm border ${
                                                activeEquipmentFilter === eq.id
                                                ? 'bg-brand-primary text-black border-brand-primary' 
                                                : 'bg-brand-light-gray text-gray-400 border-brand-border hover:border-gray-500 hover:text-white'
                                            }`}
                                        >
                                            {eq.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Panel: Exercise List & Search */}
                    <div className="flex-1 flex flex-col bg-brand-gray min-h-0">
                        {/* Search Bar */}
                        <div className="p-4 border-b border-brand-border/30 shrink-0">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search exercises..." 
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (activeCategoryFilter !== 'all' || activeEquipmentFilter !== 'all') {
                                            setActiveCategoryFilter('all');
                                            setActiveEquipmentFilter('all');
                                        }
                                    }}
                                    className="w-full bg-brand-light-gray border border-brand-border rounded-xl py-3 pl-10 pr-4 outline-none text-gray-200 focus:border-brand-primary transition-colors text-sm font-medium"
                                />
                            </div>
                            <p className="text-xs text-brand-primary/80 mt-3 flex items-center justify-center gap-1.5 font-medium bg-brand-primary/5 py-2 rounded-lg border border-brand-primary/20">
                                💡 <span>Tip: Long press an exercise to open its tutorial on YouTube.</span>
                            </p>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {isLoading ? (
                                    <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-500 gap-3">
                                        <Loader2 size={32} className="animate-spin text-brand-primary" />
                                        <p className="font-medium text-sm">Loading WGER Open Database...</p>
                                    </div>
                                ) : displayedExercises.length === 0 ? (
                                    <div className="col-span-full py-10 text-center text-gray-500 font-medium">
                                        No exercises found matching your filters.
                                    </div>
                                ) : (
                                    displayedExercises.map((ex) => {
                                        const isSelected = selectedExercises.includes(ex.name);
                                        return (
                                            <button
                                                key={`ex-${ex.id}`}
                                                onPointerDown={() => handlePointerDown(ex.name)}
                                                onPointerUp={handlePointerUpOrLeave}
                                                onPointerLeave={handlePointerUpOrLeave}
                                                onClick={(e) => handleClick(ex.name, e)}
                                                onContextMenu={(e) => e.preventDefault()}
                                                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group select-none touch-manipulation ${
                                                    isSelected 
                                                    ? 'bg-brand-primary/10 border-brand-primary shadow-sm' 
                                                    : 'bg-brand-light-gray/50 border-transparent hover:bg-brand-light-gray hover:border-brand-border/50'
                                                }`}
                                            >
                                                <div className="flex flex-col pr-3">
                                                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-brand-primary' : 'text-gray-300'}`}>
                                                        {ex.name}
                                                    </span>
                                                    {(ex.category?.name || (ex.equipment?.length > 0 && ex.equipment[0].name)) && (
                                                        <span className="text-xs text-gray-500 truncate mt-1">
                                                            {[ex.category?.name, ex.equipment?.[0]?.name].filter(Boolean).join(" • ")}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                                                    isSelected ? 'bg-brand-primary border-brand-primary text-black' : 'border-gray-600 group-hover:border-gray-400'
                                                }`}>
                                                    {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {selectedExercises.length > 0 && (
                    <div className="p-4 border-t border-brand-border/50 bg-brand-light-gray shrink-0 flex justify-end animate-in slide-in-from-bottom-2">
                        <button 
                            onClick={handleConfirm}
                            className="bg-brand-primary hover:bg-brand-primary-dark text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
                        >
                            Add {selectedExercises.length} Exercise{selectedExercises.length > 1 ? 's' : ''} to Workout
                        </button>
                    </div>
                )}


            </div>
        </div>
    );
}
