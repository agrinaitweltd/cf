import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useMembershipData } from './useMembershipData'
import { getPlanByTier, membershipPlans } from '../../../data/membership'
import type { MembershipTier } from '../../../types/membership'
import styles from './Dashboard.module.css'
import wizardStyles from '../MembershipSignup.module.css'

export default function MembershipPage() {
  const { loading, membership, subscription, refresh } = useMembershipData()
  const [changing, setChanging] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <main style={{ minHeight: '40vh' }} />

  if (!membership) {
    return (
      <div className={styles.emptyState}>
        <p>You don&rsquo;t have an active membership yet.</p>
        <p style={{ marginTop: 8 }}><Link to="/cleaning/membership">Join Clean Club →</Link></p>
      </div>
    )
  }

  const plan = getPlanByTier(membership.tier)

  const changeTier = async (tier: MembershipTier) => {
    setError('')
    setChanging(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not change your membership.')
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setChanging(false)
    }
  }

  const openBillingPortal = async () => {
    setError('')
    setPortalLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not open billing portal.')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setPortalLoading(false)
    }
  }

  return (
    <>
      <h1 className={styles.welcome}>Membership</h1>
      <p className={styles.subIntro}>Manage your Clean Club plan and billing.</p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Current Membership</div>
          <div className={styles.cardValue}>{plan?.name ?? membership.tier}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Monthly Cost</div>
          <div className={styles.cardValue}>{plan?.priceLabel ?? '—'}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Renewal Date</div>
          <div className={styles.cardValueSm}>
            {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-GB') : '—'}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Subscription Status</div>
          <span className={styles.statusBadge}>{subscription?.status ?? membership.status}</span>
        </div>
      </div>

      {plan && (
        <div className={styles.card} style={{ marginBottom: 32 }}>
          <div className={styles.cardLabel}>Benefits</div>
          <ul style={{ margin: '12px 0 0', paddingLeft: 20, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            {plan.features.map(feature => <li key={feature}>{feature}</li>)}
          </ul>
        </div>
      )}

      {error && <p style={{ color: '#f05050', fontSize: '0.85rem', marginBottom: 16 }}>{error}</p>}

      <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Upgrade or Downgrade</h2>
      <div className={wizardStyles.plans} style={{ marginBottom: 32 }}>
        {membershipPlans.map(p => (
          <div key={p.tier} className={`${wizardStyles.planCard} ${p.tier === membership.tier ? wizardStyles.planCardSelected : ''}`}>
            <div className={wizardStyles.planName}>{p.name}</div>
            <div className={wizardStyles.planPrice}>{p.priceLabel}</div>
            <button
              type="button"
              className={`btn ${p.tier === membership.tier ? 'btn-ghost' : 'btn-primary'} ${wizardStyles.planSelectBtn}`}
              disabled={p.tier === membership.tier || changing}
              onClick={() => changeTier(p.tier)}
            >
              {p.tier === membership.tier ? 'Current Plan' : changing ? 'Updating…' : 'Switch Plan'}
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-ghost" onClick={openBillingPortal} disabled={portalLoading}>
        {portalLoading ? 'Opening…' : 'Manage Billing / Cancel Membership'}
      </button>
    </>
  )
}
