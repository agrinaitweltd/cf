import { getSupabaseAdmin, getUserFromRequest } from '../_lib/supabaseAdmin.js';
import { notify } from '../_lib/notify.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const admin = getSupabaseAdmin();
  const { action, bookingId, scheduledDate, scheduledTime } = req.body || {};
  const validActions = ['cancel', 'reschedule', 'rebook'];
  if (!validActions.includes(action)) return res.status(400).json({ error: 'Invalid action.' });
  if (!bookingId) return res.status(400).json({ error: 'bookingId is required.' });

  try {
    const { data: booking } = await admin.from('bookings').select('*').eq('id', bookingId).eq('profile_id', user.id).maybeSingle();
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    if (action === 'cancel') {
      if (booking.status !== 'upcoming') return res.status(400).json({ error: 'Only upcoming cleans can be cancelled.' });
      await admin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
      await notify(admin, { profileId: user.id, type: 'booking_cancelled', title: 'Clean cancelled', message: `Your clean scheduled for ${booking.scheduled_date} has been cancelled.` });
      return res.status(200).json({ success: true });
    }

    if (action === 'reschedule') {
      if (booking.status !== 'upcoming') return res.status(400).json({ error: 'Only upcoming cleans can be rescheduled.' });
      if (!scheduledDate) return res.status(400).json({ error: 'scheduledDate is required.' });
      await admin.from('bookings').update({ scheduled_date: scheduledDate, scheduled_time: scheduledTime || null }).eq('id', bookingId);
      await notify(admin, { profileId: user.id, type: 'booking_rescheduled', title: 'Clean rescheduled', message: `Your clean has been rescheduled to ${scheduledDate}${scheduledTime ? ` (${scheduledTime})` : ''}.` });
      return res.status(200).json({ success: true });
    }

    if (action === 'rebook') {
      if (!scheduledDate) return res.status(400).json({ error: 'scheduledDate is required.' });
      const { data: newBooking, error } = await admin
        .from('bookings')
        .insert({
          profile_id: user.id,
          membership_id: booking.membership_id,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime || booking.scheduled_time,
          status: 'upcoming',
        })
        .select()
        .single();
      if (error) throw error;
      await notify(admin, { profileId: user.id, type: 'booking_created', title: 'Clean scheduled', message: `A repeat clean has been scheduled for ${scheduledDate}.` });
      return res.status(200).json({ success: true, booking: newBooking });
    }
  } catch (err) {
    console.error('customer/booking-action error', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
