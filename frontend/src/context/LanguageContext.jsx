import React, { createContext, useContext, useState, useEffect } from 'react';
import { locales } from '../config/locales';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    // Try to read from localStorage, default to 'pt' (since user asked for translation kit) or 'en'
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'pt';
    });

    useEffect(() => {
        localStorage.setItem('app_language', language);
    }, [language]);

    const t = (key, params = {}) => {
        const dict = locales[language] || locales['en'];
        let value = dict[key] || key;

        // Simple interpolation: replaces {paramKey} with params[paramKey]
        Object.keys(params).forEach(param => {
            value = value.replace(`{${param}}`, params[param]);
        });

        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
