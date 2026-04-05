import { useIntersection } from '../hooks/useIntersection'
import PageBanner from '../components/PageBanner'
import CTABanner from '../components/CTABanner'
import ServiceCard from '../components/ServiceCard'
import { services } from '../data/services'
import styles from './Services.module.css'

function Services() {
  const [gridRef, gridVisible] = useIntersection()

  return (
    <>
      <PageBanner
        title="Our Services"
        subtitle="A complete range of professional property improvement services, delivered to the highest standard across the UK."
        image="/about-banner.png"
      />

      {/* ── Services Grid ── */}
      <section className="section">
        <div className="container">
          <div ref={gridRef} className={`section-head section-head--center ${gridVisible ? 'reveal visible' : 'reveal'}`}>
            <span className="label">What We Offer</span>
            <h2>Every Service You Need</h2>
            <p>
              From structural renovations and bespoke carpentry to electrics, plumbing and
              finishing touches — our specialist teams cover every aspect of property improvement.
            </p>
          </div>
          <div className={`grid-3 ${styles.grid}`}>
            {services.map((s, i) => (
              <div key={s.id} className={`reveal ${gridVisible ? 'visible' : ''} d${(i % 6) + 1}`}>
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className={`section section--alt ${styles.processSection}`}>
        <div className="container">
          <div className="section-head section-head--center">
            <span className="label">How It Works</span>
            <h2>Our Simple Process</h2>
            <p>Getting started is straightforward. From first contact to final completion, we keep things clear and simple.</p>
          </div>
          <div className={styles.steps}>
            {[
              { num: '01', title: 'Get in Touch', desc: 'Contact us by phone, email or through our online form. Tell us about your project and we\'ll get back to you promptly.' },
              { num: '02', title: 'Free Consultation', desc: 'We arrange a convenient time to visit your property, assess the work and discuss your requirements in detail.' },
              { num: '03', title: 'Receive Your Quote', desc: 'We provide a clear, itemised quote with full transparency on costs, materials and timescales. No hidden fees.' },
              { num: '04', title: 'Work Begins', desc: 'Our skilled team arrives on time and gets to work. We deliver quality throughout and leave your property clean and tidy.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className={styles.step}>
                <div className={styles.stepNum}>{num}</div>
                <div className={styles.stepLine} aria-hidden="true" />
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        heading="Not Sure Which Service You Need?"
        subtext="Contact us and one of our specialists will advise you on the best solution for your property."
      />
    </>
  )
}

export default Services
