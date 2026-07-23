import { getStripe } from './_lib/stripe.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function activateMembership(admin, session) {
  const membershipId = session.metadata?.membership_id;
  const profileId = session.metadata?.supabase_user_id;
  if (!membershipId || !profileId) return;

  await admin.from('memberships').update({ status: 'active' }).eq('id', membershipId);

  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

  await admin.from('subscriptions').upsert(
    {
      profile_id: profileId,
      membership_id: membershipId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: 'active',
    },
    { onConflict: 'stripe_subscription_id' }
  );
}

async function syncSubscriptionStatus(admin, subscription) {
  const status = subscription.status;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  await admin
    .from('subscriptions')
    .update({ status, current_period_end: currentPeriodEnd, stripe_price_id: subscription.items?.data?.[0]?.price?.id })
    .eq('stripe_subscription_id', subscription.id);

  if (status === 'canceled') {
    const membershipId = subscription.metadata?.membership_id;
    if (membershipId) {
      await admin.from('memberships').update({ status: 'cancelled' }).eq('id', membershipId);
    }
  }
}

async function recordInvoicePayment(admin, invoice, status) {
  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionId) return;

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('id, profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();

  if (!subscription) return;

  await admin.from('payments').upsert(
    {
      profile_id: subscription.profile_id,
      subscription_id: subscription.id,
      stripe_invoice_id: invoice.id,
      amount: (invoice.amount_paid || invoice.amount_due || 0) / 100,
      currency: invoice.currency,
      status,
      invoice_pdf_url: invoice.invoice_pdf || null,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    },
    { onConflict: 'stripe_invoice_id' }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const stripe = getStripe();
  let event;

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const admin = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await activateMembership(admin, event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscriptionStatus(admin, event.data.object);
        break;
      case 'invoice.paid':
        await recordInvoicePayment(admin, event.data.object, 'paid');
        break;
      case 'invoice.payment_failed':
        await recordInvoicePayment(admin, event.data.object, 'failed');
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`Error handling Stripe webhook event ${event.type}`, err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  return res.status(200).json({ received: true });
}
