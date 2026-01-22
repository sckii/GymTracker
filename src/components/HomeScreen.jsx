import React from 'react';
import { ClipboardList, Play } from 'lucide-react';

export default function HomeScreen({ setView, activePlan }) {
    return (
        <div className="relative flex flex-col gap-6 p-8 h-full justify-center items-center overflow-hidden">
            {/* Background Decoration for Glass Effect */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 mb-8 drop-shadow-sm py-3 px-1">GymTracker</h1>

            <button
                onClick={() => setView('plan-list')}
                className="w-72 p-6 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl flex flex-row items-center gap-4 hover:shadow-2xl hover:bg-white/60 hover:scale-105 transition-all duration-300 group"
            >
                <div className="p-4 bg-white/50 rounded-full text-blue-600 shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shrink-0">
                    <ClipboardList size={28} />
                </div>
                <div className="text-left">
                    <span className="block text-lg font-bold text-gray-800 tracking-tight">My Plans</span>
                    <span className="text-xs text-gray-500 font-medium">Manage workouts</span>
                </div>
            </button>

            <button
                onClick={() => setView('start-workout')}
                className={`w-72 p-6 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl flex flex-row items-center gap-4 hover:shadow-2xl hover:bg-white/60 hover:scale-105 transition-all duration-300 group ${!activePlan ? 'opacity-80 grayscale-[0.5]' : ''}`}
            >
                <div className={`p-4 rounded-full shadow-inner transition-all duration-500 shrink-0 ${activePlan ? 'bg-green-100/50 text-green-600 group-hover:bg-green-500 group-hover:text-white' : 'bg-gray-100/50 text-gray-400 group-hover:bg-gray-500 group-hover:text-white'}`}>
                    <Play size={28} className={activePlan ? "ml-1" : ""} />
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className="block text-lg font-bold text-gray-800 tracking-tight">Start Workout</span>
                    {activePlan ? (
                        <span className="text-xs text-green-700 font-bold mt-1 bg-green-100/50 px-2 py-0.5 rounded-full">
                            {activePlan.name}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-500 font-medium mt-1">Select a plan first</span>
                    )}
                </div>
            </button>
        </div>
    );
}
