import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import { services } from '../data/services'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>

            {/* Brand */}
            <div className={styles.brand}>
              <Link to="/" className={styles.logo}>
                <img src="/logo.png" alt="CF Hub UK" className={styles.logoImg + ' animate-fadein'} loading="lazy" decoding="async" />
              </Link>
              <p className={styles.tagline}>
                Your trusted property improvement experts across the UK. Quality
                craftsmanship, transparent pricing and exceptional service on every project.
              </p>
              <div className={styles.socials}>
                {/* Facebook */}
                <a href="#" aria-label="Facebook" className={styles.socialIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" aria-label="Instagram" className={styles.socialIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" aria-label="LinkedIn" className={styles.socialIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                {/* X / Twitter */}
                <a href="#" aria-label="X (Twitter)" className={styles.socialIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Quick Links</h4>
              <nav>
                <Link to="/" className={styles.footerLink}>Home</Link>
                <Link to="/about" className={styles.footerLink}>About Us</Link>
                <Link to="/services" className={styles.footerLink}>Our Services</Link>
                <Link to="/projects" className={styles.footerLink}>Projects</Link>
                <Link to="/contact" className={styles.footerLink}>Contact Us</Link>
                <Link to="/contact" className={styles.footerLink}>Get a Quote</Link>
              </nav>
            </div>

            {/* Services */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Our Services</h4>
              <nav>
                {services.map(s => (
                  <Link key={s.id} to={`/services/${s.slug}`} className={styles.footerLink}>
                    {s.title}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Get in Touch</h4>
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.36 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                  </svg>
                  <span>07960481933</span>
                </div>
                <div className={styles.contactItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>enquiries@cfhubuk.com</span>
                </div>
                <div className={styles.contactItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Serving all across the United Kingdom</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copy}>
              &copy; {year} CF HUB UK. All rights reserved. Made & Developed By Kavo Tech <a href="https://kavotech.uk" target="_blank" rel="noopener noreferrer">https://kavotech.uk</a>
            </p>
            <div className={styles.bottomLinks}>
              <a href="#" className={styles.bottomLink}>Privacy Policy</a>
              <a href="#" className={styles.bottomLink}>Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
