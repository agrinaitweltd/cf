import crypto from 'crypto';
import { requireAdmin } from '../_lib/requireAdmin.js';
import { sendServiceEmail } from '../_lib/notify.js';

const SETUP_TOKEN_TTL_HOURS = 48;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await requireAdmin(req);
  if (!ctx) return res.status(403).json({ error: 'Admin access required' });

  const { admin, user } = ctx;
  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  try {
    const { data: existing } = await admin
      .from('admin_users')
      .select('id, activated')
      .eq('invite_email', email)
      .maybeSingle();

    if (existing && existing.activated) {
      return res.status(400).json({ error: 'This person is already an activated admin.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SETUP_TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();

    if (existing) {
      await admin.from('admin_users').update({ setup_token: token, setup_token_expires_at: expiresAt }).eq('id', existing.id);
    } else {
      const { error: insertError } = await admin.from('admin_users').insert({
        invite_email: email,
        activated: false,
        setup_token: token,
        setup_token_expires_at: expiresAt,
      });
      if (insertError) throw insertError;
    }

    const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://www.cfhubuk.com';
    const setupUrl = `${siteUrl}/admin/setup?token=${token}`;

    await sendServiceEmail({
      to: email,
      subject: 'Set up your CF Hub UK admin account',
      bodyHtml: `
        <h2 style="margin:0 0 16px;">You've been invited as an admin</h2>
        <p style="margin:0 0 20px;line-height:1.6;">You've been invited to manage the CF Hub UK Clean Club admin dashboard. Click below to create your password and activate your account. This link expires in ${SETUP_TOKEN_TTL_HOURS} hours and can only be used once.</p>
        <p style="margin:0 0 24px;"><a href="${setupUrl}" style="display:inline-block;background:#0D0D0D;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Activate Admin Account</a></p>
        <p style="margin:0;font-size:13px;color:#888;">If the button doesn't work, copy this link: ${setupUrl}</p>
      `,
    });

    await admin.from('audit_logs').insert({
      actor_email: user.email,
      action: 'admin_invited',
      target_type: 'admin_users',
      target_id: email,
      meta: { invited_by: user.email },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('admin/invite error', err);
    return res.status(500).json({ error: 'Could not send invite. Please try again.' });
  }
}
