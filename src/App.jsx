import { lazy, Suspense, useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
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
const Cleaning    = lazy(() => import('./pages/Cleaning'))
const CleaningServices = lazy(() => import('./pages/CleaningServices'))
const CleaningGallery = lazy(() => import('./pages/CleaningGallery'))
const CleaningContact = lazy(() => import('./pages/CleaningContact'))
const CleaningJoin = lazy(() => import('./pages/CleaningJoin'))
const ServiceSelection = lazy(() => import('./pages/ServiceSelection'))

const SignIn = lazy(() => import('./pages/cleaning-club/SignIn'))
const SignUp = lazy(() => import('./pages/cleaning-club/SignUp'))
const VerifyEmail = lazy(() => import('./pages/cleaning-club/VerifyEmail'))
const ForgotPassword = lazy(() => import('./pages/cleaning-club/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/cleaning-club/ResetPassword'))
const MembershipLanding = lazy(() => import('./pages/cleaning-club/MembershipLanding'))
const MembershipSignup = lazy(() => import('./pages/cleaning-club/MembershipSignup'))
const DashboardLayout = lazy(() => import('./pages/cleaning-club/dashboard/DashboardLayout'))
const Dashboard = lazy(() => import('./pages/cleaning-club/dashboard/Dashboard'))
const MembershipPage = lazy(() => import('./pages/cleaning-club/dashboard/Membership'))
const UpcomingCleans = lazy(() => import('./pages/cleaning-club/dashboard/UpcomingCleans'))
const PaymentHistory = lazy(() => import('./pages/cleaning-club/dashboard/PaymentHistory'))
const CustomerProfile = lazy(() => import('./pages/cleaning-club/dashboard/Profile'))
const ProtectedRoute = lazy(() => import('./components/cleaning-club/ProtectedRoute'))

const SEO_BY_PATH = {
  '/': {
    title: 'CF Hub UK | Choose Your Service',
    description: 'CF Hub UK is an online platform where customers can browse, book and manage professional property services such as cleaning, plumbing, electrical, gardening, decorating, removals and maintenance. Create an account, sign in, manage bookings, view booking history and pay securely online.',
  },
  '/handyman': {
    title: 'CF HUB UK | Handyman Services',
    description: 'Reliable handyman, renovations, painting, carpentry, electrics and plumbing services across the UK.',
  },
  '/select-service': {
    title: 'Choose Service | CF Hub UK',
    description: 'Select CF Hub Handyman Services or CF Hub & Co. Cleaning Services to continue to the right website section.',
  },
  '/cleaning': {
    title: 'CF Hub & Co. Cleaning Services | Trusted Cleaners UK',
    description: 'Professional cleaning services including end of tenancy cleaning, deep cleans, commercial cleaning, Airbnb cleaning and move in cleans across the UK.',
  },
  '/cleaning/services': {
    title: 'Cleaning Services | CF Hub & Co.',
    description: 'Explore end of tenancy cleaning, deep cleans, commercial cleaning, after build cleaning, move in cleans and Airbnb cleaning services.',
  },
  '/cleaning/gallery': {
    title: 'Cleaning Gallery | CF Hub & Co.',
    description: 'View cleaning gallery sections for end of tenancy, deep clean, commercial and after build cleaning projects.',
  },
  '/cleaning/contact': {
    title: 'Book Cleaning | CF Hub & Co.',
    description: 'Book cleaning services and send enquiries to CF Hub & Co. Cleaning Services for homes and businesses.',
  },
  '/cleaning/join': {
    title: 'Join Cleaning Team | CF Hub & Co.',
    description: 'Apply to join CF Hub & Co. Cleaning Services as a cleaner with CV upload and application form.',
  },
  '/cleaning/membership': {
    title: 'The Clean Club | CF Hub & Co.',
    description: 'Join The Clean Club membership for regular, priority cleaning visits with exclusive discounts.',
  },
  '/cleaning/membership/join': {
    title: 'Join The Clean Club | CF Hub & Co.',
    description: 'Set up your Clean Club membership: customer details, plan, schedule and secure payment.',
  },
  '/cleaning/sign-in': {
    title: 'Sign In | The Clean Club',
    description: 'Sign in to manage your Clean Club membership, upcoming cleans and billing.',
  },
  '/cleaning/sign-up': {
    title: 'Create Account | The Clean Club',
    description: 'Create your Clean Club account to manage your cleaning membership online.',
  },
  '/cleaning/verify-email': {
    title: 'Verify Your Email | The Clean Club',
    description: 'Enter the verification code sent to your email to activate your Clean Club account.',
  },
  '/cleaning/forgot-password': {
    title: 'Forgot Password | The Clean Club',
    description: 'Reset your Clean Club account password.',
  },
  '/cleaning/reset-password': {
    title: 'Reset Password | The Clean Club',
    description: 'Choose a new password for your Clean Club account.',
  },
  '/cleaning/dashboard': {
    title: 'My Dashboard | The Clean Club',
    description: 'View your Clean Club membership, upcoming cleans and payment history.',
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

const CONSTRUCTION_MARKER = 'CF_HUB_UNDER_CONSTRUCTION'

function ConstructionPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#000',
        color: '#fff',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(2rem, 6vw, 4.5rem)',
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          We're currently under construction
        </h1>
        <p
          style={{
            margin: '16px 0 0',
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            lineHeight: 1.5,
          }}
        >
          making the site better for our customers
        </p>
      </div>
    </main>
  )
}

function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [isUnderConstruction, setIsUnderConstruction] = useState(null);
  const previousPathRef = useRef(pathname);
  const isCleaningRoute = pathname.startsWith('/cleaning')
  const isSelectionRoute = pathname === '/select-service' || pathname === '/'

  const loadingLogoSrc = isCleaningRoute ? '/logo2.png' : '/logo.png'
  const loadingLogoAlt = isCleaningRoute ? 'CF Hub & Co. Cleaning Services' : 'CF HUB UK'

  const handleFinish = useCallback(() => setLoading(false), []);

  useEffect(() => {
    let isMounted = true

    fetch(`/construction?t=${Date.now()}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.text() : ''))
      .then((text) => {
        if (isMounted) {
          setIsUnderConstruction(text.includes(CONSTRUCTION_MARKER))
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsUnderConstruction(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

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

  if (isUnderConstruction === null) {
    return <main style={{ minHeight: '100vh', background: '#000' }} />;
  }

  if (isUnderConstruction) {
    return <ConstructionPage />;
  }

  if (loading) {
    return <LoadingScreen key={pathname} onFinish={handleFinish} logoSrc={loadingLogoSrc} logoAlt={loadingLogoAlt} />;
  }

  const isSelectionPage = isSelectionRoute

  const handleServiceSelect = (service) => {
    window.localStorage.setItem('cf-service-selection', service)
    if (service === 'cleaning') {
      navigate('/cleaning')
      return
    }
    navigate('/handyman')
  }

  return (
    <>
      <ScrollToTop />
      {!isSelectionPage && <Header />}
      <Suspense fallback={<main className="pageFallback" aria-hidden="true" />}>
        <main>
          <Routes>
            <Route
              path="/"
              element={<ServiceSelection onSelect={handleServiceSelect} />}
            />
            <Route path="/select-service" element={<ServiceSelection onSelect={handleServiceSelect} />} />
            <Route path="/handyman" element={<Home />} />
            <Route path="/cleaning" element={<Cleaning />} />
            <Route path="/cleaning/services" element={<CleaningServices />} />
            <Route path="/cleaning/gallery" element={<CleaningGallery />} />
            <Route path="/cleaning/contact" element={<CleaningContact />} />
            <Route path="/cleaning/join" element={<CleaningJoin />} />
            <Route path="/cleaning/membership" element={<MembershipLanding />} />
            <Route path="/cleaning/membership/join" element={<MembershipSignup />} />
            <Route path="/cleaning/sign-in" element={<SignIn />} />
            <Route path="/cleaning/sign-up" element={<SignUp />} />
            <Route path="/cleaning/verify-email" element={<VerifyEmail />} />
            <Route path="/cleaning/forgot-password" element={<ForgotPassword />} />
            <Route path="/cleaning/reset-password" element={<ResetPassword />} />
            <Route path="/cleaning/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="membership" element={<MembershipPage />} />
              <Route path="upcoming-cleans" element={<UpcomingCleans />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>
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
        {!isSelectionPage && <Footer />}
      </Suspense>
      <CookieConsent />
    </>
  );
}

export default App
