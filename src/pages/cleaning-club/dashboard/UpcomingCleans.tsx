import { useMembershipData } from './useMembershipData'
import styles from './Dashboard.module.css'
import tableStyles from './DataTable.module.css'

export default function UpcomingCleans() {
  const { loading, bookings } = useMembershipData()

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const upcoming = bookings.filter(b => b.status === 'upcoming')

  return (
    <>
      <h1 className={styles.welcome}>Upcoming Cleans</h1>
      <p className={styles.subIntro}>Your scheduled cleans. Completed cleans move into your payment history.</p>

      {upcoming.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No upcoming cleans scheduled yet. Your team will confirm your first visit shortly.</p>
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
              </tr>
            </thead>
            <tbody>
              {upcoming.map(booking => (
                <tr key={booking.id}>
                  <td>{new Date(booking.scheduled_date).toLocaleDateString('en-GB')}</td>
                  <td style={{ textTransform: 'capitalize' }}>{booking.scheduled_time ?? '—'}</td>
                  <td><span className={tableStyles.badge}>{booking.status}</span></td>
                  <td>{booking.assigned_cleaner_id ? 'Assigned' : 'To be confirmed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
