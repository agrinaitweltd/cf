import { useState } from 'react'
import PageBanner from '../components/PageBanner'
import styles from './Contact.module.css'

const serviceOptions = [
  'Select a service…',
  'Renovations',
  'Painting & Decorating',
  'Carpentry',
  'Handyman Services',
  'Electrics',
  'Plumbing',
  'Multiple Services',
  'Other / General Enquiry',
]

const INITIAL = { name: '', email: '', phone: '', service: '', message: '' }

function Contact() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Please enter your name.'
    if (!form.email.trim())   e.email   = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.'
    if (!form.service || form.service === 'Select a service…') e.service = 'Please select a service.'
    if (!form.message.trim()) e.message = 'Please enter a message.'
    return e
  }

  const handleChange = ({ target: { name, value } }) => {
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSending(true)
    setServerError('')
    try {
      const res = await fetch('/api/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setSubmitted(true)
      setForm(INITIAL)
      setErrors({})
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <PageBanner
        title="Contact Us"
        subtitle="Ready to start your project? Get in touch for a free, no-obligation consultation and quote."
        image="/contact-banner.png"
      />

      <section className="section">
        <div className="container">
          <div className={styles.layout}>

            {/* Form */}
            <div className={styles.formWrap}>
              <span className="label">Send a Message</span>
              <h2 className={styles.formTitle}>Get Your Free Quote</h2>
              <p className={styles.formIntro}>
                Fill in the form below and a member of our team will get back to you within one business day.
              </p>

              {submitted ? (
                <div className={styles.success} role="alert">
                  <div className={styles.successIcon} aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Thank you for getting in touch!</h3>
                  <p>We've received your enquiry and will be in contact within one business day.</p>
                  <button className={`btn btn-ghost ${styles.resetBtn}`} onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="name" className={styles.label}>Full Name <span className={styles.req}>*</span></label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        autoComplete="name"
                      />
                      {errors.name && <span className={styles.error} role="alert">{errors.name}</span>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="email" className={styles.label}>Email Address <span className={styles.req}>*</span></label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.co.uk"
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        autoComplete="email"
                      />
                      {errors.email && <span className={styles.error} role="alert">{errors.email}</span>}
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="phone" className={styles.label}>Phone Number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+44 7700 900000"
                        className={styles.input}
                        autoComplete="tel"
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="service" className={styles.label}>Service Required <span className={styles.req}>*</span></label>
                      <select
                        id="service"
                        name="service"
                        value={form.service}
                        onChange={handleChange}
                        className={`${styles.input} ${styles.select} ${errors.service ? styles.inputError : ''}`}
                      >
                        {serviceOptions.map(o => (
                          <option key={o} value={o === 'Select a service…' ? '' : o} disabled={o === 'Select a service…'}>
                            {o}
                          </option>
                        ))}
                      </select>
                      {errors.service && <span className={styles.error} role="alert">{errors.service}</span>}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="message" className={styles.label}>Message <span className={styles.req}>*</span></label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project — the type of work required, your location and any other relevant details…"
                      className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    />
                    {errors.message && <span className={styles.error} role="alert">{errors.message}</span>}
                  </div>

                  {serverError && (
                    <p className={styles.error} role="alert" style={{ marginBottom: '12px' }}>{serverError}</p>
                  )}
                  <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
                    {sending ? 'Sending…' : 'Send Enquiry'}
                    {!sending && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info Panel */}
            <div className={styles.infoPanel}>
              <div className={styles.infoCard}>
                <span className="label">Contact Details</span>
                <h3 className={styles.infoTitle}>Reach Us Directly</h3>

                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrap} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.36 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                      </svg>
                    </div>
                    <div>
                      <p className={styles.infoLabel}>Phone</p>
                      <a href="tel:07960481933" className={styles.infoVal}>07960481933</a>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrap} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <p className={styles.infoLabel}>Email</p>
                      <a href="mailto:enquiries@cfhubuk.com" className={styles.infoVal}>enquiries@cfhubuk.com</a>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrap} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <p className={styles.infoLabel}>Coverage Area</p>
                      <p className={styles.infoValMuted}>Serving all across the United Kingdom</p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrap} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div>
                      <p className={styles.infoLabel}>Working Hours</p>
                      <p className={styles.infoValMuted}>Mon–Fri: 7:00am – 6:00pm</p>
                      <p className={styles.infoValMuted}>Saturday: 8:00am – 4:00pm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className={styles.mapPlaceholder} role="img" aria-label="Service area map placeholder">
                <div className={styles.mapContent}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <p>United Kingdom Wide Coverage</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
