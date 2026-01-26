import dotenv from 'dotenv';
dotenv.config({ path: '../frontend/.env' });

import express, { Request, Response } from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 4242;

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing');
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
});

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());

// --- WEBHOOK ---
app.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log(`Webhook Debug - Signature present: ${!!signature}`);
    console.log(`Webhook Debug - Secret present: ${!!webhookSecret}`);
    if (webhookSecret) {
        console.log(`Webhook Debug - Secret (masked): ${webhookSecret.substring(0, 5)}...`);
    }

    if (!webhookSecret || !signature) {
        return res.status(400).send('Missing secret or signature');
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature as string,
            webhookSecret
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerId = session.customer as string;

            if (customerId) {
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single();

                if (profile) {
                    const amount = session.amount_total;
                    let newTier = 'free';
                    if (amount === 499) newTier = 'basic';
                    if (amount === 999) newTier = 'pro';

                    console.log(`Updating user ${profile.id} to tier ${newTier}`);

                    await supabaseAdmin
                        .from('profiles')
                        .update({ subscription_tier: newTier })
                        .eq('id', profile.id);
                } else {
                    console.error('Profile not found for customer:', customerId);
                }
            }
        }
        res.json({ received: true });
    } catch (err: any) {
        console.error('Error processing webhook:', err);
        res.status(500).send(`Server Error: ${err.message}`);
    }
});

// JSON Parser for other routes
app.use(express.json());

// --- CREATE CHECKOUT SESSION ---
app.post('/create-checkout-session', async (req: Request, res: Response) => {
    try {
        const { priceId, userId, email, successUrl, cancelUrl } = req.body;

        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        // Robustness: if getUser fails via token (common with complex RLS or just checking validity),
        // we might fail. For now, we enforce it.
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid Token or Session' });
        }

        if (user.id !== userId) return res.status(403).json({ error: 'User ID mismatch' });

        // Logic check
        const { data: profile } = await supabaseAdmin.from('profiles').select('stripe_customer_id').eq('id', userId).single();
        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: email,
                metadata: { supabase_uid: userId }
            });
            customerId = customer.id;
            await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        res.json({ url: session.url });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- CREATE PORTAL SESSION ---
app.post('/create-portal-session', async (req: Request, res: Response) => {
    try {
        const { returnUrl } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Missing Auth' });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

        const { data: profile } = await supabaseAdmin.from('profiles').select('stripe_customer_id').eq('id', user.id).single();

        if (!profile?.stripe_customer_id) {
            return res.status(400).json({ error: 'No Stripe Customer found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: returnUrl,
        });

        res.json({ url: session.url });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- CANCEL SUBSCRIPTION ---
app.post('/cancel-subscription', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Missing Auth' });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

        const { data: profile } = await supabaseAdmin.from('profiles').select('stripe_customer_id').eq('id', user.id).single();
        if (!profile?.stripe_customer_id) return res.status(400).json({ error: 'No Customer ID' });

        const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            return res.status(400).json({ message: 'No active subscription found.' });
        }

        const sub = subscriptions.data[0];
        const createdTime = sub.created * 1000;
        const daysActive = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);

        if (daysActive <= 7) {
            // Refund Logic
            const latestInvoiceId = sub.latest_invoice as string; // in TS, strictly string | Invoice
            if (typeof latestInvoiceId === 'string') {
                const invoice = await stripe.invoices.retrieve(latestInvoiceId);
                if (invoice.charge) {
                    await stripe.refunds.create({ charge: invoice.charge as string });
                }
            }

            await stripe.subscriptions.cancel(sub.id);
            await supabaseAdmin.from('profiles').update({ subscription_tier: 'free' }).eq('id', user.id);

            return res.json({ message: 'Subscription cancelled and refunded successfully.' });
        } else {
            return res.json({ redirect: true, message: 'Subscription > 7 days. Please use the portal.' });
        }

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Backend (TS) running on http://localhost:${port}`);
});
