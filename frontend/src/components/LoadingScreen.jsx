import React from 'react';

export default function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FFFADC] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#B6F500]/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-[#A4DD00]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

            <div className="z-10 flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#B6F500]/30 border-t-[#B6F500] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-[#98CD00]/20 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 animate-pulse">Loading Gym Tracker...</h2>
            </div>
        </div>
    );
}
