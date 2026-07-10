import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import styles from './Header.module.css'
import { services } from '../data/services'

function Header() {
  const { pathname } = useLocation()
  const isCleaning = pathname.startsWith('/cleaning')
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

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const close = () => setMobileOpen(false)

  const navClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink

  const mobileLinkClass = ({ isActive }) =>
    isActive ? `${styles.mobileLink} ${styles.mobileLinkActive}` : styles.mobileLink

  const persistSelection = (service) => () => {
    window.localStorage.setItem('cf-service-selection', service)
  }

  return (
    <>
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${mobileOpen ? styles.menuOpen : ''}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to={isCleaning ? '/cleaning' : '/'} className={styles.logo} onClick={close}>
          <img
            src={isCleaning ? '/logo2.png' : '/logo.png'}
            alt={isCleaning ? 'CF Hub & Co. Cleaning Services' : 'CF Hub UK'}
            className={styles.logoImg + ' animate-fadein'}
            loading="lazy"
            decoding="async"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {isCleaning ? (
            <>
              <NavLink to="/cleaning" end className={navClass}>Home</NavLink>
              <NavLink to="/cleaning/services" className={navClass}>Services</NavLink>
              <NavLink to="/cleaning/gallery" className={navClass}>Gallery</NavLink>
              <NavLink to="/cleaning/contact" className={navClass}>Contact</NavLink>
              <NavLink to="/cleaning/join" className={navClass}>Join the Team</NavLink>
            </>
          ) : (
            <>
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
              <NavLink to="/join" className={navClass}>Join the Team</NavLink>
            </>
          )}
        </nav>

        <div className={styles.headerActions}>
          <Link
            to={isCleaning ? '/' : '/cleaning'}
            className={styles.switchBtn}
            aria-label="Switch services"
            onClick={persistSelection(isCleaning ? 'handyman' : 'cleaning')}
          >
            {isCleaning ? 'Handyman' : 'Cleaning'}
          </Link>
          <Link to="/select-service" className={styles.switchGhost} aria-label="Choose service">
            Switch
          </Link>
          <Link to={isCleaning ? '/cleaning/contact' : '/contact'} className={styles.ctaBtn} aria-label="Get a quote">
            {isCleaning ? 'Book Cleaning' : 'Get a Quote'}
          </Link>
        </div>

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
    </header>

      {/* Mobile Drawer - outside header to avoid backdrop-filter containing block */}
      <nav
        className={`${styles.mobileNav} ${mobileOpen ? styles.mobileNavOpen : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? '' : undefined}
      >
        <div className={styles.mobileLinks}>
          {isCleaning ? (
            <>
              <NavLink to="/cleaning" end className={mobileLinkClass} onClick={close} style={{ '--item-i': 0 }}>
                <span className={styles.mobileNum}>01</span>
                <span className={styles.mobileTxt}>Cleaning Home</span>
                <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </NavLink>

              <NavLink to="/cleaning/services" className={mobileLinkClass} onClick={close} style={{ '--item-i': 1 }}>
                <span className={styles.mobileNum}>02</span>
                <span className={styles.mobileTxt}>Services</span>
                <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </NavLink>

              <NavLink to="/cleaning/gallery" className={mobileLinkClass} onClick={close} style={{ '--item-i': 2 }}>
                <span className={styles.mobileNum}>03</span>
                <span className={styles.mobileTxt}>Gallery</span>
                <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </NavLink>

              <NavLink to="/cleaning/contact" className={mobileLinkClass} onClick={close} style={{ '--item-i': 3 }}>
                <span className={styles.mobileNum}>04</span>
                <span className={styles.mobileTxt}>Contact</span>
                <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </NavLink>

              <NavLink to="/cleaning/join" className={mobileLinkClass} onClick={close} style={{ '--item-i': 4 }}>
                <span className={styles.mobileNum}>05</span>
                <span className={styles.mobileTxt}>Join the Team</span>
                <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </NavLink>

              <NavLink
                to="/"
                end
                className={mobileLinkClass}
                onClick={() => {
                  persistSelection('handyman')()
                  close()
                }}
                style={{ '--item-i': 5 }}
              >
                <span className={styles.mobileNum}>06</span>
                <span className={styles.mobileTxt}>Handyman Services</span>
                <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={mobileLinkClass} onClick={close} style={{ '--item-i': 0 }}>
            <span className={styles.mobileNum}>01</span>
            <span className={styles.mobileTxt}>Home</span>
            <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavLink>

          <NavLink to="/about" className={mobileLinkClass} onClick={close} style={{ '--item-i': 1 }}>
            <span className={styles.mobileNum}>02</span>
            <span className={styles.mobileTxt}>About</span>
            <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavLink>

          <NavLink to="/services" className={mobileLinkClass} onClick={close} style={{ '--item-i': 2 }}>
            <span className={styles.mobileNum}>03</span>
            <span className={styles.mobileTxt}>Services</span>
            <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavLink>

          <div className={styles.mobileSubGroup}>
            {services.map(s => (
              <Link key={s.id} to={`/services/${s.slug}`} className={styles.mobileSubLink} onClick={close}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {s.title}
              </Link>
            ))}
          </div>

          <NavLink to="/projects" className={mobileLinkClass} onClick={close} style={{ '--item-i': 3 }}>
            <span className={styles.mobileNum}>04</span>
            <span className={styles.mobileTxt}>Projects</span>
            <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavLink>

          <NavLink to="/contact" className={mobileLinkClass} onClick={close} style={{ '--item-i': 4 }}>
            <span className={styles.mobileNum}>05</span>
            <span className={styles.mobileTxt}>Contact</span>
            <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavLink>

          <NavLink to="/join" className={mobileLinkClass} onClick={close} style={{ '--item-i': 5 }}>
            <span className={styles.mobileNum}>06</span>
            <span className={styles.mobileTxt}>Join the Team</span>
            <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavLink>
          <NavLink
            to="/cleaning"
            className={mobileLinkClass}
            onClick={() => {
              persistSelection('cleaning')()
              close()
            }}
            style={{ '--item-i': 6 }}
          >
            <span className={styles.mobileNum}>07</span>
            <span className={styles.mobileTxt}>Cleaning Services</span>
            <svg className={styles.mobileArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavLink>
            </>
          )}
        </div>

        <div className={styles.mobileFooter}>
          <Link to={isCleaning ? '/cleaning/contact' : '/contact'} className={styles.mobileCta} onClick={close}>
            {isCleaning ? 'Book Cleaning Service' : 'Get a Free Quote'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Header
