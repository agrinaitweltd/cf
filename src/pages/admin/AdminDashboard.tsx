import { useAdminData } from './useAdminData'
import { membershipPlans } from '../../data/membership'
import StatCard from './StatCard'
import styles from './AdminPages.module.css'

const ICONS = {
  members: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
  revenue: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
  cleans: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  failed: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  cancelled: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
  paid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  customers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
}

export default function AdminDashboard() {
  const { profiles, memberships, bookings, payments, loading, error } = useAdminData()

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const activeMembers = memberships.filter(m => m.status === 'active').length
  const cancelledMembers = memberships.filter(m => m.status === 'cancelled').length
  const upcomingCleans = bookings.filter(b => b.status === 'upcoming').length
  const totalMemberships = memberships.length || 1

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
  const totalPayments = payments.length || 1

  return (
    <>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.subtitle}>Overview of Clean Club members, bookings and payments.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.statsGrid}>
        <StatCard label="Active Members" value={activeMembers} percent={Math.round((activeMembers / totalMemberships) * 100)} trend="up" trendLabel={`${activeMembers}/${memberships.length}`} icon={ICONS.members} />
        <StatCard label="Monthly Revenue" value={`£${monthlyRevenue.toLocaleString()}`} percent={Math.min(100, Math.round((monthlyRevenue / 5000) * 100))} trend="up" icon={ICONS.revenue} />
        <StatCard label="Upcoming Cleans" value={upcomingCleans} percent={Math.min(100, upcomingCleans * 10)} icon={ICONS.cleans} />
        <StatCard label="Payments Due / Failed" value={paymentsDue} percent={Math.round((paymentsDue / totalPayments) * 100)} trend={paymentsDue > 0 ? 'down' : 'up'} icon={ICONS.failed} />
        <StatCard label="Cancelled Memberships" value={cancelledMembers} percent={Math.round((cancelledMembers / totalMemberships) * 100)} trend={cancelledMembers > 0 ? 'down' : 'up'} icon={ICONS.cancelled} />
        <StatCard label="Payments This Month" value={thisMonthPayments} percent={Math.round((thisMonthPayments / totalPayments) * 100)} trend="up" icon={ICONS.paid} />
        <StatCard label="Total Customers" value={profiles.length} percent={100} icon={ICONS.customers} />
      </div>
    </>
  )
}
