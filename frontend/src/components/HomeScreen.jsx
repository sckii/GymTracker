import React from 'react';
import { ClipboardList, Play, History } from 'lucide-react';

export default function HomeScreen({ setView, activePlan }) {
    return (
        <div className="relative flex flex-col gap-6 p-8 h-full justify-center items-center overflow-hidden">
            {/* Logo with new secondary colors */}
            <div className="text-center mb-8 relative">
                <h1 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-sm py-3 px-1 relative z-10">
                    GYM
                    <span className="text-brand-lime">TRACKER</span>
                </h1>
            </div>

            <button
                onClick={() => setView('plan-list')}
                className="w-72 p-6 bg-brand-light-gray/40 backdrop-blur-md border border-brand-border/50 rounded-2xl shadow-xl flex flex-row items-center gap-4 hover:shadow-2xl hover:bg-brand-light-gray/60 hover:scale-105 transition-all duration-300 group"
            >
                <div className="p-4 bg-brand-gray rounded-full text-brand-lime shadow-inner group-hover:bg-brand-lime group-hover:text-black transition-all duration-500 shrink-0">
                    <ClipboardList size={28} />
                </div>
                <div className="text-left">
                    <span className="block text-lg font-bold text-gray-100 tracking-tight">My Plans</span>
                    <span className="text-xs text-gray-400 font-medium">Manage workouts</span>
                </div>
            </button>

            <button
                onClick={() => setView('start-workout')}
                className={`w-72 p-6 bg-brand-light-gray/40 backdrop-blur-md border border-brand-border/50 rounded-2xl shadow-xl flex flex-row items-center gap-4 hover:shadow-2xl hover:bg-brand-light-gray/60 hover:scale-105 transition-all duration-300 group ${!activePlan ? 'opacity-80 grayscale-[0.5]' : ''}`}
            >
                <div className={`p-4 rounded-full shadow-inner transition-all duration-500 shrink-0 ${activePlan ? 'bg-brand-lime/20 text-brand-lime group-hover:bg-brand-lime group-hover:text-black' : 'bg-brand-gray text-gray-500 group-hover:bg-gray-700 group-hover:text-white'}`}>
                    <Play size={28} className={activePlan ? "ml-1" : ""} />
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className="block text-lg font-bold text-gray-100 tracking-tight">Start Workout</span>
                    {activePlan ? (
                        <span className="text-xs text-black font-bold mt-1 bg-brand-lime px-2 py-0.5 rounded-full shadow-sm">
                            {activePlan.name}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-500 font-medium mt-1">Select a plan first</span>
                    )}
                </div>
            </button>

            <button
                onClick={() => setView('stats')}
                className="w-72 p-6 bg-brand-light-gray/40 backdrop-blur-md border border-brand-border/50 rounded-2xl shadow-xl flex flex-row items-center gap-4 hover:shadow-2xl hover:bg-brand-light-gray/60 hover:scale-105 transition-all duration-300 group"
            >
                <div className="p-4 bg-brand-gray rounded-full text-brand-lime shadow-inner group-hover:bg-brand-lime group-hover:text-black transition-all duration-500 shrink-0">
                    <History size={28} />
                </div>
                <div className="text-left">
                    <span className="block text-lg font-bold text-gray-100 tracking-tight">History & Stats</span>
                    <span className="text-xs text-gray-400 font-medium">View progress</span>
                </div>
            </button>
        </div>
    );
}
