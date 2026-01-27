import React from 'react';
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans';
import { Check, X, Star } from 'lucide-react';

export default function SubscriptionModal({ isOpen, onClose, currentPlanId, onUpgrade, onManage, onCancel }) {
    if (!isOpen) return null;

    const plans = Object.values(SUBSCRIPTION_PLANS);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #3f3f46;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #FF204E;
                }
            `}</style>
            <div className="bg-brand-gray rounded-3xl w-full max-w-4xl max-h-[70vh] overflow-y-auto custom-scrollbar shadow-2xl animate-slide-up flex flex-col md:flex-row relative border border-brand-border">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-brand-light-gray rounded-full text-gray-400 hover:text-white hover:bg-brand-border z-10 transition-colors"
                >
                    <X size={20} />
                </button>

                {plans.map((plan) => {
                    const isCurrent = currentPlanId === plan.id;
                    const isPro = plan.id === 'pro';

                    return (
                        <div
                            key={plan.id}
                            className={`flex-1 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r last:border-0 border-brand-border relative ${isPro ? 'bg-gradient-to-b from-brand-light-gray via-brand-gray to-black text-white' : 'text-gray-100'}`}
                        >
                            {/* ... existing plan content ... */}
                            {isPro && (
                                <div className="absolute top-0 transform -translate-y-1/2 bg-gradient-to-r from-brand-primary to-rose-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> MOST POPULAR
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-2 ${!isPro && 'text-gray-100'}`}>{plan.name}</h3>
                            <div className="text-3xl font-extrabold mb-6 text-brand-primary">
                                {plan.price}
                            </div>

                            <div className="flex-1 space-y-4 w-full mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${isPro ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-light-gray text-gray-400'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm ${!isPro ? 'text-gray-400' : 'text-gray-300'}`}>
                                        {plan.maxPlans === Infinity ? 'Unlimited' : plan.maxPlans} Plans
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${isPro ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-light-gray text-gray-400'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm ${!isPro ? 'text-gray-400' : 'text-gray-300'}`}>
                                        {plan.maxLogs === Infinity ? 'Unlimited' : plan.maxLogs} Workout Logs
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${isPro ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-light-gray text-gray-400'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm ${!isPro ? 'text-gray-400' : 'text-gray-300'}`}>
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
                                    ? 'bg-brand-light-gray text-gray-500 cursor-default'
                                    : isPro
                                        ? 'bg-brand-primary text-black hover:bg-brand-primary-mid shadow-lg shadow-brand-primary/20'
                                        : 'bg-white text-black hover:bg-gray-100'
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
                    <div className="bg-brand-gray/90 backdrop-blur-md p-2 rounded-2xl shadow-xl flex gap-3 pointer-events-auto border border-brand-border">
                        <button
                            onClick={onManage}
                            className="px-4 py-2 bg-brand-light-gray hover:bg-brand-border text-gray-200 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Manage Subscription
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
