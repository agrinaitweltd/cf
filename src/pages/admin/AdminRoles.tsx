import { useState } from 'react'
import { useAdminData, postAdminAction } from './useAdminData'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminPages.module.css'

export default function AdminRoles() {
  const { adminUsers, loading, error, refresh } = useAdminData()
  const { user } = useAuth()
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const handleInvite = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setInviteError('Enter a valid email address.')
    setSending(true)
    setInviteError('')
    try {
      await postAdminAction('/api/admin', { resource: 'invite', email: email.trim() })
      setInviteSent(true)
      setEmail('')
      await refresh()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  const toggleAccess = async (adminId: string, activated: boolean) => {
    setBusyId(adminId)
    setActionError('')
    try {
      await postAdminAction('/api/admin', { resource: 'admin_role', action: activated ? 'revoke' : 'restore', adminId })
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <h1 className={styles.title}>Roles & Permissions</h1>
      <p className={styles.subtitle}>Invite new administrators and manage who has access to this dashboard.</p>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className={styles.dataCardTitleRow}>
              <span className={styles.dataCardTitle}>Admin accounts</span>
              <span className={styles.dataCardCount}>{adminUsers.length} total</span>
            </div>
            <p className={styles.dataCardSubtitle}>Pending invites appear until the recipient completes first-time setup.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => { setShowInvite(true); setInviteSent(false) }}>Invite Admin</button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Invited</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map(a => {
                const isSelf = a.profile_id === user?.id
                const pending = !a.profile_id
                return (
                  <tr key={a.id}>
                    <td>{a.full_name || '—'}</td>
                    <td>{a.invite_email || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{a.role.replace('_', ' ')}</td>
                    <td>
                      <span className={`${styles.statusDot} ${pending ? styles.dotWarn : a.activated ? styles.dotActive : styles.dotInactive}`} />
                      <span className={styles.badge}>{pending ? 'Pending Setup' : a.activated ? 'Active' : 'Revoked'}</span>
                    </td>
                    <td>{new Date(a.created_at).toLocaleDateString('en-GB')}</td>
                    <td>
                      {!pending && !isSelf && (
                        <button type="button" className={styles.actionBtn} disabled={busyId === a.id} onClick={() => toggleAccess(a.id, a.activated)}>
                          {a.activated ? 'Revoke Access' : 'Restore Access'}
                        </button>
                      )}
                      {isSelf && <span className={styles.rowSub}>This is you</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && (
        <div className={styles.modalOverlay} onClick={() => setShowInvite(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {inviteSent ? (
              <>
                <h3>Invite Sent</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  A secure setup link has been emailed. It expires in 48 hours and can only be used once.
                </p>
                <div className={styles.modalActions}>
                  <button type="button" className="btn btn-primary" onClick={() => setShowInvite(false)}>Done</button>
                </div>
              </>
            ) : (
              <>
                <h3>Invite New Admin</h3>
                <div className={styles.modalField}>
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@cfhubuk.com" />
                </div>
                {inviteError && <p className={styles.error}>{inviteError}</p>}
                <div className={styles.modalActions}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowInvite(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleInvite} disabled={sending}>
                    {sending ? 'Sending…' : 'Send Invite'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
