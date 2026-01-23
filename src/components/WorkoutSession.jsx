import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Check, Save } from 'lucide-react';

export default function WorkoutSession({ workout, onFinish, onBack }) {
    const [logs, setLogs] = useState({});
    const [duration, setDuration] = useState(0);

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLogChange = (exerciseId, setIndex, field, value) => {
        // Validation: Prevent negative values
        if (value < 0) return;

        // Clear validation error when user types
        if (validationErrors[`${exerciseId}-${setIndex}-${field}`]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${exerciseId}-${setIndex}-${field}`];
                return newErrors;
            });
        }

        setLogs(prev => ({
            ...prev,
            [exerciseId]: {
                ...prev[exerciseId],
                [setIndex]: {
                    ...prev[exerciseId]?.[setIndex],
                    [field]: value
                }
            }
        }));
    };

    const toggleSetComplete = (exerciseId, setIndex) => {
        const current = logs[exerciseId]?.[setIndex]?.completed;
        handleLogChange(exerciseId, setIndex, 'completed', !current);
    };

    const getTargetLabel = (exercise, index) => {
        if (exercise.type === 'Normal') return exercise.reps;
        if (Array.isArray(exercise.reps)) return exercise.reps[index] || '-';
        return '-';
    };

    const handleFinish = () => {
        let hasErrors = false;
        const newErrors = {};

        // Validate all fields are filled
        for (const exercise of workout.exercises) {
            const setsCount = parseInt(exercise.sets) || 0;

            for (let i = 0; i < setsCount; i++) {
                const log = logs[exercise.id]?.[i];
                const weight = log?.weight;
                const reps = log?.reps;

                if (weight === '' || weight === undefined || weight === null) {
                    newErrors[`${exercise.id}-${i}-weight`] = true;
                    hasErrors = true;
                }
                if (reps === '' || reps === undefined || reps === null) {
                    newErrors[`${exercise.id}-${i}-reps`] = true;
                    hasErrors = true;
                }
            }
        }

        if (hasErrors) {
            setValidationErrors(newErrors);
            // Optional: Scroll to top or first error if needed
            return;
        }

        onFinish(logs, duration);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white p-6 pb-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{workout.name}</h2>
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium text-sm">
                            <Clock size={14} />
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleFinish}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Save size={18} />
                    <span>Finish</span>
                </button>
            </div>

            {/* Exercises List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {workout.exercises.map((exercise) => (
                    <div key={exercise.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-800">{exercise.name}</h3>
                            <div className="flex gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                                <span className="bg-gray-100 px-2 py-0.5 rounded">{exercise.sets} Sets</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-blue-600">{exercise.type}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Header Row */}
                            <div className="grid grid-cols-10 gap-2 text-xs font-bold text-gray-400 uppercase text-center mb-2 px-1">
                                <div className="col-span-1">Set</div>
                                <div className="col-span-2">Target</div>
                                <div className="col-span-3">Kg</div>
                                <div className="col-span-2">Reps</div>
                                <div className="col-span-2"></div>
                            </div>

                            {Array.from({ length: parseInt(exercise.sets) || 0 }).map((_, i) => {
                                const isCompleted = logs[exercise.id]?.[i]?.completed;
                                const setClass = isCompleted ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100';
                                const weightError = validationErrors[`${exercise.id}-${i}-weight`];
                                const repsError = validationErrors[`${exercise.id}-${i}-reps`];

                                return (
                                    <div key={i} className={`grid grid-cols-10 gap-2 items-center p-2 rounded-xl border ${setClass} transition-colors`}>
                                        <div className="col-span-1 text-center font-bold text-gray-500 text-sm">{i + 1}</div>

                                        <div className="col-span-2 text-center text-sm font-medium text-gray-400">
                                            {getTargetLabel(exercise, i)}
                                        </div>

                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="-"
                                                className={`w-full text-center bg-white rounded-lg py-1.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-200 border transition-all ${weightError ? 'border-red-500 ring-1 ring-red-200' : 'border-transparent focus:border-blue-300'} ${isCompleted ? 'text-green-700' : ''}`}
                                                value={logs[exercise.id]?.[i]?.weight || ''}
                                                onChange={(e) => handleLogChange(exercise.id, i, 'weight', e.target.value)}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder={getTargetLabel(exercise, i)}
                                                className={`w-full text-center bg-white rounded-lg py-1.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-200 border transition-all ${repsError ? 'border-red-500 ring-1 ring-red-200' : 'border-transparent focus:border-blue-300'} ${isCompleted ? 'text-green-700' : ''}`}
                                                value={logs[exercise.id]?.[i]?.reps || ''}
                                                onChange={(e) => handleLogChange(exercise.id, i, 'reps', e.target.value)}
                                            />
                                        </div>

                                        <div className="col-span-2 flex justify-center">
                                            <button
                                                onClick={() => toggleSetComplete(exercise.id, i)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                                            >
                                                <Check size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="h-10"></div> {/* Spacer */}
            </div>
        </div>
    );

}
