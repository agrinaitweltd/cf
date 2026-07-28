import { useAdminData } from './useAdminData'
import styles from './AdminPages.module.css'

function formatAction(action: string) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function AdminAuditLogs() {
  const { auditLogs, loading, error } = useAdminData()

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Audit Logs</h1>
      <p className={styles.subtitle}>A record of sensitive admin actions: invites, role changes, refunds and more.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead}>
          <div className={styles.dataCardTitleRow}>
            <span className={styles.dataCardTitle}>Recent activity</span>
            <span className={styles.dataCardCount}>{auditLogs.length}</span>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className={styles.empty}>No audit events recorded yet.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.actor_email || '—'}</td>
                    <td><span className={styles.tagPill}>{formatAction(log.action)}</span></td>
                    <td>{log.target_type ? `${log.target_type}: ${log.target_id ?? ''}` : '—'}</td>
                    <td>{new Date(log.created_at).toLocaleString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
