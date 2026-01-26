import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export default function NotificationToast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />
    };

    const borderColors = {
        success: 'border-green-100',
        error: 'border-red-100',
        info: 'border-blue-100'
    };

    const bgColors = {
        success: 'bg-green-50',
        error: 'bg-red-50',
        info: 'bg-blue-50'
    };

    return (
        <div className={`fixed bottom-6 right-0 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${borderColors[type]} ${bgColors[type]} z-50 animate-in slide-in-from-right-10 fade-in duration-300`}>
            {icons[type]}
            <p className="text-sm font-medium text-gray-700 pr-2">{message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
            </button>
        </div>
    );
}
