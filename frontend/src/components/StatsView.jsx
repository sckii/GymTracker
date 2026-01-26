import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ArrowLeft, BarChart2, Table as TableIcon } from 'lucide-react';
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

export default function StatsView({ logs, onBack }) {
    const [activeTab, setActiveTab] = useState('table'); // 'table' | 'charts'

    // --- AG Grid Setup ---
    const rowData = useMemo(() => {
        if (!logs || logs.length === 0) return [];
        // Flatten logs for the table
        // logs structure expected: [{ date, planName, workoutName, duration, exercises: { exerciseId: { setIndex: { reps, weight, completed } } } }]
        // But App.jsx might need to standardise the log format first. 
        // Let's assume passed `logs` is an array of finished sessions.

        const rows = [];
        logs.forEach(session => {
            const date = new Date(session.date).toLocaleDateString();
            if (session.data) {
                Object.values(session.data).forEach((sets, exIndex) => { // This structure depends on how we save it
                    // We need to map exercise IDs back to names if possible, or just store names in logs
                    // For now assuming session.data keys are exercise names or IDs. 
                    // Ideally logs should contains standardized "exercises" array.

                    // Let's defer strict typing until we see how handleFinishSession saves data.
                    // Assuming session = { id, date, planName, workoutName, exercises: [{ name, sets: [{reps, weight}] }] }

                    session.exercises.forEach(ex => {
                        ex.sets.forEach((set, i) => {
                            rows.push({
                                date: date,
                                plan: session.planName,
                                workout: session.workoutName,
                                exercise: ex.name,
                                set: i + 1,
                                reps: set.reps,
                                weight: set.weight
                            });
                        });
                    });
                });
            }
        });
        return rows;
    }, [logs]);

    const [colDefs] = useState([
        { field: 'date', headerName: 'Date', filter: true, sortable: true },
        { field: 'plan', headerName: 'Plan', filter: true, sortable: true },
        { field: 'workout', headerName: 'Workout', filter: true, sortable: true },
        { field: 'exercise', headerName: 'Exercise', filter: true, sortable: true },
        { field: 'set', headerName: 'Set', width: 80 },
        { field: 'reps', headerName: 'Reps', width: 100 },
        { field: 'weight', headerName: 'Weight (kg)', width: 120 },
    ]);

    // --- Chart Setup ---
    const chartData = useMemo(() => {
        // Example: Total Volume per Date
        const volumeByDate = {};

        if (!logs) return { labels: [], datasets: [] };

        logs.forEach(session => {
            const date = new Date(session.date).toLocaleDateString();
            let vol = 0;
            session.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    const w = parseFloat(set.weight) || 0;
                    const r = parseFloat(set.reps) || 0;
                    vol += w * r;
                });
            });
            volumeByDate[date] = (volumeByDate[date] || 0) + vol;
        });

        return {
            labels: Object.keys(volumeByDate),
            datasets: [
                {
                    label: 'Total Volume (kg)',
                    data: Object.values(volumeByDate),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    tension: 0.3
                }
            ]
        };
    }, [logs]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Training Progress' },
        },
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">History & Stats</h2>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('table')}
                        className={`p-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <TableIcon size={16} /> Table
                    </button>
                    <button
                        onClick={() => setActiveTab('charts')}
                        className={`p-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'charts' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <BarChart2 size={16} /> Charts
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
                {activeTab === 'table' ? (
                    <div className="h-full w-full ag-theme-alpine">
                        {/* AG Grid requires a fixed height container usually */}
                        <div style={{ height: '100%', width: '100%' }}>
                            <AgGridReact
                                rowData={rowData}
                                columnDefs={colDefs}
                                pagination={true}
                                paginationPageSize={20}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
                        <div className="w-full h-full max-h-[500px]">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
