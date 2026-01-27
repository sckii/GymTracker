import React, { useState } from 'react';
import { Plus, X, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TabManager({ workouts, activeTab, setActiveTab, setWorkouts, isReadOnly }) {
    const { t } = useLanguage();
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const addTab = () => {
        if (isReadOnly) return;
        if (isReadOnly) return;
        const newId = Date.now().toString();
        const newWorkout = { id: newId, name: t('tab_new_workout'), exercises: [] };
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
        <div className="flex items-center bg-brand-light-gray p-2 gap-1 overflow-x-auto border-b border-brand-border">
            {/* Fixed Plan Info Tab */}
            <div
                onClick={() => setActiveTab('plan-info')}
                className={`
            flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer text-sm font-medium transition-colors select-none shrink-0
            ${activeTab === 'plan-info' ? 'bg-brand-gray text-brand-lime shadow-sm border-t-2 border-brand-lime' : 'hover:bg-brand-border text-gray-500'}
          `}
            >
                <Info size={16} />
                <span>{t('tab_plan_details')}</span>
            </div>

            <div className="w-[1px] h-6 bg-brand-border mx-1 shrink-0"></div>

            {workouts.map(workout => (
                <div
                    key={workout.id}
                    onClick={() => setActiveTab(workout.id)}
                    onDoubleClick={(e) => startEditing(e, workout)}
                    className={`
            group flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer text-sm font-medium transition-colors select-none shrink-0
            ${activeTab === workout.id ? 'bg-brand-gray text-gray-100 shadow-sm' : 'hover:bg-brand-border text-gray-500'}
          `}
                >
                    {editingId === workout.id ? (
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => saveEdit(workout.id)}
                            onKeyDown={(e) => handleKeyDown(e, workout.id)}
                            className="w-24 bg-transparent outline-none border-b border-brand-lime text-white"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span>{workout.name}</span>
                    )}

                    {!isReadOnly && (
                        <button
                            onClick={(e) => removeTab(e, workout.id)}
                            className="opacity-0 group-hover:opacity-100 hover:bg-brand-border p-0.5 rounded-full transition-all text-gray-400 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            ))}
            {!isReadOnly && (
                <button
                    onClick={addTab}
                    className="p-2 hover:bg-brand-border rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                    <Plus size={18} />
                </button>
            )}
        </div>
    );
}
