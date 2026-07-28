import { useState } from 'react'
import { useAdminData, postAdminAction } from './useAdminData'
import styles from './AdminPages.module.css'

export default function AdminCoupons() {
  const { coupons, loading, error, refresh } = useAdminData()
  const [showAdd, setShowAdd] = useState(false)
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountPercent, setDiscountPercent] = useState('10')
  const [expiresAt, setExpiresAt] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const handleAdd = async () => {
    if (!code.trim() || !discountPercent) return
    setActionError('')
    try {
      await postAdminAction('/api/admin', {
        resource: 'coupon',
        action: 'create',
        code: code.trim(),
        description: description.trim() || undefined,
        discountPercent: Number(discountPercent),
        expiresAt: expiresAt || undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
      })
      setShowAdd(false)
      setCode('')
      setDescription('')
      setDiscountPercent('10')
      setExpiresAt('')
      setUsageLimit('')
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const toggle = async (id: string, active: boolean) => {
    setBusyId(id)
    setActionError('')
    try {
      await postAdminAction('/api/admin', { resource: 'coupon', action: active ? 'deactivate' : 'activate', couponId: id })
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this coupon permanently?')) return
    setBusyId(id)
    setActionError('')
    try {
      await postAdminAction('/api/admin', { resource: 'coupon', action: 'delete', couponId: id })
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <h1 className={styles.title}>Coupons & Discounts</h1>
      <p className={styles.subtitle}>Create promotional codes members can redeem. Active coupons appear in the customer dashboard.</p>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className={styles.dataCardTitleRow}>
              <span className={styles.dataCardTitle}>All coupons</span>
              <span className={styles.dataCardCount}>{coupons.length} total</span>
            </div>
            <p className={styles.dataCardSubtitle}>Manage discount codes and usage limits.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>New Coupon</button>
        </div>

        {coupons.length === 0 ? (
          <div className={styles.empty}>No coupons yet. Create one to offer members a discount.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td><span className={styles.tagPill}>{c.code}</span></td>
                    <td>{c.description || '—'}</td>
                    <td>{c.discount_percent}%</td>
                    <td>{c.times_used}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                    <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-GB') : 'Never'}</td>
                    <td>
                      <span className={`${styles.statusDot} ${c.active ? styles.dotActive : styles.dotInactive}`} />
                      <span className={styles.badge}>{c.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td>
                      <button type="button" className={styles.actionBtn} disabled={busyId === c.id} onClick={() => toggle(c.id, c.active)}>
                        {c.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button type="button" className={styles.actionBtn} disabled={busyId === c.id} onClick={() => remove(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className={styles.modalOverlay} onClick={() => setShowAdd(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>New Coupon</h3>
            <div className={styles.modalField}>
              <label>Code</label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. WELCOME10" />
            </div>
            <div className={styles.modalField}>
              <label>Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="10% off your first clean" />
            </div>
            <div className={styles.modalField}>
              <label>Discount %</label>
              <input type="number" min={1} max={100} value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} />
            </div>
            <div className={styles.modalField}>
              <label>Expiry Date (optional)</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
            <div className={styles.modalField}>
              <label>Usage Limit (optional)</label>
              <input type="number" min={1} value={usageLimit} onChange={e => setUsageLimit(e.target.value)} />
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAdd}>Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
