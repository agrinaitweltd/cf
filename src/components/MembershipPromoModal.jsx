import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MembershipPromoModal.module.css'

const DISMISS_KEY = 'cf-membership-promo-dismissed'
const SHOW_DELAY_MS = 1800

export default function MembershipPromoModal() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.')
    setSending(true)
    setError('')
    try {
      await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'clean_club_promo' }),
      })
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleVisit = () => {
    dismiss()
    navigate('/cleaning/membership')
  }

  if (!open) return null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Clean Club membership offer">
      <div className={styles.card}>
        <button type="button" className={styles.closeBtn} onClick={dismiss} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        <div className={styles.imageWrap}>
          <img src="/cleaning/gallery/deep-clean-1.png" alt="Clean Club membership cleaning" loading="lazy" />
        </div>

        <div className={styles.content}>
          {done ? (
            <>
              <h2 className={styles.heading}>You&rsquo;re In! 🎉</h2>
              <p className={styles.body}>Thanks — we&rsquo;ve saved your 10% off code. Head to the Clean Club to pick your plan and it&rsquo;ll be applied at checkout.</p>
              <button type="button" className={`btn btn-primary ${styles.ctaBtn}`} onClick={handleVisit}>
                View Membership Packages
              </button>
            </>
          ) : (
            <>
              <h2 className={styles.heading}>
                <span className={styles.highlight}>Unlock 10% Off</span><br />
                The Clean Club Membership
              </h2>
              <p className={styles.body}>
                Join The Clean Club — regular, reliable cleans with priority booking and member discounts.
                Enter your email to unlock 10% off your first membership.
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className={styles.input}
                  aria-label="Email address"
                />
                <button type="submit" className={`btn btn-primary ${styles.ctaBtn}`} disabled={sending}>
                  {sending ? 'Unlocking…' : 'Unlock Offer'}
                </button>
              </form>

              {error && <p className={styles.error}>{error}</p>}

              <p className={styles.fineprint}>
                By signing up, you agree to receive email marketing from CF Hub & Co. You can unsubscribe at any time.
              </p>

              <button type="button" className={styles.noThanks} onClick={dismiss}>No, thanks</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
