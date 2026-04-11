import { useState, useRef } from 'react'
import PageBanner from '../components/PageBanner'
import styles from './JoinTeam.module.css'

const roleOptions = [
  'Select a role…',
  'Plumber',
  'Electrician',
  'Handyman',
  'Carpenter',
  'Painter & Decorator',
  'Renovation Specialist',
  'Other',
]

const availabilityOptions = [
  'Select availability…',
  'Immediate',
  '1 week notice',
  '2 weeks notice',
  '1 month notice',
]

const workTypeOptions = [
  'Select preferred work type…',
  'Full-time',
  'Part-time',
  'Contract',
  'Subcontractor',
  'Flexible',
]

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  role: '',
  experience: '',
  location: '',
  availability: '',
  workType: '',
  certifications: '',
  message: '',
}
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 3 * 1024 * 1024 // 3 MB (base64 overhead must fit within Vercel's 4.5 MB limit)

function JoinTeam() {
  const [form, setForm] = useState(INITIAL)
  const [cv, setCv] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [serverError, setServerError] = useState('')
  const fileRef = useRef()

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your full name.'
    if (!form.email.trim()) e.email = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.'
    if (!form.role || form.role === 'Select a role…') e.role = 'Please select a role.'
    if (!form.location.trim()) e.location = 'Please enter your town/city or postcode.'
    if (!form.availability || form.availability === 'Select availability…') e.availability = 'Please select availability.'
    if (!form.workType || form.workType === 'Select preferred work type…') e.workType = 'Please select your preferred work type.'
    if (!form.message.trim()) e.message = 'Tell us a bit about yourself.'
    if (!cv) e.cv = 'Please upload your CV.'
    return e
  }

  const parseApiResponse = async res => {
    const text = await res.text()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      return { error: text.slice(0, 180) }
    }
  }

  const handleChange = ({ target: { name, value } }) => {
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleFile = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, cv: 'Please upload a PDF or Word document.' }))
      return
    }
    if (file.size > MAX_SIZE) {
      setErrors(prev => ({ ...prev, cv: 'File must be under 3 MB.' }))
      return
    }
    setCv(file)
    setErrors(prev => ({ ...prev, cv: '' }))
  }

  const removeFile = () => {
    setCv(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSending(true)
    setServerError('')
    try {
      // Read CV as base64
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
      const res = await fetch('/api/send-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cvBase64, cvName: cv?.name, cvMime }),
      })
      const data = await parseApiResponse(res)
      if (!res.ok) throw new Error(data.error || 'Server error. Please try again in a moment.')
      setSubmitted(true)
      setForm(INITIAL)
      setCv(null)
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
        title="Join the Team"
        subtitle="We're always looking for skilled tradespeople to join our growing network. Apply today and become part of CF Hub UK."
        image="/contact-banner.png"
      />

      <section className="section">
        <div className="container">
          <div className={styles.layout}>

            {/* Form */}
            <div>
              <span className="label">Careers</span>
              <h2 className={styles.formTitle}>Apply Now</h2>
              <p className={styles.formIntro}>
                Fill in the form below and upload your CV. We'll review your application and get back to you as soon as possible.
              </p>

              {submitted ? (
                <div className={styles.success} role="alert">
                  <div className={styles.successIcon} aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Application Received!</h3>
                  <p>Thank you for your interest in joining CF Hub UK. We'll review your details and be in touch soon.</p>
                  <button className={`btn btn-ghost ${styles.resetBtn}`} onClick={() => setSubmitted(false)}>
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="name" className={styles.label}>Full Name <span className={styles.req}>*</span></label>
                      <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Smith" className={`${styles.input} ${errors.name ? styles.inputError : ''}`} autoComplete="name" />
                      {errors.name && <span className={styles.error} role="alert">{errors.name}</span>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="email" className={styles.label}>Email Address <span className={styles.req}>*</span></label>
                      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.co.uk" className={`${styles.input} ${errors.email ? styles.inputError : ''}`} autoComplete="email" />
                      {errors.email && <span className={styles.error} role="alert">{errors.email}</span>}
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="phone" className={styles.label}>Phone Number</label>
                      <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="07000 000000" className={styles.input} autoComplete="tel" />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="role" className={styles.label}>Role <span className={styles.req}>*</span></label>
                      <select id="role" name="role" value={form.role} onChange={handleChange} className={`${styles.input} ${styles.select} ${errors.role ? styles.inputError : ''}`}>
                        {roleOptions.map(o => <option key={o}>{o}</option>)}
                      </select>
                      {errors.role && <span className={styles.error} role="alert">{errors.role}</span>}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="experience" className={styles.label}>Years of Experience</label>
                    <input id="experience" name="experience" type="text" value={form.experience} onChange={handleChange} placeholder="e.g. 5 years" className={styles.input} />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="location" className={styles.label}>Town/City or Postcode <span className={styles.req}>*</span></label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Birmingham, B1"
                        className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                      />
                      {errors.location && <span className={styles.error} role="alert">{errors.location}</span>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="availability" className={styles.label}>Availability <span className={styles.req}>*</span></label>
                      <select
                        id="availability"
                        name="availability"
                        value={form.availability}
                        onChange={handleChange}
                        className={`${styles.input} ${styles.select} ${errors.availability ? styles.inputError : ''}`}
                      >
                        {availabilityOptions.map(o => (
                          <option key={o} value={o === 'Select availability…' ? '' : o} disabled={o === 'Select availability…'}>
                            {o}
                          </option>
                        ))}
                      </select>
                      {errors.availability && <span className={styles.error} role="alert">{errors.availability}</span>}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="workType" className={styles.label}>Preferred Work Type <span className={styles.req}>*</span></label>
                    <select
                      id="workType"
                      name="workType"
                      value={form.workType}
                      onChange={handleChange}
                      className={`${styles.input} ${styles.select} ${errors.workType ? styles.inputError : ''}`}
                    >
                      {workTypeOptions.map(o => (
                        <option key={o} value={o === 'Select preferred work type…' ? '' : o} disabled={o === 'Select preferred work type…'}>
                          {o}
                        </option>
                      ))}
                    </select>
                    {errors.workType && <span className={styles.error} role="alert">{errors.workType}</span>}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="certifications" className={styles.label}>Key Qualifications / CSCS / NVQ (Optional)</label>
                    <input
                      id="certifications"
                      name="certifications"
                      type="text"
                      value={form.certifications}
                      onChange={handleChange}
                      placeholder="e.g. NVQ Level 3, ECS Gold Card"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="message" className={styles.label}>About You <span className={styles.req}>*</span></label>
                    <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your experience, qualifications and why you'd like to join CF Hub UK…" className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`} />
                    {errors.message && <span className={styles.error} role="alert">{errors.message}</span>}
                  </div>

                  {/* CV Upload */}
                  <div className={styles.field}>
                    <span className={styles.label}>Upload CV <span className={styles.req}>*</span></span>
                    <label htmlFor="cv" className={`${styles.fileLabel} ${errors.cv ? styles.fileLabelError : ''}`}>
                      <input ref={fileRef} id="cv" type="file" accept=".pdf,.doc,.docx" onChange={handleFile} hidden />
                      <div className={styles.fileIcon} aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <span className={styles.fileText}><strong>Click to upload</strong> or drag and drop</span>
                      <span className={styles.fileHint}>PDF or Word document (max 3 MB)</span>
                    </label>
                    {errors.cv && <span className={styles.error} role="alert">{errors.cv}</span>}
                    {cv && (
                      <div className={styles.fileName}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {cv.name}
                        <button type="button" className={styles.fileRemove} onClick={removeFile} aria-label="Remove file">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {serverError && (
                    <p className={styles.error} role="alert" style={{ marginBottom: '12px' }}>{serverError}</p>
                  )}
                  <button type="submit" className={`btn ${styles.submitBtn}`} disabled={sending}>
                    {sending ? 'Submitting…' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>

            {/* Side Panel */}
            <div className={styles.infoPanel}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Roles We're Hiring</h3>
                <div className={styles.roleList}>
                  {['Plumbers', 'Electricians', 'Handymen', 'Carpenters', 'Painters & Decorators', 'Renovation Specialists'].map(r => (
                    <div key={r} className={styles.roleItem}>
                      <span className={styles.roleDot} aria-hidden="true" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Why Join Us?</h3>
                <div className={styles.benefitList}>
                  <div className={styles.benefitItem}>
                    <div className={styles.benefitIcon} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    </div>
                    <div className={styles.benefitText}>
                      <strong>Competitive Pay</strong>
                      Fair rates that reflect your skills and experience.
                    </div>
                  </div>
                  <div className={styles.benefitItem}>
                    <div className={styles.benefitIcon} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div className={styles.benefitText}>
                      <strong>Flexible Hours</strong>
                      Work schedules that fit around your life.
                    </div>
                  </div>
                  <div className={styles.benefitItem}>
                    <div className={styles.benefitIcon} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <div className={styles.benefitText}>
                      <strong>Growing Team</strong>
                      Join a supportive, expanding network of professionals.
                    </div>
                  </div>
                  <div className={styles.benefitItem}>
                    <div className={styles.benefitIcon} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div className={styles.benefitText}>
                      <strong>Steady Work</strong>
                      Consistent projects across the UK all year round.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}

export default JoinTeam
