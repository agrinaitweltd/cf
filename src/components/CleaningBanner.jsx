import styles from './CleaningBanner.module.css'

function CleaningBanner({ title, subtitle, tone = 'default', images = [] }) {
  const heroImage = images[0] || '/cleaning/gallery/hero41.png'

  return (
    <section
      className={`${styles.banner} ${styles[tone] || ''} animate-mobile-fadeup`}
      style={{ backgroundImage: `url(${heroImage})` }}
      aria-label={`${title} page banner`}
    >
      <div className={styles.overlay} aria-hidden="true" />
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
