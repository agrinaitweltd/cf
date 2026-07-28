import { requireAdmin } from '../_lib/requireAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await requireAdmin(req);
  if (!ctx) return res.status(403).json({ error: 'Admin access required' });

  const { admin } = ctx;

  try {
    const [profiles, memberships, subscriptions, bookings, payments, cleaners, coupons, reviews, supportTickets, adminUsers, auditLogs] = await Promise.all([
      admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(500),
      admin.from('memberships').select('*').order('created_at', { ascending: false }).limit(500),
      admin.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(500),
      admin.from('bookings').select('*').order('scheduled_date', { ascending: true }).limit(500),
      admin.from('payments').select('*').order('created_at', { ascending: false }).limit(500),
      admin.from('cleaners').select('*').order('full_name', { ascending: true }),
      admin.from('coupons').select('*').order('created_at', { ascending: false }).limit(200),
      admin.from('reviews').select('*').order('created_at', { ascending: false }).limit(200),
      admin.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(200),
      admin.from('admin_users').select('id, profile_id, invite_email, full_name, role, activated, created_at').order('created_at', { ascending: false }).limit(100),
      admin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    return res.status(200).json({
      profiles: profiles.data ?? [],
      memberships: memberships.data ?? [],
      subscriptions: subscriptions.data ?? [],
      bookings: bookings.data ?? [],
      payments: payments.data ?? [],
      cleaners: cleaners.data ?? [],
      coupons: coupons.data ?? [],
      reviews: reviews.data ?? [],
      supportTickets: supportTickets.data ?? [],
      adminUsers: adminUsers.data ?? [],
      auditLogs: auditLogs.data ?? [],
    });
  } catch (err) {
    console.error('admin/data error', err);
    return res.status(500).json({ error: 'Failed to load admin data' });
  }
}
