import { getStripe } from './_lib/stripe.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';
import { notify, sendServiceEmail } from './_lib/notify.js';

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

async function getProfile(admin, profileId) {
  const { data } = await admin.from('profiles').select('email, full_name').eq('id', profileId).maybeSingle();
  return data;
}

async function activateMembership(admin, session) {
  const membershipId = session.metadata?.membership_id;
  const profileId = session.metadata?.supabase_user_id;
  const tier = session.metadata?.tier;
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

  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Clean Club';

  await notify(admin, {
    profileId,
    type: 'membership_activated',
    title: 'Membership activated',
    message: `Your ${tierLabel} membership is now active. Welcome to The Clean Club!`,
  });

  const profile = await getProfile(admin, profileId);
  if (profile?.email) {
    await sendServiceEmail({
      to: profile.email,
      subject: 'Your Clean Club membership is active',
      bodyHtml: `
        <h2 style="margin:0 0 16px;">Welcome to The Clean Club${profile.full_name ? `, ${profile.full_name}` : ''}!</h2>
        <p style="line-height:1.6;">Your <strong>${tierLabel}</strong> membership is now active. Your Direct Debit is confirming with your bank, which usually takes a few business days.</p>
        <p style="line-height:1.6;">You can view your membership, upcoming cleans and payments any time from your dashboard.</p>
        <p style="margin-top:24px;"><a href="https://www.cfhubuk.com/cleaning/dashboard" style="background:#0D0D0D;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Go to My Dashboard</a></p>
      `,
    });
  }
}

async function syncSubscriptionStatus(admin, subscription) {
  const status = subscription.status;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const { data: existing } = await admin
    .from('subscriptions')
    .select('profile_id, status')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  await admin
    .from('subscriptions')
    .update({ status, current_period_end: currentPeriodEnd, stripe_price_id: subscription.items?.data?.[0]?.price?.id })
    .eq('stripe_subscription_id', subscription.id);

  if (status === 'canceled') {
    const membershipId = subscription.metadata?.membership_id;
    if (membershipId) {
      await admin.from('memberships').update({ status: 'cancelled' }).eq('id', membershipId);
    }
    if (existing?.profile_id) {
      await notify(admin, {
        profileId: existing.profile_id,
        type: 'membership_cancelled',
        title: 'Membership cancelled',
        message: 'Your Clean Club membership has been cancelled. No further payments will be taken.',
      });
      const profile = await getProfile(admin, existing.profile_id);
      if (profile?.email) {
        await sendServiceEmail({
          to: profile.email,
          subject: 'Your Clean Club membership has been cancelled',
          bodyHtml: `
            <h2 style="margin:0 0 16px;">Membership cancelled</h2>
            <p style="line-height:1.6;">Your Clean Club membership has been cancelled and no further payments will be taken. We're sorry to see you go — you can rejoin any time from our website.</p>
          `,
        });
      }
    }
  } else if (existing?.profile_id && existing.status && existing.status !== status) {
    await notify(admin, {
      profileId: existing.profile_id,
      type: 'membership_updated',
      title: 'Membership updated',
      message: `Your membership status changed to "${status}".`,
    });
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

  const amount = ((invoice.amount_paid || invoice.amount_due || 0) / 100).toFixed(2);
  const profile = await getProfile(admin, subscription.profile_id);

  if (status === 'paid') {
    await notify(admin, {
      profileId: subscription.profile_id,
      type: 'payment_succeeded',
      title: 'Payment received',
      message: `We received your payment of £${amount}. Thank you!`,
    });
    if (profile?.email) {
      await sendServiceEmail({
        to: profile.email,
        subject: `Payment receipt — £${amount}`,
        bodyHtml: `
          <h2 style="margin:0 0 16px;">Payment received</h2>
          <p style="line-height:1.6;">We've received your Clean Club payment of <strong>£${amount}</strong>. Thank you!</p>
          <p style="line-height:1.6;">You can view and download this invoice any time from your dashboard's Payment History.</p>
          <p style="margin-top:24px;"><a href="https://www.cfhubuk.com/cleaning/dashboard/payments" style="background:#0D0D0D;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Payment History</a></p>
        `,
      });
    }
  } else {
    await notify(admin, {
      profileId: subscription.profile_id,
      type: 'payment_failed',
      title: 'Payment failed',
      message: `We couldn't collect your payment of £${amount}. Please check your payment details.`,
    });
    if (profile?.email) {
      await sendServiceEmail({
        to: profile.email,
        subject: 'Action needed: payment failed',
        bodyHtml: `
          <h2 style="margin:0 0 16px;">We couldn't collect your payment</h2>
          <p style="line-height:1.6;">A payment of <strong>£${amount}</strong> for your Clean Club membership could not be collected. Please check your payment details to avoid any interruption to your membership.</p>
          <p style="margin-top:24px;"><a href="https://www.cfhubuk.com/cleaning/dashboard/membership" style="background:#0D0D0D;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Manage Billing</a></p>
        `,
      });
    }
  }
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
