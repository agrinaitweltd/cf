import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useMembershipData } from './useMembershipData'
import { supabase } from '../../../lib/supabase'
import styles from './Dashboard.module.css'
import tableStyles from './DataTable.module.css'

interface Coupon {
  id: string
  code: string
  description: string | null
  discount_percent: number
  expires_at: string | null
}

export default function Rewards() {
  const { user } = useAuth()
  const { loading, bookings } = useMembershipData()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('coupons').select('id, code, description, discount_percent, expires_at').eq('active', true)
      .then(({ data }) => setCoupons((data as Coupon[]) ?? []))
  }, [])

  if (loading || !user) return <main style={{ minHeight: '40vh' }} />

  const completedCleans = bookings.filter(b => b.status === 'completed').length
  const loyaltyPoints = completedCleans * 50
  const referralLink = `${window.location.origin}/cleaning/sign-up?ref=${user.id.slice(0, 8)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <h1 className={styles.welcome}>Rewards & Vouchers</h1>
      <p className={styles.subIntro}>Earn loyalty points, redeem vouchers and refer friends to Clean Club.</p>

      <div className={styles.grid} style={{ marginBottom: 32 }}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Loyalty Points</div>
          <div className={styles.cardValue}>{loyaltyPoints.toLocaleString()}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Completed Cleans</div>
          <div className={styles.cardValue}>{completedCleans}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Points per Clean</div>
          <div className={styles.cardValue}>50</div>
        </div>
      </div>

      <h2 className={styles.welcome} style={{ fontSize: '1.15rem', marginBottom: 6 }}>Refer a Friend</h2>
      <p className={styles.subIntro} style={{ marginBottom: 16 }}>Share your link — when a friend joins Clean Club, you both get rewarded.</p>
      <div style={{ display: 'flex', gap: 10, maxWidth: 560, marginBottom: 32, flexWrap: 'wrap' }}>
        <input readOnly value={referralLink} style={{ flex: 1, minWidth: 220, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '11px 14px', color: 'var(--text-secondary)', fontSize: '0.84rem' }} />
        <button type="button" className="btn btn-primary" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Link'}</button>
      </div>

      <h2 className={styles.welcome} style={{ fontSize: '1.15rem', marginBottom: 6 }}>Available Vouchers</h2>
      <p className={styles.subIntro} style={{ marginBottom: 16 }}>Active discount codes you can use on any one-off booking.</p>

      {coupons.length === 0 ? (
        <div className={styles.emptyState}><p>No vouchers available right now — check back soon.</p></div>
      ) : (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr><th>Code</th><th>Description</th><th>Discount</th><th>Expires</th></tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td><span className={tableStyles.badge}>{c.code}</span></td>
                  <td>{c.description || '—'}</td>
                  <td>{c.discount_percent}%</td>
                  <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-GB') : 'No expiry'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
