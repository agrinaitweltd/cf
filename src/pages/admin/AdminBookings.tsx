import { useMemo, useState } from 'react'
import { useAdminData, postAdminAction, type AdminBooking } from './useAdminData'
import BookingsCalendar from './BookingsCalendar'
import styles from './AdminPages.module.css'

export default function AdminBookings() {
  const { bookings, profiles, cleaners, loading, error, refresh } = useAdminData()
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [assignTarget, setAssignTarget] = useState<AdminBooking | null>(null)
  const [cleanerName, setCleanerName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newBooking, setNewBooking] = useState({ profileId: '', scheduledDate: '', scheduledTime: 'morning' })
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const profileById = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])
  const cleanerById = useMemo(() => new Map(cleaners.map(c => [c.id, c])), [cleaners])

  const filtered = bookings.filter(b => b.status === tab)

  const handleAction = async (action: string, bookingId: string, extra: Record<string, unknown> = {}) => {
    setActionError('')
    setBusyId(bookingId)
    try {
      await postAdminAction('/api/admin', { resource: 'booking', action, bookingId, ...extra })
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const handleAssignSubmit = async () => {
    if (!assignTarget || !cleanerName.trim()) return
    await handleAction('assign', assignTarget.id, { cleanerName: cleanerName.trim() })
    setAssignTarget(null)
    setCleanerName('')
  }

  const handleCreate = async () => {
    if (!newBooking.profileId || !newBooking.scheduledDate) {
      setActionError('Select a customer and date.')
      return
    }
    setActionError('')
    try {
      await postAdminAction('/api/admin', {
        resource: 'booking',
        action: 'create',
        profileId: newBooking.profileId,
        scheduledDate: newBooking.scheduledDate,
        scheduledTime: newBooking.scheduledTime,
      })
      await refresh()
      setCreating(false)
      setNewBooking({ profileId: '', scheduledDate: '', scheduledTime: 'morning' })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Bookings</h1>
      <p className={styles.subtitle}>Manage scheduled, completed and cancelled cleans.</p>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead}>
          <div className={styles.dataCardTitleRow}>
            <span className={styles.dataCardTitle}>Clean schedule</span>
            <span className={styles.dataCardCount}>{bookings.length} bookings</span>
          </div>
          <p className={styles.dataCardSubtitle}>Assign cleaners and track upcoming, completed and cancelled cleans.</p>
        </div>

        <div className={styles.tabRow}>
          <button type="button" className={`${styles.tabBtn} ${tab === 'upcoming' ? styles.tabBtnActive : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'completed' ? styles.tabBtnActive : ''}`} onClick={() => setTab('completed')}>Completed</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'cancelled' ? styles.tabBtnActive : ''}`} onClick={() => setTab('cancelled')}>Cancelled</button>
        </div>

        <div className={styles.toolbar}>
          <button type="button" className={styles.actionBtn} onClick={() => setView('list')} disabled={view === 'list'}>List</button>
          <button type="button" className={styles.actionBtn} onClick={() => setView('calendar')} disabled={view === 'calendar'}>Calendar</button>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>+ New Booking</button>
        </div>

        {view === 'calendar' ? (
          <BookingsCalendar bookings={bookings} profileById={profileById} />
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No {tab} bookings.</div>
        ) : (
          <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Date</th>
                <th>Time</th>
                <th>Cleaner</th>
                <th>Status</th>
                {tab === 'upcoming' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const profile = profileById.get(b.profile_id)
                const cleaner = b.assigned_cleaner_id ? cleanerById.get(b.assigned_cleaner_id) : null
                return (
                  <tr key={b.id}>
                    <td>{profile?.full_name || profile?.email || b.profile_id.slice(0, 8)}</td>
                    <td>{new Date(b.scheduled_date).toLocaleDateString('en-GB')}</td>
                    <td style={{ textTransform: 'capitalize' }}>{b.scheduled_time || '—'}</td>
                    <td>{cleaner?.full_name || 'Unassigned'}</td>
                    <td><span className={styles.badge}>{b.status}</span></td>
                    {tab === 'upcoming' && (
                      <td>
                        <button type="button" className={styles.iconActionBtn} title="Assign cleaner" aria-label="Assign cleaner" disabled={busyId === b.id} onClick={() => setAssignTarget(b)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>
                        </button>
                        <button type="button" className={styles.iconActionBtn} title="Mark complete" aria-label="Mark complete" disabled={busyId === b.id} onClick={() => handleAction('complete', b.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </button>
                        <button type="button" className={styles.iconActionBtn} title="Cancel booking" aria-label="Cancel booking" disabled={busyId === b.id} onClick={() => handleAction('cancel', b.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {assignTarget && (
        <div className={styles.modalOverlay} onClick={() => setAssignTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Assign Cleaner</h3>
            <div className={styles.modalField}>
              <label>Cleaner Name</label>
              <input value={cleanerName} onChange={e => setCleanerName(e.target.value)} placeholder="e.g. Sarah Jones" list="cleaner-names" />
              <datalist id="cleaner-names">
                {cleaners.map(c => <option key={c.id} value={c.full_name} />)}
              </datalist>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setAssignTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAssignSubmit}>Assign</button>
            </div>
          </div>
        </div>
      )}

      {creating && (
        <div className={styles.modalOverlay} onClick={() => setCreating(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>New Booking</h3>
            <div className={styles.modalField}>
              <label>Customer</label>
              <select value={newBooking.profileId} onChange={e => setNewBooking({ ...newBooking, profileId: e.target.value })}>
                <option value="">Select a customer…</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalField}>
              <label>Date</label>
              <input type="date" value={newBooking.scheduledDate} onChange={e => setNewBooking({ ...newBooking, scheduledDate: e.target.value })} />
            </div>
            <div className={styles.modalField}>
              <label>Time</label>
              <select value={newBooking.scheduledTime} onChange={e => setNewBooking({ ...newBooking, scheduledTime: e.target.value })}>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create Booking</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
