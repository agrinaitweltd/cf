import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

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
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Suspense fallback={null}>
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
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

export default App
