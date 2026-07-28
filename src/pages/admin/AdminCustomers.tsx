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
  const [selected, setSelected] = useState<Set<string>>(new Set())

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

  const toggleRow = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(prev => (prev.size === pageItems.length ? new Set() : new Set(pageItems.map(p => p.id))))
  }

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.title}>Customers</h1>
      <p className={styles.subtitle}>View, search and manage every registered customer.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.dataCard}>
        <div className={styles.dataCardHead}>
          <div className={styles.dataCardTitleRow}>
            <span className={styles.dataCardTitle}>Customer directory</span>
            <span className={styles.dataCardCount}>{profiles.length} customers</span>
          </div>
          <p className={styles.dataCardSubtitle}>Keep track of every customer and their membership status.</p>
        </div>

        <div className={styles.tabRow}>
          <button type="button" className={`${styles.tabBtn} ${tab === 'all' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('all'); setPage(0) }}>View all</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'active' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('active'); setPage(0) }}>Active Members</button>
          <button type="button" className={`${styles.tabBtn} ${tab === 'none' ? styles.tabBtnActive : ''}`} onClick={() => { setTab('none'); setPage(0) }}>No Membership</button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              className={styles.searchInput}
              placeholder="Search customers…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
            />
          </div>
          <button type="button" className={styles.filterBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            Filters
          </button>
        </div>

        {pageItems.length === 0 ? (
          <div className={styles.empty}>No customers found.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><input type="checkbox" className={styles.checkbox} checked={selected.size === pageItems.length} onChange={toggleAll} aria-label="Select all" /></th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Postcode</th>
                  <th>Membership</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(p => {
                  const membership = membershipByProfile.get(p.id)
                  const isActive = membership?.includes('active')
                  return (
                    <tr key={p.id}>
                      <td><input type="checkbox" className={styles.checkbox} checked={selected.has(p.id)} onChange={() => toggleRow(p.id)} aria-label={`Select ${p.full_name}`} /></td>
                      <td>
                        <div className={styles.rowNameCell}>
                          <span className={styles.rowAvatar}>{initialsOf(p.full_name, p.email)}</span>
                          <div>
                            <div>{p.full_name || '—'}</div>
                            <div className={styles.rowSub}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.phone || '—'}</td>
                      <td>{p.postcode || '—'}</td>
                      <td>
                        <span className={`${styles.statusDot} ${isActive ? styles.dotActive : membership ? styles.dotWarn : styles.dotInactive}`} />
                        {membership ? <span className={styles.tagPill} style={{ textTransform: 'capitalize' }}>{membership}</span> : <span className={styles.rowSub}>No membership</span>}
                      </td>
                      <td>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <button type="button" className={styles.iconActionBtn} title="Edit (coming soon)" aria-label="Edit customer" disabled>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" /></svg>
                        </button>
                        <button type="button" className={styles.iconActionBtn} title="Delete (not available)" aria-label="Delete customer" disabled>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        </button>
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
    </>
  )
}
