import { Link } from 'react-router-dom'
import CleaningBanner from '../components/CleaningBanner'
import CTABanner from '../components/CTABanner'
import { mainCleaningServices, additionalCleaningServices, cleaningGallerySections } from '../data/cleaning'
import styles from './CleaningServices.module.css'

function CleaningServices() {
  const serviceGallery = cleaningGallerySections.slice(2, 4)

  return (
    <>
      <CleaningBanner
        title="Cleaning Services"
        subtitle="Professional cleaning services tailored for homes, landlords and businesses."
        tone="services"
      />

      <section className="section">
        <div className="container">
          <div className={`section-head section-head--center ${styles.headAnimated}`}>
            <span className="label">Main Services</span>
            <h2>Specialist Cleaning Solutions</h2>
            <p>
              End of tenancy, deep cleans, commercial and post-construction cleaning handled by trained professionals.
            </p>
          </div>
          <div className="grid-3">
            {mainCleaningServices.map((service, index) => (
              <article key={service} className={styles.card} style={{ '--card-delay': `${index * 0.08}s` }}>
                <h3>{service}</h3>
                <p>Delivered with professional checklists, quality controls and trusted staff.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`section section--alt ${styles.altSection}`}>
        <div className="container">
          <div className={`section-head section-head--center ${styles.headAnimated}`}>
            <span className="label">Additional Services</span>
            <h2>Flexible Add-On Cleaning Services</h2>
          </div>
          <div className="grid-3">
            {additionalCleaningServices.map((service, index) => (
              <article key={service} className={styles.card} style={{ '--card-delay': `${index * 0.08}s` }}>
                <h3>{service}</h3>
                <p>Combine these options with your main cleaning package for a complete service.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {serviceGallery.map(section => (
        <section key={section.id} className="section">
          <div className="container">
            <div className={`section-head ${styles.headAnimated}`}>
              <span className="label">Service Image Section</span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </div>
            <div className={styles.galleryGrid}>
              {section.images.map((src, idx) => (
                <figure key={src} className={styles.galleryItem} style={{ '--card-delay': `${idx * 0.07}s` }}>
                  <img src={src} alt={`${section.title} ${idx + 1}`} loading="lazy" decoding="async" />
                  <figcaption>{src}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className={`section section--alt ${styles.ctaRow}`}>
        <div className="container">
          <div className={styles.inlineActions}>
            <Link to="/cleaning/gallery" className="btn btn-ghost">View Full Cleaning Gallery</Link>
            <Link to="/cleaning/contact" className="btn btn-primary">Book Cleaning Service</Link>
          </div>
        </div>
      </section>

      <CTABanner
        heading="Need Advice On The Right Cleaning Package?"
        subtext="Contact us for a tailored recommendation and quote."
        btnLabel="Speak to the Team"
        btnTo="/cleaning/contact"
      />
    </>
  )
}

export default CleaningServices
