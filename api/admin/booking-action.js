import { requireAdmin } from '../_lib/requireAdmin.js';
import { notify } from '../_lib/notify.js';

const VALID_ACTIONS = ['create', 'assign', 'complete', 'cancel', 'reschedule'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await requireAdmin(req);
  if (!ctx) return res.status(403).json({ error: 'Admin access required' });

  const { admin } = ctx;
  const { action, bookingId, profileId, membershipId, scheduledDate, scheduledTime, cleanerName } = req.body || {};

  if (!VALID_ACTIONS.includes(action)) return res.status(400).json({ error: 'Invalid action.' });

  try {
    if (action === 'create') {
      if (!profileId || !scheduledDate) return res.status(400).json({ error: 'profileId and scheduledDate are required.' });

      const { data: booking, error } = await admin
        .from('bookings')
        .insert({
          profile_id: profileId,
          membership_id: membershipId || null,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime || null,
          status: 'upcoming',
        })
        .select()
        .single();
      if (error) throw error;

      await notify(admin, {
        profileId,
        type: 'booking_created',
        title: 'Clean scheduled',
        message: `A clean has been scheduled for ${scheduledDate}${scheduledTime ? ` (${scheduledTime})` : ''}.`,
      });

      return res.status(200).json({ booking });
    }

    if (!bookingId) return res.status(400).json({ error: 'bookingId is required.' });

    const { data: existingBooking } = await admin.from('bookings').select('profile_id, scheduled_date').eq('id', bookingId).maybeSingle();
    if (!existingBooking) return res.status(404).json({ error: 'Booking not found.' });

    if (action === 'assign') {
      if (!cleanerName) return res.status(400).json({ error: 'cleanerName is required.' });

      let { data: cleaner } = await admin.from('cleaners').select('id').eq('full_name', cleanerName).maybeSingle();
      if (!cleaner) {
        const { data: newCleaner, error: cleanerError } = await admin.from('cleaners').insert({ full_name: cleanerName }).select().single();
        if (cleanerError) throw cleanerError;
        cleaner = newCleaner;
      }

      await admin.from('bookings').update({ assigned_cleaner_id: cleaner.id }).eq('id', bookingId);

      await notify(admin, {
        profileId: existingBooking.profile_id,
        type: 'cleaner_assigned',
        title: 'Cleaner assigned',
        message: `${cleanerName} has been assigned to your clean on ${existingBooking.scheduled_date}.`,
      });
    } else if (action === 'complete') {
      await admin.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
      await notify(admin, {
        profileId: existingBooking.profile_id,
        type: 'booking_completed',
        title: 'Clean completed',
        message: `Your clean on ${existingBooking.scheduled_date} has been marked complete.`,
      });
    } else if (action === 'cancel') {
      await admin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
      await notify(admin, {
        profileId: existingBooking.profile_id,
        type: 'booking_cancelled',
        title: 'Clean cancelled',
        message: `Your clean scheduled for ${existingBooking.scheduled_date} has been cancelled.`,
      });
    } else if (action === 'reschedule') {
      if (!scheduledDate) return res.status(400).json({ error: 'scheduledDate is required.' });
      await admin.from('bookings').update({ scheduled_date: scheduledDate, scheduled_time: scheduledTime || null }).eq('id', bookingId);
      await notify(admin, {
        profileId: existingBooking.profile_id,
        type: 'booking_rescheduled',
        title: 'Clean rescheduled',
        message: `Your clean has been rescheduled to ${scheduledDate}${scheduledTime ? ` (${scheduledTime})` : ''}.`,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('admin/booking-action error', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
