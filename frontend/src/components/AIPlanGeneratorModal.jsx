import React, { useState } from 'react';
import { generateWorkoutPlan } from '../lib/gemini';
import { X, Sparkles, Loader, AlertCircle } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function AIPlanGeneratorModal({ isOpen, onClose, onPlanGenerated }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');

    const [formData, setFormData] = useState({
        goal: 'Hypertrophy (Muscle Gain)',
        focus: 'Full Body',
        days: '3',
        time: '60',
        level: 'Intermediate',
        equipment: 'Full Gym'
    });

    if (!isOpen) return null;

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            setError("Please enter a valid Gemini API Key.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const csvData = await generateWorkoutPlan(apiKey, formData);
            if (csvData) {
                onPlanGenerated(csvData);
                onClose();
            } else {
                setError("AI returned empty data. Try again.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-brand-gray rounded-3xl w-full max-w-lg shadow-2xl animate-slide-up border border-brand-border relative overflow-hidden">

                {/* Header */}
                <div className="bg-brand-light-gray/50 p-6 border-b border-brand-border/50 flex justify-between items-center relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Sparkles className="text-purple-400" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">AI Coach Generator</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-brand-light-gray rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>

                    {/* Background decoration */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* API Key Input (if not set in env) */}
                    {!import.meta.env.VITE_GEMINI_API_KEY && (
                        <div className="bg-brand-light-gray/30 p-4 rounded-xl border border-dashed border-gray-700">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Gemini API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full bg-brand-gray border border-brand-border rounded-lg p-3 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                                placeholder="Paste your API Key here..."
                            />
                            <p className="text-[10px] text-gray-500 mt-2">
                                Review your <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">Google AI Studio</a> dashboard to get a key.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Goal */}
                        <CustomDropdown
                            label="Goal"
                            options={[
                                { value: 'Hypertrophy (Muscle Gain)', label: 'Hypertrophy (Muscle Gain)' },
                                { value: 'Strength (Powerlifting)', label: 'Strength (Powerlifting)' },
                                { value: 'Fat Loss (Cutting)', label: 'Fat Loss (Cutting)' },
                                { value: 'Endurance / Cardio', label: 'Endurance / Cardio' },
                                { value: 'Athletic Performance', label: 'Athletic Performance' },
                                { value: 'Flexibility & Mobility', label: 'Flexibility & Mobility' }
                            ]}
                            value={formData.goal}
                            onChange={(val) => handleChange('goal', val)}
                            containerClass="w-full"
                        />

                        {/* Focus */}
                        <CustomDropdown
                            label="Focus Area"
                            options={[
                                { value: 'Full Body', label: 'Full Body' },
                                { value: 'Upper Body', label: 'Upper Body' },
                                { value: 'Lower Body', label: 'Lower Body' },
                                { value: 'Push / Pull / Legs', label: 'Push / Pull / Legs' },
                                { value: 'Chest & Back', label: 'Chest & Back' },
                                { value: 'Arms & Shoulders', label: 'Arms & Shoulders' },
                                { value: 'Glutes & Legs', label: 'Glutes & Legs' }
                            ]}
                            value={formData.focus}
                            onChange={(val) => handleChange('focus', val)}
                            containerClass="w-full"
                        />

                        {/* Level */}
                        <CustomDropdown
                            label="Experience Level"
                            options={[
                                { value: 'Beginner (0-6 months)', label: 'Beginner (0-6 months)' },
                                { value: 'Intermediate (6m - 2 years)', label: 'Intermediate (6m - 2 years)' },
                                { value: 'Advanced (2+ years)', label: 'Advanced (2+ years)' }
                            ]}
                            value={formData.level}
                            onChange={(val) => handleChange('level', val)}
                            containerClass="w-full"
                        />

                        {/* Equipment */}
                        <CustomDropdown
                            label="Equipment"
                            options={[
                                { value: 'Full Gym', label: 'Full Gym' },
                                { value: 'Home Gym (Dumbbells Only)', label: 'Home Gym (Dumbbells Only)' },
                                { value: 'Bodyweight Only', label: 'Bodyweight Only' },
                                { value: 'Resistance Bands', label: 'Resistance Bands' }
                            ]}
                            value={formData.equipment}
                            onChange={(val) => handleChange('equipment', val)}
                            containerClass="w-full"
                        />

                        {/* Days per Week */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Days / Week</label>
                            <input
                                type="number"
                                name="days"
                                min="1"
                                max="7"
                                value={formData.days}
                                onChange={(e) => handleChange('days', e.target.value)}
                                className="w-full bg-brand-light-gray border-none rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-brand-primary outline-none no-spinner"
                            />
                        </div>

                        {/* Time per Workout */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Minutes / Session</label>
                            <input
                                type="number"
                                name="time"
                                min="15"
                                max="180"
                                value={formData.time}
                                onChange={(e) => handleChange('time', e.target.value)}
                                className="w-full bg-brand-light-gray border-none rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-brand-primary outline-none no-spinner"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-3 mt-2">
                            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]
                            ${loading
                                ? 'bg-brand-secondary/50 cursor-not-allowed text-gray-300'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader size={20} className="animate-spin" />
                                Designing your plan...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} fill="currentColor" className="text-yellow-300" />
                                Generate Workout Plan
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-500 mt-3">
                        Powered by Gemini AI. Results may vary. Always review generated plans.
                    </p>
                </div>

            </div>
        </div>
    );
}
