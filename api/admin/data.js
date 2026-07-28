import { requireAdmin } from '../_lib/requireAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await requireAdmin(req);
  if (!ctx) return res.status(403).json({ error: 'Admin access required' });

  const { admin } = ctx;

  try {
    const [profiles, memberships, subscriptions, bookings, payments, cleaners] = await Promise.all([
      admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(500),
      admin.from('memberships').select('*').order('created_at', { ascending: false }).limit(500),
      admin.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(500),
      admin.from('bookings').select('*').order('scheduled_date', { ascending: true }).limit(500),
      admin.from('payments').select('*').order('created_at', { ascending: false }).limit(500),
      admin.from('cleaners').select('*').order('full_name', { ascending: true }),
    ]);

    return res.status(200).json({
      profiles: profiles.data ?? [],
      memberships: memberships.data ?? [],
      subscriptions: subscriptions.data ?? [],
      bookings: bookings.data ?? [],
      payments: payments.data ?? [],
      cleaners: cleaners.data ?? [],
    });
  } catch (err) {
    console.error('admin/data error', err);
    return res.status(500).json({ error: 'Failed to load admin data' });
  }
}
