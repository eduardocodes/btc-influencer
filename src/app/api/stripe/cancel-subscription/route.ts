import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest) {
  console.log('🚫 Cancel subscription API called:', new Date().toISOString());
  
  try {
    const body = await req.json();
    console.log('📋 Request body:', body);
    
    const { userId } = body;
    
    if (!userId) {
      console.error('❌ Missing userId');
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Buscar assinatura ativa do usuário no banco de dados
    const { data: subscription, error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('plan', 'monthly') // Só cancelamos assinaturas mensais, lifetime não pode ser cancelada
      .single();

    if (dbError || !subscription) {
      console.error('❌ No active monthly subscription found:', dbError);
      return NextResponse.json({ error: 'No active monthly subscription found' }, { status: 404 });
    }

    console.log('📊 Found subscription:', subscription);

    // Cancelar assinatura no Stripe
    if (subscription.stripe_subscription_id) {
      console.log('🚫 Canceling Stripe subscription:', subscription.stripe_subscription_id);
      
      const canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id
      );
      
      console.log('✅ Stripe subscription canceled:', canceledSubscription.id);
      
      const stripeSubscription = canceledSubscription as any;
      
      // Atualizar status no banco de dados
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({ 
          status: 'canceled'
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
      }

      console.log('✅ Subscription canceled successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription canceled successfully',
        current_period_end: new Date(stripeSubscription.current_period_end * 1000)
      });
    } else {
      console.error('❌ No Stripe subscription ID found');
      return NextResponse.json({ error: 'No Stripe subscription ID found' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}