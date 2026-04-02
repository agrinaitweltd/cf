import { Link } from 'react-router-dom'
import styles from './CTABanner.module.css'

function CTABanner({ heading, subtext, btnLabel = 'Get a Quote', btnTo = '/contact' }) {
  return (
    <section className={styles.section} aria-label="Call to action">
      <div className={styles.glow} aria-hidden="true" />
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.text}>
            <h2 className={styles.heading}>{heading}</h2>
            {subtext && <p className={styles.subtext}>{subtext}</p>}
          </div>
          <Link to={btnTo} className={`btn btn-primary ${styles.btn}`}>
            {btnLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTABanner
