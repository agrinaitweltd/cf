import { useMemo, useState } from 'react'
import { useAdminData } from './useAdminData'
import styles from './AdminPages.module.css'

export default function AdminCustomers() {
  const { profiles, memberships, loading, error } = useAdminData()
  const [search, setSearch] = useState('')

  const membershipByProfile = useMemo(() => {
    const map = new Map<string, string>()
    memberships.forEach(m => {
      if (!map.has(m.profile_id)) map.set(m.profile_id, `${m.tier} (${m.status})`)
    })
    return map
  }, [memberships])

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.postcode?.toLowerCase().includes(q)
    )
  })

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Customers</h1>
      <p className={styles.subtitle}>{profiles.length} registered customers.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, email, phone or postcode…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No customers found.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Postcode</th>
                <th>Membership</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.full_name || '—'}</td>
                  <td>{p.email || '—'}</td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.postcode || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{membershipByProfile.get(p.id) || 'None'}</td>
                  <td>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
