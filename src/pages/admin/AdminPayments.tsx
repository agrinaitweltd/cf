import { useMemo } from 'react'
import { useAdminData } from './useAdminData'
import styles from './AdminPages.module.css'

export default function AdminPayments() {
  const { payments, profiles, loading, error } = useAdminData()
  const profileById = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Payments</h1>
      <p className={styles.subtitle}>{payments.length} payment records.</p>

      {error && <p className={styles.error}>{error}</p>}

      {payments.length === 0 ? (
        <div className={styles.empty}>No payments recorded yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const profile = profileById.get(p.profile_id)
                return (
                  <tr key={p.id}>
                    <td>{profile?.full_name || profile?.email || p.profile_id.slice(0, 8)}</td>
                    <td>{new Date(p.paid_at || p.created_at).toLocaleDateString('en-GB')}</td>
                    <td>£{Number(p.amount).toFixed(2)}</td>
                    <td><span className={styles.badge}>{p.status}</span></td>
                    <td>{p.stripe_invoice_id || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
