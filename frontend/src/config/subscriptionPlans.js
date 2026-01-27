export const SUBSCRIPTION_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        maxLogs: 1000,
        maxPlans: 20,
        maxAIPlans: 2,
        color: 'gray',
        price: 'Free'
    },
    BASIC: {
        id: 'basic',
        name: 'Basic',
        maxLogs: 300,
        maxPlans: 10,
        maxAIPlans: 5,
        color: 'blue',
        price: '$4.99/mo',
        price: '$4.99/mo',
        priceId: 'price_1SsrAfDLLX3WOCmi9MzxP0dZ',
        comingSoon: true
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        maxLogs: Infinity,
        maxPlans: Infinity,
        maxAIPlans: 10,
        color: 'purple',
        price: '$9.99/mo',
        price: '$9.99/mo',
        priceId: 'price_1Sso3MDLLX3WOCmim3l7Mvi2',
        comingSoon: true
    }
};

export const DEFAULT_PLAN = SUBSCRIPTION_PLANS.FREE;
