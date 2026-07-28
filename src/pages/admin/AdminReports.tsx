import { useMemo } from 'react'
import { useAdminData } from './useAdminData'
import { membershipPlans } from '../../data/membership'
import styles from './AdminPages.module.css'
import reportStyles from './AdminReports.module.css'

function monthLabel(d: Date) {
  return d.toLocaleDateString('en-GB', { month: 'short' })
}

export default function AdminReports() {
  const { payments, memberships, bookings, loading, error } = useAdminData()

  const monthlyRevenue = useMemo(() => {
    const months: { label: string; total: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const total = payments
        .filter(p => {
          if (p.status !== 'paid' || !p.paid_at) return false
          const pd = new Date(p.paid_at)
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
        })
        .reduce((sum, p) => sum + Number(p.amount), 0)
      months.push({ label: monthLabel(d), total })
    }
    return months
  }, [payments])

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total), 1)

  const tierBreakdown = useMemo(() => {
    return membershipPlans.map(plan => ({
      tier: plan.name,
      count: memberships.filter(m => m.tier === plan.tier && m.status === 'active').length,
    }))
  }, [memberships])

  const maxTierCount = Math.max(...tierBreakdown.map(t => t.count), 1)

  const bookingStatusBreakdown = useMemo(() => {
    const statuses = ['upcoming', 'in_progress', 'completed', 'cancelled']
    return statuses.map(status => ({ status, count: bookings.filter(b => b.status === status).length }))
  }, [bookings])

  const totalRevenue6mo = monthlyRevenue.reduce((s, m) => s + m.total, 0)
  const totalCompletedCleans = bookings.filter(b => b.status === 'completed').length

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Reports</h1>
      <p className={styles.subtitle}>Revenue and operational trends across the last 6 months.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Revenue (6mo)</div>
          <div className={styles.statValue}>£{totalRevenue6mo.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Completed Cleans</div>
          <div className={styles.statValue}>{totalCompletedCleans}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Memberships</div>
          <div className={styles.statValue}>{memberships.filter(m => m.status === 'active').length}</div>
        </div>
      </div>

      <div className={reportStyles.grid}>
        <div className={styles.dataCard} style={{ paddingBottom: 24 }}>
          <div className={styles.dataCardHead}>
            <span className={styles.dataCardTitle}>Monthly Revenue</span>
            <p className={styles.dataCardSubtitle}>Paid invoices by month, last 6 months.</p>
          </div>
          <div className={reportStyles.barChart}>
            {monthlyRevenue.map(m => (
              <div key={m.label} className={reportStyles.barCol}>
                <div className={reportStyles.barTrack}>
                  <div className={reportStyles.bar} style={{ height: `${Math.max(4, (m.total / maxRevenue) * 100)}%` }} title={`£${m.total.toLocaleString()}`} />
                </div>
                <span className={reportStyles.barValue}>£{m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}k` : m.total}</span>
                <span className={reportStyles.barLabel}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dataCard} style={{ paddingBottom: 24 }}>
          <div className={styles.dataCardHead}>
            <span className={styles.dataCardTitle}>Active Members by Tier</span>
            <p className={styles.dataCardSubtitle}>Current active membership distribution.</p>
          </div>
          <div className={reportStyles.hBarList}>
            {tierBreakdown.map(t => (
              <div key={t.tier} className={reportStyles.hBarRow}>
                <span className={reportStyles.hBarLabel}>{t.tier}</span>
                <div className={reportStyles.hBarTrack}>
                  <div className={reportStyles.hBar} style={{ width: `${Math.max(4, (t.count / maxTierCount) * 100)}%` }} />
                </div>
                <span className={reportStyles.hBarValue}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dataCard} style={{ paddingBottom: 24 }}>
          <div className={styles.dataCardHead}>
            <span className={styles.dataCardTitle}>Bookings by Status</span>
            <p className={styles.dataCardSubtitle}>All-time booking breakdown.</p>
          </div>
          <div className={reportStyles.hBarList}>
            {bookingStatusBreakdown.map(b => (
              <div key={b.status} className={reportStyles.hBarRow}>
                <span className={reportStyles.hBarLabel} style={{ textTransform: 'capitalize' }}>{b.status.replace('_', ' ')}</span>
                <div className={reportStyles.hBarTrack}>
                  <div className={reportStyles.hBar} style={{ width: `${Math.max(4, (b.count / Math.max(...bookingStatusBreakdown.map(x => x.count), 1)) * 100)}%` }} />
                </div>
                <span className={reportStyles.hBarValue}>{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
