import { getStripe, getPriceIdForTier } from './_lib/stripe.js';
import { getSupabaseAdmin, getUserFromRequest } from './_lib/supabaseAdmin.js';

const VALID_TIERS = ['bronze', 'silver', 'gold', 'platinum'];
const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const VALID_TIMES = ['morning', 'afternoon', 'evening'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { tier, preferredDay, preferredTime, preferredStartDate, specialInstructions } = req.body || {};

    if (!VALID_TIERS.includes(tier)) return res.status(400).json({ error: 'Invalid membership tier.' });
    if (!VALID_DAYS.includes(preferredDay)) return res.status(400).json({ error: 'Invalid preferred day.' });
    if (!VALID_TIMES.includes(preferredTime)) return res.status(400).json({ error: 'Invalid preferred time.' });
    if (!preferredStartDate) return res.status(400).json({ error: 'Preferred start date is required.' });

    const priceId = getPriceIdForTier(tier);
    if (!priceId) return res.status(500).json({ error: `No Stripe price configured for the ${tier} tier.` });

    const stripe = getStripe();
    const admin = getSupabaseAdmin();

    const { data: profile } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user.id)
      .maybeSingle();

    // reuse an existing Stripe customer for this profile if one exists
    const { data: existingSubscription } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let customerId = existingSubscription?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const { data: membership, error: membershipError } = await admin
      .from('memberships')
      .insert({
        profile_id: user.id,
        tier,
        status: 'pending',
        preferred_day: preferredDay,
        preferred_time: preferredTime,
        preferred_start_date: preferredStartDate,
        special_instructions: specialInstructions || null,
      })
      .select('id')
      .single();

    if (membershipError) {
      console.error('Failed to create membership row', membershipError);
      return res.status(500).json({ error: 'Could not start your membership. Please try again.' });
    }

    const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://www.cfhubuk.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      ui_mode: 'embedded',
      customer: customerId,
      payment_method_types: ['bacs_debit'],
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${siteUrl}/cleaning/dashboard?checkout=success`,
      metadata: {
        supabase_user_id: user.id,
        membership_id: membership.id,
        tier,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          membership_id: membership.id,
          tier,
        },
      },
    });

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('create-checkout-session error', err);
    return res.status(500).json({ error: 'Something went wrong starting checkout. Please try again.' });
  }
}
