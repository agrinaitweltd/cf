import { useMemo, useState } from 'react'
import { useAdminData } from './useAdminData'
import styles from './AdminPages.module.css'

const PAGE_SIZE = 8

function initialsOf(name: string | null, email: string | null) {
  const source = name || email || '?'
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('')
}

export default function AdminCustomers() {
  const { profiles, memberships, loading, error } = useAdminData()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'none'>('all')
  const [page, setPage] = useState(0)

  const membershipByProfile = useMemo(() => {
    const map = new Map<string, string>()
    memberships.forEach(m => {
      if (!map.has(m.profile_id)) map.set(m.profile_id, `${m.tier} (${m.status})`)
    })
    return map
  }, [memberships])

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch =
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.postcode?.toLowerCase().includes(q)
    if (!matchesSearch) return false

    const hasMembership = membershipByProfile.has(p.id)
    if (tab === 'active') return hasMembership && membershipByProfile.get(p.id)?.includes('active')
    if (tab === 'none') return !hasMembership
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Customers</h1>
      <p className={styles.subtitle}>{profiles.length} registered customers.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tabRow}>
        <button type="button" className={`${styles.tabBtn} ${tab === 'all' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('all'); setPage(0) }}>All</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'active' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('active'); setPage(0) }}>Active Members</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'none' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('none'); setPage(0) }}>No Membership</button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, email, phone or postcode…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
      </div>

      {pageItems.length === 0 ? (
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
              {pageItems.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.rowNameCell}>
                      <span className={styles.rowAvatar}>{initialsOf(p.full_name, p.email)}</span>
                      {p.full_name || '—'}
                    </div>
                  </td>
                  <td>{p.email || '—'}</td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.postcode || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{membershipByProfile.get(p.id) || 'None'}</td>
                  <td>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
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
