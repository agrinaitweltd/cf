import { useMemo, useState } from 'react'
import { useAdminData } from './useAdminData'
import styles from './AdminPages.module.css'

const PAGE_SIZE = 10

export default function AdminPayments() {
  const { payments, profiles, loading, error } = useAdminData()
  const [tab, setTab] = useState<'all' | 'paid' | 'failed'>('all')
  const [page, setPage] = useState(0)
  const profileById = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])

  const filtered = tab === 'all' ? payments : payments.filter(p => p.status === tab)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Payments</h1>
      <p className={styles.subtitle}>{payments.length} payment records.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tabRow}>
        <button type="button" className={`${styles.tabBtn} ${tab === 'all' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('all'); setPage(0) }}>All</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'paid' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('paid'); setPage(0) }}>Successful</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'failed' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('failed'); setPage(0) }}>Failed</button>
      </div>

      {pageItems.length === 0 ? (
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
              {pageItems.map(p => {
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
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
            <button type="button" className={styles.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</button>
            <button type="button" className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</button>
          </div>
        </div>
      )}
    </>
  )
}
