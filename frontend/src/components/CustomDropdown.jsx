import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ label, options, value, onChange, disabled, placeholder = "Select...", containerClass = "flex-1 min-w-[140px]" }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    // Handle Closing
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (triggerRef.current && triggerRef.current.contains(event.target)) return;
            if (menuRef.current && menuRef.current.contains(event.target)) return;
            setIsOpen(false);
        };

        const handleScroll = () => {
            // Close on scroll to prevent detached floating menu
            if (isOpen) setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', () => setIsOpen(false));
            // Capture scroll events from any parent
            document.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', () => setIsOpen(false));
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    // Calculate Position
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen]);

    const selectedOption = options.find(o => o.value === value);
    const labelClass = label.replace(/[\s\(\)]/g, '');

    return (
        <div className={`relative flex flex-col gap-1 ${containerClass} dropdown-${labelClass}`}>
            <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
                {label}
            </label>

            <button
                ref={triggerRef}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between bg-brand-light-gray border ${isOpen ? 'border-brand-primary ring-1 ring-brand-primary/50' : 'border-brand-border'} text-gray-100 text-sm rounded-lg px-3 py-2 outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-border/30 cursor-pointer'}`}
            >
                <span className="truncate max-w-[250px] text-left">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && createPortal(
                <div
                    ref={menuRef}
                    style={{
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        position: 'fixed'
                    }}
                    className="bg-brand-gray border border-brand-border rounded-xl shadow-2xl z-[9999] max-h-[250px] overflow-y-auto flex flex-col"
                >
                    <div className="p-1 flex flex-col gap-0.5">
                        {options.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">No options</div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${option.value === value ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-300 hover:bg-brand-light-gray hover:text-white'}`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && <Check size={14} />}
                                </button>
                            ))
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
