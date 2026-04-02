import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Projects from './pages/Projects'
import Contact from './pages/Contact'
import Renovations from './pages/Renovations'
import Painting from './pages/Painting'
import Carpentry from './pages/Carpentry'
import Handyman from './pages/Handyman'
import Electrics from './pages/Electrics'
import Plumbing from './pages/Plumbing'

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
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
    </>
  )
}

export default App
