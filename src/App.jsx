import { lazy, Suspense, useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import LoadingScreen from './components/LoadingScreen'

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
          </Routes>
        </main>
        <Footer />
      </Suspense>
    </>
  );
}

export default App
