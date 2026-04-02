import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import styles from './Header.module.css'
import { services } from '../data/services'

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const close = () => setMobileOpen(false)

  const navClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={close}>
          <img src="/logo.png" alt="CF Hub UK" className={styles.logoImg} />
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/about" className={navClass}>About</NavLink>

          {/* Services dropdown */}
          <div
            className={styles.dropdownWrap}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <NavLink to="/services" end={false} className={navClass}>
              Services
              <svg className={`${styles.chevron} ${dropdownOpen ? styles.chevronUp : ''}`} width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden="true">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </NavLink>
            <div className={`${styles.dropdown} ${dropdownOpen ? styles.dropdownVisible : ''}`} role="menu">
              {services.map(s => (
                <Link
                  key={s.id}
                  to={`/services/${s.slug}`}
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                  role="menuitem"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </div>

          <NavLink to="/projects" className={navClass}>Projects</NavLink>
          <NavLink to="/contact" className={navClass}>Contact</NavLink>
        </nav>

        <Link to="/contact" className={styles.ctaBtn} aria-label="Get a quote">
          Get a Quote
        </Link>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Drawer */}
      <nav
        className={`${styles.mobileNav} ${mobileOpen ? styles.mobileNavOpen : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <NavLink to="/" end className={styles.mobileLink} onClick={close}>Home</NavLink>
        <NavLink to="/about" className={styles.mobileLink} onClick={close}>About</NavLink>
        <NavLink to="/services" className={styles.mobileLink} onClick={close}>Services</NavLink>

        <div className={styles.mobileSubGroup}>
          {services.map(s => (
            <Link
              key={s.id}
              to={`/services/${s.slug}`}
              className={styles.mobileSubLink}
              onClick={close}
            >
              {s.title}
            </Link>
          ))}
        </div>

        <NavLink to="/projects" className={styles.mobileLink} onClick={close}>Projects</NavLink>
        <NavLink to="/contact" className={styles.mobileLink} onClick={close}>Contact</NavLink>
        <Link to="/contact" className={styles.mobileCta} onClick={close}>Get a Quote</Link>
      </nav>
    </header>
  )
}

export default Header
