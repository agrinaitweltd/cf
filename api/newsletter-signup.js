import { sendServiceEmail } from './_lib/notify.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const adminEmail = (process.env.CLEANING_ADMIN_EMAIL || 'info@cleanfreakshub.co.uk').trim();

  await sendServiceEmail({
    to: adminEmail,
    subject: `New Clean Club promo signup: ${email}`,
    bodyHtml: `
      <h2 style="margin:0 0 16px;">New 10% off signup</h2>
      <p style="margin:0 0 12px;">Email: <strong>${email}</strong></p>
      <p style="margin:0;color:#888;font-size:13px;">Source: ${source || 'unknown'}</p>
    `,
  });

  return res.status(200).json({ success: true });
}
