import styles from './CleaningBanner.module.css'

function CleaningBanner({ title, subtitle, tone = 'default' }) {
  return (
    <section className={`${styles.banner} ${styles[tone] || ''} animate-mobile-fadeup`} aria-label={`${title} page banner`}>
      <div className={styles.orbOne} aria-hidden="true" />
      <div className={styles.orbTwo} aria-hidden="true" />
      <div className={styles.gridGlow} aria-hidden="true" />
      <div className="container">
        <div className={styles.content}>
          <span className="label">CF Hub & Co. Cleaning Services</span>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
    </section>
  )
}

export default CleaningBanner
