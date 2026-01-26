import React, { useState, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
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

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

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

function CustomDropdown({ label, options, value, onChange, disabled, placeholder = "Select...", containerClass = "flex-1 min-w-[140px]" }) {
    const [isOpen, setIsOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest(`.dropdown-${label.replace(/\s/g, '')}`)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, label]);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className={`relative flex flex-col gap-1 ${containerClass} dropdown-${label.replace(/\s/g, '')}`}>
            <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
                {label}
            </label>

            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between bg-brand-light-gray border ${isOpen ? 'border-brand-lime ring-1 ring-brand-lime/50' : 'border-brand-border'} text-gray-100 text-sm rounded-lg px-3 py-2 outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-border/30 cursor-pointer'}`}
            >
                <span className="truncate max-w-[150px] text-left">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-gray border border-brand-border rounded-xl shadow-2xl z-50 max-h-[250px] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1 flex flex-col gap-0.5">
                        {options.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">No options</div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${option.value === value ? 'bg-brand-lime/10 text-brand-lime' : 'text-gray-300 hover:bg-brand-light-gray hover:text-white'}`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && <Check size={14} />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function StatsView({ logs, plans, activePlanId, onBack }) {
    const [activeTab, setActiveTab] = useState('charts'); // 'charts' | 'table'
    const [showDesktopWarning, setShowDesktopWarning] = useState(window.innerWidth < 768);

    // --- Filters ---
    const [selectedPlanId, setSelectedPlanId] = useState(activePlanId || (plans[0]?.id));
    const [selectedExercise, setSelectedExercise] = useState('');
    const [selectedSet, setSelectedSet] = useState('1');

    // Filter logs by selected plan
    const planLogs = useMemo(() => {
        if (!logs) return [];
        return logs.filter(l => l.plan_id === selectedPlanId).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [logs, selectedPlanId]);

    // Available Exercises
    const availableExercises = useMemo(() => {
        const exercises = new Set();
        planLogs.forEach(session => {
            if (session.exercises) {
                session.exercises.forEach(ex => exercises.add(ex.name));
            }
        });
        return Array.from(exercises).sort();
    }, [planLogs]);

    // Auto-select first exercise
    useMemo(() => {
        if (availableExercises.length > 0 && (!selectedExercise || !availableExercises.includes(selectedExercise))) {
            setSelectedExercise(availableExercises[0]);
        }
    }, [availableExercises, selectedExercise]);

    // Available Sets
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

    // --- Chart Data ---
    const detailedChartData = useMemo(() => {
        if (!selectedExercise || !selectedSet) return { labels: [], datasets: [] };

        const labels = [];
        const weightData = [];
        const repsData = [];

        planLogs.forEach(session => {
            const date = new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            if (session.exercises) {
                const ex = session.exercises.find(e => e.name === selectedExercise);
                if (ex && ex.sets) {
                    const setIndex = parseInt(selectedSet) - 1;
                    const set = ex.sets[setIndex];
                    if (set) {
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
                    borderColor: '#B6F500',
                    backgroundColor: '#B6F500',
                    yAxisID: 'y',
                    tension: 0.3,
                    pointBackgroundColor: '#B6F500',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: `Reps (Set ${selectedSet})`,
                    data: repsData,
                    borderColor: '#a855f7',
                    backgroundColor: '#a855f7',
                    yAxisID: 'y1',
                    tension: 0.3,
                    pointBackgroundColor: '#a855f7',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    }, [planLogs, selectedExercise, selectedSet]);

    // --- AG Grid ---
    const rowData = useMemo(() => {
        if (!planLogs || planLogs.length === 0) return [];
        const rows = [];
        [...planLogs].reverse().forEach(session => {
            const date = new Date(session.date).toLocaleDateString();
            if (session.exercises) {
                session.exercises.forEach(ex => {
                    ex.sets.forEach((set, i) => {
                        rows.push({
                            date: date,
                            workout: session.workoutName,
                            exercise: ex.name,
                            set: i + 1,
                            reps: set.reps,
                            weight: set.weight
                        });
                    });
                });
            }
        });
        return rows;
    }, [planLogs]);

    const [colDefs] = useState([
        { field: 'date', headerName: 'Date', filter: true, sortable: true, width: 110 },
        { field: 'workout', headerName: 'Workout', filter: true, sortable: true, width: 140 },
        { field: 'exercise', headerName: 'Exercise', filter: true, sortable: true, flex: 1 },
        { field: 'set', headerName: 'Set', width: 70 },
        { field: 'reps', headerName: 'Reps', width: 80 },
        { field: 'weight', headerName: 'Kg', width: 80 },
    ]);

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
            y: { type: 'linear', display: true, position: 'left', grid: { color: '#3f3f46', drawBorder: false }, ticks: { color: '#B6F500' }, title: { display: true, text: 'Weight (kg)', color: '#B6F500' } },
            y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#a855f7' }, title: { display: true, text: 'Reps', color: '#a855f7' } },
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
                            PROGRESS <span className="text-brand-lime not-italic font-sans font-bold">STATS</span>
                        </h2>
                    </div>

                    <div className="flex bg-brand-gray p-1 rounded-lg border border-brand-border">
                        <button onClick={() => setActiveTab('charts')} className={`p-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'charts' ? 'bg-brand-light-gray text-brand-lime shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                            <BarChart2 size={16} /> <span className="hidden sm:inline">Charts</span>
                        </button>
                        <button onClick={() => setActiveTab('table')} className={`p-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'table' ? 'bg-brand-light-gray text-brand-lime shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                            <TableIcon size={16} /> <span className="hidden sm:inline">Logs</span>
                        </button>
                    </div>
                </div>

                {activeTab === 'charts' && (
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
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 overflow-hidden relative">
                {activeTab === 'table' ? (
                    <div className="h-full w-full ag-theme-alpine-dark shadow-2xl rounded-xl overflow-hidden border border-brand-border">
                        <div style={{ height: '100%', width: '100%' }}>
                            <AgGridReact rowData={rowData} columnDefs={colDefs} pagination={true} paginationPageSize={20} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full bg-brand-light-gray/20 p-4 rounded-xl shadow-inner border border-brand-border/50 backdrop-blur-sm flex flex-col">
                        {availableExercises.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-brand-border/30 rounded-xl">
                                <BarChart2 size={64} className="mb-4 opacity-20 text-brand-lime" />
                                <p className="text-lg font-medium text-gray-400">No workout data found</p>
                                <p className="text-sm">Complete a workout session to see your stats evolve!</p>
                            </div>
                        ) : (
                            <div className="relative w-full flex-1 min-h-0">
                                <Line options={chartOptions} data={detailedChartData} />
                            </div>
                        )}

                        {availableExercises.length > 0 && (
                            <div className="mt-4 flex gap-6 justify-center text-xs text-gray-400">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-lime"></div><span>Weight (Left Axis)</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span>Reps (Right Axis)</span></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
