import React, { useState } from 'react';
import TabManager from './TabManager';
import WorkoutView from './WorkoutView';
import PlanInfoView from './PlanInfoView';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PlanEditor({ plan, updatePlan, onBack }) {
    const { t } = useLanguage();
    // Start with 'plan-info' as the active tab
    const [activeTab, setActiveTab] = useState('plan-info');

    const setWorkouts = (updater) => {
        const newWorkouts = typeof updater === 'function' ? updater(plan.workouts) : updater;
        updatePlan({ ...plan, workouts: newWorkouts });
    };

    const activeWorkout = plan.workouts.find(w => w.id === activeTab);
    const isReadOnly = plan.isActive;

    return (
        <div className="flex flex-col h-full bg-brand-gray">
            {/* Header */}
            <div className="bg-brand-light-gray p-4 flex items-center justify-between border-b border-brand-border">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-brand-border rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-100 truncate max-w-[200px]">{plan.name || t('editor_new_plan')}</h2>
                    {isReadOnly && <span className="bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded text-xs font-bold uppercase">{t('editor_active')}</span>}
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="flex-1 flex flex-col bg-brand-light-gray overflow-hidden">
                <TabManager
                    workouts={plan.workouts}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setWorkouts={setWorkouts}
                    isReadOnly={isReadOnly}
                />
                <div className="flex-1 bg-brand-gray overflow-hidden">
                    {activeTab === 'plan-info' ? (
                        <PlanInfoView plan={plan} updatePlan={updatePlan} />
                    ) : activeWorkout ? (
                        <WorkoutView workout={activeWorkout} setWorkouts={setWorkouts} isReadOnly={isReadOnly} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                            <span>{t('editor_no_workout')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
