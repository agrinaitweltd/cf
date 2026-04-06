import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIntersection } from '../hooks/useIntersection'
import PageBanner from '../components/PageBanner'
import CTABanner from '../components/CTABanner'
import { services } from '../data/services'
import styles from './ServicePage.module.css'

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqOpen : ''}`}>
      <button
        className={styles.faqQ}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <svg
          className={`${styles.faqChevron} ${open ? styles.faqChevronUp : ''}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      {open && <p className={styles.faqA}>{a}</p>}
    </div>
  )
}

function ServicePage({ service }) {
  const [bodyRef, bodyVisible]   = useIntersection()
  const [statsRef, statsVisible] = useIntersection()
  const [faqRef, faqVisible]     = useIntersection()

  const others = services.filter(s => s.id !== service.id).slice(0, 3)

  return (
    <>
      <PageBanner
        title={service.title}
        subtitle={service.tagline}
        image={service.banner}
      />

      {/* ——— Stats Bar ——— */}
      <section className={styles.statsBar}>
        <div className="container">
          <div ref={statsRef} className={styles.statsGrid}>
            {service.stats.map((s, i) => (
              <div key={s.label} className={`reveal ${statsVisible ? 'visible' : ''} d${i + 1} ${styles.statItem}`}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Main Content ——— */}
      <section className="section">
        <div className="container">
          <div ref={bodyRef} className={styles.bodyGrid}>

            {/* Left – detail image */}
            <div className={`reveal-left ${bodyVisible ? 'visible' : ''}`}>
              <div
                className={styles.detailImage}
                style={{ backgroundImage: `url(${service.detail})` }}
                role="img"
                aria-label={`${service.title} detail`}
              />
            </div>

            {/* Right – description + includes */}
            <div className={`reveal-right ${bodyVisible ? 'visible' : ''} ${styles.bodyContent}`}>
              <span className="label">About This Service</span>
              <h2>{service.tagline}</h2>
              {service.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}

              <div className={styles.includesWrap}>
                <h3 className={styles.includesTitle}>What's Included</h3>
                <ul className={styles.includesList}>
                  {service.includes.map(item => (
                    <li key={item} className={styles.includesItem}>
                      <span className={styles.includesTick} aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/contact" className={`btn btn-primary ${styles.ctaBtn}`}>
                Request a Quote
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Our Approach ——— */}
      <section className={`section section--alt ${styles.approachSection}`}>
        <div className="container">
          <div className={styles.approachGrid}>
            <div className={styles.approachLeft}>
              <span className="label">Our Approach</span>
              <h2>How We Deliver {service.title}</h2>
            </div>
            <div className={styles.approachRight}>
              <p className={styles.approachText}>{service.approach}</p>
              <Link to="/contact" className="btn btn-ghost">Book a Consultation</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section className="section">
        <div className="container">
          <div ref={faqRef} className={`section-head ${faqVisible ? 'reveal visible' : 'reveal'}`}>
            <span className="label">Frequently Asked</span>
            <h2>Frequently Asked Questions</h2>
            <p className="faq-intro">Below you'll find answers to the most common questions about our services. If you need more information, please contact us directly.</p>
          </div>
          <div className={styles.faqList}>
            {service.faq.map((item, i) => (
              <div key={i} className={`reveal ${faqVisible ? 'visible' : ''} d${i + 1}`}>
                <FAQItem q={item.q} a={item.a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Other Services ——— */}
      <section className={`section section--alt ${styles.othersSection}`}>
        <div className="container">
          <div className="section-head">
            <span className="label">Explore More</span>
            <h2>Other Services</h2>
            <p>We offer a full range of property improvement services to cover every need.</p>
          </div>
          <div className="grid-3">
            {others.map(s => (
              <Link key={s.id} to={`/services/${s.slug}`} className={styles.otherCard}>
                <div
                  className={styles.otherImage}
                  style={{ backgroundImage: `url(${s.serviceImage})` }}
                  aria-hidden="true"
                />
                <div className={styles.otherBody}>
                  <h3 className={styles.otherTitle}>{s.title}</h3>
                  <span className={styles.otherLink}>
                    View Service
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        heading={`Ready to Get Started with ${service.title}?`}
        subtext="Contact our team today for a free, no-obligation consultation and quote."
      />
    </>
  )
}

export default ServicePage
