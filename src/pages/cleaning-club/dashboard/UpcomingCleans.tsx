import { useState } from 'react'
import { useMembershipData } from './useMembershipData'
import { supabase } from '../../../lib/supabase'
import styles from './Dashboard.module.css'
import tableStyles from './DataTable.module.css'

const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Upcoming',
  in_progress: 'Cleaner En Route / Onsite',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

async function postBookingAction(body: Record<string, unknown>) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  const res = await fetch('/api/customer/booking-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Something went wrong.')
  return json
}

export default function UpcomingCleans() {
  const { loading, bookings, reviews, refresh } = useMembershipData()
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')
  const [rescheduleTarget, setRescheduleTarget] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [reviewTarget, setReviewTarget] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const upcoming = bookings.filter(b => b.status === 'upcoming' || b.status === 'in_progress')
  const history = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')
  const list = tab === 'upcoming' ? upcoming : history
  const reviewedBookingIds = new Set(reviews.map(r => r.booking_id))

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Cancel this clean?')) return
    setBusyId(bookingId)
    setActionError('')
    try {
      await postBookingAction({ action: 'cancel', bookingId })
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleTarget || !newDate) return
    setBusyId(rescheduleTarget)
    setActionError('')
    try {
      await postBookingAction({ action: 'reschedule', bookingId: rescheduleTarget, scheduledDate: newDate })
      setRescheduleTarget(null)
      setNewDate('')
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const handleRebook = async (bookingId: string, scheduledTime: string | null) => {
    const date = prompt('Rebook this clean for which date? (YYYY-MM-DD)')
    if (!date) return
    setBusyId(bookingId)
    setActionError('')
    try {
      await postBookingAction({ action: 'rebook', bookingId, scheduledDate: date, scheduledTime })
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewTarget) return
    setBusyId(reviewTarget)
    setActionError('')
    const { error } = await supabase.from('reviews').insert({
      profile_id: (await supabase.auth.getUser()).data.user?.id,
      booking_id: reviewTarget,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    })
    setBusyId(null)
    if (error) {
      setActionError('Could not submit your review. Please try again.')
      return
    }
    setReviewTarget(null)
    setReviewRating(5)
    setReviewComment('')
    refresh()
  }

  return (
    <>
      <h1 className={styles.welcome}>Your Cleans</h1>
      <p className={styles.subIntro}>Upcoming visits, booking history and status updates.</p>

      {actionError && <p style={{ color: '#f05050', fontSize: '0.85rem', marginBottom: 12 }}>{actionError}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button type="button" className={`btn ${tab === 'upcoming' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('upcoming')}>
          Upcoming ({upcoming.length})
        </button>
        <button type="button" className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('history')}>
          History ({history.length})
        </button>
      </div>

      {list.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{tab === 'upcoming' ? 'No upcoming cleans scheduled yet. Your team will confirm your first visit shortly.' : 'No past cleans yet.'}</p>
        </div>
      ) : (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Assigned Cleaner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(booking => {
                const busy = busyId === booking.id
                return (
                  <tr key={booking.id}>
                    <td>{new Date(booking.scheduled_date).toLocaleDateString('en-GB')}</td>
                    <td style={{ textTransform: 'capitalize' }}>{booking.scheduled_time ?? '—'}</td>
                    <td><span className={tableStyles.badge}>{STATUS_LABEL[booking.status] ?? booking.status}</span></td>
                    <td>{booking.assigned_cleaner_id ? 'Assigned' : 'To be confirmed'}</td>
                    <td>
                      {tab === 'upcoming' ? (
                        <>
                          <button type="button" className="btn btn-ghost" disabled={busy} style={{ padding: '6px 12px', fontSize: '0.78rem', marginRight: 6 }} onClick={() => { setRescheduleTarget(booking.id); setNewDate(booking.scheduled_date) }}>
                            Reschedule
                          </button>
                          <button type="button" className="btn btn-ghost" disabled={busy} style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleCancel(booking.id)}>
                            Cancel
                          </button>
                        </>
                      ) : booking.status === 'completed' ? (
                        <>
                          <button type="button" className="btn btn-ghost" disabled={busy} style={{ padding: '6px 12px', fontSize: '0.78rem', marginRight: 6 }} onClick={() => handleRebook(booking.id, booking.scheduled_time)}>
                            Rebook
                          </button>
                          {!reviewedBookingIds.has(booking.id) && (
                            <button type="button" className="btn btn-ghost" disabled={busy} style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setReviewTarget(booking.id)}>
                              Leave Review
                            </button>
                          )}
                        </>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {rescheduleTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={() => setRescheduleTarget(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 28, width: '100%', maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 18 }}>Reschedule Clean</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>New Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '10px 13px', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setRescheduleTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleReschedule}>Save</button>
            </div>
          </div>
        </div>
      )}

      {reviewTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={() => setReviewTarget(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 28, width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 18 }}>Leave a Review</h3>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem', color: n <= reviewRating ? 'var(--accent)' : 'var(--border)' }}
                  aria-label={`${n} stars`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Tell us how your clean went (optional)"
              rows={4}
              style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '10px 13px', color: 'var(--text-primary)', fontSize: '0.86rem', resize: 'vertical', marginBottom: 20 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setReviewTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSubmitReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
