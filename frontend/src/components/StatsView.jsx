import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, BarChart2, Table as TableIcon, X, ChevronDown, Check } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

import CustomDropdown from './CustomDropdown';

export default function StatsView({ logs, plans, activePlanId, onBack }) {
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'charts' | 'table'
    const [showDesktopWarning, setShowDesktopWarning] = useState(window.innerWidth < 768);

    // --- Filters ---
    const [selectedPlanId, setSelectedPlanId] = useState(activePlanId || (plans[0]?.id));

    // Charts Filters
    const [selectedExercise, setSelectedExercise] = useState('');
    const [selectedSet, setSelectedSet] = useState('1');

    // Table Filters
    const [selectedWorkout, setSelectedWorkout] = useState('all');

    // Build a map of exercise IDs to current names for the selected plan
    const currentExerciseNames = useMemo(() => {
        const selectedPlan = plans.find(p => p.id === selectedPlanId);
        const map = new Map();
        if (selectedPlan && selectedPlan.workouts) {
            selectedPlan.workouts.forEach(w => {
                if (w.exercises) {
                    w.exercises.forEach(ex => {
                        if (ex.id) map.set(ex.id, ex.name);
                    });
                }
            });
        }
        return map;
    }, [plans, selectedPlanId]);

    // Filter logs by selected plan and normalize exercise names
    const planLogs = useMemo(() => {
        if (!logs) return [];

        const filtered = logs.filter(l => l.plan_id === selectedPlanId)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Return a new array with normalized names
        return filtered.map(log => ({
            ...log,
            exercises: log.exercises ? log.exercises.map(ex => ({
                ...ex,
                name: currentExerciseNames.has(ex.id) ? currentExerciseNames.get(ex.id) : ex.name
            })) : []
        }));
    }, [logs, selectedPlanId, currentExerciseNames]);

    // Available Exercises (for Charts)
    const availableExercises = useMemo(() => {
        const exercises = new Set();
        planLogs.forEach(session => {
            if (session.exercises) {
                session.exercises.forEach(ex => exercises.add(ex.name));
            }
        });
        return Array.from(exercises).sort();
    }, [planLogs]);

    // Available Workouts (for Table)
    const availableWorkouts = useMemo(() => {
        const workouts = new Set();
        planLogs.forEach(session => {
            if (session.workoutName) {
                workouts.add(session.workoutName);
            }
        });
        return Array.from(workouts).sort();
    }, [planLogs]);

    // Auto-select defaults
    useMemo(() => {
        // Charts: Default to first exercise
        if (availableExercises.length > 0 && !selectedExercise && activeTab === 'charts') {
            setSelectedExercise(availableExercises[0]);
        }

        // Table: Default to 'all' workouts is already set in state initialization
    }, [availableExercises, selectedExercise, activeTab]);


    // Available Sets (for Charts)
    const availableSets = useMemo(() => {
        if (!selectedExercise) return [];
        let maxSets = 0;
        planLogs.forEach(session => {
            if (session.exercises) {
                const ex = session.exercises.find(e => e.name === selectedExercise);
                if (ex && ex.sets) {
                    if (ex.sets.length > maxSets) maxSets = ex.sets.length;
                }
            }
        });
        return Array.from({ length: maxSets }, (_, i) => (i + 1).toString());
    }, [planLogs, selectedExercise]);

    // --- General Stats Calculations ---
    const generalStats = useMemo(() => {
        if (!planLogs || planLogs.length === 0) return null;

        // 1. Total Days Trained
        const uniqueDays = new Set(planLogs.map(l => new Date(l.date).toDateString())).size;

        // 2. Max Weight per Exercise
        const exerciseRecords = {};

        planLogs.forEach(session => {
            if (session.exercises) {
                session.exercises.forEach(ex => {
                    if (!exerciseRecords[ex.name]) {
                        exerciseRecords[ex.name] = { maxWeight: 0, reps: 0, date: null };
                    }

                    if (ex.sets) {
                        ex.sets.forEach(set => {
                            const weight = parseFloat(set.weight) || 0;
                            const reps = parseFloat(set.reps) || 0;

                            if (weight > exerciseRecords[ex.name].maxWeight) {
                                exerciseRecords[ex.name] = {
                                    maxWeight: weight,
                                    reps: reps,
                                    date: session.date
                                };
                            } else if (weight === exerciseRecords[ex.name].maxWeight && weight > 0) {
                                // If tie in weight, check for higher reps? Or just keep first/latest?
                                // Let's keep higher reps for now as a tie breaker
                                if (reps > exerciseRecords[ex.name].reps) {
                                    exerciseRecords[ex.name] = {
                                        maxWeight: weight,
                                        reps: reps,
                                        date: session.date
                                    };
                                }
                            }
                        });
                    }
                });
            }
        });

        // Convert to array and sort by name
        const recordsArray = Object.entries(exerciseRecords)
            .map(([name, stats]) => ({ name, ...stats }))
            .filter(r => r.maxWeight > 0) // Only show exercises with actual logged weight
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
            totalDays: uniqueDays,
            records: recordsArray
        };
    }, [planLogs]);

    // --- Chart Data ---
    const detailedChartData = useMemo(() => {
        if (!selectedExercise || !selectedSet) return { labels: [], datasets: [] };

        const labels = [];
        const weightData = [];
        const repsData = [];

        planLogs.forEach(session => {
            // Only consider sessions that actually have this exercise
            if (session.exercises) {
                const ex = session.exercises.find(e => e.name === selectedExercise);
                if (ex && ex.sets) {
                    const setIndex = parseInt(selectedSet) - 1;
                    const set = ex.sets[setIndex];
                    if (set) {
                        const date = new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        labels.push(date);
                        weightData.push(parseFloat(set.weight) || 0);
                        repsData.push(parseFloat(set.reps) || 0);
                    }
                }
            }
        });

        return {
            labels,
            datasets: [
                {
                    label: `Weight (Set ${selectedSet})`,
                    data: weightData,
                    borderColor: '#FF204E', // brand-primary
                    backgroundColor: '#FF204E',
                    yAxisID: 'y',
                    tension: 0.3,
                    pointBackgroundColor: '#FF204E',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: `Reps (Set ${selectedSet})`,
                    data: repsData,
                    borderColor: '#ffffffff', // brand-secondary
                    backgroundColor: '#ffffffff',
                    yAxisID: 'y1',
                    tension: 0.3,
                    pointBackgroundColor: '#ffffffff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    }, [planLogs, selectedExercise, selectedSet]);

    // --- Filter logic for Table View ---
    const filteredLogList = useMemo(() => {
        let logsToShow = [...planLogs].reverse();

        if (selectedWorkout && selectedWorkout !== 'all') {
            logsToShow = logsToShow.filter(session => session.workoutName === selectedWorkout);
        }
        return logsToShow;
    }, [planLogs, selectedWorkout]);


    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'top', labels: { color: '#e4e4e7', usePointStyle: true, boxWidth: 8 } },
            title: { display: true, text: `${selectedExercise || 'Select Exercise'} - Set ${selectedSet} Evolution`, color: '#e4e4e7', font: { size: 16, weight: 'bold' } },
            tooltip: { backgroundColor: 'rgba(24, 24, 27, 0.9)', titleColor: '#e4e4e7', bodyColor: '#e4e4e7', borderColor: '#3f3f46', borderWidth: 1, padding: 10, displayColors: true, usePointStyle: true }
        },
        scales: {
            x: { grid: { color: '#3f3f46', drawBorder: false }, ticks: { color: '#a1a1aa' } },
            y: { type: 'linear', display: true, position: 'left', grid: { color: '#3f3f46', drawBorder: false }, ticks: { color: '#FF204E' }, title: { display: true, text: 'Weight (kg)', color: '#FF204E' } },
            y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#ffffffff' }, title: { display: true, text: 'Reps', color: '#ffffffff' } },
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-gray relative">
            {showDesktopWarning && (
                <div className="absolute top-4 left-4 right-4 z-50 bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 px-4 py-3 rounded-xl flex justify-between items-center shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                    <span className="text-xs font-medium">For best experience with charts, please use a Desktop.</span>
                    <button onClick={() => setShowDesktopWarning(false)} className="text-yellow-500 hover:text-yellow-100">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="bg-brand-light-gray/90 backdrop-blur-md p-6 border-b border-brand-border flex flex-col gap-4 shrink-0 transition-all z-20 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-brand-border rounded-full text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-black italic tracking-tighter text-white">
                            PROGRESS <span className="text-brand-primary font-sans font-bold">STATS</span>
                        </h2>
                    </div>

                    <div className="flex bg-brand-gray p-1 rounded-lg border border-brand-border">
                        <button onClick={() => setActiveTab('general')} className={`p-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-brand-light-gray text-brand-primary shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                            <BarChart2 size={16} /> <span className="hidden sm:inline">General</span>
                        </button>
                        <button onClick={() => setActiveTab('charts')} className={`p-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'charts' ? 'bg-brand-light-gray text-brand-primary shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                            <BarChart2 size={16} /> <span className="hidden sm:inline">Charts</span>
                        </button>
                        <button onClick={() => setActiveTab('table')} className={`p-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'table' ? 'bg-brand-light-gray text-brand-primary shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                            <TableIcon size={16} /> <span className="hidden sm:inline">Logs</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 p-4 bg-brand-gray/50 rounded-xl border border-brand-border/50 shadow-inner items-end">
                    <CustomDropdown
                        label="Plan"
                        options={plans.map(p => ({
                            value: p.id,
                            label: p.isActive ? `★ ${p.name} (Active)` : p.name
                        }))}
                        value={selectedPlanId}
                        onChange={setSelectedPlanId}
                    />

                    {/* Conditional Filters based on Tab */}
                    {activeTab === 'general' && (
                        <div className="flex-1 min-w-[140px] hidden sm:block"></div>
                    )}

                    {/* Conditional Dropdown: Exercise for Charts, Workout for Table */}
                    {activeTab === 'charts' ? (
                        <>
                            <CustomDropdown
                                label="Exercise"
                                options={availableExercises.map(ex => ({ value: ex, label: ex }))}
                                value={selectedExercise}
                                onChange={setSelectedExercise}
                                placeholder={availableExercises.length === 0 ? "No data..." : "Select..."}
                                disabled={availableExercises.length === 0}
                            />

                            <CustomDropdown
                                label="Set"
                                options={availableSets.map(s => ({ value: s, label: `Set ${s}` }))}
                                value={selectedSet}
                                onChange={setSelectedSet}
                                disabled={availableSets.length === 0}
                                containerClass="w-[100px]"
                            />
                        </>
                    ) : (
                        <CustomDropdown
                            label="Workout"
                            options={[{ value: 'all', label: 'All Workouts' }, ...availableWorkouts.map(w => ({ value: w, label: w }))]}
                            value={selectedWorkout}
                            onChange={setSelectedWorkout}
                            placeholder="Select Workout..."
                        />
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
                {activeTab === 'general' ? (
                    <div className="flex flex-col gap-6 pb-20">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-brand-light-gray p-6 rounded-2xl border border-brand-border/50 shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <TableIcon size={64} className="text-brand-primary" />
                                </div>
                                <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Total Training Days</h3>
                                <p className="text-4xl font-black text-white">{generalStats?.totalDays || 0}</p>
                                <div className="mt-2 text-xs text-brand-primary font-medium">Recorded Sessions</div>
                            </div>

                            {/* Placeholder for future metrics */}
                            <div className="bg-brand-light-gray p-6 rounded-2xl border border-brand-border/50 shadow-lg relative overflow-hidden group md:col-span-1 lg:col-span-2 flex items-center justify-center border-dashed">
                                <p className="text-gray-500 font-medium text-sm">More metrics coming soon...</p>
                            </div>
                        </div>

                        {/* Personal Records Grid */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Check size={20} className="text-brand-primary" />
                                Personal Records
                            </h3>

                            {!generalStats || generalStats.records.length === 0 ? (
                                <div className="text-center py-12 bg-brand-light-gray/20 rounded-xl border border-brand-border/30">
                                    <p className="text-gray-500">No records found for this plan yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {generalStats.records.map((record) => (
                                        <div key={record.name} className="bg-brand-light-gray/80 p-4 rounded-xl border border-brand-border/50 hover:border-brand-primary/50 transition-all hover:bg-brand-light-gray group">
                                            <h4 className="font-bold text-white text-sm mb-3 truncate" title={record.name}>{record.name}</h4>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-black text-brand-primary">{record.maxWeight}</span>
                                                <span className="text-sm font-medium text-gray-400 mb-1.5">kg</span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between border-t border-gray-700/50 pt-2">
                                                <div className="text-xs text-gray-400">
                                                    For <span className="text-white font-bold">{record.reps}</span> reps
                                                </div>
                                                <div className="text-[10px] text-gray-600">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'table' ? (
                    <div className="flex flex-col gap-4 pb-20">
                        {filteredLogList.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">No logs found matching your filters.</div>
                        ) : (
                            filteredLogList.map((session) => (
                                <div key={session.id} className="bg-brand-light-gray border border-brand-border rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between mb-4 border-b border-brand-border/50 pb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-100">{session.workoutName}</h3>
                                            <div className="text-xs text-gray-400 font-medium flex items-center gap-2">
                                                <span>{new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span>{session.duration ? `${Math.floor(session.duration / 60)}m` : 'No duration'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {session.exercises && session.exercises.map((ex, exIdx) => (
                                            <div key={`${session.id}-${ex.id || exIdx}`} className="bg-brand-gray/50 rounded-lg p-3 border border-brand-border/30">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-bold text-brand-primary truncate">{ex.name}</span>
                                                    <span className="text-[10px] text-gray-500 bg-brand-gray px-1.5 py-0.5 rounded border border-brand-border/30">{ex.sets?.length || 0} Sets</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {ex.sets && ex.sets.map((set, sIdx) => (
                                                        <div key={sIdx} className="flex items-center justify-between text-xs bg-brand-gray rounded px-2 py-1.5 border border-brand-border/20">
                                                            <span className="text-gray-400 w-8">#{sIdx + 1}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-mono text-white min-w-[40px] text-right">{set.weight}<span className="text-gray-600 text-[10px] ml-0.5">kg</span></span>
                                                                <span className="text-gray-600">x</span>
                                                                <span className="font-mono text-brand-primary-dark min-w-[30px] text-right">{set.reps}<span className="text-gray-600 text-[10px] ml-0.5">reps</span></span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="h-full w-full bg-brand-light-gray/20 p-4 rounded-xl shadow-inner backdrop-blur-sm flex flex-col">
                        {availableExercises.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-brand-border/30 rounded-xl">
                                <BarChart2 size={64} className="mb-4 opacity-20 text-brand-primary" />
                                <p className="text-lg font-medium text-gray-400">No workout data found</p>
                                <p className="text-sm">Complete a workout session to see your stats evolve!</p>
                            </div>
                        ) : (
                            <div className="relative w-full flex-1 min-h-0">
                                {!selectedExercise ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                        <BarChart2 size={48} className="mb-4 opacity-50 text-brand-primary" />
                                        <p className="text-md font-medium text-gray-300">Select a specific Exercise to view Charts</p>
                                    </div>
                                ) : (
                                    <Line options={chartOptions} data={detailedChartData} />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
