import { getStripe } from './_lib/stripe.js';
import { getSupabaseAdmin, getUserFromRequest } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const admin = getSupabaseAdmin();
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.stripe_customer_id) {
      return res.status(404).json({ error: 'No billing account found for this customer.' });
    }

    const stripe = getStripe();
    const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://www.cfhubuk.com';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/cleaning/dashboard/membership`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('create-portal-session error', err);
    return res.status(500).json({ error: 'Something went wrong opening billing portal. Please try again.' });
  }
}
