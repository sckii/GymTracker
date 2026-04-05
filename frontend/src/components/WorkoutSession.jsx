import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Timer, Check, ChevronRight, ChevronLeft, Trash2, Save } from 'lucide-react';
import TutorialModal from './TutorialModal';

export default function WorkoutSession({ workout, previousLog, onFinish, onBack, onDiscard }) {
    const [logs, setLogs] = useState(() => {
        try {
            const saved = sessionStorage.getItem('app_session_logs');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [duration, setDuration] = useState(() => {
        const start = parseInt(sessionStorage.getItem('app_session_start') || '0');
        return start ? Math.floor((Date.now() - start) / 1000) : 0;
    });
    const [currentIndex, setCurrentIndex] = useState(() => {
        const saved = parseInt(sessionStorage.getItem('app_session_index') || '0');
        return isNaN(saved) ? 0 : saved;
    });
    const [showTutorial, setShowTutorial] = useState(false);
    const [confirmDiscard, setConfirmDiscard] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const prevIndexRef = useRef(null);
    const scrollRef = useRef(null);
    const [setRestRemaining, setSetRestRemaining] = useState(() => {
        try {
            const saved = JSON.parse(sessionStorage.getItem('app_session_set_rest'));
            if (!saved) return null;
            const remaining = saved.remaining - Math.floor((Date.now() - saved.savedAt) / 1000);
            return remaining > 0 ? remaining : null;
        } catch { return null; }
    });
    const [exerciseRestRemaining, setExerciseRestRemaining] = useState(() => {
        try {
            const saved = JSON.parse(sessionStorage.getItem('app_session_exercise_rest'));
            if (!saved) return null;
            const remaining = saved.remaining - Math.floor((Date.now() - saved.savedAt) / 1000);
            return remaining > 0 ? remaining : null;
        } catch { return null; }
    });

    const exercises = workout.exercises;
    const exercise = exercises[currentIndex];
    const isLast = currentIndex === exercises.length - 1;
    const setsCount = parseInt(exercise?.sets) || 0;

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(d => d + 1);
            setSetRestRemaining(r => (r !== null && r > 0) ? r - 1 : r === 0 ? null : r);
            setExerciseRestRemaining(r => (r !== null && r > 0) ? r - 1 : r === 0 ? null : r);
        }, 1000);
        if (!localStorage.getItem('hasSeenSessionTutorial')) setShowTutorial(true);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => { sessionStorage.setItem('app_session_logs', JSON.stringify(logs)); }, [logs]);
    useEffect(() => { sessionStorage.setItem('app_session_index', String(currentIndex)); }, [currentIndex]);
    useEffect(() => {
        if (setRestRemaining !== null && setRestRemaining > 0)
            sessionStorage.setItem('app_session_set_rest', JSON.stringify({ remaining: setRestRemaining, savedAt: Date.now() }));
        else
            sessionStorage.removeItem('app_session_set_rest');
    }, [setRestRemaining]);
    useEffect(() => {
        if (exerciseRestRemaining !== null && exerciseRestRemaining > 0)
            sessionStorage.setItem('app_session_exercise_rest', JSON.stringify({ remaining: exerciseRestRemaining, savedAt: Date.now() }));
        else
            sessionStorage.removeItem('app_session_exercise_rest');
    }, [exerciseRestRemaining]);

    // Reset set rest timer and errors on navigation — exercise rest persists intentionally
    useEffect(() => {
        if (prevIndexRef.current === null || prevIndexRef.current === currentIndex) {
            prevIndexRef.current = currentIndex;
            return;
        }
        prevIndexRef.current = currentIndex;
        scrollRef.current?.scrollTo({ top: 0 });
        setValidationErrors({});
        setSetRestRemaining(null);
    }, [currentIndex]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const getPrevStats = (setIndex) => {
        if (!previousLog?.exercises) return null;
        let prev = previousLog.exercises.find(e => e.id === exercise.id);
        if (!prev) prev = previousLog.exercises.find(e => e.name === exercise.name);
        return prev?.sets?.[setIndex] ?? null;
    };

    const handleChange = (setIndex, field, value) => {
        if (value < 0) return;
        const key = `${exercise.id}-${setIndex}-${field}`;
        if (validationErrors[key]) setValidationErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
        setLogs(prev => ({
            ...prev,
            [exercise.id]: { ...prev[exercise.id], [setIndex]: { ...prev[exercise.id]?.[setIndex], [field]: value } }
        }));
    };

    const toggleComplete = (setIndex) => {
        const nowCompleted = !logs[exercise.id]?.[setIndex]?.completed;
        if (nowCompleted) {
            const log = logs[exercise.id]?.[setIndex];
            const errors = {};
            if (log?.weight === '' || log?.weight == null) errors[`${exercise.id}-${setIndex}-weight`] = true;
            if (log?.reps === '' || log?.reps == null) errors[`${exercise.id}-${setIndex}-reps`] = true;
            if (Object.keys(errors).length) {
                setValidationErrors(prev => ({ ...prev, ...errors }));
                return;
            }
            handleChange(setIndex, 'completed', true);
            const otherCompleted = Array.from({ length: setsCount })
                .filter((_, i) => i !== setIndex && logs[exercise.id]?.[i]?.completed).length;
            const isLastSet = otherCompleted + 1 === setsCount;
            if (isLastSet) {
                // All sets done → exercise rest timer, clear set rest
                setSetRestRemaining(null);
                if (restAfter && !isLast) setExerciseRestRemaining(parseInt(restAfter));
            } else {
                // Non-final set → set rest timer, clear any leftover exercise rest
                const restVal = getRest(setIndex);
                setSetRestRemaining(restVal ? parseInt(restVal) : null);
                setExerciseRestRemaining(null);
            }
        } else {
            handleChange(setIndex, 'completed', false);
        }
    };

    const getTarget = (i) => {
        if (exercise.type === 'Normal') return exercise.reps || '—';
        return Array.isArray(exercise.reps) ? (exercise.reps[i] || '—') : '—';
    };

    const getRest = (i) => {
        if (!exercise.rest) return null;
        if (exercise.restType === 'Normal' || !exercise.restType) return exercise.rest;
        return Array.isArray(exercise.rest) ? exercise.rest[i] : null;
    };

    const validateCurrent = () => {
        const errors = {};
        for (let i = 0; i < setsCount; i++) {
            const log = logs[exercise.id]?.[i];
            if (log?.weight === '' || log?.weight == null) errors[`${exercise.id}-${i}-weight`] = true;
            if (log?.reps === '' || log?.reps == null) errors[`${exercise.id}-${i}-reps`] = true;
        }
        if (Object.keys(errors).length) { setValidationErrors(errors); return false; }
        return true;
    };

    const handleNext = () => {
        if (!validateCurrent()) return;
        // Auto-complete sets that have required fields but aren't ticked
        const updates = {};
        for (let i = 0; i < setsCount; i++) {
            const log = logs[exercise.id]?.[i];
            if (!log?.completed && log?.weight != null && log?.weight !== '' && log?.reps != null && log?.reps !== '') {
                updates[i] = { ...log, completed: true };
            }
        }
        if (Object.keys(updates).length) {
            setLogs(prev => ({ ...prev, [exercise.id]: { ...prev[exercise.id], ...updates } }));
        }
        // Start exercise rest timer only if not already running
        if (restAfter && !isLast && exerciseRestRemaining === null) setExerciseRestRemaining(parseInt(restAfter));
        setCurrentIndex(i => i + 1);
    };

    const handleFinish = () => {
        if (!validateCurrent()) return;
        onFinish(logs, duration);
    };

    const completedSets = Array.from({ length: setsCount }).filter((_, i) => logs[exercise.id]?.[i]?.completed).length;
    const restAfter = exercise?.restAfter;


    const tutorialSteps = [
        { title: "Track Your Performance", content: <p className="text-gray-300">Fill in the weight and reps for each set. Tap ✓ to mark a set as done.</p> },
        { title: "Previous History", content: <p className="text-gray-300">Your last session stats appear below each input so you know what to beat.</p> },
        { title: "Navigate Exercises", content: <p className="text-gray-300">Use <strong className="text-brand-primary">Next</strong> to advance to the next exercise after finishing your sets.</p> },
    ];

    return (
        <div className="flex flex-col h-full bg-brand-gray">
            {/* Header */}
            <div className="bg-brand-light-gray px-4 py-3 border-b border-brand-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-brand-border rounded-full text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            Exercise {currentIndex + 1} of {exercises.length}
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-brand-primary font-mono font-bold text-base">
                                <Clock size={15} />
                                <span>{formatTime(duration)}</span>
                                <span className="text-[9px] text-brand-primary/50 font-medium ml-0.5">total</span>
                            </div>
                            {setRestRemaining !== null && (
                                <div className="flex items-center gap-1 text-green-400 font-mono font-bold text-base">
                                    <Timer size={15} />
                                    <span>{formatTime(setRestRemaining)}</span>
                                    <span className="text-[9px] text-green-600 font-medium ml-0.5">rest</span>
                                </div>
                            )}
                            {exerciseRestRemaining !== null && (
                                <div className="flex items-center gap-1 text-yellow-400 font-mono font-bold text-base">
                                    <Timer size={15} />
                                    <span>{formatTime(exerciseRestRemaining)}</span>
                                    <span className="text-[9px] text-yellow-600 font-medium ml-0.5">próx</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setConfirmDiscard(true)} className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 py-3 bg-brand-light-gray/50 shrink-0">
                {exercises.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`rounded-full transition-all duration-300 ${
                            i === currentIndex
                                ? 'w-5 h-2 bg-brand-primary'
                                : i < currentIndex
                                    ? 'w-2 h-2 bg-brand-primary/40'
                                    : 'w-2 h-2 bg-brand-border'
                        }`}
                    />
                ))}
            </div>


            {/* Exercise content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
                {/* Exercise rest banner — non-blocking */}
                {exerciseRestRemaining !== null && (
                    <div className="mx-4 mt-4 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2.5">
                        <Timer size={16} className="text-yellow-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-yellow-400 leading-tight">Rest before starting</p>
                            <p className="text-[10px] text-yellow-700 leading-tight">You can start whenever you're ready</p>
                        </div>
                        <span className="font-mono font-black text-yellow-400 text-lg tabular-nums">{formatTime(exerciseRestRemaining)}</span>
                    </div>
                )}
                <div className="px-4 pt-5 pb-2">
                    {/* Exercise name + tags */}
                    <h2 className="text-2xl font-black text-gray-100 leading-tight mb-2">{exercise.name}</h2>
                    <div className="flex flex-wrap gap-2 mb-5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                            {setsCount} Sets
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-light-gray text-gray-400 border border-brand-border">
                            {exercise.type || 'Normal'}
                        </span>
                        {completedSets > 0 && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                {completedSets}/{setsCount} done
                            </span>
                        )}
                    </div>

                    {/* Sets */}
                    <div className="flex flex-col gap-1.5">
                        {Array.from({ length: setsCount }).map((_, i) => {
                            const isCompleted = logs[exercise.id]?.[i]?.completed;
                            const prevStats = getPrevStats(i);
                            const weightErr = validationErrors[`${exercise.id}-${i}-weight`];
                            const repsErr = validationErrors[`${exercise.id}-${i}-reps`];
                            const rest = getRest(i);

                            return (
                                <div key={i}>
                                    <div className={`rounded-xl border px-3 py-2 transition-all duration-200 ${
                                        isCompleted ? 'bg-green-500/5 border-green-500/30' : 'bg-brand-light-gray border-brand-border'
                                    }`}>
                                        {/* Set label row */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`text-[11px] font-black uppercase tracking-wider ${isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                                                Set {i + 1}
                                            </span>
                                            <span className="text-[11px] text-gray-600">· Target {getTarget(i)}</span>
                                        </div>

                                        {/* Inputs + ✓ inline */}
                                        <div className="flex items-center gap-2">
                                            {/* KG */}
                                            <div className="flex-1 flex flex-col gap-0.5">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">KG</label>
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    min="0"
                                                    placeholder="0"
                                                    value={logs[exercise.id]?.[i]?.weight ?? ''}
                                                    onChange={e => handleChange(i, 'weight', e.target.value)}
                                                    className={`w-full text-center text-lg font-black bg-brand-gray rounded-lg py-1.5 text-gray-100 border-2 outline-none transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                                                        ${weightErr ? 'border-red-500 text-red-400' : isCompleted ? 'border-green-500/40 text-green-400' : 'border-transparent focus:border-brand-primary/60'}`}
                                                />
                                                {prevStats?.weight != null && (
                                                    <span className="text-[9px] text-gray-600 text-center">last: {prevStats.weight}kg</span>
                                                )}
                                            </div>

                                            {/* Reps */}
                                            <div className="flex-1 flex flex-col gap-0.5">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Reps</label>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    min="0"
                                                    placeholder={getTarget(i)}
                                                    value={logs[exercise.id]?.[i]?.reps ?? ''}
                                                    onChange={e => handleChange(i, 'reps', e.target.value)}
                                                    className={`w-full text-center text-lg font-black bg-brand-gray rounded-lg py-1.5 text-gray-100 border-2 outline-none transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                                                        ${repsErr ? 'border-red-500 text-red-400' : isCompleted ? 'border-green-500/40 text-green-400' : 'border-transparent focus:border-brand-primary/60'}`}
                                                />
                                                {prevStats?.reps != null && (
                                                    <span className="text-[9px] text-gray-600 text-center">last: {prevStats.reps} reps</span>
                                                )}
                                            </div>

                                            {/* ✓ button */}
                                            <button
                                                onClick={() => toggleComplete(i)}
                                                className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                                    isCompleted
                                                        ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                                                        : 'bg-brand-gray text-gray-600 hover:text-gray-300'
                                                }`}
                                            >
                                                <Check size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rest between sets — outside the card */}
                                    {rest && i < setsCount - 1 && (
                                        <div className="flex items-center justify-center py-1">
                                            <span className="text-[10px] text-gray-600 font-medium">— {rest}s rest —</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Fixed bottom nav */}
            <div className="shrink-0 px-4 pb-4 pt-2 bg-brand-gray">
                {restAfter && !isLast && (
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-px flex-1 bg-brand-border/50" />
                        <span className="text-[10px] text-gray-500 font-medium">{restAfter}s rest before next exercise</span>
                        <div className="h-px flex-1 bg-brand-border/50" />
                    </div>
                )}
                <div className="flex items-center gap-3">
                    {currentIndex > 0 && (
                        <button
                            onClick={() => setCurrentIndex(i => i - 1)}
                            className="p-3 rounded-2xl bg-brand-light-gray border border-brand-border text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    {isLast ? (
                        <button
                            onClick={handleFinish}
                            className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-primary/20"
                        >
                            <Save size={18} />
                            Save Workout
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-primary/20"
                        >
                            Next Exercise
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>

            {confirmDiscard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
                    <div className="bg-brand-light-gray border border-brand-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-red-500/10">
                                <Trash2 size={20} className="text-red-400" />
                            </div>
                            <h3 className="text-lg font-black text-gray-100">Discard workout?</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">All progress from this session will be lost and cannot be recovered.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDiscard(false)}
                                className="flex-1 py-3 rounded-xl bg-brand-border text-gray-300 font-bold text-sm hover:bg-brand-border/80 transition-colors"
                            >
                                Keep going
                            </button>
                            <button
                                onClick={onDiscard}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <TutorialModal
                isOpen={showTutorial}
                onClose={() => { setShowTutorial(false); localStorage.setItem('hasSeenSessionTutorial', 'true'); }}
                title="How to use Session Logger"
                steps={tutorialSteps}
            />
        </div>
    );
}
