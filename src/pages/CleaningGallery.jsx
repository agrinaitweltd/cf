import PageBanner from '../components/PageBanner'
import { cleaningGallerySections } from '../data/cleaning'
import styles from './CleaningGallery.module.css'

function CleaningGallery() {
  return (
    <>
      <PageBanner
        title="Cleaning Gallery"
        subtitle="Upload your own work photos into these path references in the public folder."
        image="/projects-banner.png"
      />

      {cleaningGallerySections.map(section => (
        <section key={section.id} className="section">
          <div className="container">
            <div className="section-head">
              <span className="label">Image Section</span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </div>
            <div className={styles.galleryGrid}>
              {section.images.map((src, idx) => (
                <figure key={src} className={styles.galleryItem}>
                  <img src={src} alt={`${section.title} ${idx + 1}`} loading="lazy" decoding="async" />
                  <figcaption>{src}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

export default CleaningGallery
