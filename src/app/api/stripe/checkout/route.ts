import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const { id } = await stripe.customers.create({ email: profile.email });
    customerId = id;
    await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

    const { plan } = await req.json();  // ex.: 'monthly' | 'lifetime'

    const priceId =
      plan === 'yearly'
        ? process.env.STRIPE_SUBSCRIPTION_PRICE_ID!
        : process.env.STRIPE_PRICE_ID!;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/billing/canceled`,
    });

  return NextResponse.json({ url: session.url });
}
