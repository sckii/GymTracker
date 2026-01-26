import React, { useState } from 'react';
import TabManager from './TabManager';
import WorkoutView from './WorkoutView';
import PlanInfoView from './PlanInfoView';
import { ArrowLeft } from 'lucide-react';

export default function PlanEditor({ plan, updatePlan, onBack }) {
    // Start with 'plan-info' as the active tab
    const [activeTab, setActiveTab] = useState('plan-info');

    const setWorkouts = (updater) => {
        const newWorkouts = typeof updater === 'function' ? updater(plan.workouts) : updater;
        updatePlan({ ...plan, workouts: newWorkouts });
    };

    const activeWorkout = plan.workouts.find(w => w.id === activeTab);
    const isReadOnly = plan.isActive;

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-800 truncate max-w-[200px]">{plan.name || 'New Plan'}</h2>
                    {isReadOnly && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold uppercase">Active</span>}
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <TabManager
                    workouts={plan.workouts}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setWorkouts={setWorkouts}
                    isReadOnly={isReadOnly}
                />
                <div className="flex-1 bg-gray-50 overflow-hidden">
                    {activeTab === 'plan-info' ? (
                        <PlanInfoView plan={plan} updatePlan={updatePlan} />
                    ) : activeWorkout ? (
                        <WorkoutView workout={activeWorkout} setWorkouts={setWorkouts} isReadOnly={isReadOnly} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <span>No workout selected</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
