import React, { useState, useEffect, useRef } from 'react';
import ExerciseCard from './ExerciseCard';
import { Plus, Copy, Trash2, Edit2, Play, ChevronUp, ChevronDown } from 'lucide-react';
import { generateUUID } from '../lib/uuid';
import ExerciseSelectorModal from './ExerciseSelectorModal';
import { fetchWgerCategories } from '../lib/wgerClient';

export default function WorkoutView({ workout, setWorkouts, isReadOnly }) {
    const workoutRef = useRef(null);
    const [muscleCategories, setMuscleCategories] = useState([]);

    useEffect(() => {
        fetchWgerCategories().then(setMuscleCategories);
    }, []);
    // Ensure variations array exists for legacy support during render
    const variations = workout.variations && workout.variations.length > 0
        ? workout.variations
        : [{ id: workout.id + '_v', name: 'Week 1', exercises: workout.exercises || [] }];

    const [activeVariationId, setActiveVariationId] = useState(variations[0]?.id);
    const [editingVariationId, setEditingVariationId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

    // If workout changes, reset active variation to its first
    useEffect(() => {
        const currentVariations = workout.variations && workout.variations.length > 0
            ? workout.variations
            : [{ id: workout.id + '_v', name: 'Week 1', exercises: workout.exercises || [] }];
        if (!currentVariations.find(v => v.id === activeVariationId)) {
            setActiveVariationId(currentVariations[0]?.id);
        }
    }, [workout.id, workout.variations, activeVariationId]);

    const activeVariation = variations.find(v => v.id === activeVariationId) || variations[0];

    // Helper to safely update a specific variation
    const updateVariation = (variationId, updater) => {
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            const wVariations = w.variations && w.variations.length > 0
                ? w.variations
                : [{ id: w.id + '_v', name: 'Week 1', exercises: w.exercises || [] }];

            return {
                ...w,
                variations: wVariations.map(v => v.id === variationId ? updater(v) : v)
            };
        }));
    };

    const toggleTargetMuscle = (muscleId) => {
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            const currentMuscles = w.targetMuscles || [];
            const newMuscles = currentMuscles.includes(muscleId)
                ? currentMuscles.filter(m => m !== muscleId)
                : [...currentMuscles, muscleId];
            return { ...w, targetMuscles: newMuscles };
        }));
    };

    const updateExercise = (exerciseId, newData) => {
        updateVariation(activeVariationId, (v) => ({
            ...v,
            exercises: v.exercises.map(ex => ex.id === exerciseId ? newData : ex)
        }));
    };

    const deleteExercise = (exerciseId) => {
        updateVariation(activeVariationId, (v) => ({
            ...v,
            exercises: v.exercises.filter(ex => ex.id !== exerciseId)
        }));
    };

    const openExerciseModal = () => {
        setIsModalOpen(true);
    };

    const handleAddExercisesFromModal = (selectedExerciseNames) => {
        const newExercises = selectedExerciseNames.map(name => ({
            id: generateUUID(),
            name: name,
            sets: '',
            reps: '',
            type: 'Normal',
            restType: 'Normal',
            rest: '',
            restAfter: ''
        }));

        updateVariation(activeVariationId, (v) => ({
            ...v,
            exercises: [...(v.exercises || []), ...newExercises]
        }));
    };

    const updateWorkoutName = (name) => {
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            return { ...w, name };
        }));
    };

    const updateVariationName = (variationId, newName) => {
        updateVariation(variationId, (v) => ({ ...v, name: newName }));
        setEditingVariationId(null);
    };

    const addVariation = () => {
        const newId = generateUUID();
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            const wVariations = w.variations && w.variations.length > 0
                ? w.variations
                : [{ id: w.id + '_v', name: 'Week 1', exercises: w.exercises || [] }];
            return {
                ...w,
                variations: [...wVariations, { id: newId, name: `Week ${wVariations.length + 1}`, exercises: [] }]
            };
        }));
        setActiveVariationId(newId);
    };

    const duplicateVariation = (variationToDuplicate) => {
        const newId = generateUUID();
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            const wVariations = w.variations && w.variations.length > 0 ? w.variations : [{ id: w.id + '_v', name: 'Week 1', exercises: w.exercises || [] }];

            // Generate new IDs for duplicated exercises
            const duplicatedExercises = (variationToDuplicate.exercises || []).map(ex => ({
                ...ex,
                id: generateUUID()
            }));

            return {
                ...w,
                variations: [...wVariations, { id: newId, name: `${variationToDuplicate.name} (Copy)`, exercises: duplicatedExercises }]
            };
        }));
        setActiveVariationId(newId);
    };

    const deleteVariation = (variationId) => {
        if (variations.length <= 1) return; // Don't delete last variation
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            return {
                ...w,
                variations: w.variations.filter(v => v.id !== variationId)
            };
        }));
        if (activeVariationId === variationId) {
            setActiveVariationId(variations.find(v => v.id !== variationId)?.id);
        }
    };

    return (
        <div ref={workoutRef} className="flex flex-col h-full bg-brand-gray">
            <div className="px-6 pt-4 border-b border-brand-border/50 pb-4">
                {/* Name row + toggle */}
                <div className="flex items-center gap-2 mb-3">
                    <input
                        disabled={isReadOnly}
                        className={`text-xl font-bold bg-transparent border-none outline-none text-gray-100 placeholder-gray-600 flex-1 min-w-0 focus:ring-1 focus:ring-brand-primary/50 rounded px-2 -mx-2 transition-all ${isReadOnly ? 'text-gray-500' : ''}`}
                        value={workout.name}
                        onChange={(e) => updateWorkoutName(e.target.value)}
                        placeholder="Workout Name"
                    />
                    <button
                        onClick={() => setIsHeaderExpanded(v => !v)}
                        className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-brand-light-gray transition-colors"
                    >
                        {isHeaderExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                {/* Collapsible: muscles */}
                <div className={`overflow-hidden transition-all duration-300 ${isHeaderExpanded ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                    {!isReadOnly && muscleCategories.length > 0 && (
                        <p className="text-xs text-gray-500 mb-2">Select the muscle groups targeted in this workout</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {(!isReadOnly || (workout.targetMuscles && workout.targetMuscles.length > 0)) && muscleCategories.map(m => {
                            const isSelected = (workout.targetMuscles || []).includes(m.id);
                            if (isReadOnly && !isSelected) return null;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => !isReadOnly && toggleTargetMuscle(m.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${isSelected
                                        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary'
                                        : 'bg-brand-light-gray/50 text-gray-400 border-brand-border hover:border-gray-500'
                                        }`}
                                    disabled={isReadOnly}
                                >
                                    {m.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Variations Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {variations.map((variation) => (
                        <div
                            key={variation.id}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${activeVariationId === variation.id
                                ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                                : 'bg-brand-light-gray border-brand-border text-gray-400 hover:text-gray-200 hover:border-gray-600'
                                }`}
                            onClick={() => setActiveVariationId(variation.id)}
                        >
                            {editingVariationId === variation.id && !isReadOnly ? (
                                <input
                                    autoFocus
                                    className="bg-transparent border-none outline-none text-sm font-medium w-24 text-gray-100"
                                    defaultValue={variation.name}
                                    onBlur={(e) => updateVariationName(variation.id, e.target.value || 'Unnamed')}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') updateVariationName(variation.id, e.target.value || 'Unnamed');
                                        if (e.key === 'Escape') setEditingVariationId(null);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span className="text-sm font-medium select-none" onDoubleClick={() => !isReadOnly && setEditingVariationId(variation.id)}>
                                    {variation.name}
                                </span>
                            )}

                            {!isReadOnly && activeVariationId === variation.id && (
                                <div className="flex items-center ml-1 gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => setEditingVariationId(variation.id)} className="p-1 hover:bg-brand-gray rounded text-current hover:text-white transition-colors" title="Rename Variation">
                                        <Edit2 size={12} />
                                    </button>
                                    <button onClick={() => duplicateVariation(variation)} className="p-1 hover:bg-brand-gray rounded text-current hover:text-white transition-colors" title="Duplicate Variation">
                                        <Copy size={12} />
                                    </button>
                                    {variations.length > 1 && (
                                        <button onClick={() => deleteVariation(variation.id)} className="p-1 hover:bg-red-500/20 rounded text-current hover:text-red-400 transition-colors" title="Delete Variation">
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {!isReadOnly && (
                        <button
                            onClick={addVariation}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-brand-border text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-all whitespace-nowrap"
                        >
                            <Plus size={14} />
                            <span className="text-sm font-medium">Add Variation</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6 py-6 scrollbar-none">
                {(activeVariation?.exercises || []).map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        updateExercise={updateExercise}
                        deleteExercise={deleteExercise}
                        isReadOnly={isReadOnly}
                        isLast={index === (activeVariation?.exercises || []).length - 1}
                    />
                ))}

                {!isReadOnly && (
                    <button
                        onClick={openExerciseModal}
                        className="w-full py-4 border-2 border-dashed border-brand-border rounded-xl text-gray-500 font-medium hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2 group"
                    >
                        <div className="bg-brand-light-gray p-1 rounded-full group-hover:bg-brand-primary group-hover:text-black transition-colors">
                            <Plus size={20} />
                        </div>
                        Add Exercise
                    </button>
                )}
            </div>

            <ExerciseSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddExercises={handleAddExercisesFromModal}
                defaultMuscles={workout.targetMuscles || []}
                parentRef={workoutRef}
            />
        </div>
    );
}
