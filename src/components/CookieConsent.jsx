import { useState, useEffect } from 'react'
import styles from './CookieConsent.module.css'

const STORAGE_KEY = 'cf-cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = (choice) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, date: new Date().toISOString() }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.banner} role="dialog" aria-label="Cookie consent" aria-modal="true">
        <h2 className={styles.title}>We care about your privacy</h2>
        <p className={styles.text}>
          We use cookies to ensure our website works properly. To help us improve our
          service, we collect data to understand how people use our site. By allowing all
          cookies, we can enhance your experience even further. This means helping you find
          information more quickly and tailoring content or marketing to your needs. You are
          in complete control and can change your cookie preferences at any time. Select
          &ldquo;Allow All Cookies&rdquo; to agree, &ldquo;Reject Non-Essential Cookies&rdquo; to
          decline non-essential cookies, or &ldquo;Manage Preferences&rdquo; to manage cookie
          preferences. You can find out more by viewing our{' '}
          <a href="#" className={styles.policyLink}>Cookie Policy</a>.
        </p>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => accept('all')}>
            Allow All Cookies
          </button>
          <button className={styles.btnOutline} onClick={() => accept('preferences')}>
            Manage Preferences
          </button>
          <button className={styles.btnOutline} onClick={() => accept('essential')}>
            Reject Non-Essential Cookies
          </button>
        </div>
      </div>
    </>
  )
}
