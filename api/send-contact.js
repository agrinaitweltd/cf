import { Resend } from 'resend';

function internalEmail({ name, email, phone, service, propertyType, postcode, budget, preferredContact, timeline, message }) {
  const isCleaningService = service && service.toLowerCase().includes('cleaning');
  const contactEmail = isCleaningService ? 'info@cleanfreakshub.co.uk' : 'enquiries@cfhubuk.com';
  const companyLabel = isCleaningService ? 'CF Hub & Co. Cleaning Services' : 'CF HUB UK';
  const companyTagline = isCleaningService ? 'Professional Cleaning Services' : 'Property Improvement Experts';

  const rows = [
    ['Full Name',          name],
    ['Email',              `<a href="mailto:${email}" style="color:#0D0D0D;font-weight:600;">${email}</a>`],
    ['Phone',              phone || '<span style="color:#aaa;">Not provided</span>'],
    ['Service Required',   `<span style="display:inline-block;background:#0D0D0D;color:#fff;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.4px;">${service}</span>`],
    ['Property Type',      propertyType],
    ['Postcode',           postcode],
    ['Budget',             budget || '<span style="color:#aaa;">Not provided</span>'],
    ['Preferred Contact',  preferredContact],
    ['Start Timeline',     timeline],
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Enquiry — ${companyLabel}</title>
</head>
<body style="margin:0;padding:0;background:#EBEBEB;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EBEBEB;padding:48px 16px 64px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:#0D0D0D;padding:36px 48px 32px;text-align:center;">
            <img src="https://www.cfhubuk.com/logo.png" alt="${companyLabel}" height="72" style="display:block;margin:0 auto 16px;" />
            <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);font-weight:600;">${companyTagline}</p>
          </td>
        </tr>

        <!-- Alert bar -->
        <tr>
          <td style="background:#1A1A1A;padding:14px 48px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#ffffff;font-weight:700;letter-spacing:0.5px;">&#128276;&nbsp; NEW CUSTOMER ENQUIRY</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 48px 16px;">
            <h2 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#0D0D0D;letter-spacing:-0.5px;">Enquiry from ${name}</h2>
            <p style="margin:0 0 32px;font-size:14px;color:#888888;">Submitted via cfhubuk.com &mdash; reply directly to this email to respond.</p>

            <!-- Details table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #EEEEEE;">
              ${rows.map(([label, value], i) => `
              <tr style="background:${i % 2 === 0 ? '#FAFAFA' : '#FFFFFF'};">
                <td style="padding:13px 18px;font-size:12px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:0.6px;width:160px;border-bottom:1px solid #F0F0F0;white-space:nowrap;">${label}</td>
                <td style="padding:13px 18px;font-size:14px;color:#111111;border-bottom:1px solid #F0F0F0;">${value}</td>
              </tr>`).join('')}
              <tr style="background:#FAFAFA;">
                <td style="padding:13px 18px;font-size:12px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:0.6px;vertical-align:top;border-bottom:none;white-space:nowrap;">Message</td>
                <td style="padding:13px 18px;font-size:14px;color:#111111;line-height:1.7;white-space:pre-wrap;border-bottom:none;">${message}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Reply CTA -->
        <tr>
          <td style="padding:28px 48px 40px;text-align:center;">
            <a href="mailto:${email}?subject=Re: Your ${companyLabel} Enquiry" style="display:inline-block;background:#0D0D0D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.4px;">Reply to ${name}</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F5F5F5;padding:20px 48px;text-align:center;border-top:1px solid #EEEEEE;">
            <p style="margin:0 0 4px;font-size:12px;color:#AAAAAA;font-weight:600;letter-spacing:1px;text-transform:uppercase;">${companyLabel}</p>
            <p style="margin:0;font-size:12px;color:#CCCCCC;">
              <a href="mailto:${contactEmail}" style="color:#AAAAAA;text-decoration:none;">${contactEmail}</a>
              &nbsp;&middot;&nbsp;
              <a href="https://www.cfhubuk.com" style="color:#AAAAAA;text-decoration:none;">cfhubuk.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function confirmationEmail({ name, service }) {
  const isCleaningService = service && service.toLowerCase().includes('cleaning');
  const contactEmail = isCleaningService ? 'info@cleanfreakshub.co.uk' : 'enquiries@cfhubuk.com';
  const companyLabel = isCleaningService ? 'CF Hub & Co. Cleaning Services' : 'CF HUB UK';
  const companyTagline = isCleaningService ? 'Professional Cleaning Services' : 'Property Improvement Experts';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Enquiry Received — ${companyLabel}</title>
</head>
<body style="margin:0;padding:0;background:#EBEBEB;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EBEBEB;padding:48px 16px 64px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:#0D0D0D;padding:40px 48px 36px;text-align:center;">
            <img src="https://www.cfhubuk.com/logo.png" alt="${companyLabel}" height="72" style="display:block;margin:0 auto 16px;" />
            <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);font-weight:600;">${companyTagline}</p>
          </td>
        </tr>

        <!-- Tick icon + headline -->
        <tr>
          <td style="padding:48px 48px 0;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:#0D0D0D;width:64px;height:64px;border-radius:50%;text-align:center;vertical-align:middle;">
                  <img src="https://www.cfhubuk.com/logo.png" alt="" width="0" height="0" style="display:none;" />
                  &#10003;
                </td>
              </tr>
            </table>
            <!-- fallback tick as text since SVG unreliable in some clients -->
            <div style="width:64px;height:64px;background:#0D0D0D;border-radius:50%;margin:0 auto 28px;line-height:64px;text-align:center;font-size:28px;color:#ffffff;font-weight:900;">&#10003;</div>
            <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0D0D0D;letter-spacing:-0.5px;">Enquiry Received!</h1>
            <p style="margin:0 0 8px;font-size:16px;color:#333333;line-height:1.6;">Hi <strong>${name}</strong>, thanks for getting in touch.</p>
            <p style="margin:0 0 32px;font-size:15px;color:#666666;line-height:1.7;">We've received your enquiry for <strong style="color:#0D0D0D;">${service}</strong> and a member of our team will be in contact within one business day.</p>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="padding:0 48px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;border-radius:10px;overflow:hidden;">
              <tr><td style="padding:20px 24px 4px;"><p style="margin:0;font-size:11px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:1.5px;">What happens next</p></td></tr>
              <tr>
                <td style="padding:12px 24px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:2px;"><div style="width:20px;height:20px;background:#0D0D0D;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:800;color:#fff;">1</div></td>
                      <td style="padding-left:12px;font-size:14px;color:#444;line-height:1.6;">Our team reviews your enquiry &amp; checks availability.</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:2px;"><div style="width:20px;height:20px;background:#0D0D0D;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:800;color:#fff;">2</div></td>
                      <td style="padding-left:12px;font-size:14px;color:#444;line-height:1.6;">We'll contact you via your preferred method to discuss your project.</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px 20px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:2px;"><div style="width:20px;height:20px;background:#0D0D0D;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:800;color:#fff;">3</div></td>
                      <td style="padding-left:12px;font-size:14px;color:#444;line-height:1.6;">We provide a free, no-obligation quote tailored to your needs.</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 48px 20px;text-align:center;">
            <a href="https://www.cfhubuk.com/services" style="display:inline-block;background:#0D0D0D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:15px 36px;border-radius:8px;letter-spacing:0.4px;">Explore Our Services</a>
          </td>
        </tr>

        <!-- Urgent contact -->
        <tr>
          <td style="padding:0 48px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#999999;">Need to speak to someone urgently? Call us on <a href="tel:07960481933" style="color:#0D0D0D;font-weight:700;text-decoration:none;">07960 481933</a></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F5F5F5;padding:20px 48px;text-align:center;border-top:1px solid #EEEEEE;">
            <p style="margin:0 0 4px;font-size:12px;color:#AAAAAA;font-weight:600;letter-spacing:1px;text-transform:uppercase;">${companyLabel}</p>
            <p style="margin:0;font-size:12px;color:#CCCCCC;">
              <a href="mailto:${contactEmail}" style="color:#AAAAAA;text-decoration:none;">${contactEmail}</a>
              &nbsp;&middot;&nbsp;
              <a href="https://www.cfhubuk.com" style="color:#AAAAAA;text-decoration:none;">cfhubuk.com</a>
            </p>
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
    'CF HUB UK <noreply@cfhubuk.com>'
  ).trim();
  const adminEmail = (
    process.env.ADMIN_EMAIL || 'enquiries@cfhubuk.com'
  ).trim();
  const cleaningAdminEmail = (
    process.env.CLEANING_ADMIN_EMAIL || 'info@cleanfreakshub.co.uk'
  ).trim();

  const { name, email, phone, service, propertyType, postcode, budget, preferredContact, timeline, message } = req.body ?? {};

  // Use cleaning email for cleaning-related services
  const isCleaningService = service && service.toLowerCase().includes('cleaning');
  const targetAdminEmail = isCleaningService ? cleaningAdminEmail : adminEmail;

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

  // Send both emails independently — a failure in one must not block the other
  const adminResult = await resend.emails.send({
    from: fromEmail,
    to: targetAdminEmail,
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
  }).catch(err => {
    console.error('Resend admin email error (contact):', err?.message ?? err);
    return null;
  });

  const customerResult = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "We've received your enquiry — CF HUB UK",
    html: confirmationEmail({ name, service }),
  }).catch(err => {
    console.error('Resend customer email error (contact):', err?.message ?? err);
    return null;
  });

  if (!adminResult && !customerResult) {
    return res.status(500).json({ error: 'Failed to send emails. Please try again or call us directly.' });
  }

  return res.status(200).json({ success: true });
}
