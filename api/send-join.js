import { Resend } from 'resend';

function internalEmail({ name, email, phone, role, experience, location, availability, workType, certifications, message, cvName }) {
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
            <h2 style="margin:0 0 4px;font-size:20px;color:#0D0D0D;">New Job Application</h2>
            <p style="margin:0 0 28px;font-size:14px;color:#666666;">A candidate has applied via cfhubuk.com/join</p>
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
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Role Applied</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${role}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Experience</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${experience || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Location</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${location}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Availability</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${availability}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Work Type</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${workType}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Qualifications</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${certifications || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;border-bottom:1px solid #eee;">CV</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;border-bottom:1px solid #eee;">${cvName ? `${cvName} (attached)` : 'Not provided'}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#555;vertical-align:top;">About</td>
                <td style="padding:12px 16px;font-size:14px;color:#111;white-space:pre-wrap;">${message}</td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#999;">Reply directly to this email to respond to the applicant.</p>
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

function confirmationEmail({ name, role }) {
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
            <h2 style="margin:0 0 12px;font-size:22px;color:#0D0D0D;">Application Received!</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
              Hi ${name}, thank you for applying for the <strong>${role}</strong> position at CF HUB UK.<br>
              We'll review your application and get back to you as soon as possible.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0;">
                  <a href="https://www.cfhubuk.com/join" style="display:inline-block;background:#0D0D0D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:6px;letter-spacing:0.3px;">View Open Roles</a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#999999;">
              For any queries, contact us at <a href="mailto:enquiries@cfhubuk.com" style="color:#0D0D0D;font-weight:600;">enquiries@cfhubuk.com</a>
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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server email is not configured. Please try again later.' });
  }

  const resend = new Resend(apiKey);

  const { name, email, phone, role, experience, location, availability, workType, certifications, message, cvBase64, cvName, cvMime } = req.body ?? {};

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

  try {
    await Promise.all([
      // Notification to CF HUB UK (with CV attached)
      resend.emails.send({
        from: 'CF HUB UK <noreply@cfhubuk.com>',
        to: 'enquiries@cfhubuk.com',
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
      }),
      // Confirmation to the applicant
      resend.emails.send({
        from: 'CF HUB UK <noreply@cfhubuk.com>',
        to: email,
        subject: 'Your application to CF HUB UK has been received',
        html: confirmationEmail({ name, role }),
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error (join):', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
}
