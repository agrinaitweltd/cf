import { useState, useRef } from 'react'
import CleaningBanner from '../components/CleaningBanner'
import CTABanner from '../components/CTABanner'
import { cleaningGallerySections } from '../data/cleaning'
import styles from './JoinTeam.module.css'
import galleryStyles from './CleaningGallery.module.css'

const availabilityOptions = [
	'Select availability…',
	'Immediate',
	'Weekdays',
	'Weekends',
	'Part-time',
	'Full-time',
	'Flexible',
]

const INITIAL = {
	name: '',
	email: '',
	phone: '',
	role: 'Cleaner',
	experience: '',
	location: '',
	availability: '',
	workType: 'Cleaning Services',
	certifications: '',
	message: '',
}

const ALLOWED_TYPES = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 3 * 1024 * 1024

function CleaningJoin() {
	const [form, setForm] = useState(INITIAL)
	const [cv, setCv] = useState(null)
	const [errors, setErrors] = useState({})
	const [submitted, setSubmitted] = useState(false)
	const [sending, setSending] = useState(false)
	const [serverError, setServerError] = useState('')
	const fileRef = useRef()
	const showcaseSection = cleaningGallerySections.slice(-1)[0]

	const validate = () => {
		const nextErrors = {}
		if (!form.name.trim()) nextErrors.name = 'Please enter your full name.'
		if (!form.email.trim()) nextErrors.email = 'Please enter your email address.'
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Please enter a valid email address.'
		if (!form.phone.trim()) nextErrors.phone = 'Please enter your phone number.'
		if (!form.experience.trim()) nextErrors.experience = 'Please tell us about your cleaning experience.'
		if (!form.location.trim()) nextErrors.location = 'Please enter your location.'
		if (!form.availability || form.availability === 'Select availability…') nextErrors.availability = 'Please select availability.'
		if (!form.message.trim()) nextErrors.message = 'Please tell us a bit about yourself.'
		if (!cv) nextErrors.cv = 'Please upload your CV.'
		return nextErrors
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
		setForm(prev => ({ ...prev, [name]: value }))
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
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
		const nextErrors = validate()
		if (Object.keys(nextErrors).length) {
			setErrors(nextErrors)
			return
		}

		setSending(true)
		setServerError('')

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
			<CleaningBanner
				title="Want To Join The Team?"
				subtitle="Apply to work with CF Hub & Co. Cleaning Services as a trusted cleaner."
				tone="join"
			/>

			<section className="section">
				<div className="container">
					<div className={styles.layout}>
						<div>
							<span className="label">Cleaner Applications</span>
							<h2 className={styles.formTitle}>Apply Now</h2>
							<p className={styles.formIntro}>
								Complete the cleaner application form below and upload your CV. We review every application carefully.
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
									<p>Thank you for your interest in joining CF Hub & Co. Cleaning Services. We will review your application and be in touch soon.</p>
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
											<label htmlFor="phone" className={styles.label}>Phone Number <span className={styles.req}>*</span></label>
											<input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="07000 000000" className={`${styles.input} ${errors.phone ? styles.inputError : ''}`} autoComplete="tel" />
											{errors.phone && <span className={styles.error} role="alert">{errors.phone}</span>}
										</div>
									</div>

									<div className={styles.row}>
										<div className={styles.field}>
											<label htmlFor="email" className={styles.label}>Email Address <span className={styles.req}>*</span></label>
											<input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.co.uk" className={`${styles.input} ${errors.email ? styles.inputError : ''}`} autoComplete="email" />
											{errors.email && <span className={styles.error} role="alert">{errors.email}</span>}
										</div>
										<div className={styles.field}>
											<label htmlFor="experience" className={styles.label}>Experience <span className={styles.req}>*</span></label>
											<input id="experience" name="experience" type="text" value={form.experience} onChange={handleChange} placeholder="e.g. 3 years domestic and commercial" className={`${styles.input} ${errors.experience ? styles.inputError : ''}`} />
											{errors.experience && <span className={styles.error} role="alert">{errors.experience}</span>}
										</div>
									</div>

									<div className={styles.row}>
										<div className={styles.field}>
											<label htmlFor="location" className={styles.label}>Location <span className={styles.req}>*</span></label>
											<input id="location" name="location" type="text" value={form.location} onChange={handleChange} placeholder="Town, city or postcode" className={`${styles.input} ${errors.location ? styles.inputError : ''}`} />
											{errors.location && <span className={styles.error} role="alert">{errors.location}</span>}
										</div>
										<div className={styles.field}>
											<label htmlFor="availability" className={styles.label}>Availability <span className={styles.req}>*</span></label>
											<select id="availability" name="availability" value={form.availability} onChange={handleChange} className={`${styles.input} ${styles.select} ${errors.availability ? styles.inputError : ''}`}>
												{availabilityOptions.map(option => (
													<option key={option} value={option === 'Select availability…' ? '' : option} disabled={option === 'Select availability…'}>
														{option}
													</option>
												))}
											</select>
											{errors.availability && <span className={styles.error} role="alert">{errors.availability}</span>}
										</div>
									</div>

									<div className={styles.field}>
										<label htmlFor="message" className={styles.label}>Message <span className={styles.req}>*</span></label>
										<textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your cleaning experience, the types of properties you have worked on and why you would like to join the team..." className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`} />
										{errors.message && <span className={styles.error} role="alert">{errors.message}</span>}
									</div>

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
											<span className={styles.fileText}><strong>Click to upload</strong> your CV</span>
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

									{serverError && <p className={styles.error} role="alert" style={{ marginBottom: '12px' }}>{serverError}</p>}
									<button type="submit" className={`btn ${styles.submitBtn}`} disabled={sending}>
										{sending ? 'Submitting…' : 'Submit Application'}
									</button>
								</form>
							)}
						</div>

						<div className={styles.infoPanel}>
							<div className={styles.infoCard}>
								<h3 className={styles.infoTitle}>What We Look For</h3>
								<div className={styles.roleList}>
									{['Reliable attendance', 'Attention to detail', 'Professional communication', 'Domestic or commercial cleaning experience', 'Pride in high standards'].map(item => (
										<div key={item} className={styles.roleItem}>
											<span className={styles.roleDot} aria-hidden="true" />
											{item}
										</div>
									))}
								</div>
							</div>

							<div className={styles.infoCard}>
								<h3 className={styles.infoTitle}>Why Join CF Hub & Co.</h3>
								<div className={styles.benefitList}>
									<div className={styles.benefitItem}>
										<div className={styles.benefitIcon} aria-hidden="true">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
										</div>
										<div className={styles.benefitText}>
											<strong>Competitive Work Opportunities</strong>
											Join a growing team serving homes, landlords and businesses.
										</div>
									</div>
									<div className={styles.benefitItem}>
										<div className={styles.benefitIcon} aria-hidden="true">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
										</div>
										<div className={styles.benefitText}>
											<strong>Flexible Availability</strong>
											Opportunities across recurring cleans, deep cleans and specialist projects.
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{showcaseSection && (
				<section className="section section--alt">
					<div className="container">
						<div className={`${galleryStyles.headAnimated} section-head`}>
							<span className="label">Cleaning Image Section</span>
							<h2>{showcaseSection.title}</h2>
							<p>{showcaseSection.text}</p>
						</div>
						<div className={galleryStyles.galleryGrid}>
							{showcaseSection.images.map((src, idx) => (
								<figure key={src} className={galleryStyles.galleryItem} style={{ '--card-delay': `${idx * 0.07}s` }}>
									<img src={src} alt={`${showcaseSection.title} ${idx + 1}`} loading="lazy" decoding="async" />
									<figcaption>{src}</figcaption>
								</figure>
							))}
						</div>
					</div>
				</section>
			)}

			<CTABanner
				heading="Ready to Join the Cleaning Team?"
				subtext="Submit your application and we will review your details as soon as possible."
				btnLabel="Apply Today"
				btnTo="/cleaning/join"
			/>
		</>
	)
}

export default CleaningJoin
