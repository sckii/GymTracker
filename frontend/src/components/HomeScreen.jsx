import React from 'react';
import { ClipboardList, Play, History } from 'lucide-react';

export default function HomeScreen({ setView, activePlan }) {
    return (
        <div className="relative flex flex-col gap-6 p-8 h-full justify-center items-center overflow-hidden">
            {/* Logo with new secondary colors */}
            <div className="text-center mb-8 relative">
                <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 drop-shadow-sm py-3 px-1 relative z-10">
                    GYM
                    <span className="text-[#98CD00]">TRACKER</span>
                </h1>
            </div>

            <button
                onClick={() => setView('plan-list')}
                className="w-72 p-6 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl flex flex-row items-center gap-4 hover:shadow-2xl hover:bg-white/60 hover:scale-105 transition-all duration-300 group"
            >
                <div className="p-4 bg-white/50 rounded-full text-[#98CD00] shadow-inner group-hover:bg-[#B6F500] group-hover:text-black transition-all duration-500 shrink-0">
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
                <div className={`p-4 rounded-full shadow-inner transition-all duration-500 shrink-0 ${activePlan ? 'bg-[#B6F500]/20 text-[#98CD00] group-hover:bg-[#B6F500] group-hover:text-black' : 'bg-gray-100/50 text-gray-400 group-hover:bg-gray-500 group-hover:text-white'}`}>
                    <Play size={28} className={activePlan ? "ml-1" : ""} />
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className="block text-lg font-bold text-gray-800 tracking-tight">Start Workout</span>
                    {activePlan ? (
                        <span className="text-xs text-gray-900 font-bold mt-1 bg-[#B6F500] px-2 py-0.5 rounded-full shadow-sm">
                            {activePlan.name}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-500 font-medium mt-1">Select a plan first</span>
                    )}
                </div>
            </button>

            <button
                className="w-72 p-6 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl flex flex-row items-center gap-4 transition-all duration-300 group opacity-60 grayscale cursor-not-allowed"
            >
                <div className="p-4 bg-white/50 rounded-full text-[#98CD00] shadow-inner shrink-0">
                    <History size={28} />
                </div>
                <div className="text-left">
                    <span className="block text-lg font-bold text-gray-800 tracking-tight">History</span>
                    <span className="text-xs text-gray-500 font-medium">Coming Soon</span>
                </div>
            </button>
        </div>
    );
}
