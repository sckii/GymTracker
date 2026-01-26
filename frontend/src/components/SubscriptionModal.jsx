import React from 'react';
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans';
import { Check, X, Star } from 'lucide-react';

export default function SubscriptionModal({ isOpen, onClose, currentPlanId, onUpgrade, onManage, onCancel }) {
    if (!isOpen) return null;

    const plans = Object.values(SUBSCRIPTION_PLANS);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #E5E7EB;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #B6F500;
                }
            `}</style>
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[70vh] overflow-y-auto custom-scrollbar shadow-2xl animate-slide-up flex flex-col md:flex-row relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 z-10 transition-colors"
                >
                    <X size={20} />
                </button>

                {plans.map((plan) => {
                    const isCurrent = currentPlanId === plan.id;
                    const isPro = plan.id === 'pro';

                    return (
                        <div
                            key={plan.id}
                            className={`flex-1 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r last:border-0 border-gray-100 relative ${isPro ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white' : ''}`}
                        >
                            {/* ... existing plan content ... */}
                            {isPro && (
                                <div className="absolute top-0 transform -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> MOST POPULAR
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-2 ${!isPro && 'text-gray-800'}`}>{plan.name}</h3>
                            <div className="text-3xl font-extrabold mb-6">
                                {plan.price}
                            </div>

                            <div className="flex-1 space-y-4 w-full mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${isPro ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm ${!isPro ? 'text-gray-600' : 'text-gray-300'}`}>
                                        {plan.maxPlans === Infinity ? 'Unlimited' : plan.maxPlans} Plans
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${isPro ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm ${!isPro ? 'text-gray-600' : 'text-gray-300'}`}>
                                        {plan.maxLogs === Infinity ? 'Unlimited' : plan.maxLogs} Workout Logs
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${isPro ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm ${!isPro ? 'text-gray-600' : 'text-gray-300'}`}>
                                        Advanced Stats
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (isCurrent) return;
                                    if (plan.id === 'free' && currentPlanId !== 'free') {
                                        onClose();
                                        onCancel();
                                        return;
                                    }
                                    onUpgrade(plan.id);
                                    onClose();
                                }}
                                disabled={isCurrent}
                                className={`w-full py-3 rounded-xl font-bold transition-transform active:scale-95 ${isCurrent
                                    ? 'bg-gray-100 text-gray-400 cursor-default'
                                    : isPro
                                        ? 'bg-[#B6F500] text-black hover:bg-[#a4dd00] shadow-lg shadow-[#B6F500]/20'
                                        : 'bg-gray-900 text-white hover:bg-black'
                                    }`}
                            >
                                {isCurrent ? 'Current Plan' : (plan.id === 'free' && currentPlanId !== 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`)}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Extended Modal Footer for Management if Paid */}
            {currentPlanId !== 'free' && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-50 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl flex gap-3 pointer-events-auto border border-gray-200">
                        <button
                            onClick={onManage}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Manage Subscription
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
