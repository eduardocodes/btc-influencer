import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest) {
  console.log('🔍 Webhook received:', new Date().toISOString());
  console.log('📍 Headers:', Object.fromEntries(req.headers.entries()));
  
  const sig = req.headers.get('stripe-signature') as string;
  console.log('🔑 Signature:', sig ? 'Present' : 'Missing');
  
  const raw = await req.arrayBuffer();
  console.log('📦 Raw body size:', raw.byteLength);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(raw), sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('✅ Event parsed:', event.type);
    console.log('📋 Event data:', JSON.stringify(event.data.object, null, 2));
  } catch (err) {
    console.error('❌ Webhook Error:', err);
    return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
  }

  const data = event.data.object as any;

  console.log('🎯 Processing event:', event.type);
  console.log('👤 Client ID:', data.client_reference_id);
  console.log('💳 Customer ID:', data.customer);
  console.log('📊 Has subscription:', !!data.subscription);

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('🛒 Checkout completed - processing...');
      console.log('📊 Session data:', {
        id: data.id,
        client_reference_id: data.client_reference_id,
        customer: data.customer,
        subscription: data.subscription,
        payment_intent: data.payment_intent,
        mode: data.mode,
        amount_total: data.amount_total
      });
      
      if (!data.client_reference_id) {
        console.error('❌ Missing client_reference_id in checkout session');
        break;
      }
      
      // Verificar se é uma subscription ou payment único
      if (data.subscription) {
        console.log('📅 Processing MONTHLY subscription...');
        // Get subscription details to get current_period_end
        const subscription = await stripe.subscriptions.retrieve(data.subscription);
        const subscriptionObj = subscription as any;
        console.log('📊 Stripe subscription details:', {
          id: subscriptionObj.id,
          current_period_end: subscriptionObj.current_period_end,
          current_period_end_date: new Date(subscriptionObj.current_period_end * 1000)
        });
        
        const subscriptionData = {
          user_id: data.client_reference_id,
          stripe_customer_id: data.customer,
          stripe_subscription_id: data.subscription,
          plan: 'monthly',
          status: 'active',
          current_period_end: subscriptionObj.current_period_end ? new Date(subscriptionObj.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now if undefined
        };
        console.log('💾 Saving subscription data:', subscriptionData);
        console.log('📅 Current period end timestamp:', subscriptionObj.current_period_end);
        console.log('📅 Current period end date:', new Date(subscriptionObj.current_period_end * 1000));
        
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
          console.error('❌ Database error (monthly):', error);
        } else {
          console.log('✅ Monthly subscription saved successfully:', result);
        }
      } else if (data.mode === 'payment') {
        console.log('💎 Processing LIFETIME payment...');
        // Checar se já existe registro lifetime ativo para este user_id
        const { data: existingLifetime, error: checkError } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', data.client_reference_id)
          .eq('plan', 'lifetime')
          .eq('status', 'active');
        if (checkError) {
          console.error('❌ Database error (check lifetime):', checkError);
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
          console.log('💾 Saving lifetime data:', lifetimeData);
          const { data: result, error } = await supabaseAdmin.from('subscriptions').insert(lifetimeData);
          if (error) {
            console.error('❌ Database error (lifetime):', error);
          } else {
            console.log('✅ Lifetime access saved successfully:', result);
          }
        } else {
          console.log('⏩ Lifetime already exists for this user, skipping insert.');
        }
      }
      break;

    case 'payment_intent.succeeded':
      console.log('💳 Payment intent succeeded - checking for lifetime payment...');
      console.log('📊 Payment intent data:', {
        id: data.id,
        customer: data.customer,
        metadata: data.metadata,
        charges: data.charges?.data?.length
      });
      
      // Try to find the checkout session associated with this payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: data.id,
        limit: 1
      });
      
      if (sessions.data.length > 0) {
        const session = sessions.data[0];
        console.log('🛒 Found associated checkout session:', session.id);
        console.log('📋 Session details:', {
          client_reference_id: session.client_reference_id,
          customer: session.customer,
          mode: session.mode
        });
        
        let userId = session.client_reference_id || (data.metadata as any)?.userId;
        if (!userId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(data.payment_intent as string);
            userId = (paymentIntent.metadata as any)?.userId;
            console.log('🔄 Retrieved userId from PaymentIntent metadata:', userId);
          } catch (e) {
            console.error('❌ Failed to retrieve PaymentIntent:', e);
          }
        }
        // Note: Lifetime payments are handled in charge.succeeded event to avoid duplicates
        console.log('ℹ️ Payment intent succeeded - lifetime processing handled in charge.succeeded event');
      } else {
        console.log('⚠️ No checkout session found for payment intent');
      }
      break;

    case 'charge.succeeded':
    case 'charge.updated':
      if(event.type === 'charge.updated' && data.status !== 'succeeded') {
        console.log('⚡ Charge updated but not succeeded, skipping');
        break;
      }
      console.log('⚡ Charge success event - processing potential lifetime payment...');
      console.log('📊 Charge data:', {
        customer: data.customer,
        payment_intent: data.payment_intent,
        amount: data.amount
      });

      if (!data.payment_intent) {
        console.log('⚠️ Charge missing payment_intent');
        break;
      }

      const chargeSessions = await stripe.checkout.sessions.list({
        payment_intent: data.payment_intent,
        limit: 1,
      });

      if (chargeSessions.data.length) {
        const session = chargeSessions.data[0];
        console.log('🛒 Found associated checkout session:', session.id);
        console.log('📋 Session details:', {
          client_reference_id: session.client_reference_id,
          customer: session.customer,
          mode: session.mode,
        });

        let userId = session.client_reference_id || (data.metadata as any)?.userId;
        if (!userId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(data.payment_intent as string);
            userId = (paymentIntent.metadata as any)?.userId;
            console.log('🔄 Retrieved userId from PaymentIntent (charge event):', userId);
          } catch (e) {
            console.error('❌ Failed to retrieve PaymentIntent (charge event):', e);
          }
        }
        if (session.mode === 'payment' && userId) {
          console.log('💎 Processing lifetime payment from charge event...');
          // Checar se já existe registro lifetime ativo para este user_id
          const { data: existingLifetime, error: checkError } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('plan', 'lifetime')
            .eq('status', 'active');
          if (checkError) {
            console.error('❌ Database error (check lifetime):', checkError);
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
            console.log('💾 Saving lifetime data from charge event:', lifetimeData);
            const { data: result, error } = await supabaseAdmin.from('subscriptions').insert(lifetimeData);
            if (error) {
              console.error('❌ Database error (charge):', error);
            } else {
              console.log('✅ Lifetime access saved successfully from charge event:', result);
            }
          } else {
            console.log('⏩ Lifetime already exists for this user, skipping insert.');
          }
        } else {
          console.log('⚠️ Missing user identifier or wrong mode in charge event');
        }
      } else {
        console.log('⚠️ No checkout session found for charge event');
      }
      break;

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':
      console.log('🔄 Processing subscription update:', event.type);
      const updateData: { status: any; current_period_end?: Date } = {
        status: data.status
      };
      if (typeof data.current_period_end === 'number' && !isNaN(data.current_period_end)) {
        updateData.current_period_end = new Date(data.current_period_end * 1000);
      }
      console.log('📝 Update data:', updateData);
      
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', data.id);
        
      if (error) {
        console.error('❌ Database error (update):', error);
      } else {
        console.log('✅ Subscription updated successfully');
      }
      break;
      
    case 'invoice.payment_succeeded':
      console.log('💰 Processing invoice payment succeeded');
      
      // For invoice events, we need to get the subscription from the invoice
       const invoice = event.data.object as any;
       console.log('📄 Invoice details:', {
         id: invoice.id,
         customer: invoice.customer,
         subscription: invoice.subscription,
         status: invoice.status
       });
       
       if (invoice.subscription) {
         // Get subscription details from Stripe
         const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
         console.log('📊 Retrieved subscription:', {
           id: subscription.id,
           status: subscription.status,
           current_period_end: (subscription as any).current_period_end
         });
         
         const invoiceUpdateData = {
           status: subscription.status,
           current_period_end: new Date((subscription as any).current_period_end * 1000),
         };
         console.log('📝 Invoice update data:', invoiceUpdateData);
         
         const { error: invoiceError } = await supabaseAdmin
           .from('subscriptions')
           .update(invoiceUpdateData)
           .eq('stripe_subscription_id', subscription.id);
           
         if (invoiceError) {
           console.error('❌ Database error (invoice update):', invoiceError);
         } else {
           console.log('✅ Subscription updated from invoice successfully');
         }
       } else {
          console.log('⚠️ No subscription found in invoice');
        }
       break;

    default:
      console.log('⚠️ Unhandled event type:', event.type);
  }

  return NextResponse.json({ received: true });
}
