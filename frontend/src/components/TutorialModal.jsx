import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function TutorialModal({ isOpen, onClose, title, steps }) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-brand-gray border border-brand-border rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-light-gray/50">
                    <h3 className="font-bold text-gray-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4 min-h-[200px]">
                    <div className="flex-1">
                        <h4 className="text-brand-primary font-bold text-lg mb-2">{steps[currentStep].title}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {steps[currentStep].content}
                        </p>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-1.5 mt-4">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentStep ? 'w-6 bg-brand-primary' : 'w-1.5 bg-brand-border'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-brand-border flex justify-between items-center bg-brand-light-gray/30">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`text-gray-400 hover:text-white text-sm font-medium px-3 py-2 transition-colors flex items-center gap-1 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ChevronLeft size={16} />
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        className="bg-brand-primary hover:bg-brand-primary-mid text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                        {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
                        {currentStep < steps.length - 1 && <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
