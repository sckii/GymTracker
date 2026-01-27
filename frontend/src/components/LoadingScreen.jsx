import React from 'react';

export default function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-brand-dark">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-secondary/20 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-brand-primary-dark/20 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

            <div className="z-10 flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-brand-primary/20 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-white animate-pulse">Loading Gym Tracker...</h2>
            </div>
        </div>
    );
}
