import React, { useRef, useState } from 'react';
import { Plus, ArrowLeft, ChevronRight, Upload, Trash2, Download, Share2, FileText, Link as LinkIcon, X, Copy, Check } from 'lucide-react';
import { generateShareLink, parseShareLink } from '../lib/share';

export default function PlanList({ plans, setView, setSelectedPlanId, createPlan, addPlan, deletePlan, showNotification }) {
    const fileInputRef = useRef(null);
    const [activeModal, setActiveModal] = useState(null); // 'export', 'import', 'share-result', 'import-link'
    const [selectedPlanForExport, setSelectedPlanForExport] = useState(null);
    const [generatedLink, setGeneratedLink] = useState('');
    const [importLinkInput, setImportLinkInput] = useState('');
    const [hasCopied, setHasCopied] = useState(false);

    const handleImportFileClick = () => {
        fileInputRef.current.click();
        setActiveModal(null);
    };

    const handleImportLinkSubmit = () => {
        try {
            const url = new URL(importLinkInput);
            const token = url.searchParams.get('share');
            if (!token) throw new Error('No share token found');

            const plan = parseShareLink(token);
            if (plan) {
                let addPlanRes = addPlan(plan);

                if (addPlanRes === "limit_reached") {
                    return;
                }

                showNotification('Plan imported from link!', 'success');
                setActiveModal(null);
                setImportLinkInput('');
            } else {
                showNotification('Invalid share link.', 'error');
            }
        } catch (e) {
            showNotification('Invalid URL format.', 'error');
        }
    };

    const handleGenerateLink = (plan) => {
        const link = generateShareLink(plan);
        if (link) {
            setGeneratedLink(link);
            setActiveModal('share-result');
        } else {
            showNotification('Error generating link', 'error');
        }
    };

    const copyToClipboard = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(generatedLink).then(() => {
                setHasCopied(true);
                showNotification('Link copied to clipboard!', 'success');
                setTimeout(() => setHasCopied(false), 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showNotification('Failed to copy link.', 'error');
            });
        } else {
            // Fallback for non-secure contexts (HTTP)
            const textArea = document.createElement("textarea");
            textArea.value = generatedLink;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    setHasCopied(true);
                    showNotification('Link copied to clipboard!', 'success');
                    setTimeout(() => setHasCopied(false), 2000);
                } else {
                    showNotification('Failed to copy link.', 'error');
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                showNotification('Failed to copy link.', 'error');
            }

            document.body.removeChild(textArea);
        }
    };

    const exportPlanToCSV = (plan) => {
        try {
            // Calculate max sets to define number of Rep/Rest columns
            let maxSets = 0;
            plan.workouts.forEach(workout => {
                workout.exercises.forEach(exercise => {
                    const sets = parseInt(exercise.sets) || 0;
                    if (sets > maxSets) maxSets = sets;
                });
            });

            // Build Headers
            let headers = ['PlanName', 'Description', 'StartDate', 'Duration', 'Weight', 'Age', 'WorkoutName', 'ExerciseName', 'Sets', 'Type', 'Reps', 'Rest Type', 'Rest', 'Rest After'];
            for (let i = 1; i <= maxSets; i++) {
                headers.push(`Rep ${i}`);
            }
            for (let i = 1; i <= maxSets; i++) {
                headers.push(`Rest ${i}`);
            }

            const rows = [];

            // Add First Row with Plan Details (and first exercise if exists)
            // We iterate all workouts and exercises to flatten the data
            if (plan.workouts.length === 0) {
                // Plan with no workouts (padding 2 sets of maxSets for Reps and Rest columns)
                rows.push([plan.name, plan.description, plan.startDate, plan.duration, plan.weight, plan.age, '', '', '', '', '', '', '', '', ...Array(maxSets * 2).fill('')]);
            } else {
                plan.workouts.forEach(workout => {
                    if (workout.exercises.length === 0) {
                        rows.push([
                            plan.name, plan.description, plan.startDate, plan.duration, plan.weight, plan.age,
                            workout.name, '', '', '', '', '', '', '', ...Array(maxSets * 2).fill('')
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
                                exercise.type,
                            ];

                            // Reps Logic
                            if (exercise.type === 'Normal') {
                                row.push(exercise.reps || ''); // Reps Column
                                row.push(exercise.restType || 'Normal'); // Rest Type
                                row.push(exercise.restType === 'Normal' ? (exercise.rest || '') : ''); // Rest Main Column
                                row.push(exercise.restAfter || ''); // Rest After

                                // Fill Rep 1...N with empty
                                row.push(...Array(maxSets).fill(''));
                            } else {
                                // Custom Type
                                row.push(''); // Main 'Reps' column is empty
                                row.push(exercise.restType || 'Normal'); // Rest Type
                                row.push(exercise.restType === 'Normal' ? (exercise.rest || '') : ''); // Rest Main Column
                                row.push(exercise.restAfter || ''); // Rest After

                                const repValues = Array.isArray(exercise.reps) ? exercise.reps : [];
                                for (let i = 0; i < maxSets; i++) {
                                    row.push(repValues[i] || '');
                                }
                            }

                            // Rest Arrays Logic (for Custom Rest Type)
                            if (exercise.restType === 'Custom') {
                                const restValues = Array.isArray(exercise.rest) ? exercise.rest : [];
                                for (let i = 0; i < maxSets; i++) {
                                    row.push(restValues[i] || '');
                                }
                            } else {
                                // Fill Rest 1...N with empty
                                row.push(...Array(maxSets).fill(''));
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
            setActiveModal(null);

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
                const restType = row['Rest Type'] || 'Normal';
                const restAfter = row['Rest After'] || '';

                let parsedReps = '';
                let parsedRest = '';

                // REPS Parsing
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
                        const splitReps = row.Reps.split(',').map(s => s.trim());
                        if (splitReps.length > 0) parsedReps = splitReps;
                    }
                }

                // REST Parsing
                if (restType === 'Normal') {
                    parsedRest = row.Rest || row['Rest 1'] || '';
                } else {
                    // Collect 'Rest 1', 'Rest 2', etc.
                    const setCount = parseInt(row.Sets) || 0;
                    parsedRest = [];
                    for (let i = 1; i <= setCount; i++) {
                        const restVal = row[`Rest ${i}`] || row[`Rest${i}`] || '';
                        parsedRest.push(restVal);
                    }
                    // Fallback string split
                    if (parsedRest.every(r => r === '') && row.Rest) {
                        const splitRest = row.Rest.split(',').map(s => s.trim());
                        if (splitRest.length > 0) parsedRest = splitRest;
                    }
                }

                workoutsMap[row.WorkoutName].exercises.push({
                    id: Date.now().toString() + Math.random().toString().slice(2, 6),
                    name: row.ExerciseName,
                    sets: row.Sets || '',
                    reps: parsedReps,
                    type: type,
                    restType: restType,
                    rest: parsedRest,
                    restAfter: restAfter
                });
            }
        });

        return newPlan;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const plan = parseCSV(event.target.result);
                if (plan) {
                    let addPlanRes = await addPlan(plan);

                    if (addPlanRes === "limit_reached") {
                        return;
                    }

                    showNotification('Plan imported successfully!', 'success');
                    setActiveModal(null);
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
        <div className="flex flex-col h-full relative">
            <div className="p-6 pb-2 flex items-center gap-4">
                <button
                    onClick={() => setView('home')}
                    className="p-2 hover:bg-brand-light-gray rounded-full text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-100">My Plans</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        className="bg-brand-light-gray p-5 rounded-xl shadow-lg border-none hover:shadow-xl transition-all flex justify-between items-center group"
                    >
                        <div
                            onClick={() => { setSelectedPlanId(plan.id); setView('plan-editor'); }}
                            className="flex-1 cursor-pointer"
                        >
                            <h3 className="text-lg font-bold text-gray-100">{plan.name || 'Untitled Plan'}</h3>
                            <p className="text-sm text-gray-400">{plan.description || 'No description'}</p>
                            {plan.isActive && <span className="inline-block mt-1 text-xs font-bold text-brand-lime bg-brand-lime/10 px-2 py-0.5 rounded">ACTIVE</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPlanForExport(plan);
                                    setActiveModal('export');
                                }}
                                className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
                            >
                                <Share2 size={20} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deletePlan(plan.id);
                                }}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                            <ChevronRight
                                onClick={() => { setSelectedPlanId(plan.id); setView('plan-editor'); }}
                                className="text-gray-600 group-hover:text-gray-300 transition-colors cursor-pointer"
                            />
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No plans created yet.
                    </div>
                )}
            </div>

            <div className="p-6 bg-brand-gray border-t border-brand-border flex gap-3">
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    onClick={() => setActiveModal('import')}
                    className="flex-1 py-3 px-2 bg-brand-light-gray text-gray-300 rounded-xl font-bold hover:bg-brand-border transition-colors flex items-center justify-center gap-2"
                >
                    <Upload size={16} />
                    Import
                </button>
                <button
                    onClick={createPlan}
                    className="flex-[2] py-4 bg-brand-lime text-black rounded-xl font-bold hover:bg-brand-lime-mid transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    New Plan
                </button>
            </div>

            {/* --- MODALS --- */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-brand-gray rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
                        <div className="p-4 border-b border-brand-border/10 flex justify-between items-center bg-brand-light-gray/50">
                            <h3 className="font-bold text-gray-100">
                                {activeModal === 'export' && 'Share Plan'}
                                {activeModal === 'import' && 'Import Plan'}
                                {activeModal === 'share-result' && 'Share Link'}
                                {activeModal === 'import-link' && 'Paste Link'}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-brand-light-gray rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* EXPORT OPTIONS */}
                            {activeModal === 'export' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => exportPlanToCSV(selectedPlanForExport)}
                                        className="w-full p-4 border border-brand-border rounded-xl flex items-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group text-left"
                                    >
                                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-full group-hover:bg-blue-500/30">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-200">Export CSV</span>
                                            <span className="text-xs text-gray-500">Download file to save</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleGenerateLink(selectedPlanForExport)}
                                        className="w-full p-4 border border-brand-border rounded-xl flex items-center gap-4 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group text-left"
                                    >
                                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-full group-hover:bg-purple-500/30">
                                            <LinkIcon size={24} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-200">Share Link</span>
                                            <span className="text-xs text-gray-500">Copy unique URL</span>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* IMPORT OPTIONS */}
                            {activeModal === 'import' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleImportFileClick}
                                        className="w-full p-4 border border-brand-border rounded-xl flex items-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group text-left"
                                    >
                                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-full group-hover:bg-blue-500/30">
                                            <Upload size={24} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-200">Upload File</span>
                                            <span className="text-xs text-gray-500">Import .csv file</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveModal('import-link')}
                                        className="w-full p-4 border border-brand-border rounded-xl flex items-center gap-4 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group text-left"
                                    >
                                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-full group-hover:bg-purple-500/30">
                                            <LinkIcon size={24} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-200">Paste Link</span>
                                            <span className="text-xs text-gray-500">Import from URL</span>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* SHARE RESULT (DISPLAY LINK) */}
                            {activeModal === 'share-result' && (
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-gray-400 text-center">Copy this link to share your workout plan.</p>
                                    <div className="bg-black/30 p-3 rounded-lg break-all text-xs font-mono text-gray-300 border border-brand-border max-h-32 overflow-y-auto">
                                        {generatedLink}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${hasCopied ? 'bg-green-500 text-white' : 'bg-brand-lime text-black hover:bg-brand-lime-mid'}`}
                                    >
                                        {hasCopied ? <Check size={18} /> : <Copy size={18} />}
                                        {hasCopied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                </div>
                            )}

                            {/* IMPORT LINK INPUT */}
                            {activeModal === 'import-link' && (
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-gray-400">Paste the shared link below:</p>
                                    <textarea
                                        className="w-full p-3 bg-brand-light-gray border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-lime outline-none text-sm min-h-[100px] text-gray-200 placeholder-gray-600"
                                        placeholder="https://..."
                                        value={importLinkInput}
                                        onChange={(e) => setImportLinkInput(e.target.value)}
                                    />
                                    <button
                                        onClick={handleImportLinkSubmit}
                                        className="w-full py-3 bg-brand-lime text-black rounded-xl font-bold hover:bg-brand-lime-mid transition-colors"
                                    >
                                        Import Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
