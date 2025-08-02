import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest) {
  console.log('🚀 Checkout API called:', new Date().toISOString());
  
  const body = await req.json();
  console.log('📋 Request body:', body);
  
  const { userId, plan, email } = body;
  
  if (!userId || !plan) {
    console.error('❌ Missing required fields:', { userId, plan });
    return NextResponse.json({ error: 'Missing userId or plan' }, { status: 400 });
  }

  // Não buscar mais perfil, apenas usar userId e email
  let customerId = null;
  let userEmail = email;

  if (!userEmail) {
    // Buscar e-mail do usuário autenticado pelo Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError || !authUser) {
      console.error('❌ Auth user lookup failed:', authError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    userEmail = authUser.user.email;
  }

  // Buscar cliente Stripe existente pelo e-mail, se houver
  const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
    console.log('✅ Stripe customer found:', customerId);
  } else {
    console.log('🆕 Creating new Stripe customer...');
    const { id } = await stripe.customers.create({ email: userEmail });
    customerId = id;
    console.log('✅ Customer created:', customerId);
  }

  console.log('💰 Processing plan:', plan);
  const monthlyPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
  const lifetimePriceId = process.env.STRIPE_PRICE_ID;

  console.log('🔍 Price IDs:', { monthlyPriceId, lifetimePriceId });

  if (!monthlyPriceId || !lifetimePriceId) {
    console.error('❌ Missing price configuration');
    return NextResponse.json({ error: 'Missing price configuration' }, { status: 500 });
  }

  let session;
  
  try {
    if (plan === 'monthly') {
      console.log('🔄 Creating monthly subscription session...');
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        client_reference_id: userId,
        line_items: [{ price: monthlyPriceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/canceled`,
      });
    } else if (plan === 'lifetime') {
      console.log('💎 Creating lifetime payment session...');
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        client_reference_id: userId,
        payment_intent_data: {
          metadata: {
            userId,
          },
        },
        line_items: [{ price: lifetimePriceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/canceled`,
      });
    } else {
      console.error('❌ Invalid plan:', plan);
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    
    console.log('✅ Session created:', { sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Stripe session creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
