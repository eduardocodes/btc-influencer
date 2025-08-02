import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest) {

  
  try {
    const body = await req.json();

    
    const { userId } = body;
    
    if (!userId) {
      console.error('User ID missing in cancel subscription request');
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
      console.error('No subscription found for user:', userId);
      return NextResponse.json({ error: 'No active monthly subscription found' }, { status: 404 });
    }



    // Cancelar assinatura no Stripe
    if (subscription.stripe_subscription_id) {

      
      const canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id
      );
      

      
      const stripeSubscription = canceledSubscription as any;
      
      // Atualizar status no banco de dados
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({ 
          status: 'canceled'
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('Failed to update subscription in database:', updateError);
        return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
      }

      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription canceled successfully',
        current_period_end: new Date(stripeSubscription.current_period_end * 1000)
      });
    } else {

      return NextResponse.json({ error: 'No Stripe subscription ID found' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in cancel subscription:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}