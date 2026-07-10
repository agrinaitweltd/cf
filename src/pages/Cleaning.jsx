import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import CTABanner from '../components/CTABanner'
import styles from './Cleaning.module.css'

const mainServices = [
  'End Of Tenancy Cleaning',
  'Deep Cleans',
  'Commercial Cleaning',
  'After Build / Construction Cleaning',
  'Move In Cleans',
  'Airbnb Cleaning',
]

const additionalServices = [
  'Ironing',
  'Window Cleaning',
  'Jet Washing',
  'Sofa Cleaning',
  'Carpet Cleaning',
]

const testimonials = [
  {
    quote: 'Excellent standards and a very professional team. They left our end of tenancy clean spotless and inspection-ready.',
    name: 'Landlord Client',
  },
  {
    quote: 'Reliable cleaners that turn up on time and do exactly what they promise. Great communication from start to finish.',
    name: 'Commercial Client',
  },
  {
    quote: 'We now use CF Hub & Co. for regular Airbnb changeovers. Consistent quality and trusted cleaners every time.',
    name: 'Airbnb Host',
  },
]

const galleryPhotos = [
  '/cleaning/gallery/photo1.jpg',
  '/cleaning/gallery/photo2.jpg',
  '/cleaning/gallery/photo3.jpg',
]

const enquiryInitial = {
  name: '',
  email: '',
  phone: '',
  service: '',
  propertyType: '',
  postcode: '',
  preferredContact: '',
  timeline: '',
  message: '',
}

const joinInitial = {
  name: '',
  phone: '',
  email: '',
  experience: '',
  location: '',
  availability: '',
  message: '',
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 3 * 1024 * 1024

function Cleaning() {
  const [enquiry, setEnquiry] = useState(enquiryInitial)
  const [enquiryErrors, setEnquiryErrors] = useState({})
  const [enquirySent, setEnquirySent] = useState(false)
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquiryServerError, setEnquiryServerError] = useState('')

  const [join, setJoin] = useState(joinInitial)
  const [joinErrors, setJoinErrors] = useState({})
  const [joinSent, setJoinSent] = useState(false)
  const [sendingJoin, setSendingJoin] = useState(false)
  const [joinServerError, setJoinServerError] = useState('')
  const [cv, setCv] = useState(null)
  const cvRef = useRef()

  const parseApiResponse = async (res) => {
    const text = await res.text()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      return { error: text.slice(0, 180) }
    }
  }

  const validateEnquiry = () => {
    const e = {}
    if (!enquiry.name.trim()) e.name = 'Please enter your name.'
    if (!enquiry.email.trim()) e.email = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) e.email = 'Please enter a valid email address.'
    if (!enquiry.service) e.service = 'Please select a service.'
    if (!enquiry.propertyType) e.propertyType = 'Please enter the property type.'
    if (!enquiry.postcode.trim()) e.postcode = 'Please enter your postcode.'
    if (!enquiry.preferredContact) e.preferredContact = 'Please choose a preferred contact method.'
    if (!enquiry.timeline) e.timeline = 'Please select your preferred timeline.'
    if (!enquiry.message.trim()) e.message = 'Please provide your enquiry details.'
    return e
  }

  const validateJoin = () => {
    const e = {}
    if (!join.name.trim()) e.name = 'Please enter your full name.'
    if (!join.phone.trim()) e.phone = 'Please enter your phone number.'
    if (!join.email.trim()) e.email = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(join.email)) e.email = 'Please enter a valid email address.'
    if (!join.experience.trim()) e.experience = 'Please add your experience.'
    if (!join.location.trim()) e.location = 'Please enter your location.'
    if (!join.availability.trim()) e.availability = 'Please enter your availability.'
    if (!join.message.trim()) e.message = 'Please add a short message.'
    if (!cv) e.cv = 'Please upload your CV.'
    return e
  }

  const handleEnquiryChange = ({ target: { name, value } }) => {
    setEnquiry(prev => ({ ...prev, [name]: value }))
    if (enquiryErrors[name]) setEnquiryErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleJoinChange = ({ target: { name, value } }) => {
    setJoin(prev => ({ ...prev, [name]: value }))
    if (joinErrors[name]) setJoinErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setJoinErrors(prev => ({ ...prev, cv: 'Please upload a PDF or Word document.' }))
      return
    }

    if (file.size > MAX_SIZE) {
      setJoinErrors(prev => ({ ...prev, cv: 'File must be under 3 MB.' }))
      return
    }

    setCv(file)
    setJoinErrors(prev => ({ ...prev, cv: '' }))
  }

  const removeFile = () => {
    setCv(null)
    if (cvRef.current) cvRef.current.value = ''
  }

  const handleEnquirySubmit = async (e) => {
    e.preventDefault()
    const e2 = validateEnquiry()
    if (Object.keys(e2).length) {
      setEnquiryErrors(e2)
      return
    }

    setSendingEnquiry(true)
    setEnquiryServerError('')

    try {
      const payload = {
        ...enquiry,
        service: `Cleaning - ${enquiry.service}`,
      }

      const res = await fetch('/api/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await parseApiResponse(res)
      if (!res.ok) throw new Error(data.error || 'Server error. Please try again in a moment.')

      setEnquirySent(true)
      setEnquiry(enquiryInitial)
      setEnquiryErrors({})
    } catch (err) {
      setEnquiryServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSendingEnquiry(false)
    }
  }

  const handleJoinSubmit = async (e) => {
    e.preventDefault()
    const e2 = validateJoin()
    if (Object.keys(e2).length) {
      setJoinErrors(e2)
      return
    }

    setSendingJoin(true)
    setJoinServerError('')

    try {
      let cvBase64 = null
      let cvMime = null

      if (cv) {
        cvBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(cv)
        })
        cvMime = cv.type
      }

      const payload = {
        name: join.name,
        email: join.email,
        phone: join.phone,
        role: 'Cleaner',
        experience: join.experience,
        location: join.location,
        availability: join.availability,
        workType: 'Cleaning Services',
        certifications: '',
        message: join.message,
        cvBase64,
        cvName: cv?.name,
        cvMime,
      }

      const res = await fetch('/api/send-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await parseApiResponse(res)
      if (!res.ok) throw new Error(data.error || 'Server error. Please try again in a moment.')

      setJoinSent(true)
      setJoin(joinInitial)
      setJoinErrors({})
      setCv(null)
    } catch (err) {
      setJoinServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSendingJoin(false)
    }
  }

  return (
    <>
      <section className={`${styles.hero} animate-fadein-up`} id="cleaning-top" aria-label="CF Hub & Co. Cleaning Services hero">
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroContent}>
            <span className="label">CF Hub & Co. Cleaning Services</span>
            <h1>Reliable, Professional and Trusted Cleaning Services</h1>
            <p>
              CF Hub & Co. Cleaning Services provides high-standard cleaning for homes, landlords,
              developers and businesses across the UK.
            </p>
            <div className={styles.heroActions}>
              <a href="#enquiry" className="btn btn-primary">Book a Cleaning Service</a>
              <a href="#enquiry" className="btn btn-outline">Make an Enquiry</a>
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.trustSection}`}>
        <div className="container">
          <div className={styles.trustCard}>
            <span className="label">Trust & Safety</span>
            <p>
              All our cleaners are fully insured, trained, DBS checked and criminal record checked for your peace of mind.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="label">Cleaning Services</span>
            <h2>Professional Cleaning For Every Requirement</h2>
            <p>
              We provide specialist one-off and ongoing cleaning packages tailored to your property and schedule.
            </p>
          </div>

          <h3 className={styles.groupTitle}>Main Cleaning Services</h3>
          <div className="grid-3">
            {mainServices.map((service) => (
              <article key={service} className={styles.serviceCard}>
                <h4>{service}</h4>
                <p>Delivered by experienced and trusted cleaners with a meticulous attention to detail.</p>
              </article>
            ))}
          </div>

          <h3 className={styles.groupTitle}>Additional Services</h3>
          <div className={`grid-3 ${styles.additionalGrid}`}>
            {additionalServices.map((service) => (
              <article key={service} className={styles.serviceCard}>
                <h4>{service}</h4>
                <p>Flexible add-ons available to complete your cleaning package exactly how you need it.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`section section--alt ${styles.reviewSection}`} id="reviews">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="label">Reviews & Testimonials</span>
            <h2>What Clients Say</h2>
            <p>
              Feedback from customers who trust CF Hub & Co. Cleaning Services for reliable, professional cleaning.
            </p>
          </div>

          <div className="grid-3">
            {testimonials.map((item) => (
              <article key={item.quote} className={styles.reviewCard}>
                <p className={styles.reviewQuote}>"{item.quote}"</p>
                <span className={styles.reviewName}>{item.name}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="gallery">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="label">Photo Gallery</span>
            <h2>Our Cleaning Work</h2>
            <p>Upload your own photos into the following image paths in the public folder.</p>
          </div>

          <div className={styles.galleryGrid}>
            {galleryPhotos.map((src, idx) => (
              <figure key={src} className={styles.galleryItem}>
                <img src={src} alt={`Cleaning gallery ${idx + 1}`} loading="lazy" decoding="async" />
                <figcaption>{src}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className={`section section--alt ${styles.formSection}`} id="enquiry">
        <div className="container">
          <div className="section-head">
            <span className="label">Booking & Enquiries</span>
            <h2>Book a Cleaning Service</h2>
            <p>
              Request a quote or cleaning booking and our team will get back to you within one business day.
            </p>
          </div>

          {enquirySent ? (
            <div className={styles.success} role="alert">
              <h3>Thank you for your enquiry.</h3>
              <p>We have received your cleaning request and will contact you shortly.</p>
              <button type="button" className="btn btn-ghost" onClick={() => setEnquirySent(false)}>
                Send Another Enquiry
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleEnquirySubmit} noValidate>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="name">Name *</label>
                  <input id="name" name="name" value={enquiry.name} onChange={handleEnquiryChange} className={enquiryErrors.name ? styles.inputError : ''} />
                  {enquiryErrors.name && <span className={styles.error}>{enquiryErrors.name}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" value={enquiry.email} onChange={handleEnquiryChange} className={enquiryErrors.email ? styles.inputError : ''} />
                  {enquiryErrors.email && <span className={styles.error}>{enquiryErrors.email}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="phone">Phone Number</label>
                  <input id="phone" name="phone" type="tel" value={enquiry.phone} onChange={handleEnquiryChange} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="service">Cleaning Service *</label>
                  <select id="service" name="service" value={enquiry.service} onChange={handleEnquiryChange} className={enquiryErrors.service ? styles.inputError : ''}>
                    <option value="">Select service...</option>
                    {mainServices.concat(additionalServices).map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  {enquiryErrors.service && <span className={styles.error}>{enquiryErrors.service}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="propertyType">Property Type *</label>
                  <input id="propertyType" name="propertyType" value={enquiry.propertyType} onChange={handleEnquiryChange} placeholder="House, flat, office..." className={enquiryErrors.propertyType ? styles.inputError : ''} />
                  {enquiryErrors.propertyType && <span className={styles.error}>{enquiryErrors.propertyType}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="postcode">Postcode *</label>
                  <input id="postcode" name="postcode" value={enquiry.postcode} onChange={handleEnquiryChange} className={enquiryErrors.postcode ? styles.inputError : ''} />
                  {enquiryErrors.postcode && <span className={styles.error}>{enquiryErrors.postcode}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="preferredContact">Preferred Contact *</label>
                  <select id="preferredContact" name="preferredContact" value={enquiry.preferredContact} onChange={handleEnquiryChange} className={enquiryErrors.preferredContact ? styles.inputError : ''}>
                    <option value="">Select contact method...</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="No preference">No preference</option>
                  </select>
                  {enquiryErrors.preferredContact && <span className={styles.error}>{enquiryErrors.preferredContact}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="timeline">Preferred Timeline *</label>
                  <select id="timeline" name="timeline" value={enquiry.timeline} onChange={handleEnquiryChange} className={enquiryErrors.timeline ? styles.inputError : ''}>
                    <option value="">Select timeline...</option>
                    <option value="ASAP">ASAP</option>
                    <option value="Within 1 week">Within 1 week</option>
                    <option value="Within 2 weeks">Within 2 weeks</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="Just exploring options">Just exploring options</option>
                  </select>
                  {enquiryErrors.timeline && <span className={styles.error}>{enquiryErrors.timeline}</span>}
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="message">Message *</label>
                <textarea id="message" name="message" rows={5} value={enquiry.message} onChange={handleEnquiryChange} className={enquiryErrors.message ? styles.inputError : ''} />
                {enquiryErrors.message && <span className={styles.error}>{enquiryErrors.message}</span>}
              </div>

              {enquiryServerError && <p className={styles.error}>{enquiryServerError}</p>}

              <button type="submit" className="btn btn-primary" disabled={sendingEnquiry}>
                {sendingEnquiry ? 'Sending...' : 'Send Enquiry'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="section" id="join-team">
        <div className="container">
          <div className="section-head">
            <span className="label">Careers</span>
            <h2>Want To Join The Team?</h2>
            <p>
              We are looking for reliable cleaners to join CF Hub & Co. Complete the cleaner application form below.
            </p>
          </div>

          {joinSent ? (
            <div className={styles.success} role="alert">
              <h3>Application received.</h3>
              <p>Thank you for applying. Our team will review your details and contact you soon.</p>
              <button type="button" className="btn btn-ghost" onClick={() => setJoinSent(false)}>
                Submit Another Application
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleJoinSubmit} noValidate>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="joinName">Name *</label>
                  <input id="joinName" name="name" value={join.name} onChange={handleJoinChange} className={joinErrors.name ? styles.inputError : ''} />
                  {joinErrors.name && <span className={styles.error}>{joinErrors.name}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="joinPhone">Phone Number *</label>
                  <input id="joinPhone" name="phone" type="tel" value={join.phone} onChange={handleJoinChange} className={joinErrors.phone ? styles.inputError : ''} />
                  {joinErrors.phone && <span className={styles.error}>{joinErrors.phone}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="joinEmail">Email *</label>
                  <input id="joinEmail" name="email" type="email" value={join.email} onChange={handleJoinChange} className={joinErrors.email ? styles.inputError : ''} />
                  {joinErrors.email && <span className={styles.error}>{joinErrors.email}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="experience">Experience *</label>
                  <input id="experience" name="experience" value={join.experience} onChange={handleJoinChange} placeholder="e.g. 3 years domestic and commercial" className={joinErrors.experience ? styles.inputError : ''} />
                  {joinErrors.experience && <span className={styles.error}>{joinErrors.experience}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="location">Location *</label>
                  <input id="location" name="location" value={join.location} onChange={handleJoinChange} className={joinErrors.location ? styles.inputError : ''} />
                  {joinErrors.location && <span className={styles.error}>{joinErrors.location}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="availability">Availability *</label>
                  <input id="availability" name="availability" value={join.availability} onChange={handleJoinChange} placeholder="Weekdays, weekends, full-time..." className={joinErrors.availability ? styles.inputError : ''} />
                  {joinErrors.availability && <span className={styles.error}>{joinErrors.availability}</span>}
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="joinMessage">Message *</label>
                <textarea id="joinMessage" name="message" rows={5} value={join.message} onChange={handleJoinChange} className={joinErrors.message ? styles.inputError : ''} />
                {joinErrors.message && <span className={styles.error}>{joinErrors.message}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="cv">Upload CV *</label>
                <input ref={cvRef} id="cv" type="file" accept=".pdf,.doc,.docx" onChange={handleFile} />
                {joinErrors.cv && <span className={styles.error}>{joinErrors.cv}</span>}
                {cv && (
                  <div className={styles.fileRow}>
                    <span>{cv.name}</span>
                    <button type="button" className={styles.removeBtn} onClick={removeFile}>Remove</button>
                  </div>
                )}
              </div>

              {joinServerError && <p className={styles.error}>{joinServerError}</p>}

              <button type="submit" className="btn btn-primary" disabled={sendingJoin}>
                {sendingJoin ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </section>

      <CTABanner
        heading="Need Trusted Cleaning Support?"
        subtext="Book CF Hub & Co. Cleaning Services today for reliable, professional results."
        btnLabel="Enquire Now"
        btnTo="/cleaning#enquiry"
      />

      <section className={styles.switchSection}>
        <div className="container">
          <div className={styles.switchCard}>
            <h3>Looking for Property Improvements Instead?</h3>
            <p>Visit CF Hub Handyman Services for renovations, repairs and maintenance support.</p>
            <Link
              to="/"
              className="btn btn-ghost"
              onClick={() => window.localStorage.setItem('cf-service-selection', 'handyman')}
            >
              Go to Handyman Services
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Cleaning
