import styles from './CleaningBanner.module.css'

function CleaningBanner({ title, subtitle, tone = 'default', images = [] }) {
  const handleHeroImageError = ({ currentTarget }) => {
    if (currentTarget.src.includes('/cleaning/gallery/photo1.png')) return
    currentTarget.src = '/cleaning/gallery/photo1.png'
  }

  return (
    <section className={`${styles.banner} ${styles[tone] || ''} animate-mobile-fadeup`} aria-label={`${title} page banner`}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.content}>
            <span className="label">CF Hub & Co. Cleaning Services</span>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CleaningBanner
