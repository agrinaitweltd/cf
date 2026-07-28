import { useAdminData } from './useAdminData'
import { membershipPlans } from '../../data/membership'
import styles from './AdminPages.module.css'

export default function AdminDashboard() {
  const { profiles, memberships, bookings, payments, loading, error } = useAdminData()

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const activeMembers = memberships.filter(m => m.status === 'active').length
  const cancelledMembers = memberships.filter(m => m.status === 'cancelled').length
  const upcomingCleans = bookings.filter(b => b.status === 'upcoming').length

  const now = new Date()
  const monthlyRevenue = memberships
    .filter(m => m.status === 'active')
    .reduce((sum, m) => {
      const plan = membershipPlans.find(p => p.tier === m.tier)
      return sum + (plan?.price ?? 0)
    }, 0)

  const paymentsDue = payments.filter(p => p.status === 'failed').length
  const thisMonthPayments = payments.filter(p => {
    if (!p.paid_at) return false
    const d = new Date(p.paid_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === 'paid'
  }).length

  return (
    <>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.subtitle}>Overview of Clean Club members, bookings and payments.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Members</div>
          <div className={styles.statValue}>{activeMembers}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Monthly Revenue (est.)</div>
          <div className={styles.statValue}>£{monthlyRevenue.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Upcoming Cleans</div>
          <div className={styles.statValue}>{upcomingCleans}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Payments Due / Failed</div>
          <div className={styles.statValue}>{paymentsDue}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Cancelled Memberships</div>
          <div className={styles.statValue}>{cancelledMembers}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Payments This Month</div>
          <div className={styles.statValue}>{thisMonthPayments}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Customers</div>
          <div className={styles.statValue}>{profiles.length}</div>
        </div>
      </div>
    </>
  )
}
