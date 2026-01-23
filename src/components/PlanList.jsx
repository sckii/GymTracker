import React, { useRef } from 'react';
import { Plus, ArrowLeft, ChevronRight, Upload, Trash2, Download } from 'lucide-react';

export default function PlanList({ plans, setView, setSelectedPlanId, createPlan, addPlan, deletePlan, showNotification }) {
    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const exportPlanToCSV = (plan, e) => {
        e.stopPropagation();

        try {
            // Calculate max sets to define number of Rep columns
            let maxSets = 0;
            plan.workouts.forEach(workout => {
                workout.exercises.forEach(exercise => {
                    const sets = parseInt(exercise.sets) || 0;
                    if (sets > maxSets) maxSets = sets;
                });
            });

            // Build Headers
            let headers = ['PlanName', 'Description', 'StartDate', 'Duration', 'Weight', 'Age', 'WorkoutName', 'ExerciseName', 'Sets', 'Type', 'Reps'];
            for (let i = 1; i <= maxSets; i++) {
                headers.push(`Rep ${i}`);
            }

            const rows = [];

            // Add First Row with Plan Details (and first exercise if exists)
            // We iterate all workouts and exercises to flatten the data
            if (plan.workouts.length === 0) {
                // Plan with no workouts
                rows.push([plan.name, plan.description, plan.startDate, plan.duration, plan.weight, plan.age, '', '', '', '', '', ...Array(maxSets).fill('')]);
            } else {
                plan.workouts.forEach(workout => {
                    if (workout.exercises.length === 0) {
                        rows.push([
                            plan.name, plan.description, plan.startDate, plan.duration, plan.weight, plan.age,
                            workout.name, '', '', '', '', ...Array(maxSets).fill('')
                        ]);
                    } else {
                        workout.exercises.forEach(exercise => {
                            const row = [
                                plan.name,
                                plan.description,
                                plan.startDate,
                                plan.duration,
                                plan.weight,
                                plan.age,
                                workout.name,
                                exercise.name,
                                exercise.sets,
                                exercise.type
                            ];

                            // Handle Reps
                            if (exercise.type === 'Normal') {
                                row.push(exercise.reps || '');
                                // Fill Rep 1...N with empty
                                row.push(...Array(maxSets).fill(''));
                            } else {
                                // Pyramid / Drop-set
                                row.push(''); // Main 'Reps' column is empty
                                const repValues = Array.isArray(exercise.reps) ? exercise.reps : [];
                                for (let i = 0; i < maxSets; i++) {
                                    row.push(repValues[i] || '');
                                }
                            }
                            rows.push(row);
                        });
                    }
                });
            }

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${plan.name.replace(/\s+/g, '_')}_export.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification('Plan exported successfully!', 'success');

        } catch (error) {
            console.error('Export Error:', error);
            showNotification('Failed to export plan.', 'error');
        }
    };

    const parseCSV = (text) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        // Basic validation
        if (!headers.includes('PlanName') || !headers.includes('WorkoutName')) {
            showNotification('Invalid CSV format. Missing required headers.', 'error');
            return null;
        }

        const parseLine = (line) => {
            const values = [];
            let currentValue = '';
            let insideQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (insideQuotes && line[i + 1] === '"') {
                        currentValue += '"'; // Handle escaped quote
                        i++;
                    } else {
                        insideQuotes = !insideQuotes;
                    }
                } else if (char === ',' && !insideQuotes) {
                    values.push(currentValue);
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            values.push(currentValue);
            return values;
        };

        const data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
            const values = parseLine(line);
            const entry = {};
            headers.forEach((h, i) => {
                const val = values[i]?.trim() || '';
                // Remove surrounding quotes if present
                entry[h] = val.replace(/^"|"$/g, '');
            });
            return entry;
        });

        if (data.length === 0) return null;

        // Grouping logic (Assuming single plan per file for now based on first row)
        const firstRow = data[0];
        const newPlan = {
            id: Date.now().toString(),
            name: firstRow.PlanName || 'Imported Plan',
            description: firstRow.Description || '',
            startDate: firstRow.StartDate || new Date().toISOString().split('T')[0],
            duration: firstRow.Duration || '',
            weight: firstRow.Weight || '',
            age: firstRow.Age || '',
            isActive: false,
            workouts: []
        };

        const workoutsMap = {};

        data.forEach(row => {
            if (!row.WorkoutName) return;

            if (!workoutsMap[row.WorkoutName]) {
                workoutsMap[row.WorkoutName] = {
                    id: Date.now().toString() + Math.random().toString().slice(2, 6),
                    name: row.WorkoutName,
                    exercises: []
                };
                newPlan.workouts.push(workoutsMap[row.WorkoutName]);
            }

            if (row.ExerciseName) {
                const type = row.Type || 'Normal';
                let parsedReps = '';

                if (type === 'Normal') {
                    // Try 'Reps' column, fallback to 'Rep 1'
                    parsedReps = row.Reps || row['Rep 1'] || '';
                } else {
                    // Collect 'Rep 1', 'Rep 2', etc. based on set count
                    const setCount = parseInt(row.Sets) || 0;
                    parsedReps = [];
                    for (let i = 1; i <= setCount; i++) {
                        const repVal = row[`Rep ${i}`] || row[`Rep${i}`] || '';
                        parsedReps.push(repVal);
                    }
                    // Fallback if no specific columns found but 'Reps' exists (comma separated maybe?)
                    if (parsedReps.every(r => r === '') && row.Reps) {
                        // Attempt to split basic 'Reps' column if it looks like "10,12,14"
                        const splitReps = row.Reps.split(',').map(s => s.trim());
                        if (splitReps.length > 0) parsedReps = splitReps;
                    }
                }

                workoutsMap[row.WorkoutName].exercises.push({
                    id: Date.now().toString() + Math.random().toString().slice(2, 6),
                    name: row.ExerciseName,
                    sets: row.Sets || '',
                    reps: parsedReps,
                    type: type
                });
            }
        });

        return newPlan;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const plan = parseCSV(event.target.result);
                if (plan) {
                    addPlan(plan);
                    showNotification('Plan imported successfully!', 'success');
                }
            } catch (error) {
                console.error(error);
                showNotification('Error importing plan.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 pb-2 flex items-center gap-4">
                <button
                    onClick={() => setView('home')}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">My Plans</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
                    >
                        <div
                            onClick={() => { setSelectedPlanId(plan.id); setView('plan-editor'); }}
                            className="flex-1 cursor-pointer"
                        >
                            <h3 className="text-lg font-bold text-gray-800">{plan.name || 'Untitled Plan'}</h3>
                            <p className="text-sm text-gray-400">{plan.description || 'No description'}</p>
                            {plan.isActive && <span className="inline-block mt-1 text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">ACTIVE</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => exportPlanToCSV(plan, e)}
                                className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            >
                                <Download size={20} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deletePlan(plan.id);
                                }}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                            <ChevronRight
                                onClick={() => { setSelectedPlanId(plan.id); setView('plan-editor'); }}
                                className="text-gray-300 group-hover:text-gray-500 transition-colors cursor-pointer"
                            />
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="text-center text-gray-400 py-10">
                        No plans created yet.
                    </div>
                )}
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex gap-3">
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    onClick={handleImportClick}
                    className="flex-1 py-3 px-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-"
                >
                    <Upload size={16} />
                    Import plan
                </button>
                <button
                    onClick={createPlan}
                    className="flex-[2] py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    Create New Plan
                </button>
            </div>
        </div>
    );
}
