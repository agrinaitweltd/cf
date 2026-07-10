import styles from './CleaningBanner.module.css'

function CleaningBanner({ title, subtitle, tone = 'default', images = [] }) {
  const handleHeroImageError = ({ currentTarget }) => {
    if (currentTarget.src.includes('/cleaning/gallery/photo1.png')) return
    currentTarget.src = '/cleaning/gallery/photo1.png'
  }

  return (
    <section className={`${styles.banner} ${styles[tone] || ''} animate-mobile-fadeup`} aria-label={`${title} page banner`}>
      <div className={styles.orbOne} aria-hidden="true" />
      <div className={styles.orbTwo} aria-hidden="true" />
      <div className={styles.gridGlow} aria-hidden="true" />
      {images.length > 0 && (
        <div className={styles.heroGallery} aria-label="Featured cleaning images background">
          {images.slice(0, 4).map((src, idx) => (
            <figure key={src} className={styles.heroGalleryItem} style={{ '--hero-delay': `${idx * 0.09}s` }}>
              <img
                src={src}
                alt={`${title} highlight ${idx + 1}`}
                loading="eager"
                decoding="async"
                fetchpriority="high"
                onError={handleHeroImageError}
              />
            </figure>
          ))}
        </div>
      )}
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
