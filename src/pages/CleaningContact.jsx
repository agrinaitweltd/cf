import { useState } from 'react'
import CleaningBanner from '../components/CleaningBanner'
import CTABanner from '../components/CTABanner'
import { mainCleaningServices, additionalCleaningServices, cleaningGallerySections } from '../data/cleaning'
import styles from './Contact.module.css'
import galleryStyles from './CleaningGallery.module.css'

const serviceOptions = [
	'Select a service…',
	...mainCleaningServices,
	...additionalCleaningServices,
	'Multiple Cleaning Services',
	'Other / General Cleaning Enquiry',
]

const propertyTypeOptions = [
	'Select property type…',
	'House',
	'Flat / Apartment',
	'Commercial',
	'Airbnb / Short Stay',
	'Landlord Property',
	'Other',
]

const preferredContactOptions = [
	'Select contact preference…',
	'Phone',
	'Email',
	'WhatsApp',
	'No preference',
]

const timelineOptions = [
	'Select preferred start time…',
	'ASAP',
	'Within 48 hours',
	'Within 1 week',
	'Within 2 weeks',
	'Just exploring options',
]

const INITIAL = {
	name: '',
	email: '',
	phone: '',
	service: '',
	propertyType: '',
	postcode: '',
	budget: '',
	preferredContact: '',
	timeline: '',
	message: '',
}

function CleaningContact() {
	const [form, setForm] = useState(INITIAL)
	const [errors, setErrors] = useState({})
	const [submitted, setSubmitted] = useState(false)
	const [sending, setSending] = useState(false)
	const [serverError, setServerError] = useState('')
	const showcaseSections = cleaningGallerySections.slice(4, 6)

	const validate = () => {
		const nextErrors = {}
		if (!form.name.trim()) nextErrors.name = 'Please enter your name.'
		if (!form.email.trim()) nextErrors.email = 'Please enter your email address.'
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Please enter a valid email address.'
		if (!form.service || form.service === 'Select a service…') nextErrors.service = 'Please select a service.'
		if (!form.propertyType || form.propertyType === 'Select property type…') nextErrors.propertyType = 'Please select a property type.'
		if (!form.postcode.trim()) nextErrors.postcode = 'Please enter your postcode.'
		if (!form.preferredContact || form.preferredContact === 'Select contact preference…') nextErrors.preferredContact = 'Please choose a contact preference.'
		if (!form.timeline || form.timeline === 'Select preferred start time…') nextErrors.timeline = 'Please select your preferred start time.'
		if (!form.message.trim()) nextErrors.message = 'Please enter a message.'
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
			const payload = {
				...form,
				service: `Cleaning - ${form.service}`,
			}
			const res = await fetch('/api/send-contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
			const data = await parseApiResponse(res)
			if (!res.ok) throw new Error(data.error || 'Server error. Please try again in a moment.')
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
			<CleaningBanner
				title="Book Cleaning"
				subtitle="Arrange a trusted cleaning service or request a quote for your property."
				tone="contact"
			/>

			<section className="section">
				<div className="container">
					<div className={styles.layout}>
						<div className={styles.formWrap}>
							<span className="label">Book & Enquire</span>
							<h2 className={styles.formTitle}>Request Your Cleaning Quote</h2>
							<p className={styles.formIntro}>
								Tell us what type of clean you need and our team will get back to you within one business day.
							</p>

							{submitted ? (
								<div className={styles.success} role="alert">
									<div className={styles.successIcon} aria-hidden="true">
										<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
											<path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									</div>
									<h3>Thank you for your enquiry.</h3>
									<p>We have received your cleaning request and will contact you shortly.</p>
									<button className={`btn btn-ghost ${styles.resetBtn}`} onClick={() => setSubmitted(false)}>
										Send Another Message
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
											<input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+44 7700 900000" className={styles.input} autoComplete="tel" />
										</div>
										<div className={styles.field}>
											<label htmlFor="service" className={styles.label}>Cleaning Service <span className={styles.req}>*</span></label>
											<select id="service" name="service" value={form.service} onChange={handleChange} className={`${styles.input} ${styles.select} ${errors.service ? styles.inputError : ''}`}>
												{serviceOptions.map(option => (
													<option key={option} value={option === 'Select a service…' ? '' : option} disabled={option === 'Select a service…'}>
														{option}
													</option>
												))}
											</select>
											{errors.service && <span className={styles.error} role="alert">{errors.service}</span>}
										</div>
									</div>

									<div className={styles.row}>
										<div className={styles.field}>
											<label htmlFor="propertyType" className={styles.label}>Property Type <span className={styles.req}>*</span></label>
											<select id="propertyType" name="propertyType" value={form.propertyType} onChange={handleChange} className={`${styles.input} ${styles.select} ${errors.propertyType ? styles.inputError : ''}`}>
												{propertyTypeOptions.map(option => (
													<option key={option} value={option === 'Select property type…' ? '' : option} disabled={option === 'Select property type…'}>
														{option}
													</option>
												))}
											</select>
											{errors.propertyType && <span className={styles.error} role="alert">{errors.propertyType}</span>}
										</div>
										<div className={styles.field}>
											<label htmlFor="postcode" className={styles.label}>Postcode <span className={styles.req}>*</span></label>
											<input id="postcode" name="postcode" type="text" value={form.postcode} onChange={handleChange} placeholder="e.g. SW1A 1AA" className={`${styles.input} ${errors.postcode ? styles.inputError : ''}`} autoComplete="postal-code" />
											{errors.postcode && <span className={styles.error} role="alert">{errors.postcode}</span>}
										</div>
									</div>

									<div className={styles.row}>
										<div className={styles.field}>
											<label htmlFor="preferredContact" className={styles.label}>Preferred Contact Method <span className={styles.req}>*</span></label>
											<select id="preferredContact" name="preferredContact" value={form.preferredContact} onChange={handleChange} className={`${styles.input} ${styles.select} ${errors.preferredContact ? styles.inputError : ''}`}>
												{preferredContactOptions.map(option => (
													<option key={option} value={option === 'Select contact preference…' ? '' : option} disabled={option === 'Select contact preference…'}>
														{option}
													</option>
												))}
											</select>
											{errors.preferredContact && <span className={styles.error} role="alert">{errors.preferredContact}</span>}
										</div>
										<div className={styles.field}>
											<label htmlFor="timeline" className={styles.label}>Preferred Start Time <span className={styles.req}>*</span></label>
											<select id="timeline" name="timeline" value={form.timeline} onChange={handleChange} className={`${styles.input} ${styles.select} ${errors.timeline ? styles.inputError : ''}`}>
												{timelineOptions.map(option => (
													<option key={option} value={option === 'Select preferred start time…' ? '' : option} disabled={option === 'Select preferred start time…'}>
														{option}
													</option>
												))}
											</select>
											{errors.timeline && <span className={styles.error} role="alert">{errors.timeline}</span>}
										</div>
									</div>

									<div className={styles.field}>
										<label htmlFor="message" className={styles.label}>Message <span className={styles.req}>*</span></label>
										<textarea id="message" name="message" rows={6} value={form.message} onChange={handleChange} placeholder="Tell us about the property, the cleaning service needed and any access details..." className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`} />
										{errors.message && <span className={styles.error} role="alert">{errors.message}</span>}
									</div>

									{serverError && <p className={styles.error} role="alert" style={{ marginBottom: '12px' }}>{serverError}</p>}
									<button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
										{sending ? 'Sending…' : 'Send Cleaning Enquiry'}
									</button>
								</form>
							)}
						</div>

						<div className={styles.infoPanel}>
							<div className={styles.infoCard}>
								<h3 className={styles.infoTitle}>Why Clients Book Us</h3>
								<div className={styles.infoList}>
									<div className={styles.infoItem}>
										<div className={styles.infoIconWrap} aria-hidden="true">
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
										</div>
										<div>
											<div className={styles.infoLabel}>Trusted Team</div>
											<p className={styles.infoValMuted}>Fully insured, trained, DBS checked and criminal record checked cleaners.</p>
										</div>
									</div>
									<div className={styles.infoItem}>
										<div className={styles.infoIconWrap} aria-hidden="true">
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
										</div>
										<div>
											<div className={styles.infoLabel}>Fast Response</div>
											<p className={styles.infoValMuted}>Prompt quotes, flexible bookings and fast turnaround for urgent cleans.</p>
										</div>
									</div>
									<div className={styles.infoItem}>
										<div className={styles.infoIconWrap} aria-hidden="true">
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
										</div>
										<div>
											<div className={styles.infoLabel}>Professional Standards</div>
											<p className={styles.infoValMuted}>Reliable cleaning quality for residential, landlord, Airbnb and commercial clients.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{showcaseSections.map(section => (
				<section key={section.id} className="section section--alt">
					<div className="container">
						<div className={`${galleryStyles.headAnimated} section-head`}>
							<span className="label">Cleaning Image Section</span>
							<h2>{section.title}</h2>
							<p>{section.text}</p>
						</div>
						<div className={galleryStyles.galleryGrid}>
							{section.images.map((src, idx) => (
								<figure key={src} className={galleryStyles.galleryItem} style={{ '--card-delay': `${idx * 0.07}s` }}>
									<img src={src} alt={`${section.title} ${idx + 1}`} loading="lazy" decoding="async" />
									<figcaption>{src}</figcaption>
								</figure>
							))}
						</div>
					</div>
				</section>
			))}

			<CTABanner
				heading="Ready to Book Cleaning Services?"
				subtext="Send us your details and we will arrange the right cleaning package for your property."
				btnLabel="Send Enquiry"
				btnTo="/cleaning/contact"
			/>
		</>
	)
}

export default CleaningContact
