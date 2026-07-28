import { getSupabaseAdmin, getUserFromRequest } from './supabaseAdmin.js';

export async function requireAdmin(req) {
  const user = await getUserFromRequest(req);
  if (!user) return null;

  const admin = getSupabaseAdmin();
  const { data } = await admin.from('admin_users').select('id').eq('profile_id', user.id).maybeSingle();
  if (!data) return null;

  return { user, admin };
}
