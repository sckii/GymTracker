export const SUBSCRIPTION_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        maxLogs: 20,
        maxPlans: 2,
        color: 'gray',
        price: 'Free'
    },
    BASIC: {
        id: 'basic',
        name: 'Basic',
        maxLogs: 300,
        maxPlans: 10,
        color: 'blue',
        price: '$4.99/mo',
        priceId: 'price_1SsrAfDLLX3WOCmi9MzxP0dZ'
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        maxLogs: Infinity,
        maxPlans: Infinity,
        color: 'purple',
        price: '$9.99/mo',
        priceId: 'price_1Sso3MDLLX3WOCmim3l7Mvi2'
    }
};

export const DEFAULT_PLAN = SUBSCRIPTION_PLANS.FREE;
