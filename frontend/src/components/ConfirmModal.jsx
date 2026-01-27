import React from 'react';

export default function ConfirmModal({ isOpen, title, message, confirmText, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-brand-gray rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-brand-border">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
                    <p className="text-sm text-gray-400">{message}</p>
                </div>
                <div className="bg-black/20 px-6 py-4">
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl font-bold bg-brand-light-gray text-gray-300 hover:bg-brand-border transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 rounded-xl font-bold text-brand-dark transition-colors bg-brand-primary hover:bg-brand-primary-dark"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
