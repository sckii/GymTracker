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
                <div className="bg-black/20 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-brand-light-gray border border-brand-border rounded-lg hover:bg-brand-border focus:outline-none focus:ring-2 focus:ring-brand-border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-black bg-brand-lime rounded-lg hover:bg-brand-lime-mid focus:outline-none focus:ring-2 focus:ring-brand-lime focus:ring-offset-2 focus:ring-offset-brand-gray"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
