import React from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, User } from 'lucide-react';

export default function UserProfile({ user }) {
    if (!user) return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const avatarUrl = user.user_metadata?.avatar_url;
    const fullName = user.user_metadata?.full_name || user.email;

    // Split name to get first name if too long, or just use full name
    const displayName = fullName.split(' ')[0];

    const handleForceUpdate = async () => {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
            window.location.reload();
        }
    };

    return (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-white backdrop-blur-md py-1.5 px-3 rounded-full border border-white/40 shadow-sm transition-all hover:bg-white/50 fixed top-0">
            <div className="flex items-center gap-2">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border-2 border-white shadow-sm text-purple-600">
                        <User size={16} />
                    </div>
                )}
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                    {displayName}
                </span>
            </div>

            <div className="h-4 w-px bg-gray-400/30"></div>

            <button
                onClick={handleForceUpdate}
                className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-white/50"
                title="Force Update App"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
            </button>

            <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white/50"
                title="Sign Out"
            >
                <LogOut size={16} />
            </button>
        </div>
    );
}
