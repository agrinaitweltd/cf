import { useMemo, useState } from 'react'
import { useAdminData, postAdminAction, type AdminMembership } from './useAdminData'
import { membershipPlans } from '../../data/membership'
import styles from './AdminPages.module.css'

export default function AdminMemberships() {
  const { memberships, profiles, loading, error, refresh } = useAdminData()
  const [tab, setTab] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all')
  const [tierTarget, setTierTarget] = useState<AdminMembership | null>(null)
  const [newTier, setNewTier] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const profileById = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])

  const filtered = tab === 'all' ? memberships : memberships.filter(m => m.status === tab)

  const runAction = async (action: string, membershipId: string, extra: Record<string, unknown> = {}) => {
    setActionError('')
    setBusyId(membershipId)
    try {
      await postAdminAction('/api/admin', { resource: 'membership', action, membershipId, ...extra })
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const handleTierSubmit = async () => {
    if (!tierTarget || !newTier) return
    await runAction('change_tier', tierTarget.id, { tier: newTier })
    setTierTarget(null)
    setNewTier('')
  }

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Memberships</h1>
      <p className={styles.subtitle}>Upgrade, downgrade, pause or cancel Clean Club memberships.</p>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead}>
          <div className={styles.dataCardTitleRow}>
            <span className={styles.dataCardTitle}>All memberships</span>
            <span className={styles.dataCardCount}>{memberships.length} total</span>
          </div>
          <p className={styles.dataCardSubtitle}>Manage plan changes, pauses and cancellations.</p>
        </div>

        <div className={styles.tabRow}>
          <button type="button" className={`${styles.tabBtn} ${tab === 'all' ? styles.tabBtnActive : ''}`} onClick={() => setTab('all')}>All</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'active' ? styles.tabBtnActive : ''}`} onClick={() => setTab('active')}>Active</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'paused' ? styles.tabBtnActive : ''}`} onClick={() => setTab('paused')}>Paused</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'cancelled' ? styles.tabBtnActive : ''}`} onClick={() => setTab('cancelled')}>Cancelled</button>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>No memberships found.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Preferred Day</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const profile = profileById.get(m.profile_id)
                  const busy = busyId === m.id
                  const isActive = m.status === 'active'
                  return (
                    <tr key={m.id}>
                      <td>{profile?.full_name || profile?.email || m.profile_id.slice(0, 8)}</td>
                      <td>
                        <span className={styles.tagPill} style={{ textTransform: 'capitalize' }}>{m.tier}</span>
                      </td>
                      <td>
                        <span className={`${styles.statusDot} ${isActive ? styles.dotActive : m.status === 'paused' ? styles.dotWarn : styles.dotInactive}`} />
                        <span className={styles.badge}>{m.status}</span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{m.preferred_day || '—'}</td>
                      <td>{new Date(m.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => { setTierTarget(m); setNewTier(m.tier) }}>Change Plan</button>
                        {isActive && (
                          <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => runAction('pause', m.id)}>Pause</button>
                        )}
                        {m.status === 'paused' && (
                          <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => runAction('resume', m.id)}>Resume</button>
                        )}
                        {m.status !== 'cancelled' && (
                          <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => runAction('cancel', m.id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tierTarget && (
        <div className={styles.modalOverlay} onClick={() => setTierTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Change Membership Plan</h3>
            <div className={styles.modalField}>
              <label>New Plan</label>
              <select value={newTier} onChange={e => setNewTier(e.target.value)}>
                {membershipPlans.map(p => (
                  <option key={p.tier} value={p.tier}>{p.name} — {p.priceLabel}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setTierTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleTierSubmit}>Save Change</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
