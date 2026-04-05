import { Link } from 'react-router-dom'
import { useIntersection } from '../hooks/useIntersection'
import PageBanner from '../components/PageBanner'
import CTABanner from '../components/CTABanner'
import styles from './About.module.css'

const values = [
  { title: 'Quality',       text: 'We use only the finest materials and proven techniques, ensuring every project we complete meets the highest standard of craftsmanship.' },
  { title: 'Reliability',   text: 'We show up on time, complete work on schedule and communicate clearly throughout every project — no surprises, no excuses.' },
  { title: 'Transparency',  text: 'Honest, upfront pricing with no hidden costs. We give you a clear picture of scope, timeline and cost from the very first meeting.' },
  { title: 'Excellence',    text: 'We hold ourselves to an exceptional standard in everything we do — constantly improving our practices, skills and service.' },
]

function About() {
  const [storyRef, storyVisible]  = useIntersection()
  const [valRef, valVisible]      = useIntersection()
  const [teamRef, teamVisible]    = useIntersection()

  return (
    <>
      <PageBanner
        title="About CF HUB UK"
        subtitle="Trusted property improvement professionals, dedicated to quality and reliability across the UK."
        image="/about-banner.png"
      />

      {/* ── Story ── */}
      <section className="section">
        <div className="container">
          <div ref={storyRef} className={styles.storyGrid}>
            <div className={`reveal-left ${storyVisible ? 'visible' : ''} ${styles.storyText}`}>
              <span className="label">Our Story</span>
              <h2>Founded on Craftsmanship, Built on Trust</h2>
              <p>
                CF HUB UK was founded with a single unwavering commitment — to deliver
                exceptional property improvement services that homeowners and businesses
                could genuinely rely on. What started as a small team of dedicated
                tradespeople has grown into a comprehensive property services company
                trusted by clients across the United Kingdom.
              </p>
              <p>
                From day one, our philosophy has remained consistent: quality craftsmanship,
                honest communication and a genuine care for every project and every client.
                We believe that your home or business deserves the very best — and that's
                exactly what we deliver.
              </p>
              <p>
                Today, CF HUB UK operates a skilled, multidisciplinary team covering
                renovations, painting and decorating, carpentry, handyman services,
                electrical and plumbing work. Every team member shares our core values and
                commitment to the highest professional standard.
              </p>
            </div>
            <div className={`reveal-right ${storyVisible ? 'visible' : ''}`}>
              <div
                className={styles.storyImage}
                style={{ backgroundImage: 'url(/about-team.png)' }}
                role="img"
                aria-label="CF HUB UK team at work"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className={`section section--alt ${styles.missionSection}`}>
        <div className="container">
          <div className={styles.missionInner}>
            <div className={styles.missionAccent} aria-hidden="true" />
            <div className={styles.missionContent}>
              <span className="label">Our Mission</span>
              <blockquote className={styles.missionQuote}>
                "To provide exceptional property improvement services that enhance the quality
                and value of every home and business — delivered by skilled professionals who
                take genuine pride in every job."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="section">
        <div className="container">
          <div ref={valRef} className={`section-head section-head--center ${valVisible ? 'reveal visible' : 'reveal'}`}>
            <span className="label">What We Stand For</span>
            <h2>Our Core Values</h2>
            <p>These principles guide every decision we make and every project we deliver.</p>
          </div>
          <div className="grid-2">
            {values.map(({ title, text }, i) => (
              <div key={title} className={`reveal ${valVisible ? 'visible' : ''} d${i + 1} ${styles.valueCard}`}>
                <div className={styles.valueNum}>0{i + 1}</div>
                <div>
                  <h3 className={styles.valueTitle}>{title}</h3>
                  <p className={styles.valueText}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className={`section section--alt ${styles.teamSection}`}>
        <div className="container">
          <div ref={teamRef} className={`section-head section-head--center ${teamVisible ? 'reveal visible' : 'reveal'}`}>
            <span className="label">Meet the Team</span>
            <h2>The People Behind the Work</h2>
            <p>
              Our team of experienced tradespeople are the backbone of CF HUB UK.
              Skilled, reliable and passionate about the work they do.
            </p>
          </div>
          <div className={styles.teamGrid}>
            {[
              { img: '/team1.png', name: 'James Carter', role: 'Founder & Lead Renovations Specialist' },
              { img: '/team2.png', name: 'Mark Thompson', role: 'Head of Electrical & Plumbing' },
            ].map((member, i) => (
              <div key={member.name} className={`reveal ${teamVisible ? 'visible' : ''} d${i + 1} ${styles.teamCard}`}>
                <div
                  className={styles.teamPhoto}
                  style={{ backgroundImage: `url(${member.img})` }}
                  role="img"
                  aria-label={member.name}
                />
                <div className={styles.teamInfo}>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        heading="Ready to Start Your Project?"
        subtext="Get in touch for a free, no-obligation consultation and quote."
      />
    </>
  )
}

export default About
