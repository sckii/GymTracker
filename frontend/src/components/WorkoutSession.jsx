import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Check, Save } from 'lucide-react';
import TutorialModal from './TutorialModal';

export default function WorkoutSession({ workout, previousLog, onFinish, onBack }) {
    const [logs, setLogs] = useState({});
    const [duration, setDuration] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const timer = setInterval(() => setDuration(d => d + 1), 1000);

        // Check for tutorial
        const hasSeenTutorial = localStorage.getItem('hasSeenSessionTutorial');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }

        return () => clearInterval(timer);
    }, []);

    const handleCloseTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenSessionTutorial', 'true');
    };

    const tutorialSteps = [
        {
            title: "Track Your Performance",
            content: (
                <div className="flex flex-col gap-3">
                    <p>Welcome to your workout session! Log your weight and reps for each set just like a real notebook.</p>
                </div>
            )
        },
        {
            title: "Targets & Rest",
            content: (
                <div className="flex flex-col gap-3">
                    <p>See your targets and rest times directly in the row.</p>
                    <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase text-center bg-brand-light-gray p-2 rounded-lg border border-brand-border/50">
                        <div className="col-span-4 text-left pl-2">Target</div>
                        <div className="col-span-4 text-center">Rest</div>
                        <div className="col-span-4 text-center"></div>

                        <div className="col-span-4 flex items-center text-gray-400 pl-2 text-sm font-medium">12</div>
                        <div className="col-span-4 flex items-center justify-center text-gray-500 text-sm font-medium">60s</div>
                    </div>
                </div>
            )
        },
        {
            title: "Previous History",
            content: (
                <div className="flex flex-col gap-3">
                    <p>Your "Last" stats show what you did last time. They appear right below the inputs so you know what to beat!</p>
                    <div className="flex gap-4 justify-center py-2">
                        <div className="flex flex-col gap-1 w-20">
                            <div className="text-[10px] uppercase font-bold text-gray-500 text-center">KG</div>
                            <input disabled type="text" value="20" className="w-full text-center bg-brand-dark rounded-lg py-1.5 text-sm font-bold text-gray-200 outline-none border border-brand-border/30 opacity-70" />
                            <span className="text-[10px] text-gray-500 text-center">20 kg</span>
                        </div>
                        <div className="flex flex-col gap-1 w-20">
                            <div className="text-[10px] uppercase font-bold text-gray-500 text-center">Reps</div>
                            <input disabled type="text" value="12" className="w-full text-center bg-brand-dark rounded-lg py-1.5 text-sm font-bold text-gray-200 outline-none border border-brand-border/30 opacity-70" />
                            <span className="text-[10px] text-gray-500 text-center">12 Reps</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPreviousStats = (exerciseId, setIndex) => {
        // ... (rest of the file remains unchanged, just need to render the Modal)
        if (!previousLog || !previousLog.exercises) return null;
        // Try precise ID match first
        let prevExercise = previousLog.exercises.find(e => e.id === exerciseId);

        // If not found (maybe plan edited/recreated), try matching by Name
        if (!prevExercise) {
            const currentExercise = workout.exercises.find(e => e.id === exerciseId);
            if (currentExercise) {
                prevExercise = previousLog.exercises.find(e => e.name === currentExercise.name);
            }
        }

        if (prevExercise && prevExercise.sets && prevExercise.sets[setIndex]) {
            return prevExercise.sets[setIndex];
        }
        return null;
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

    const getRestLabel = (exercise, index) => {
        if (exercise.restType === 'Normal' || !exercise.restType) return exercise.rest || '-';
        if (Array.isArray(exercise.rest)) return exercise.rest[index] || '-';
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
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-brand-light-gray p-6 pb-4 border-b border-brand-border flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-brand-border rounded-full text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">{workout.name}</h2>
                        <div className="flex items-center gap-1.5 text-brand-lime font-medium text-sm">
                            <Clock size={14} />
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleFinish}
                    className="bg-brand-lime hover:bg-brand-lime-mid text-black px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Save size={18} />
                    <span>Finish</span>
                </button>
            </div>

            {/* Exercises List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {workout.exercises.map((exercise, index) => (
                    <React.Fragment key={exercise.id}>
                        <div className="bg-brand-light-gray rounded-2xl p-3 shadow-sm border border-brand-border">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-100">{exercise.name}</h3>
                                <div className="flex gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                                    <span className="bg-brand-gray px-2 py-0.5 rounded">{exercise.sets} Sets</span>
                                    <span className="bg-brand-gray px-2 py-0.5 rounded text-brand-lime">{exercise.type}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {/* Header Row */}
                                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase text-center mb-2 px-2">
                                    <div className="col-span-1">Set</div>
                                    <div className="col-span-3">Target</div>
                                    <div className="col-span-2">Rest</div>
                                    <div className="col-span-2">Kg</div>
                                    <div className="col-span-2">Reps</div>
                                    <div className="col-span-2"></div>
                                </div>

                                {Array.from({ length: parseInt(exercise.sets) || 0 }).map((_, i) => {
                                    const isCompleted = logs[exercise.id]?.[i]?.completed;
                                    const setClass = isCompleted ? 'bg-brand-lime/10 border-brand-lime/30' : 'bg-brand-gray border-brand-border';
                                    const weightError = validationErrors[`${exercise.id}-${i}-weight`];
                                    const repsError = validationErrors[`${exercise.id}-${i}-reps`];
                                    const prevStats = getPreviousStats(exercise.id, i);

                                    return (
                                        <div key={i} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border ${setClass} transition-colors relative`}>
                                            <div className="col-span-1 text-center font-bold text-gray-500 text-sm">{i + 1}</div>

                                            <div className="col-span-3 flex flex-col items-center justify-center">
                                                <span className="text-sm font-medium text-gray-400">{getTargetLabel(exercise, i)}</span>
                                            </div>

                                            <div className="col-span-2 flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-500">{getRestLabel(exercise, i)}s</span>
                                            </div>

                                            <div className="col-span-2 flex flex-col gap-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="-"
                                                    className={`w-full text-center bg-brand-dark rounded-lg py-1.5 text-sm font-bold text-gray-200 outline-none focus:ring-2 focus:ring-brand-lime border transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${weightError ? 'border-red-500 ring-1 ring-red-500/30' : 'border-transparent focus:border-brand-lime'} ${isCompleted ? 'text-brand-lime' : ''}`}
                                                    value={logs[exercise.id]?.[i]?.weight || ''}
                                                    onChange={(e) => handleLogChange(exercise.id, i, 'weight', e.target.value)}
                                                />
                                                {prevStats && (
                                                    <span className="text-[10px] text-gray-500 text-center">
                                                        {prevStats.weight} kg
                                                    </span>
                                                )}
                                            </div>

                                            <div className="col-span-2 flex flex-col gap-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder={getTargetLabel(exercise, i)}
                                                    className={`w-full text-center bg-brand-dark rounded-lg py-1.5 text-sm font-bold text-gray-200 outline-none focus:ring-2 focus:ring-brand-lime border transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${repsError ? 'border-red-500 ring-1 ring-red-500/30' : 'border-transparent focus:border-brand-lime'} ${isCompleted ? 'text-brand-lime' : ''}`}
                                                    value={logs[exercise.id]?.[i]?.reps || ''}
                                                    onChange={(e) => handleLogChange(exercise.id, i, 'reps', e.target.value)}
                                                />
                                                {prevStats && (
                                                    <span className="text-[10px] text-gray-500 text-center">
                                                        {prevStats.reps} Reps
                                                    </span>
                                                )}
                                            </div>

                                            <div className="col-span-2 flex justify-center">
                                                <button
                                                    onClick={() => toggleSetComplete(exercise.id, i)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isCompleted ? 'bg-brand-lime text-black shadow-md scale-105' : 'bg-brand-dark text-gray-600 hover:bg-black hover:text-gray-400'}`}
                                                >
                                                    <Check size={16} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {index < workout.exercises.length - 1 && exercise.restAfter && (
                            <div className="flex items-center justify-center py-2 relative opacity-60">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-brand-border/40"></div>
                                </div>
                                <div className="relative flex items-center justify-center">
                                    <div className="bg-brand-gray px-3 flex items-center gap-2 rounded-full border border-brand-border/20 py-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rest</span>
                                        <span className="text-xs font-bold text-brand-lime">{exercise.restAfter}s</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}

                <div className="h-10"></div> {/* Spacer */}
            </div>

            <TutorialModal
                isOpen={showTutorial}
                onClose={handleCloseTutorial}
                title="How to use Session Logger"
                steps={tutorialSteps}
            />
        </div>
    );

}
