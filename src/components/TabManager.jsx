import React, { useState } from 'react';
import { Plus, X, Info } from 'lucide-react';

export default function TabManager({ workouts, activeTab, setActiveTab, setWorkouts, isReadOnly }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const addTab = () => {
        if (isReadOnly) return;
        const newId = Date.now().toString();
        const newWorkout = { id: newId, name: 'New Workout', exercises: [] };
        setWorkouts(prev => [...prev, newWorkout]);
        setActiveTab(newId);
    };

    const removeTab = (e, id) => {
        e.stopPropagation();
        if (isReadOnly) return;
        setWorkouts(prev => prev.filter(w => w.id !== id));
        if (activeTab === id) {
            setActiveTab('plan-info');
        }
    };

    const startEditing = (e, workout) => {
        if (isReadOnly) return;
        e.stopPropagation();
        setEditingId(workout.id);
        setEditName(workout.name);
    };

    const saveEdit = (id) => {
        setWorkouts(prev => prev.map(w => w.id === id ? { ...w, name: editName } : w));
        setEditingId(null);
    };

    const handleKeyDown = (e, id) => {
        if (e.key === 'Enter') saveEdit(id);
        if (e.key === 'Escape') setEditingId(null);
    };

    return (
        <div className="flex items-center bg-gray-100 p-2 gap-1 overflow-x-auto border-b border-gray-200">
            {/* Fixed Plan Info Tab */}
            <div
                onClick={() => setActiveTab('plan-info')}
                className={`
            flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer text-sm font-medium transition-colors select-none shrink-0
            ${activeTab === 'plan-info' ? 'bg-white text-blue-600 shadow-sm border-t-2 border-blue-500' : 'hover:bg-gray-200 text-gray-500'}
          `}
            >
                <Info size={16} />
                <span>Plan Details</span>
            </div>

            <div className="w-[1px] h-6 bg-gray-300 mx-1 shrink-0"></div>

            {workouts.map(workout => (
                <div
                    key={workout.id}
                    onClick={() => setActiveTab(workout.id)}
                    onDoubleClick={(e) => startEditing(e, workout)}
                    className={`
            group flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer text-sm font-medium transition-colors select-none shrink-0
            ${activeTab === workout.id ? 'bg-white text-gray-800 shadow-sm' : 'hover:bg-gray-200 text-gray-600'}
          `}
                >
                    {editingId === workout.id ? (
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => saveEdit(workout.id)}
                            onKeyDown={(e) => handleKeyDown(e, workout.id)}
                            className="w-24 bg-transparent outline-none border-b border-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span>{workout.name}</span>
                    )}

                    {!isReadOnly && (
                        <button
                            onClick={(e) => removeTab(e, workout.id)}
                            className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 p-0.5 rounded-full transition-all"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            ))}
            {!isReadOnly && (
                <button
                    onClick={addTab}
                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                >
                    <Plus size={18} />
                </button>
            )}
        </div>
    );
}
