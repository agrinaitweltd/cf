import { useState } from 'react'
import { useAdminData, postAdminAction } from './useAdminData'
import styles from './AdminPages.module.css'

export default function AdminStaff() {
  const { cleaners, bookings, loading, error, refresh } = useAdminData()
  const [showAdd, setShowAdd] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const assignmentCount = (cleanerId: string) => bookings.filter(b => b.assigned_cleaner_id === cleanerId && b.status === 'upcoming').length

  const handleAdd = async () => {
    if (!fullName.trim()) return
    setActionError('')
    try {
      await postAdminAction('/api/admin/action', { resource: 'staff', action: 'create', fullName: fullName.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined })
      setShowAdd(false)
      setFullName('')
      setEmail('')
      setPhone('')
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    setBusyId(id)
    setActionError('')
    try {
      await postAdminAction('/api/admin/action', { resource: 'staff', action: active ? 'deactivate' : 'activate', cleanerId: id })
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <h1 className={styles.title}>Staff & Cleaner Assignments</h1>
      <p className={styles.subtitle}>Manage your cleaning team and see how many upcoming cleans each cleaner is assigned.</p>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className={styles.dataCardTitleRow}>
              <span className={styles.dataCardTitle}>Team</span>
              <span className={styles.dataCardCount}>{cleaners.length} total</span>
            </div>
            <p className={styles.dataCardSubtitle}>Add and manage cleaners available for assignment.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Staff Member</button>
        </div>

        {cleaners.length === 0 ? (
          <div className={styles.empty}>No staff members yet. Add your first cleaner to start assigning bookings.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Upcoming Assignments</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cleaners.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className={styles.rowNameCell}>
                        <span className={styles.rowAvatar}>{c.full_name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}</span>
                        {c.full_name}
                      </div>
                    </td>
                    <td>{c.email || '—'}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{assignmentCount(c.id)}</td>
                    <td>
                      <span className={`${styles.statusDot} ${c.active ? styles.dotActive : styles.dotInactive}`} />
                      <span className={styles.badge}>{c.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td>
                      <button type="button" className={styles.actionBtn} disabled={busyId === c.id} onClick={() => toggleActive(c.id, c.active)}>
                        {c.active ? 'Deactivate' : 'Activate'}
                      </button>
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
            <h3>Add Staff Member</h3>
            <div className={styles.modalField}>
              <label>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className={styles.modalField}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className={styles.modalField}>
              <label>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAdd}>Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
