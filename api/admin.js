import crypto from 'crypto';
import { requireAdmin } from './_lib/requireAdmin.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';
import { getStripe, getPriceIdForTier } from './_lib/stripe.js';
import { notify, sendServiceEmail } from './_lib/notify.js';

const VALID_TIERS = ['bronze', 'silver', 'gold', 'platinum'];
const SETUP_TOKEN_TTL_HOURS = 48;

async function handleBooking(admin, body) {
  const { action, bookingId, profileId, membershipId, scheduledDate, scheduledTime, cleanerName } = body;
  const validActions = ['create', 'assign', 'complete', 'cancel', 'reschedule'];
  if (!validActions.includes(action)) throw { status: 400, message: 'Invalid action.' };

  if (action === 'create') {
    if (!profileId || !scheduledDate) throw { status: 400, message: 'profileId and scheduledDate are required.' };
    const { data: booking, error } = await admin
      .from('bookings')
      .insert({ profile_id: profileId, membership_id: membershipId || null, scheduled_date: scheduledDate, scheduled_time: scheduledTime || null, status: 'upcoming' })
      .select()
      .single();
    if (error) throw { status: 500, message: 'Could not create booking.' };
    await notify(admin, { profileId, type: 'booking_created', title: 'Clean scheduled', message: `A clean has been scheduled for ${scheduledDate}${scheduledTime ? ` (${scheduledTime})` : ''}.` });
    return { booking };
  }

  if (!bookingId) throw { status: 400, message: 'bookingId is required.' };
  const { data: existingBooking } = await admin.from('bookings').select('profile_id, scheduled_date').eq('id', bookingId).maybeSingle();
  if (!existingBooking) throw { status: 404, message: 'Booking not found.' };

  if (action === 'assign') {
    if (!cleanerName) throw { status: 400, message: 'cleanerName is required.' };
    let { data: cleaner } = await admin.from('cleaners').select('id').eq('full_name', cleanerName).maybeSingle();
    if (!cleaner) {
      const { data: newCleaner, error: cleanerError } = await admin.from('cleaners').insert({ full_name: cleanerName }).select().single();
      if (cleanerError) throw { status: 500, message: 'Could not save cleaner.' };
      cleaner = newCleaner;
    }
    await admin.from('bookings').update({ assigned_cleaner_id: cleaner.id }).eq('id', bookingId);
    await notify(admin, { profileId: existingBooking.profile_id, type: 'cleaner_assigned', title: 'Cleaner assigned', message: `${cleanerName} has been assigned to your clean on ${existingBooking.scheduled_date}.` });
  } else if (action === 'complete') {
    await admin.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
    await notify(admin, { profileId: existingBooking.profile_id, type: 'booking_completed', title: 'Clean completed', message: `Your clean on ${existingBooking.scheduled_date} has been marked complete.` });
  } else if (action === 'cancel') {
    await admin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    await notify(admin, { profileId: existingBooking.profile_id, type: 'booking_cancelled', title: 'Clean cancelled', message: `Your clean scheduled for ${existingBooking.scheduled_date} has been cancelled.` });
  } else if (action === 'reschedule') {
    if (!scheduledDate) throw { status: 400, message: 'scheduledDate is required.' };
    await admin.from('bookings').update({ scheduled_date: scheduledDate, scheduled_time: scheduledTime || null }).eq('id', bookingId);
    await notify(admin, { profileId: existingBooking.profile_id, type: 'booking_rescheduled', title: 'Clean rescheduled', message: `Your clean has been rescheduled to ${scheduledDate}${scheduledTime ? ` (${scheduledTime})` : ''}.` });
  }
  return { success: true };
}

async function handleCustomer(admin, user, body) {
  const { action, profileId, updates } = body;
  if (!profileId) throw { status: 400, message: 'profileId is required.' };

  if (action === 'update') {
    const allowed = ['full_name', 'phone', 'address', 'postcode', 'emergency_contact'];
    const payload = {};
    for (const key of allowed) {
      if (updates && key in updates) payload[key] = updates[key];
    }
    if (Object.keys(payload).length === 0) throw { status: 400, message: 'No valid fields to update.' };
    const { error } = await admin.from('profiles').update(payload).eq('id', profileId);
    if (error) throw { status: 500, message: 'Could not update customer.' };
    return { success: true };
  }

  if (action === 'delete') {
    if (profileId === user.id) throw { status: 400, message: "You can't delete your own account from here." };
    const { error } = await admin.auth.admin.deleteUser(profileId);
    if (error) throw { status: 500, message: 'Could not delete customer.' };
    return { success: true };
  }

  throw { status: 400, message: 'Invalid action.' };
}

async function handleMembership(admin, body) {
  const { action, membershipId, tier } = body;
  const validActions = ['change_tier', 'cancel', 'pause', 'resume'];
  if (!validActions.includes(action)) throw { status: 400, message: 'Invalid action.' };
  if (!membershipId) throw { status: 400, message: 'membershipId is required.' };

  const { data: membership } = await admin.from('memberships').select('id, profile_id, tier').eq('id', membershipId).maybeSingle();
  if (!membership) throw { status: 404, message: 'Membership not found.' };

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('id, stripe_subscription_id')
    .eq('membership_id', membershipId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const stripe = getStripe();

  if (action === 'change_tier') {
    if (!VALID_TIERS.includes(tier)) throw { status: 400, message: 'Invalid tier.' };
    const priceId = getPriceIdForTier(tier);
    if (!priceId) throw { status: 500, message: `No Stripe price configured for the ${tier} tier.` };
    if (subscription?.stripe_subscription_id) {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [{ id: stripeSub.items.data[0].id, price: priceId }],
        proration_behavior: 'create_prorations',
        metadata: { ...stripeSub.metadata, tier },
      });
      await admin.from('subscriptions').update({ stripe_price_id: priceId }).eq('id', subscription.id);
    }
    await admin.from('memberships').update({ tier }).eq('id', membershipId);
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
    await notify(admin, { profileId: membership.profile_id, type: 'membership_updated', title: 'Membership plan changed', message: `Your membership was switched to the ${tierLabel} plan by our team.` });
  } else if (action === 'cancel') {
    if (subscription?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      await admin.from('subscriptions').update({ status: 'canceled' }).eq('id', subscription.id);
    }
    await admin.from('memberships').update({ status: 'cancelled' }).eq('id', membershipId);
    await notify(admin, { profileId: membership.profile_id, type: 'membership_cancelled', title: 'Membership cancelled', message: 'Your Clean Club membership has been cancelled by our team.' });
  } else if (action === 'pause') {
    if (subscription?.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, { pause_collection: { behavior: 'void' } });
    }
    await admin.from('memberships').update({ status: 'paused' }).eq('id', membershipId);
    await notify(admin, { profileId: membership.profile_id, type: 'membership_updated', title: 'Membership paused', message: 'Your Clean Club membership has been paused by our team. No payments will be taken while paused.' });
  } else if (action === 'resume') {
    if (subscription?.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, { pause_collection: '' });
    }
    await admin.from('memberships').update({ status: 'active' }).eq('id', membershipId);
    await notify(admin, { profileId: membership.profile_id, type: 'membership_updated', title: 'Membership resumed', message: 'Your Clean Club membership has been resumed.' });
  }
  return { success: true };
}

async function handleRefund(admin, body) {
  const { paymentId } = body;
  if (!paymentId) throw { status: 400, message: 'paymentId is required.' };

  const { data: payment } = await admin.from('payments').select('id, profile_id, stripe_invoice_id, amount, status').eq('id', paymentId).maybeSingle();
  if (!payment) throw { status: 404, message: 'Payment not found.' };
  if (payment.status !== 'paid') throw { status: 400, message: 'Only successful payments can be refunded.' };
  if (!payment.stripe_invoice_id) throw { status: 400, message: 'No Stripe invoice reference for this payment.' };

  const stripe = getStripe();
  const invoice = await stripe.invoices.retrieve(payment.stripe_invoice_id);
  const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;
  if (!paymentIntentId) throw { status: 400, message: 'No payment reference found for this invoice.' };

  await stripe.refunds.create({ payment_intent: paymentIntentId });
  await admin.from('payments').update({ status: 'refunded' }).eq('id', paymentId);
  await notify(admin, { profileId: payment.profile_id, type: 'payment_refunded', title: 'Payment refunded', message: `Your payment of £${Number(payment.amount).toFixed(2)} has been refunded.` });
  return { success: true };
}

async function handleStaff(admin, body) {
  const { action, cleanerId, fullName, email, phone } = body;
  const validActions = ['create', 'update', 'deactivate', 'activate'];
  if (!validActions.includes(action)) throw { status: 400, message: 'Invalid action.' };

  if (action === 'create') {
    if (!fullName) throw { status: 400, message: 'fullName is required.' };
    const { error } = await admin.from('cleaners').insert({ full_name: fullName, email: email || null, phone: phone || null });
    if (error) throw { status: 500, message: 'Could not create staff member.' };
    return { success: true };
  }

  if (!cleanerId) throw { status: 400, message: 'cleanerId is required.' };
  if (action === 'update') {
    const payload = {};
    if (fullName !== undefined) payload.full_name = fullName;
    if (email !== undefined) payload.email = email;
    if (phone !== undefined) payload.phone = phone;
    const { error } = await admin.from('cleaners').update(payload).eq('id', cleanerId);
    if (error) throw { status: 500, message: 'Could not update staff member.' };
  } else if (action === 'deactivate') {
    await admin.from('cleaners').update({ active: false }).eq('id', cleanerId);
  } else if (action === 'activate') {
    await admin.from('cleaners').update({ active: true }).eq('id', cleanerId);
  }
  return { success: true };
}

async function handleCoupon(admin, body) {
  const { action, couponId, code, description, discountPercent, expiresAt, usageLimit } = body;
  const validActions = ['create', 'update', 'deactivate', 'activate', 'delete'];
  if (!validActions.includes(action)) throw { status: 400, message: 'Invalid action.' };

  if (action === 'create') {
    if (!code || !discountPercent) throw { status: 400, message: 'code and discountPercent are required.' };
    const { error } = await admin.from('coupons').insert({
      code: code.toUpperCase(),
      description: description || null,
      discount_percent: discountPercent,
      expires_at: expiresAt || null,
      usage_limit: usageLimit || null,
    });
    if (error) throw { status: 500, message: 'Could not create coupon. The code may already exist.' };
    return { success: true };
  }

  if (!couponId) throw { status: 400, message: 'couponId is required.' };
  if (action === 'update') {
    const payload = {};
    if (description !== undefined) payload.description = description;
    if (discountPercent !== undefined) payload.discount_percent = discountPercent;
    if (expiresAt !== undefined) payload.expires_at = expiresAt;
    if (usageLimit !== undefined) payload.usage_limit = usageLimit;
    await admin.from('coupons').update(payload).eq('id', couponId);
  } else if (action === 'deactivate') {
    await admin.from('coupons').update({ active: false }).eq('id', couponId);
  } else if (action === 'activate') {
    await admin.from('coupons').update({ active: true }).eq('id', couponId);
  } else if (action === 'delete') {
    await admin.from('coupons').delete().eq('id', couponId);
  }
  return { success: true };
}

async function handleReview(admin, body) {
  const { action, reviewId } = body;
  const validActions = ['hide', 'publish', 'delete'];
  if (!validActions.includes(action)) throw { status: 400, message: 'Invalid action.' };
  if (!reviewId) throw { status: 400, message: 'reviewId is required.' };

  if (action === 'hide') await admin.from('reviews').update({ status: 'hidden' }).eq('id', reviewId);
  else if (action === 'publish') await admin.from('reviews').update({ status: 'published' }).eq('id', reviewId);
  else if (action === 'delete') await admin.from('reviews').delete().eq('id', reviewId);
  return { success: true };
}

async function handleSupportTicket(admin, body) {
  const { action, ticketId, status, adminReply } = body;
  if (!ticketId) throw { status: 400, message: 'ticketId is required.' };
  const { data: ticket } = await admin.from('support_tickets').select('profile_id, subject').eq('id', ticketId).maybeSingle();
  if (!ticket) throw { status: 404, message: 'Ticket not found.' };

  const payload = { updated_at: new Date().toISOString() };
  if (status) payload.status = status;
  if (adminReply !== undefined) payload.admin_reply = adminReply;

  const { error } = await admin.from('support_tickets').update(payload).eq('id', ticketId);
  if (error) throw { status: 500, message: 'Could not update ticket.' };

  if (action === 'reply' && adminReply) {
    await notify(admin, { profileId: ticket.profile_id, type: 'support_reply', title: `Reply to: ${ticket.subject}`, message: adminReply });
  }
  return { success: true };
}

async function handleBroadcast(admin, body) {
  const { title, message } = body;
  if (!title || !message) throw { status: 400, message: 'title and message are required.' };
  const { data: profiles } = await admin.from('profiles').select('id');
  const rows = (profiles ?? []).map(p => ({ profile_id: p.id, type: 'broadcast', title, message }));
  if (rows.length) {
    const { error } = await admin.from('notifications').insert(rows);
    if (error) throw { status: 500, message: 'Could not send broadcast.' };
  }
  return { success: true, recipients: rows.length };
}

async function handleAdminRole(admin, user, body) {
  const { action, adminId } = body;
  const validActions = ['revoke', 'restore'];
  if (!validActions.includes(action)) throw { status: 400, message: 'Invalid action.' };
  if (!adminId) throw { status: 400, message: 'adminId is required.' };

  const { data: target } = await admin.from('admin_users').select('profile_id').eq('id', adminId).maybeSingle();
  if (target?.profile_id === user.id && action === 'revoke') {
    throw { status: 400, message: "You can't revoke your own admin access." };
  }

  if (action === 'revoke') await admin.from('admin_users').update({ activated: false }).eq('id', adminId);
  else if (action === 'restore') await admin.from('admin_users').update({ activated: true }).eq('id', adminId);

  await admin.from('audit_logs').insert({
    actor_email: user.email,
    action: `admin_${action}`,
    target_type: 'admin_users',
    target_id: adminId,
  });
  return { success: true };
}

async function handleInvite(admin, user, body) {
  const { email } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw { status: 400, message: 'A valid email address is required.' };
  }

  const { data: existing } = await admin.from('admin_users').select('id, activated').eq('invite_email', email).maybeSingle();
  if (existing && existing.activated) {
    throw { status: 400, message: 'This person is already an activated admin.' };
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
    if (insertError) throw { status: 500, message: 'Could not create invite.' };
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

  return { success: true };
}

async function handleSetup(body) {
  const { token, fullName, password } = body;
  if (!token || !fullName || !password) throw { status: 400, message: 'Token, full name and password are all required.' };
  if (password.length < 8) throw { status: 400, message: 'Password must be at least 8 characters.' };

  const admin = getSupabaseAdmin();

  const { data: invite } = await admin
    .from('admin_users')
    .select('id, invite_email, activated, setup_token_expires_at')
    .eq('setup_token', token)
    .maybeSingle();

  if (!invite) throw { status: 400, message: 'This setup link is invalid.' };
  if (invite.activated) throw { status: 400, message: 'This setup link has already been used.' };
  if (!invite.setup_token_expires_at || new Date(invite.setup_token_expires_at) < new Date()) {
    throw { status: 400, message: 'This setup link has expired. Ask an existing admin to send a new invite.' };
  }

  const { data: existingUser } = await admin.auth.admin.listUsers({ page: 1, perPage: 1, email: invite.invite_email });
  let profileId = existingUser?.users?.[0]?.id ?? null;

  if (!profileId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: invite.invite_email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createError) throw { status: 500, message: createError.message };
    profileId = created.user.id;
  } else {
    const { error: updateError } = await admin.auth.admin.updateUserById(profileId, {
      password,
      user_metadata: { full_name: fullName },
    });
    if (updateError) throw { status: 500, message: updateError.message };
  }

  await admin.from('profiles').update({ full_name: fullName }).eq('id', profileId);

  const { error: activateError } = await admin
    .from('admin_users')
    .update({ profile_id: profileId, full_name: fullName, activated: true, setup_token: null, setup_token_expires_at: null })
    .eq('id', invite.id);
  if (activateError) throw { status: 500, message: activateError.message };

  await admin.from('audit_logs').insert({
    actor_email: invite.invite_email,
    action: 'admin_setup_completed',
    target_type: 'admin_users',
    target_id: invite.id,
    meta: { full_name: fullName },
  });

  return { success: true };
}

async function handleData(admin) {
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

  return {
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
  };
}

export default async function handler(req, res) {
  // Public, unauthenticated: completing first-time admin setup from an emailed link.
  if (req.method === 'POST' && req.body && req.body.mode === 'setup') {
    try {
      const result = await handleSetup(req.body);
      return res.status(200).json(result);
    } catch (err) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      console.error('admin setup error', err);
      return res.status(500).json({ error: 'Could not complete setup. Please try again or ask for a new invite.' });
    }
  }

  const ctx = await requireAdmin(req);
  if (!ctx) return res.status(403).json({ error: 'Admin access required' });
  const { admin, user } = ctx;

  if (req.method === 'GET') {
    try {
      const data = await handleData(admin);
      return res.status(200).json(data);
    } catch (err) {
      console.error('admin data error', err);
      return res.status(500).json({ error: 'Failed to load admin data' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resource, ...body } = req.body || {};

  try {
    let result;
    if (resource === 'booking') result = await handleBooking(admin, body);
    else if (resource === 'customer') result = await handleCustomer(admin, user, body);
    else if (resource === 'membership') result = await handleMembership(admin, body);
    else if (resource === 'refund') result = await handleRefund(admin, body);
    else if (resource === 'staff') result = await handleStaff(admin, body);
    else if (resource === 'coupon') result = await handleCoupon(admin, body);
    else if (resource === 'review') result = await handleReview(admin, body);
    else if (resource === 'support_ticket') result = await handleSupportTicket(admin, body);
    else if (resource === 'broadcast') result = await handleBroadcast(admin, body);
    else if (resource === 'admin_role') result = await handleAdminRole(admin, user, body);
    else if (resource === 'invite') result = await handleInvite(admin, user, body);
    else return res.status(400).json({ error: 'Invalid resource.' });

    return res.status(200).json(result);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error('admin action error', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
