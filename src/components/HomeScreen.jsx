import React from 'react';
import { ClipboardList, Play } from 'lucide-react';

export default function HomeScreen({ setView, activePlan }) {
    return (
        <div className="flex flex-col gap-6 p-8 h-full justify-center items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gym Tracker</h1>

            <button
                onClick={() => setView('plan-list')}
                className="w-full max-w-xs p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 hover:shadow-md transition-all group"
            >
                <div className="p-4 bg-blue-50 rounded-full text-blue-500 group-hover:bg-blue-100 transition-colors">
                    <ClipboardList size={32} />
                </div>
                <span className="text-xl font-semibold text-gray-800">My Plans</span>
                <span className="text-sm text-gray-400">Create and edit workout plans</span>
            </button>

            <button
                onClick={() => setView('start-workout')}
                className={`w-full max-w-xs p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 hover:shadow-md transition-all group ${!activePlan ? 'opacity-70' : ''}`}
            >
                <div className={`p-4 rounded-full transition-colors ${activePlan ? 'bg-green-50 text-green-500 group-hover:bg-green-100' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                    <Play size={32} className={activePlan ? "ml-1" : ""} />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-semibold text-gray-800">Start Workout</span>
                    {activePlan ? (
                        <span className="text-sm text-green-600 font-medium mt-1">
                            {activePlan.name}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400 mt-1">No Active Plan</span>
                    )}
                </div>
            </button>
        </div>
    );
}
