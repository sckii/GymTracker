import React from 'react';
import { Trash2 } from 'lucide-react';

export default function ExerciseCard({ exercise, updateExercise, deleteExercise, isReadOnly }) {
    const currentType = exercise.type || 'Normal';

    const handleRepsChange = (value, index) => {
        if (isReadOnly) return;
        if (currentType === 'Normal') {
            updateExercise(exercise.id, { ...exercise, reps: value });
        } else {
            const currentReps = Array.isArray(exercise.reps) ? [...exercise.reps] : [];
            const size = parseInt(exercise.sets) || 0;
            while (currentReps.length < size) currentReps.push('');

            currentReps[index] = value;
            updateExercise(exercise.id, { ...exercise, reps: currentReps });
        }
    };

    const getRepValue = (index) => {
        if (currentType === 'Normal') return exercise.reps || '';
        if (Array.isArray(exercise.reps) && exercise.reps[index] !== undefined) return exercise.reps[index];
        return '';
    };

    return (
        <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 group relative ${isReadOnly ? 'opacity-80' : ''}`}>
            <div className="flex justify-between items-start">
                <input
                    disabled={isReadOnly}
                    className="font-bold text-base text-gray-800 placeholder-gray-300 w-full outline-none bg-transparent"
                    placeholder="Exercise Name"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, { ...exercise, name: e.target.value })}
                />
                {!isReadOnly && (
                    <button
                        onClick={() => deleteExercise(exercise.id)}
                        className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <div className="flex gap-4 items-start">
                <div className="flex flex-col gap-1 w-1/3">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</label>
                    <select
                        disabled={isReadOnly}
                        className="bg-gray-50 rounded-lg p-2 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all w-full text-sm appearance-none disabled:bg-gray-100 disabled:text-gray-500"
                        value={currentType}
                        onChange={(e) => updateExercise(exercise.id, { ...exercise, type: e.target.value, reps: e.target.value === 'Normal' ? '' : [] })}
                    >
                        <option value="Normal">Normal</option>
                        <option value="Pyramid">Pyramid</option>
                        <option value="Drop-set">Drop-set</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1 w-1/4">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sets</label>
                    <input
                        disabled={isReadOnly}
                        type="number"
                        className="bg-gray-50 rounded-lg p-2 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all w-full disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="0"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(exercise.id, { ...exercise, sets: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reps</label>
                    {(currentType === 'Pyramid' || currentType === 'Drop-set') ? (
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: parseInt(exercise.sets) || 0 }).map((_, i) => (
                                <input
                                    key={i}
                                    disabled={isReadOnly}
                                    type="number"
                                    className="bg-gray-50 rounded-lg p-2 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all w-16 text-center disabled:bg-gray-100 disabled:text-gray-500"
                                    placeholder={`Rep ${i + 1}`}
                                    value={getRepValue(i)}
                                    onChange={(e) => handleRepsChange(e.target.value, i)}
                                />
                            ))}
                            {(parseInt(exercise.sets) || 0) === 0 && <span className="text-xs text-gray-300 italic p-2">Set sets count</span>}
                        </div>
                    ) : (
                        <input
                            disabled={isReadOnly}
                            type="number"
                            className="bg-gray-50 rounded-lg p-2 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all w-full disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="0"
                            value={exercise.reps}
                            onChange={(e) => handleRepsChange(e.target.value)}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}
