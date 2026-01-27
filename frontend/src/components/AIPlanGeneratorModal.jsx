import React, { useState } from 'react';
import { generateWorkoutPlan } from '../lib/gemini';
import { X, Sparkles, Loader, AlertCircle } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { useLanguage } from '../context/LanguageContext';

export default function AIPlanGeneratorModal({ isOpen, onClose, onPlanGenerated }) {
    const { t } = useLanguage();
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
                <div className="bg-brand-light-gray/50 p-6 border-b border-brand-border/50 flex justify-between items-center relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Sparkles className="text-purple-400" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">{t('ai_modal_title')}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-brand-light-gray rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {!import.meta.env.VITE_GEMINI_API_KEY && (
                        <div className="bg-brand-light-gray/30 p-4 rounded-xl border border-dashed border-gray-700">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('ai_modal_api_label')}</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full bg-brand-gray border border-brand-border rounded-lg p-3 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                                placeholder={t('ai_modal_api_placeholder')}
                            />
                            <p className="text-[10px] text-gray-500 mt-2">
                                Review your <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">Google AI Studio</a> dashboard to get a key.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Goal */}
                        <CustomDropdown
                            label={t('ai_modal_goal')}
                            options={[
                                { value: 'Hypertrophy (Muscle Gain)', label: t('goal_hypertrophy') },
                                { value: 'Strength (Powerlifting)', label: t('goal_strength') },
                                { value: 'Fat Loss (Cutting)', label: t('goal_fat_loss') },
                                { value: 'Endurance / Cardio', label: t('goal_endurance') },
                                { value: 'Athletic Performance', label: t('goal_athletic') },
                                { value: 'Flexibility & Mobility', label: t('goal_mobility') }
                            ]}
                            value={formData.goal}
                            onChange={(val) => handleChange('goal', val)}
                            containerClass="w-full"
                        />

                        {/* Focus */}
                        <CustomDropdown
                            label={t('ai_modal_focus')}
                            options={[
                                { value: 'Full Body', label: t('focus_full_body') },
                                { value: 'Upper Body', label: t('focus_upper') },
                                { value: 'Lower Body', label: t('focus_lower') },
                                { value: 'Push / Pull / Legs', label: t('focus_ppl') },
                                { value: 'Chest & Back', label: t('focus_chest_back') },
                                { value: 'Arms & Shoulders', label: t('focus_arms_shoulders') },
                                { value: 'Glutes & Legs', label: t('focus_glutes_legs') }
                            ]}
                            value={formData.focus}
                            onChange={(val) => handleChange('focus', val)}
                            containerClass="w-full"
                        />

                        {/* Level */}
                        <CustomDropdown
                            label={t('ai_modal_level')}
                            options={[
                                { value: 'Beginner (0-6 months)', label: t('level_beginner') },
                                { value: 'Intermediate (6m - 2 years)', label: t('level_intermediate') },
                                { value: 'Advanced (2+ years)', label: t('level_advanced') }
                            ]}
                            value={formData.level}
                            onChange={(val) => handleChange('level', val)}
                            containerClass="w-full"
                        />

                        {/* Equipment */}
                        <CustomDropdown
                            label={t('ai_modal_equipment')}
                            options={[
                                { value: 'Full Gym', label: t('equip_full_gym') },
                                { value: 'Home Gym (Dumbbells Only)', label: t('equip_home_gym') },
                                { value: 'Bodyweight Only', label: t('equip_bodyweight') },
                                { value: 'Resistance Bands', label: t('equip_bands') }
                            ]}
                            value={formData.equipment}
                            onChange={(val) => handleChange('equipment', val)}
                            containerClass="w-full"
                        />

                        {/* Days per Week */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">{t('ai_modal_days')}</label>
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
                            <label className="text-xs font-bold text-gray-400 uppercase">{t('ai_modal_time')}</label>
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
                                {t('ai_modal_designing')}
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} fill="currentColor" className="text-yellow-300" />
                                {t('ai_modal_generate')}
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-500 mt-3">
                        {t('ai_modal_powered_by')}
                    </p>
                </div>

            </div>
        </div>
    );
}
