import React from 'react';
import { Trash2, ChevronDown } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

export default function ExerciseCard({ exercise, updateExercise, deleteExercise, isReadOnly, isLast }) {
    const { t } = useLanguage();
    const currentType = (exercise.type === 'Pyramid' || exercise.type === 'Drop-set') ? 'Custom' : (exercise.type || 'Normal');
    const currentRestType = exercise.restType || 'Normal';

    // Helper to safely update reps/rest arrays
    const updateArrayValue = (field, value, index) => {
        if (isReadOnly) return;
        if (value < 0) return; // Prevent negative values

        const currentArray = Array.isArray(exercise[field]) ? [...exercise[field]] : [];
        const size = parseInt(exercise.sets) || 0;

        // Ensure array size matches sets
        while (currentArray.length < size) currentArray.push('');

        currentArray[index] = value;
        updateExercise(exercise.id, { ...exercise, [field]: currentArray });
    };

    const handleRepsChange = (value, index) => {
        if (isReadOnly) return;
        if (value < 0) return; // Prevent negative values

        if (currentType === 'Normal') {
            updateExercise(exercise.id, { ...exercise, reps: value });
        } else {
            updateArrayValue('reps', value, index);
        }
    };

    const handleRestChange = (value, index) => {
        if (isReadOnly) return;
        if (value < 0) return; // Prevent negative values

        if (currentRestType === 'Normal') {
            updateExercise(exercise.id, { ...exercise, rest: value });
        } else {
            updateArrayValue('rest', value, index);
        }
    };

    const getArrayValue = (field, index) => {
        if (!Array.isArray(exercise[field])) return '';
        return exercise[field][index] !== undefined ? exercise[field][index] : '';
    };

    return (
        <>
            <div className={`bg-brand-light-gray p-4 rounded-xl shadow-sm border border-brand-border flex flex-col gap-3 group relative ${isReadOnly ? 'opacity-80' : ''}`}>
                <div className="flex justify-between items-start">
                    <input
                        disabled={isReadOnly}
                        className="font-bold text-base text-gray-100 placeholder-gray-600 w-full outline-none bg-transparent"
                        placeholder={t('exercise_name_placeholder')}
                        value={exercise.name}
                        onChange={(e) => updateExercise(exercise.id, { ...exercise, name: e.target.value })}
                    />
                    {!isReadOnly && (
                        <button
                            onClick={() => deleteExercise(exercise.id)}
                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>

                {/* Main Configuration Grid */}
                <div className="flex flex-col gap-4">
                    {/* Row 1: Configurations */}
                    <div className="grid grid-cols-[4fr_1fr_4fr] gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('label_exercise_type')}</label>
                            <div className="relative group/select">
                                <select
                                    disabled={isReadOnly}
                                    className="bg-brand-gray rounded-lg p-2 pr-10 font-medium text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary transition-all w-full appearance-none disabled:opacity-50 cursor-pointer border border-transparent hover:border-brand-border/50"
                                    value={currentType}
                                    onChange={(e) => updateExercise(exercise.id, { ...exercise, type: e.target.value, reps: e.target.value === 'Normal' ? '' : [] })}
                                >
                                    <option value="Normal" className="bg-brand-gray text-gray-300">{t('opt_normal')}</option>
                                    <option value="Custom" className="bg-brand-gray text-gray-300">{t('opt_custom')}</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover/select:text-brand-primary transition-colors" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('label_sets')}</label>
                            <input
                                disabled={isReadOnly}
                                type="number"
                                min="0"
                                className="bg-brand-gray rounded-lg p-2 font-medium text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary transition-all w-full disabled:opacity-50 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] border border-transparent hover:border-brand-border/50"
                                placeholder="0"
                                value={exercise.sets}
                                onChange={(e) => {
                                    if (e.target.value < 0) return;
                                    updateExercise(exercise.id, { ...exercise, sets: e.target.value })
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('label_rest_type')}</label>
                            <div className="relative group/select">
                                <select
                                    disabled={isReadOnly}
                                    className="bg-brand-gray rounded-lg p-2 pr-10 font-medium text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary transition-all w-full appearance-none disabled:opacity-50 cursor-pointer border border-transparent hover:border-brand-border/50"
                                    value={currentRestType}
                                    onChange={(e) => updateExercise(exercise.id, { ...exercise, restType: e.target.value, rest: e.target.value === 'Normal' ? '' : [] })}
                                >
                                    <option value="Normal" className="bg-brand-gray text-gray-300">{t('opt_normal')}</option>
                                    <option value="Custom" className="bg-brand-gray text-gray-300">{t('opt_custom')}</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover/select:text-brand-primary transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Inputs Layout */}
                    <div className={(currentType === 'Normal' && currentRestType === 'Normal') ? "grid grid-cols-2 gap-3" : "flex flex-col gap-4"}>
                        {/* Reps Section */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('label_reps')}</label>
                            {currentType === 'Custom' ? (
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: parseInt(exercise.sets) || 0 }).map((_, i) => (
                                        <input
                                            key={`rep-${i}`}
                                            disabled={isReadOnly}
                                            type="number"
                                            min="0"
                                            className="bg-brand-gray rounded-lg p-2 font-medium text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary transition-all w-14 text-center disabled:opacity-50 text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] border border-transparent hover:border-brand-border/50"
                                            placeholder={`S${i + 1}`}
                                            value={getArrayValue('reps', i)}
                                            onChange={(e) => handleRepsChange(e.target.value, i)}
                                        />
                                    ))}
                                    {(parseInt(exercise.sets) || 0) === 0 && <span className="text-xs text-gray-500 italic p-2">{t('text_set_sets_count')}</span>}
                                </div>
                            ) : (
                                <input
                                    disabled={isReadOnly}
                                    type="number"
                                    min="0"
                                    className="bg-brand-gray rounded-lg p-2 font-medium text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary transition-all w-full disabled:opacity-50 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] border border-transparent hover:border-brand-border/50"
                                    placeholder="0"
                                    value={exercise.reps}
                                    onChange={(e) => handleRepsChange(e.target.value)}
                                />
                            )}
                        </div>

                        {/* Rest Section */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('label_rest_seconds')}</label>
                            {currentRestType === 'Custom' ? (
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: parseInt(exercise.sets) || 0 }).map((_, i) => (
                                        <input
                                            key={`rest-${i}`}
                                            disabled={isReadOnly}
                                            type="number"
                                            min="0"
                                            className="bg-brand-gray rounded-lg p-2 font-medium text-gray-300 outline-none focus:ring-2 focus:ring-blue-400 transition-all w-14 text-center disabled:opacity-50 text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] border border-transparent hover:border-brand-border/50"
                                            placeholder={`S${i + 1}`}
                                            value={getArrayValue('rest', i)}
                                            onChange={(e) => handleRestChange(e.target.value, i)}
                                        />
                                    ))}
                                    {(parseInt(exercise.sets) || 0) === 0 && <span className="text-xs text-gray-500 italic p-2">{t('text_set_sets_count')}</span>}
                                </div>
                            ) : (
                                <input
                                    disabled={isReadOnly}
                                    type="number"
                                    min="0"
                                    className="bg-brand-gray rounded-lg p-2 font-medium text-gray-300 outline-none focus:ring-2 focus:ring-blue-400 transition-all w-full disabled:opacity-50 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] border border-transparent hover:border-brand-border/50"
                                    placeholder="60"
                                    value={exercise.rest || ''}
                                    onChange={(e) => handleRestChange(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {!isLast && (
                <div className="flex items-center justify-center py-2 relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-brand-border/40"></div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <div className="bg-brand-gray px-3 flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('label_rest_after')}</span>
                            <input
                                disabled={isReadOnly}
                                type="number"
                                min="0"
                                className="bg-brand-light-gray rounded-md py-1 px-2 font-bold text-brand-lime outline-none focus:ring-1 focus:ring-brand-lime transition-all w-16 text-center disabled:opacity-50 text-sm border border-brand-border/50 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                                placeholder="0"
                                value={exercise.restAfter || ''}
                                onChange={(e) => {
                                    if (e.target.value < 0) return;
                                    updateExercise(exercise.id, { ...exercise, restAfter: e.target.value })
                                }}
                            />
                            <span className="text-sm font-bold text-gray-500">{t('label_rest_metric')}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
