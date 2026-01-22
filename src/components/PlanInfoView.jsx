import React from 'react';

export default function PlanInfoView({ plan, updatePlan }) {
    const handleInputChange = (field, value) => {
        updatePlan({ ...plan, [field]: value });
    };

    const isReadOnly = plan.isActive;

    return (
        <div className="flex flex-col h-full overflow-y-auto px-6 pb-6 pt-6">
            <div className="flex flex-col gap-6">

                {/* Active Toggle */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">Plan Status</span>
                        <span className="text-sm text-gray-400">{plan.isActive ? 'Active (Read-Only)' : 'Draft (Editable)'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={plan.isActive || false}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Plan Name</label>
                    <input
                        disabled={isReadOnly}
                        className={`text-xl font-bold bg-white border border-gray-200 rounded-xl p-4 outline-none text-gray-900 placeholder-gray-300 w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}`}
                        placeholder="e.g. Summer Cut"
                        value={plan.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                    <textarea
                        disabled={isReadOnly}
                        className={`w-full bg-white border border-gray-200 rounded-xl p-4 text-base text-gray-600 outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}`}
                        placeholder="Description (optional)"
                        rows={4}
                        value={plan.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Start Date</label>
                        <input
                            disabled={isReadOnly}
                            type="date"
                            className={`bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-all ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}`}
                            value={plan.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Duration</label>
                        <input
                            disabled={isReadOnly}
                            className={`bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-all ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}`}
                            placeholder="e.g. 8 weeks"
                            value={plan.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Weight (kg)</label>
                        <input
                            disabled={isReadOnly}
                            className={`bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-all ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}`}
                            placeholder="80"
                            value={plan.weight}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Age</label>
                        <input
                            disabled={isReadOnly}
                            className={`bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-all ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}`}
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
