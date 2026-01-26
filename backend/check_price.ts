
import dotenv from 'dotenv';
dotenv.config({ path: '../frontend/.env' });
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

async function checkPrice() {
    try {
        const priceId = 'price_1SsrAfDLLX3WOCmi9MzxP0dZ'; // Basic Plan
        const price = await stripe.prices.retrieve(priceId, {
            expand: ['currency_options']
        });

        console.log('Price ID:', price.id);
        console.log('Currency:', price.currency);
        console.log('Currency Options:', JSON.stringify(price.currency_options || {}, null, 2));

        if (price.currency !== 'brl' && !price.currency_options?.brl) {
            console.log('\nCONCLUSION: This Price ID is strictly for ' + price.currency.toUpperCase() + '.');
            console.log('To charge in BRL, you must find the OTHER Price ID associated with the Product.');
        } else {
            console.log('\nCONCLUSION: This Price ID supports BRL!');
        }

    } catch (err) {
        console.error(err);
    }
}

checkPrice();
