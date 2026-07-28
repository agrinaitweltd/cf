import { useMemo, useState } from 'react'
import { useAdminData, postAdminAction } from './useAdminData'
import styles from './AdminPages.module.css'

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--accent)', letterSpacing: '1px' }}>
      {'★'.repeat(rating)}
      <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function AdminReviews() {
  const { reviews, profiles, loading, error, refresh } = useAdminData()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const profileById = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const run = async (reviewId: string, action: 'hide' | 'publish' | 'delete') => {
    setBusyId(reviewId)
    setActionError('')
    try {
      await postAdminAction('/api/admin/action', { resource: 'review', action, reviewId })
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <h1 className={styles.title}>Reviews</h1>
      <p className={styles.subtitle}>Moderate member reviews left after completed cleans.</p>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Average Rating</div>
          <div className={styles.statValue}>{avgRating} / 5</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Reviews</div>
          <div className={styles.statValue}>{reviews.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Published</div>
          <div className={styles.statValue}>{reviews.filter(r => r.status === 'published').length}</div>
        </div>
      </div>

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead}>
          <div className={styles.dataCardTitleRow}>
            <span className={styles.dataCardTitle}>All reviews</span>
            <span className={styles.dataCardCount}>{reviews.length} total</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className={styles.empty}>No reviews yet.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => {
                  const profile = profileById.get(r.profile_id)
                  const busy = busyId === r.id
                  return (
                    <tr key={r.id}>
                      <td>{profile?.full_name || profile?.email || r.profile_id.slice(0, 8)}</td>
                      <td><Stars rating={r.rating} /></td>
                      <td style={{ maxWidth: 320, whiteSpace: 'normal' }}>{r.comment || '—'}</td>
                      <td>{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <span className={`${styles.statusDot} ${r.status === 'published' ? styles.dotActive : styles.dotInactive}`} />
                        <span className={styles.badge}>{r.status}</span>
                      </td>
                      <td>
                        {r.status === 'published' ? (
                          <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => run(r.id, 'hide')}>Hide</button>
                        ) : (
                          <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => run(r.id, 'publish')}>Publish</button>
                        )}
                        <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => run(r.id, 'delete')}>Delete</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
