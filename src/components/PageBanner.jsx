import styles from './PageBanner.module.css'

function PageBanner({ title, subtitle, image }) {
  return (
    <section
      className={styles.banner + ' animate-zoomout'}
      style={{ backgroundImage: `url(${image})` }}
      aria-label={`${title} page banner`}
    >
      <div className={styles.overlay} aria-hidden="true" />
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
    </section>
  )
}

export default PageBanner
