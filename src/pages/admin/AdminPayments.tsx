import { useMemo, useState } from 'react'
import { useAdminData, postAdminAction } from './useAdminData'
import styles from './AdminPages.module.css'

const PAGE_SIZE = 10

export default function AdminPayments() {
  const { payments, profiles, loading, error, refresh } = useAdminData()
  const [tab, setTab] = useState<'all' | 'paid' | 'failed' | 'refunded'>('all')
  const [page, setPage] = useState(0)
  const [refundTarget, setRefundTarget] = useState<{ id: string; amount: number } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const profileById = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])

  const filtered = tab === 'all' ? payments : payments.filter(p => p.status === tab)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const handleRefund = async () => {
    if (!refundTarget) return
    setBusyId(refundTarget.id)
    setActionError('')
    try {
      await postAdminAction('/api/admin', { resource: 'refund', paymentId: refundTarget.id })
      await refresh()
      setRefundTarget(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong processing the refund.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Payments</h1>
      <p className={styles.subtitle}>{payments.length} payment records.</p>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead}>
          <div className={styles.dataCardTitleRow}>
            <span className={styles.dataCardTitle}>Payment history</span>
            <span className={styles.dataCardCount}>{payments.length} records</span>
          </div>
          <p className={styles.dataCardSubtitle}>Track successful and failed Clean Club payments, and process refunds.</p>
        </div>

        <div className={styles.tabRow}>
          <button type="button" className={`${styles.tabBtn} ${tab === 'all' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('all'); setPage(0) }}>All</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'paid' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('paid'); setPage(0) }}>Successful</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'failed' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('failed'); setPage(0) }}>Failed</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'refunded' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('refunded'); setPage(0) }}>Refunded</button>
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
                  <th></th>
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
                      <td>
                        <span className={`${styles.statusDot} ${p.status === 'paid' ? styles.dotActive : p.status === 'refunded' ? styles.dotInactive : styles.dotWarn}`} />
                        <span className={styles.badge}>{p.status}</span>
                      </td>
                      <td>{p.stripe_invoice_id || '—'}</td>
                      <td>
                        {p.status === 'paid' && (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            disabled={busyId === p.id}
                            onClick={() => { setRefundTarget({ id: p.id, amount: Number(p.amount) }); setActionError('') }}
                          >
                            Refund
                          </button>
                        )}
                      </td>
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
      </div>

      {refundTarget && (
        <div className={styles.modalOverlay} onClick={() => setRefundTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Refund Payment</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Refund <strong>£{refundTarget.amount.toFixed(2)}</strong> to the customer via Stripe? This cannot be undone.
            </p>
            {actionError && <p className={styles.error}>{actionError}</p>}
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setRefundTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleRefund} disabled={busyId === refundTarget.id}>
                {busyId === refundTarget.id ? 'Processing…' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
