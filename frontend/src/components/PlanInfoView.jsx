import React, { useState } from 'react';
import { TriangleAlert } from 'lucide-react';

export default function PlanInfoView({ plan, updatePlan }) {
    const [activationWarnings, setActivationWarnings] = useState([]);

    const handleInputChange = (field, value) => {
        updatePlan({ ...plan, [field]: value });
    };

    const handleToggleActive = (checked) => {
        if (checked) {
            const warnings = [];
            for (const workout of plan.workouts || []) {
                const vars = workout.variations?.length > 0
                    ? workout.variations
                    : [{ name: 'Week 1', exercises: workout.exercises || [] }];
                for (const v of vars) {
                    if (!(v.exercises?.length > 0)) {
                        warnings.push(
                            vars.length > 1
                                ? `"${workout.name} — ${v.name}"`
                                : `"${workout.name}"`
                        );
                    }
                }
            }
            setActivationWarnings(warnings);
            if (warnings.length > 0) return;
        } else {
            setActivationWarnings([]);
        }
        updatePlan({ ...plan, isActive: checked });
    };

    const isReadOnly = plan.isActive;

    return (
        <div className="flex flex-col h-full overflow-y-auto px-6 pb-6 pt-6 bg-brand-gray">
            <div className="flex flex-col gap-6">

                {/* Active Toggle */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-brand-light-gray border border-brand-border rounded-xl p-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-200">Plan Status</span>
                            <span className="text-sm text-gray-500">{plan.isActive ? 'Active (Read-Only)' : 'Draft (Editable)'}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={plan.isActive || false}
                                onChange={(e) => handleToggleActive(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-brand-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-lime/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-brand-gray after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-lime peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
                        </label>
                    </div>

                    {activationWarnings.length > 0 && (
                        <div className="flex gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
                            <TriangleAlert size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-300">
                                <p className="font-bold mb-1">Cannot activate — workouts without exercises:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-yellow-400/80 text-xs">
                                    {activationWarnings.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Plan Name</label>
                    <input
                        disabled={isReadOnly}
                        className={`text-xl font-bold bg-brand-light-gray border border-brand-border rounded-xl p-4 outline-none text-gray-100 placeholder-gray-600 w-full focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all ${isReadOnly ? 'bg-brand-gray text-gray-500 opacity-60' : ''}`}
                        placeholder="e.g. Summer Cut"
                        value={plan.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea
                        disabled={isReadOnly}
                        className={`w-full bg-brand-light-gray border border-brand-border rounded-xl p-4 text-base text-gray-300 outline-none resize-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all ${isReadOnly ? 'bg-brand-gray text-gray-500 opacity-60' : ''}`}
                        placeholder="Description (optional)"
                        rows={4}
                        value={plan.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Start Date</label>
                        <input
                            disabled={isReadOnly}
                            type="date"
                            className={`bg-brand-light-gray border border-brand-border rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-brand-primary transition-all ${isReadOnly ? 'bg-brand-gray text-gray-500 opacity-60' : ''}`}
                            value={plan.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Duration</label>
                        <input
                            disabled={isReadOnly}
                            className={`bg-brand-light-gray border border-brand-border rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-brand-lime transition-all ${isReadOnly ? 'bg-brand-gray text-gray-500 opacity-60' : ''}`}
                            placeholder="e.g. 8 weeks"
                            value={plan.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Weight (kg)</label>
                        <input
                            disabled={isReadOnly}
                            className={`bg-brand-light-gray border border-brand-border rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-brand-lime transition-all ${isReadOnly ? 'bg-brand-gray text-gray-500 opacity-60' : ''}`}
                            placeholder="80"
                            value={plan.weight}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Age</label>
                        <input
                            disabled={isReadOnly}
                            className={`bg-brand-light-gray border border-brand-border rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-brand-lime transition-all ${isReadOnly ? 'bg-brand-gray text-gray-500 opacity-60' : ''}`}
                            placeholder="25"
                            value={plan.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
