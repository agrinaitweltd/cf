import { Resend } from 'resend';

export async function notify(admin, { profileId, type, title, message }) {
  if (!profileId) return;
  const { error } = await admin.from('notifications').insert({
    profile_id: profileId,
    type,
    title,
    message,
  });
  if (error) console.error('Failed to create notification', error);
}

function wrapEmail(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EBEBEB;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EBEBEB;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
        <tr><td style="background:#0D0D0D;padding:32px 40px;text-align:center;">
          <img src="https://www.cfhubuk.com/logo2.png" alt="CF Hub UK" height="56" style="display:block;margin:0 auto;" />
        </td></tr>
        <tr><td style="padding:40px;color:#0D0D0D;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:24px 40px;background:#f7f7f7;text-align:center;">
          <p style="margin:0;font-size:12px;color:#888;">CF Hub UK &middot; enquiries@cfhubuk.com &middot; +44 (0) 7806 949497</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendServiceEmail({ to, subject, bodyHtml }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return null;

  const resend = new Resend(apiKey);
  const fromEmail = (
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    'CF HUB UK <noreply@cfhubuk.com>'
  ).trim();

  try {
    return await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: wrapEmail(bodyHtml),
    });
  } catch (err) {
    console.error('sendServiceEmail failed', err);
    return null;
  }
}
