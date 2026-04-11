import { Resend } from 'resend';

function internalEmail({ name, email, phone, service, propertyType, postcode, budget, preferredContact, timeline, message }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#0D0D0D;padding:28px 40px;text-align:center;">
            <img src="https://www.cfhubuk.com/logo.png" alt="CF HUB UK" height="48" style="display:block;margin:0 auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 28px;color:#111111;">
            <h2 style="margin:0 0 4px;font-size:20px;color:#0D0D0D;">New Enquiry Received</h2>
            <p style="margin:0 0 28px;font-size:14px;color:#666666;">A customer has submitted an enquiry via cfhubuk.com</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:6px;overflow:hidden;">
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;width:140px;border-bottom:1px solid #eee;">Name</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${name}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Email</td>
                <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #eee;"><a href="mailto:${email}" style="color:#0D0D0D;">${email}</a></td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Phone</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Service</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${service}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Property Type</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${propertyType}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Postcode</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${postcode}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Budget</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${budget || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Preferred Contact</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${preferredContact}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Start Timeline</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${timeline}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;vertical-align:top;">Message</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;white-space:pre-wrap;">${message}</td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#999;">Reply directly to this email to respond to the customer.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#aaa;">CF HUB UK — enquiries@cfhubuk.com | cfhubuk.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function confirmationEmail({ name, service }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#0D0D0D;padding:28px 40px;text-align:center;">
            <img src="https://www.cfhubuk.com/logo.png" alt="CF HUB UK" height="48" style="display:block;margin:0 auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;color:#111111;text-align:center;">
            <div style="width:56px;height:56px;background:#f0f0f0;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#0D0D0D" stroke-width="1.5"/>
                <path d="M8 12l3 3 5-5" stroke="#0D0D0D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 style="margin:0 0 12px;font-size:22px;color:#0D0D0D;">Enquiry Received</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
              Hi ${name}, thank you for getting in touch.<br>We've received your enquiry for <strong>${service}</strong> and a member of our team will get back to you within one business day.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0;">
                  <a href="https://www.cfhubuk.com/services" style="display:inline-block;background:#0D0D0D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:6px;letter-spacing:0.3px;">Explore Our Services</a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#999999;">
              In the meantime, if you have any urgent queries please call us on <a href="tel:07960481933" style="color:#0D0D0D;font-weight:600;">07960 481933</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#aaa;">CF HUB UK — Property Improvement Experts</p>
            <p style="margin:4px 0 0;font-size:12px;color:#aaa;">enquiries@cfhubuk.com | <a href="https://www.cfhubuk.com" style="color:#aaa;">cfhubuk.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = (
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.RESEND ||
    ''
  ).trim();

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server email is not configured. Add RESEND_API_KEY (or RESEND_KEY/RESEND) in Vercel Environment Variables and redeploy.',
    });
  }

  const resend = new Resend(apiKey);
  const fromEmail = (
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    'CF HUB UK <onboarding@resend.dev>'
  ).trim();

  const { name, email, phone, service, propertyType, postcode, budget, preferredContact, timeline, message } = req.body ?? {};

  // Server-side validation
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof service !== 'string' || !service.trim() ||
    typeof propertyType !== 'string' || !propertyType.trim() ||
    typeof postcode !== 'string' || !postcode.trim() ||
    typeof preferredContact !== 'string' || !preferredContact.trim() ||
    typeof timeline !== 'string' || !timeline.trim() ||
    typeof message !== 'string' || !message.trim()
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    await Promise.all([
      // Notification to CF HUB UK
      resend.emails.send({
        from: fromEmail,
        to: 'enquiries@cfhubuk.com',
        replyTo: email,
        subject: `New Enquiry: ${service} — ${name}`,
        html: internalEmail({
          name,
          email,
          phone: phone?.trim(),
          service,
          propertyType,
          postcode,
          budget,
          preferredContact,
          timeline,
          message,
        }),
      }),
      // Confirmation to the customer
      resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "We've received your enquiry — CF HUB UK",
        html: confirmationEmail({ name, service }),
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error (contact):', err);
    const providerMessage =
      err?.message ||
      err?.error?.message ||
      err?.response?.data?.message ||
      '';
    return res.status(500).json({
      error: providerMessage
        ? `Email provider error: ${providerMessage}`
        : 'Failed to send email. Please try again.',
    });
  }
}
