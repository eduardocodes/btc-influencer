import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') as string;
  const raw = await req.arrayBuffer();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(raw), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
  }

  const data = event.data.object as any;

  switch (event.type) {
    case 'checkout.session.completed':
      await supabaseAdmin.from('subscriptions').upsert({
        user_id:        data.client_reference_id,
        stripe_customer_id: data.customer,
        stripe_subscription_id: data.subscription,
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(data.expires_at * 1000),
      });
      break;

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: data.status,
          current_period_end: new Date(data.current_period_end * 1000),
        })
        .eq('stripe_subscription_id', data.id);
      break;
  }

  return NextResponse.json({ received: true });
}
