import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest) {

  
  const body = await req.json();

  
  const { userId, plan, email } = body;
  
  if (!userId || !plan) {
    
    return NextResponse.json({ error: 'Missing userId or plan' }, { status: 400 });
  }

  // Não buscar mais perfil, apenas usar userId e email
  let customerId = null;
  let userEmail = email;

  if (!userEmail) {
    // Buscar e-mail do usuário autenticado pelo Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError || !authUser) {

      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    userEmail = authUser.user.email;
  }

  // Buscar cliente Stripe existente pelo e-mail, se houver
  const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
    
  } else {
    
    const { id } = await stripe.customers.create({ email: userEmail });
    customerId = id;
    
  }


  const monthlyPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
  const lifetimePriceId = process.env.STRIPE_PRICE_ID;

  

  if (!monthlyPriceId || !lifetimePriceId) {
    
    return NextResponse.json({ error: 'Missing price configuration' }, { status: 500 });
  }

  let session;
  
  try {
    if (plan === 'monthly') {

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        client_reference_id: userId,
        line_items: [{ price: monthlyPriceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/canceled`,
      });
    } else if (plan === 'lifetime') {

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

      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    

  } catch (error) {
    console.error('Error in checkout:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
