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

      
      if (!data.client_reference_id) {

        break;
      }
      
      // Verificar se é uma subscription ou payment único
      if (data.subscription) {

        // Get subscription details to get current_period_end
        const subscription = await stripe.subscriptions.retrieve(data.subscription);
        const subscriptionObj = subscription as any;

        
        const subscriptionData = {
          user_id: data.client_reference_id,
          stripe_customer_id: data.customer,
          stripe_subscription_id: data.subscription,
          plan: 'monthly',
          status: 'active',
          current_period_end: subscriptionObj.current_period_end ? new Date(subscriptionObj.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now if undefined
        };

        
        // First try to find existing subscription
        const { data: existingSubscription } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', data.client_reference_id)
          .eq('plan', 'monthly')
          .single();
        
        let result, error;
        if (existingSubscription) {
          // Update existing subscription
          const updateResult = await supabaseAdmin
            .from('subscriptions')
            .update(subscriptionData)
            .eq('id', existingSubscription.id);
          result = updateResult.data;
          error = updateResult.error;
        } else {
          // Insert new subscription
          const insertResult = await supabaseAdmin
            .from('subscriptions')
            .insert(subscriptionData);
          result = insertResult.data;
          error = insertResult.error;
        }
        if (error) {

        } else {

        }
      } else if (data.mode === 'payment') {

        // Checar se já existe registro lifetime ativo para este user_id
        const { data: existingLifetime, error: checkError } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', data.client_reference_id)
          .eq('plan', 'lifetime')
          .eq('status', 'active');
        if (checkError) {

          break;
        }
        if (!existingLifetime || existingLifetime.length === 0) {
          const lifetimeData = {
            user_id: data.client_reference_id,
            stripe_customer_id: data.customer,
            stripe_subscription_id: null,
            plan: 'lifetime',
            status: 'active',
            current_period_end: new Date('2099-12-31T23:59:59Z'),
          };

          const { data: result, error } = await supabaseAdmin.from('subscriptions').insert(lifetimeData);
          if (error) {

          } else {

          }
        } else {

        }
      }
      break;

    case 'payment_intent.succeeded':

      
      // Try to find the checkout session associated with this payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: data.id,
        limit: 1
      });
      
      if (sessions.data.length > 0) {
        const session = sessions.data[0];

        
        let userId = session.client_reference_id || (data.metadata as any)?.userId;
        if (!userId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(data.payment_intent as string);
            userId = (paymentIntent.metadata as any)?.userId;

          } catch (e) {

          }
        }
        // Note: Lifetime payments are handled in charge.succeeded event to avoid duplicates

      } else {

      }
      break;

    case 'charge.succeeded':
    case 'charge.updated':
      if(event.type === 'charge.updated' && data.status !== 'succeeded') {

        break;
      }


      if (!data.payment_intent) {

        break;
      }

      const chargeSessions = await stripe.checkout.sessions.list({
        payment_intent: data.payment_intent,
        limit: 1,
      });

      if (chargeSessions.data.length) {
        const session = chargeSessions.data[0];


        let userId = session.client_reference_id || (data.metadata as any)?.userId;
        if (!userId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(data.payment_intent as string);
            userId = (paymentIntent.metadata as any)?.userId;

          } catch (e) {

          }
        }
        if (session.mode === 'payment' && userId) {

          // Checar se já existe registro lifetime ativo para este user_id
          const { data: existingLifetime, error: checkError } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('plan', 'lifetime')
            .eq('status', 'active');
          if (checkError) {

            break;
          }
          if (!existingLifetime || existingLifetime.length === 0) {
            const lifetimeData = {
              user_id: userId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: null,
              plan: 'lifetime',
              status: 'active',
              current_period_end: new Date('2099-12-31T23:59:59Z'),
            };

            const { data: result, error } = await supabaseAdmin.from('subscriptions').insert(lifetimeData);
            if (error) {

            } else {

            }
          } else {

          }
        } else {

        }
      } else {

      }
      break;

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':

      const updateData: { status: any; current_period_end?: Date } = {
        status: data.status
      };
      if (typeof data.current_period_end === 'number' && !isNaN(data.current_period_end)) {
        updateData.current_period_end = new Date(data.current_period_end * 1000);
      }

      
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', data.id);
        
      if (error) {

      } else {

      }
      break;
      
    case 'invoice.payment_succeeded':

      
      // For invoice events, we need to get the subscription from the invoice
       const invoice = event.data.object as any;

       
       if (invoice.subscription) {
         // Get subscription details from Stripe
         const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

         
         const invoiceUpdateData = {
           status: subscription.status,
           current_period_end: new Date((subscription as any).current_period_end * 1000),
         };

         
         const { error: invoiceError } = await supabaseAdmin
           .from('subscriptions')
           .update(invoiceUpdateData)
           .eq('stripe_subscription_id', subscription.id);
           
         if (invoiceError) {

         } else {

         }
       } else {

        }
       break;

    default:

  }

  return NextResponse.json({ received: true });
}
