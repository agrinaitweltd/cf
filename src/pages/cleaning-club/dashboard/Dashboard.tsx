import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useMembershipData } from './useMembershipData'
import { getPlanByTier } from '../../../data/membership'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const { loading, profile, membership, subscription, bookings } = useMembershipData()

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const plan = membership ? getPlanByTier(membership.tier) : undefined
  const upcoming = bookings.filter(b => b.status === 'upcoming')
  const nextClean = upcoming[0]
  const completedThisPeriod = bookings.filter(b => b.status === 'completed').length
  const visitsRemaining = plan ? Math.max(plan.visitsPerMonth - completedThisPeriod, 0) : null

  return (
    <>
      <h1 className={styles.welcome}>Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
      <p className={styles.subIntro}>Here&rsquo;s an overview of your Clean Club membership.</p>

      {!membership ? (
        <div className={styles.emptyState}>
          <p>You don&rsquo;t have an active membership yet.</p>
          <p style={{ marginTop: 8 }}><Link to="/cleaning/membership">Join Clean Club →</Link></p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Current Membership</div>
              <div className={styles.cardValue}>{plan?.name ?? membership.tier}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Membership Status</div>
              <span className={styles.statusBadge}>{membership.status}</span>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Next Cleaning Date</div>
              <div className={styles.cardValueSm}>{nextClean ? nextClean.scheduled_date : 'Not scheduled yet'}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Preferred Day</div>
              <div className={styles.cardValueSm}>{membership.preferred_day ?? '—'}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Preferred Time</div>
              <div className={styles.cardValueSm}>{membership.preferred_time ?? '—'}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Next Payment Date</div>
              <div className={styles.cardValueSm}>
                {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-GB') : '—'}
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Monthly Price</div>
              <div className={styles.cardValue}>{plan?.priceLabel ?? '—'}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Visits Remaining</div>
              <div className={styles.cardValue}>{visitsRemaining ?? '—'}</div>
            </div>
          </div>

          <div className={styles.quickActions}>
            <Link to="/cleaning/dashboard/profile" className="btn btn-ghost">Change Preferred Day</Link>
            <Link to="/cleaning/dashboard/profile" className="btn btn-ghost">Update Address</Link>
            <Link to="/cleaning/dashboard/payments" className="btn btn-ghost">View Payments</Link>
          </div>
        </>
      )}

      {!user?.email_confirmed_at && (
        <p style={{ marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Please confirm your email address to unlock all features.
        </p>
      )}
    </>
  )
}
