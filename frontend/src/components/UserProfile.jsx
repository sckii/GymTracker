import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, User, Crown } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';

export default function UserProfile({ user, currentPlan, onUpgrade, onManage, onCancel }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const avatarUrl = user.user_metadata?.avatar_url;
    const fullName = user.user_metadata?.full_name || user.email;

    // Split name to get first name if too long, or just use full name
    const displayName = fullName.split(' ')[0];

    // Badge Colors
    const badgeColor = currentPlan?.id === 'pro'
        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none'
        : currentPlan?.id === 'basic'
            ? 'bg-blue-100 text-blue-600 border-blue-200'
            : 'bg-gray-100 text-gray-500 border-gray-200';

    return (
        <>
            <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-white backdrop-blur-md py-1.5 px-3 rounded-full border border-white/40 shadow-sm transition-all hover:bg-white/50 fixed top-0">

                {/* Plan Badge - Clickable */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 uppercase tracking-wider transition-transform hover:scale-105 ${badgeColor}`}
                >
                    {currentPlan?.id === 'pro' && <Crown size={10} fill="currentColor" />}
                    {currentPlan?.name || 'FREE'}
                </button>

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
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white/50"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentPlanId={currentPlan?.id || 'free'}
                onUpgrade={onUpgrade}
                onManage={() => { setIsModalOpen(false); onManage(); }}
                onCancel={() => { setIsModalOpen(false); onCancel(); }}
            />
        </>
    );
}
