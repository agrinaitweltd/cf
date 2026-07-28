import { useMemo, useState } from 'react'
import { useAdminData, postAdminAction, type AdminSupportTicket } from './useAdminData'
import styles from './AdminPages.module.css'

export default function AdminSupport() {
  const { supportTickets, profiles, loading, error, refresh } = useAdminData()
  const [tab, setTab] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
  const [replyTarget, setReplyTarget] = useState<AdminSupportTicket | null>(null)
  const [reply, setReply] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const profileById = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])
  const filtered = tab === 'all' ? supportTickets : supportTickets.filter(t => t.status === tab)

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const setStatus = async (ticketId: string, status: string) => {
    setBusyId(ticketId)
    setActionError('')
    try {
      await postAdminAction('/api/admin', { resource: 'support_ticket', ticketId, status })
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const sendReply = async () => {
    if (!replyTarget || !reply.trim()) return
    setBusyId(replyTarget.id)
    setActionError('')
    try {
      await postAdminAction('/api/admin', { resource: 'support_ticket', action: 'reply', ticketId: replyTarget.id, adminReply: reply.trim(), status: 'resolved' })
      setReplyTarget(null)
      setReply('')
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <h1 className={styles.title}>Support Tickets</h1>
      <p className={styles.subtitle}>Respond to customer support requests submitted from the dashboard.</p>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead}>
          <div className={styles.dataCardTitleRow}>
            <span className={styles.dataCardTitle}>All tickets</span>
            <span className={styles.dataCardCount}>{supportTickets.length} total</span>
          </div>
        </div>

        <div className={styles.tabRow}>
          <button type="button" className={`${styles.tabBtn} ${tab === 'all' ? styles.tabBtnActive : ''}`} onClick={() => setTab('all')}>All</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'open' ? styles.tabBtnActive : ''}`} onClick={() => setTab('open')}>Open</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'in_progress' ? styles.tabBtnActive : ''}`} onClick={() => setTab('in_progress')}>In Progress</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'resolved' ? styles.tabBtnActive : ''}`} onClick={() => setTab('resolved')}>Resolved</button>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>No tickets found.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const profile = profileById.get(t.profile_id)
                  const busy = busyId === t.id
                  return (
                    <tr key={t.id}>
                      <td>{profile?.full_name || profile?.email || t.profile_id.slice(0, 8)}</td>
                      <td>{t.subject}</td>
                      <td style={{ maxWidth: 280, whiteSpace: 'normal' }}>{t.message}</td>
                      <td>{new Date(t.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <span className={`${styles.statusDot} ${t.status === 'resolved' ? styles.dotActive : t.status === 'in_progress' ? styles.dotWarn : styles.dotInactive}`} />
                        <span className={styles.badge}>{t.status.replace('_', ' ')}</span>
                      </td>
                      <td>
                        {t.status === 'open' && (
                          <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => setStatus(t.id, 'in_progress')}>Start</button>
                        )}
                        <button type="button" className={styles.actionBtn} disabled={busy} onClick={() => { setReplyTarget(t); setReply(t.admin_reply || '') }}>
                          {t.admin_reply ? 'View / Edit Reply' : 'Reply'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {replyTarget && (
        <div className={styles.modalOverlay} onClick={() => setReplyTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Reply to: {replyTarget.subject}</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{replyTarget.message}</p>
            <div className={styles.modalField}>
              <label>Your Reply</label>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={4}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '10px 13px', color: 'var(--text-primary)', fontSize: '0.86rem', resize: 'vertical' }}
              />
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setReplyTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={sendReply} disabled={busyId === replyTarget.id}>Send Reply & Resolve</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
