import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, fullName, password } = req.body || {};
  if (!token || !fullName || !password) {
    return res.status(400).json({ error: 'Token, full name and password are all required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const admin = getSupabaseAdmin();

  try {
    const { data: invite } = await admin
      .from('admin_users')
      .select('id, invite_email, activated, setup_token_expires_at')
      .eq('setup_token', token)
      .maybeSingle();

    if (!invite) return res.status(400).json({ error: 'This setup link is invalid.' });
    if (invite.activated) return res.status(400).json({ error: 'This setup link has already been used.' });
    if (!invite.setup_token_expires_at || new Date(invite.setup_token_expires_at) < new Date()) {
      return res.status(400).json({ error: 'This setup link has expired. Ask an existing admin to send a new invite.' });
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
      if (createError) throw createError;
      profileId = created.user.id;
    } else {
      const { error: updateError } = await admin.auth.admin.updateUserById(profileId, {
        password,
        user_metadata: { full_name: fullName },
      });
      if (updateError) throw updateError;
    }

    await admin.from('profiles').update({ full_name: fullName }).eq('id', profileId);

    const { error: activateError } = await admin
      .from('admin_users')
      .update({
        profile_id: profileId,
        full_name: fullName,
        activated: true,
        setup_token: null,
        setup_token_expires_at: null,
      })
      .eq('id', invite.id);
    if (activateError) throw activateError;

    await admin.from('audit_logs').insert({
      actor_email: invite.invite_email,
      action: 'admin_setup_completed',
      target_type: 'admin_users',
      target_id: invite.id,
      meta: { full_name: fullName },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('admin/setup error', err);
    return res.status(500).json({ error: 'Could not complete setup. Please try again or ask for a new invite.' });
  }
}
