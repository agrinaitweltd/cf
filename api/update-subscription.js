import { getStripe, getPriceIdForTier } from './_lib/stripe.js';
import { getSupabaseAdmin, getUserFromRequest } from './_lib/supabaseAdmin.js';

const VALID_TIERS = ['bronze', 'silver', 'gold', 'platinum'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { tier } = req.body || {};
    if (!VALID_TIERS.includes(tier)) return res.status(400).json({ error: 'Invalid membership tier.' });

    const priceId = getPriceIdForTier(tier);
    if (!priceId) return res.status(500).json({ error: `No Stripe price configured for the ${tier} tier.` });

    const admin = getSupabaseAdmin();
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('id, membership_id, stripe_subscription_id')
      .eq('profile_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found.' });
    }

    const stripe = getStripe();
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    const currentItemId = stripeSubscription.items.data[0].id;

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      items: [{ id: currentItemId, price: priceId }],
      proration_behavior: 'create_prorations',
      metadata: { ...stripeSubscription.metadata, tier },
    });

    if (subscription.membership_id) {
      await admin.from('memberships').update({ tier }).eq('id', subscription.membership_id);
    }
    await admin.from('subscriptions').update({ stripe_price_id: priceId }).eq('id', subscription.id);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('update-subscription error', err);
    return res.status(500).json({ error: 'Something went wrong changing your membership. Please try again.' });
  }
}
