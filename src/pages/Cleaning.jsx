import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CTABanner from '../components/CTABanner'
import { mainCleaningServices, cleaningTestimonials, cleaningGallerySections } from '../data/cleaning'
import styles from './Cleaning.module.css'

const CYCLE_WORDS = ['Residential', 'Commercial', 'Deep Clean', 'End of Tenancy', 'Office', 'Carpet']

function useTypewriter(words, typingSpeed = 80, deletingSpeed = 50, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState('typing')

  useEffect(() => {
    const word = words[wordIdx]
    let timeout

    if (phase === 'typing') {
      if (display.length < word.length) {
        timeout = setTimeout(() => setDisplay(word.slice(0, display.length + 1)), typingSpeed)
      } else {
        timeout = setTimeout(() => setPhase('deleting'), pause)
      }
    } else if (phase === 'deleting') {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(display.slice(0, -1)), deletingSpeed)
      } else {
        setWordIdx((i) => (i + 1) % words.length)
        setPhase('typing')
      }
    }

    return () => clearTimeout(timeout)
  }, [display, phase, wordIdx, words, typingSpeed, deletingSpeed, pause])

  return display
}

function Cleaning() {
  const homeGallery = cleaningGallerySections.slice(0, 2)
  const heroImage = '/cleaning/gallery/hero41.png'
  const typedWord = useTypewriter(CYCLE_WORDS)

  const handleHeroImageError = ({ currentTarget }) => {
    if (currentTarget.src.includes('/cleaning/gallery/photo1.png')) return
    currentTarget.src = '/cleaning/gallery/photo1.png'
  }

  return (
    <>
      <section className={`${styles.hero} animate-fadein-up`} style={{ backgroundImage: `url(${heroImage})` }} aria-label="CF Hub & Co. Cleaning Services hero">
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroContent}>
            <span className="label">CF Hub & Co. Cleaning Services</span>
            <h1>
              Reliable, Professional and Trusted{' '}
              <span className={styles.heroTyped}>{typedWord}</span>
              <span className={styles.heroCursor} aria-hidden="true" />
              <br />Cleaning Services
            </h1>
            <p>
              High-standard residential and commercial cleaning delivered by trained,
              fully insured and trusted cleaning professionals.
            </p>
            <div className={styles.heroActions}>
              <Link to="/cleaning/contact" className="btn btn-primary">Book a Cleaning Service</Link>
              <Link to="/cleaning/services" className="btn btn-outline">Explore Cleaning Services</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.trustSection}`}>
        <div className="container">
          <div className={styles.trustCard}>
            <span className="label">Trust & Safety</span>
            <p>
              All our cleaners are fully insured, trained, DBS checked and criminal record checked for your peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Core Services Section */}

      <section className="section">
        <div className="container">
          <div className={`section-head section-head--center ${styles.headAnimated}`}>
            <span className="label">Core Services</span>
            <h2>Cleaning Services Built Around Your Property</h2>
            <p>
              Specialist one-off and recurring cleaning services tailored to your exact requirements.
            </p>
          </div>
          <div className="grid-3">
            {mainCleaningServices.map((service, index) => (
              <article key={service} className={styles.serviceCard} style={{ '--card-delay': `${index * 0.08}s` }}>
                <h3>{service}</h3>
                <p>Delivered by trusted, detail-focused cleaners with professional standards throughout.</p>
              </article>
            ))}
          </div>
          <div className={styles.sectionCta}>
            <Link to="/cleaning/services" className="btn btn-ghost">View All Cleaning Services</Link>
          </div>
        </div>
      </section>

      <section className={`section section--alt ${styles.reviewSection}`}>
        <div className="container">
          <div className={`section-head section-head--center ${styles.headAnimated}`}>
            <span className="label">Reviews & Testimonials</span>
            <h2>Trusted By Homeowners, Landlords and Businesses</h2>
          </div>
          <div className="grid-3">
            {cleaningTestimonials.map((item, index) => (
              <article key={item.quote} className={styles.reviewCard} style={{ '--card-delay': `${index * 0.08}s` }}>
                <p className={styles.reviewQuote}>"{item.quote}"</p>
                <span className={styles.reviewName}>{item.name}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {homeGallery.map(section => (
        <section key={section.id} className="section">
          <div className="container">
            <div className={`section-head ${styles.headAnimated}`}>
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

      <CTABanner
        heading="Need A Trusted Cleaning Team?"
        subtext="Book CF Hub & Co. Cleaning Services today for reliable, professional results."
        btnLabel="Book Cleaning"
        btnTo="/cleaning/contact"
      />
    </>
  )
}

export default Cleaning
