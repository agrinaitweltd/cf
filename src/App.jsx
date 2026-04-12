import { lazy, Suspense, useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import LoadingScreen from './components/LoadingScreen'
import CookieConsent from './components/CookieConsent'

const Home        = lazy(() => import('./pages/Home'))
const About       = lazy(() => import('./pages/About'))
const Services    = lazy(() => import('./pages/Services'))
const Projects    = lazy(() => import('./pages/Projects'))
const Contact     = lazy(() => import('./pages/Contact'))
const Renovations = lazy(() => import('./pages/Renovations'))
const Painting    = lazy(() => import('./pages/Painting'))
const Carpentry   = lazy(() => import('./pages/Carpentry'))
const Handyman    = lazy(() => import('./pages/Handyman'))
const Electrics   = lazy(() => import('./pages/Electrics'))
const Plumbing    = lazy(() => import('./pages/Plumbing'))
const JoinTeam    = lazy(() => import('./pages/JoinTeam'))

const SEO_BY_PATH = {
  '/': {
    title: 'CF HUB UK | Property Improvement Experts',
    description: 'Trusted property improvement experts for renovations, painting & decorating, carpentry, handyman services, electrics and plumbing across the UK.',
  },
  '/about': {
    title: 'About Us | CF HUB UK',
    description: 'Learn more about CF HUB UK, our standards, and how we deliver reliable property improvement services across the UK.',
  },
  '/services': {
    title: 'Services | CF HUB UK',
    description: 'Explore our full range of services including renovations, painting, carpentry, handyman, electrics and plumbing.',
  },
  '/services/renovations': {
    title: 'Renovations | CF HUB UK',
    description: 'Professional home and property renovation services tailored to your goals, timeline and budget.',
  },
  '/services/painting-decorating': {
    title: 'Painting & Decorating | CF HUB UK',
    description: 'High-quality painting and decorating for residential and commercial properties across the UK.',
  },
  '/services/carpentry': {
    title: 'Carpentry Services | CF HUB UK',
    description: 'Skilled carpentry solutions including bespoke woodwork, fittings and structural improvements.',
  },
  '/services/handyman': {
    title: 'Handyman Services | CF HUB UK',
    description: 'Reliable handyman support for repairs, maintenance and small improvement jobs.',
  },
  '/services/electrics': {
    title: 'Electrical Services | CF HUB UK',
    description: 'Safe, efficient electrical services completed by qualified professionals.',
  },
  '/services/plumbing': {
    title: 'Plumbing Services | CF HUB UK',
    description: 'Trusted plumbing support for installations, maintenance and urgent repairs.',
  },
  '/projects': {
    title: 'Projects | CF HUB UK',
    description: 'Browse recent projects and examples of our workmanship across multiple trades.',
  },
  '/contact': {
    title: 'Contact Us | CF HUB UK',
    description: 'Get in touch for a free consultation and quote for your next property improvement project.',
  },
  '/join': {
    title: 'Join Our Team | CF HUB UK',
    description: 'Apply to join CF HUB UK as a skilled tradesperson and work on projects across the UK.',
  },
}

function App() {
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(true);
  const previousPathRef = useRef(pathname);

  const handleFinish = useCallback(() => setLoading(false), []);

  useLayoutEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      setLoading(true);
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      window.sessionStorage.setItem('cf-initial-loaded', 'true');
    }
  }, [loading]);

  useEffect(() => {
    const baseUrl = 'https://www.cfhubuk.com'
    const meta = SEO_BY_PATH[pathname] ?? SEO_BY_PATH['/']
    const canonicalUrl = pathname === '/' ? `${baseUrl}/` : `${baseUrl}${pathname}`

    document.title = meta.title

    const setMeta = (name, content) => {
      let tag = document.head.querySelector(`meta[name="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    const setPropertyMeta = (property, content) => {
      let tag = document.head.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    setMeta('description', meta.description)
    setPropertyMeta('og:title', meta.title)
    setPropertyMeta('og:description', meta.description)
    setPropertyMeta('og:url', canonicalUrl)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [pathname]);

  if (loading) {
    return <LoadingScreen key={pathname} onFinish={handleFinish} />;
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <Suspense fallback={<main className="pageFallback" aria-hidden="true" />}>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/renovations" element={<Renovations />} />
            <Route path="/services/painting-decorating" element={<Painting />} />
            <Route path="/services/carpentry" element={<Carpentry />} />
            <Route path="/services/handyman" element={<Handyman />} />
            <Route path="/services/electrics" element={<Electrics />} />
            <Route path="/services/plumbing" element={<Plumbing />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/join" element={<JoinTeam />} />
          </Routes>
        </main>
        <Footer />
      </Suspense>
      <CookieConsent />
    </>
  );
}

export default App
