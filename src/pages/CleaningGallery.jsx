import CleaningBanner from '../components/CleaningBanner'
import { cleaningGallerySections } from '../data/cleaning'
import styles from './CleaningGallery.module.css'

function CleaningGallery() {
  const bannerImages = cleaningGallerySections[0]?.images || []

  return (
    <>
      <CleaningBanner
        title="Cleaning Gallery"
        subtitle="Upload your own work photos into these path references in the public folder."
        tone="gallery"
        images={bannerImages}
      />

      {cleaningGallerySections.map(section => (
        <section key={section.id} className="section">
          <div className="container">
            <div className={`${styles.headAnimated} section-head`}>
              <span className="label">Image Section</span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </div>
            <div className={styles.galleryGrid}>
              {section.images.map((src, idx) => (
                <figure key={src} className={styles.galleryItem} style={{ '--card-delay': `${idx * 0.07}s` }}>
                  <img src={src} alt={`${section.title} ${idx + 1}`} loading="lazy" decoding="async" />
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
