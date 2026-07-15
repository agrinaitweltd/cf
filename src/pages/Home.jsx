import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIntersection } from '../hooks/useIntersection'
import ServiceCard from '../components/ServiceCard'
import CTABanner from '../components/CTABanner'
import { services } from '../data/services'
import styles from './Home.module.css'

const CYCLE_WORDS = ['Renovations', 'Carpentry', 'Electrics', 'Plumbing', 'Decorating', 'Handyman']

function useTypewriter(words, typingSpeed = 80, deletingSpeed = 50, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState('typing') // 'typing' | 'pausing' | 'deleting'

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

/* Why Choose Us icons */
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
)
const IconTeam = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
)
const IconPound = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9 10a3 3 0 016 0c0 3-3 4-3 4M9 17h6"/>
  </svg>
)
const IconClock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const whyUs = [
  { Icon: IconShield, title: 'Fully Insured & Reliable', text: 'All work is backed by comprehensive insurance and our quality guarantee. Your property is always in safe hands.' },
  { Icon: IconTeam,   title: 'Skilled Professionals',   text: 'Our team of experienced tradespeople brings deep expertise to every service, delivering results you can trust.' },
  { Icon: IconPound,  title: 'Transparent Pricing',     text: 'Fair, competitive quotes with no hidden costs. We believe in honest, upfront pricing from the first conversation.' },
  { Icon: IconClock,  title: 'Swift Turnaround',        text: 'We respect your time. Projects are completed efficiently and on schedule without ever compromising on quality.' },
]

function Home() {
  const typedWord = useTypewriter(CYCLE_WORDS)
  const [servicesRef, servicesVisible] = useIntersection()
  const [aboutRef, aboutVisible]       = useIntersection()
  const [whyRef, whyVisible]           = useIntersection()
  const [projectsRef, projectsVisible] = useIntersection()

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroContent}>
            <span className="label">UK Property Improvement Specialists</span>
            <h1 className={styles.heroTitle}>
              Expert{' '}
              <span className={styles.heroTypeWrap}>
                <span className={styles.heroTyped}>{typedWord}</span>
                <span className={styles.heroCursor} aria-hidden="true" />
              </span>
              <br />Services Across the UK
            </h1>
            <p className={styles.heroSub}>
              We deliver reliable, high-quality property improvements across the UK.
              From full renovations to emergency handyman services — your property deserves the best.
            </p>
            <div className={styles.heroActions}>
              <Link to="/contact" className="btn btn-primary">
                Get a Quote
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/services" className="btn btn-outline">Our Services</Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}><strong>250+</strong><span>Renovations Completed</span></div>
              <div className={styles.heroStatDivider} aria-hidden="true" />
              <div cladssName={styles.heroStat}><strong>5+</strong><span>Years Experience</span></div>
              <div className={styles.heroStatDivider} aria-hidden="true" />
              <div className={styles.heroStat}><strong>100%</strong><span>Fully Insured</span></div>
              <div className={styles.heroStatDivider} aria-hidden="true" />
              <div className={styles.heroStat}><strong>5★</strong><span>Client Rating</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Overview ── */}
      <section className={`section ${styles.servicesSection} animate-fadein-up`}>
        <div className="container">
          <div ref={servicesRef} className={`section-head section-head--center ${servicesVisible ? 'reveal visible' : 'reveal'}`}>
            <span className="label">What We Do</span>
            <h2>Our Services</h2>
            <p>
              From structural renovations to finishing touches, we offer a complete range of
              professional property improvement services tailored to your needs.
            </p>
          </div>
          <div className={`grid-3 ${styles.serviceGrid}`}>
            {services.map((s, i) => (
              <div key={s.id} className={`reveal ${servicesVisible ? 'visible' : ''} d${i + 1}`}>
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
          <div className={styles.servicesCta}>
            <Link to="/services" className="btn btn-ghost">View All Services</Link>
          </div>
        </div>
      </section>

      {/* ── About Preview ── */}
      <section className={`section section--alt ${styles.aboutSection} animate-fadein-up`}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div
              ref={aboutRef}
              className={`reveal-left ${aboutVisible ? 'visible' : ''}`}
            >
              <div className={styles.aboutImage} style={{ backgroundImage: 'url(/about-team.png)' }}>
                <div className={styles.aboutBadge}>
                  <span className={styles.badgeNum}>5+</span>
                  <span className={styles.badgeTxt}>Years of Excellence</span>
                </div>
              </div>
            </div>
            <div className={`reveal-right ${aboutVisible ? 'visible' : ''} ${styles.aboutText}`}>
              <span className="label">About CF HUB UK</span>
              <h2>Built on Trust, Delivered with Pride</h2>
              <p>
                Trusted by homeowners and businesses across the UK, CF HUB UK has grown to
                become one of the country's most reliable property improvement companies. Our
                journey began with a simple belief: that every property deserves quality
                craftsmanship and every client deserves honest, dependable service.
              </p>
              <p>
                Today, our multidisciplinary team of skilled tradespeople covers everything from
                full property renovations and bespoke carpentry, to electrical, plumbing and
                decorating services — delivered to the highest standard, every time.
              </p>
              <Link to="/about" className="btn btn-ghost" style={{ marginTop: '32px' }}>
                Read Our Story
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className={`section ${styles.whySection} animate-fadein-up`}>
        <div className="container">
          <div ref={whyRef} className={`section-head section-head--center ${whyVisible ? 'reveal visible' : 'reveal'}`}>
            <span className="label">Why CF HUB UK</span>
            <h2>The Standard You Deserve</h2>
            <p>
              We hold ourselves to the highest professional standards so you
              never have to compromise on quality, reliability or value.
            </p>
          </div>
          <div className="grid-4">
            {whyUs.map(({ Icon, title, text }, i) => (
              <div key={title} className={`reveal ${whyVisible ? 'visible' : ''} d${i + 1} ${styles.whyCard}`}>
                <div className={styles.whyIcon}><Icon /></div>
                <h3 className={styles.whyTitle}>{title}</h3>
                <p className={styles.whyText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Projects ── */}
      <section className={`section section--alt ${styles.projectsSection} animate-fadein-up`}>
        <div className="container">
          <div ref={projectsRef} className={`section-head ${projectsVisible ? 'reveal visible' : 'reveal'}`}>
            <span className="label">Our Work</span>
            <h2>Recent Projects</h2>
            <p>A selection of our latest work across properties throughout the UK.</p>
          </div>
          <div className={styles.projectGrid}>
            {[1, 2, 3, 4].map((n, i) => (
              <div
                key={n}
                className={`reveal ${projectsVisible ? 'visible' : ''} d${i + 1} ${styles.projectCard}`}
                style={{ backgroundImage: `url(/project${n}.png)` }}
                role="img"
                aria-label={`Project ${n}`}
              >
                <div className={styles.projectOverlay}>
                  <span className={styles.projectLabel}>View Project</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.projectsCta}>
            <Link to="/projects" className="btn btn-ghost">View All Projects</Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <CTABanner
        heading="Need a Reliable Team? Let's Get Started Today."
        subtext="Contact us for a free, no-obligation quote tailored to your project."
      />
    </>
  )
}

export default Home