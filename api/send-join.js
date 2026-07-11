import { Resend } from 'resend';

function internalEmail({ name, email, phone, role, experience, location, availability, workType, certifications, message, cvName }) {
  const isCleaningRole = (role && role.toLowerCase().includes('cleaning')) || (workType && workType.toLowerCase().includes('cleaning'));
  const contactEmail = isCleaningRole ? 'info@cleanfreakshub.co.uk' : 'enquiries@cfhubuk.com';
  const companyLabel = isCleaningRole ? 'CF Hub & Co. Cleaning Services' : 'CF HUB UK';
  const companyTagline = isCleaningRole ? 'Professional Cleaning Services' : 'Property Improvement Experts';

  const rows = [
    ['Full Name',          name],
    ['Email',              `<a href="mailto:${email}" style="color:#0D0D0D;font-weight:600;">${email}</a>`],
    ['Phone',              phone || '<span style="color:#aaa;">Not provided</span>'],
    ['Role Applied',       `<span style="display:inline-block;background:#0D0D0D;color:#fff;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.4px;">${role}</span>`],
    ['Experience',         experience || '<span style="color:#aaa;">Not provided</span>'],
    ['Location',           location],
    ['Availability',       availability],
    ['Work Type',          workType],
    ['Qualifications',     certifications || '<span style="color:#aaa;">Not provided</span>'],
    ['CV Attached',        cvName ? `&#128206; ${cvName}` : '<span style="color:#aaa;">Not attached</span>'],
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Application — ${companyLabel}</title>
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
            <p style="margin:0;font-size:13px;color:#ffffff;font-weight:700;letter-spacing:0.5px;">&#128084;&nbsp; NEW JOB APPLICATION</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 48px 16px;">
            <h2 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#0D0D0D;letter-spacing:-0.5px;">Application from ${name}</h2>
            <p style="margin:0 0 32px;font-size:14px;color:#888888;">Submitted via cfhubuk.com/join &mdash; reply directly to this email to respond.</p>

            <!-- Details table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #EEEEEE;">
              ${rows.map(([label, value], i) => `
              <tr style="background:${i % 2 === 0 ? '#FAFAFA' : '#FFFFFF'};">
                <td style="padding:13px 18px;font-size:12px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:0.6px;width:160px;border-bottom:1px solid #F0F0F0;white-space:nowrap;">${label}</td>
                <td style="padding:13px 18px;font-size:14px;color:#111111;border-bottom:1px solid #F0F0F0;">${value}</td>
              </tr>`).join('')}
              <tr style="background:#FAFAFA;">
                <td style="padding:13px 18px;font-size:12px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:0.6px;vertical-align:top;border-bottom:none;white-space:nowrap;">About</td>
                <td style="padding:13px 18px;font-size:14px;color:#111111;line-height:1.7;white-space:pre-wrap;border-bottom:none;">${message}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Reply CTA -->
        <tr>
          <td style="padding:28px 48px 40px;text-align:center;">
            <a href="mailto:${email}?subject=Re: Your ${companyLabel} Application" style="display:inline-block;background:#0D0D0D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.4px;">Reply to ${name}</a>
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

function confirmationEmail({ name, role }) {
  const isCleaningRole = role && role.toLowerCase().includes('cleaning');
  const contactEmail = isCleaningRole ? 'info@cleanfreakshub.co.uk' : 'enquiries@cfhubuk.com';
  const companyLabel = isCleaningRole ? 'CF Hub & Co. Cleaning Services' : 'CF HUB UK';
  const companyTagline = isCleaningRole ? 'Professional Cleaning Services' : 'Property Improvement Experts';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Application Received — ${companyLabel}</title>
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

        <!-- Tick + headline -->
        <tr>
          <td style="padding:48px 48px 0;text-align:center;">
            <div style="width:64px;height:64px;background:#0D0D0D;border-radius:50%;margin:0 auto 28px;line-height:64px;text-align:center;font-size:28px;color:#ffffff;font-weight:900;">&#10003;</div>
            <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0D0D0D;letter-spacing:-0.5px;">Application Received!</h1>
            <p style="margin:0 0 8px;font-size:16px;color:#333333;line-height:1.6;">Hi <strong>${name}</strong>, thank you for applying.</p>
            <p style="margin:0 0 32px;font-size:15px;color:#666666;line-height:1.7;">Your application for the <strong style="color:#0D0D0D;">${role}</strong> position has been received and our team will review it shortly.</p>
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
                      <td style="padding-left:12px;font-size:14px;color:#444;line-height:1.6;">Our team reviews your CV and application in detail.</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:2px;"><div style="width:20px;height:20px;background:#0D0D0D;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:800;color:#fff;">2</div></td>
                      <td style="padding-left:12px;font-size:14px;color:#444;line-height:1.6;">If your skills match our requirements we'll be in touch to arrange a conversation.</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px 20px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:2px;"><div style="width:20px;height:20px;background:#0D0D0D;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:800;color:#fff;">3</div></td>
                      <td style="padding-left:12px;font-size:14px;color:#444;line-height:1.6;">We onboard you and get you started on projects across the UK.</td>
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
            <a href="https://www.cfhubuk.com/join" style="display:inline-block;background:#0D0D0D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:15px 36px;border-radius:8px;letter-spacing:0.4px;">View Open Roles</a>
          </td>
        </tr>

        <!-- Contact -->
        <tr>
          <td style="padding:0 48px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#999999;">Questions? Email us at <a href="mailto:${contactEmail}" style="color:#0D0D0D;font-weight:700;text-decoration:none;">${contactEmail}</a></p>
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

  const { name, email, phone, role, experience, location, availability, workType, certifications, message, cvBase64, cvName, cvMime } = req.body ?? {};

  // Use cleaning email for cleaning-related roles
  const isCleaningRole = (role && role.toLowerCase().includes('cleaning')) || (workType && workType.toLowerCase().includes('cleaning'));
  const targetAdminEmail = isCleaningRole ? cleaningAdminEmail : adminEmail;

  // Server-side validation
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof role !== 'string' || !role.trim() ||
    typeof location !== 'string' || !location.trim() ||
    typeof availability !== 'string' || !availability.trim() ||
    typeof workType !== 'string' || !workType.trim() ||
    typeof message !== 'string' || !message.trim()
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Build attachments array if CV was provided
  const attachments = cvBase64 && cvName
    ? [{ filename: cvName, content: cvBase64 }]
    : [];

  // Send both emails independently — a failure in one must not block the other
  const adminResult = await resend.emails.send({
    from: fromEmail,
    to: targetAdminEmail,
    replyTo: email,
    subject: `New Application: ${role} — ${name}`,
    html: internalEmail({
      name,
      email,
      phone: phone?.trim(),
      role,
      experience: experience?.trim(),
      location,
      availability,
      workType,
      certifications: certifications?.trim(),
      message,
      cvName,
    }),
    attachments,
  }).catch(err => {
    console.error('Resend admin email error (join):', err?.message ?? err);
    return null;
  });

  const customerResult = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Your application to CF HUB UK has been received',
    html: confirmationEmail({ name, role }),
  }).catch(err => {
    console.error('Resend customer email error (join):', err?.message ?? err);
    return null;
  });

  if (!adminResult && !customerResult) {
    return res.status(500).json({ error: 'Failed to send emails. Please try again or call us directly.' });
  }

  return res.status(200).json({ success: true });
}
