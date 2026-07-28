import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { membershipPlans, preferredDayOptions, preferredTimeOptions } from '../../data/membership'
import type { MembershipTier, PreferredDay, PreferredTime } from '../../types/membership'
import PostcodeAddressField from '../../components/cleaning-club/PostcodeAddressField'
import EmbeddedCheckout from '../../components/cleaning-club/EmbeddedCheckout'
import PropertyCleaningDetails, { type PropertyCleaningDetailsValue } from '../../components/cleaning-club/PropertyCleaningDetails'
import styles from './MembershipSignup.module.css'

const STEP_LABELS = ['Details', 'Membership', 'Schedule', 'Checkout']
const WIZARD_PATH = '/cleaning/membership/join'

interface DetailsForm {
  fullName: string
  email: string
  phone: string
  address: string
  postcode: string
}

interface ScheduleForm {
  preferredDay: PreferredDay | ''
  preferredTime: PreferredTime | ''
  preferredStartDate: string
  specialInstructions: string
}

interface WizardLocationState {
  tier?: MembershipTier
}

const INITIAL_DETAILS: DetailsForm = { fullName: '', email: '', phone: '', address: '', postcode: '' }
const INITIAL_SCHEDULE: ScheduleForm = { preferredDay: '', preferredTime: '', preferredStartDate: '', specialInstructions: '' }
const INITIAL_PROPERTY_DETAILS: PropertyCleaningDetailsValue = { bedrooms: 1, bathrooms: 1, tasks: [] }

export default function MembershipSignup() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const locationState = (location.state as WizardLocationState | null) ?? null
  const initialTier = (locationState?.tier || (searchParams.get('tier') as MembershipTier | null)) ?? ''

  const [step, setStep] = useState(1)

  // step 1 (details)
  const [details, setDetails] = useState<DetailsForm>(INITIAL_DETAILS)
  const [detailsErrors, setDetailsErrors] = useState<Partial<Record<keyof DetailsForm, string>>>({})
  const [detailsSaving, setDetailsSaving] = useState(false)

  // step 2 (membership)
  const [selectedTier, setSelectedTier] = useState<MembershipTier | ''>(initialTier)

  // step 3 (schedule)
  const [schedule, setSchedule] = useState<ScheduleForm>(INITIAL_SCHEDULE)
  const [scheduleErrors, setScheduleErrors] = useState<Partial<Record<keyof ScheduleForm, string>>>({})
  const [propertyDetails, setPropertyDetails] = useState<PropertyCleaningDetailsValue>(INITIAL_PROPERTY_DETAILS)

  // step 4 (checkout)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutSending, setCheckoutSending] = useState(false)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/cleaning/sign-up', {
        replace: true,
        state: { tier: selectedTier || undefined, redirect: `${WIZARD_PATH}${selectedTier ? `?tier=${selectedTier}` : ''}` },
      })
    }
  }, [authLoading, user, navigate, selectedTier])

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name, email, phone, address, postcode')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDetails({
            fullName: data.full_name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            postcode: data.postcode || '',
          })
        } else if (user.email) {
          setDetails(prev => ({ ...prev, email: user.email as string }))
        }
      })
  }, [user])

  const validateDetails = () => {
    const errors: Partial<Record<keyof DetailsForm, string>> = {}
    if (!details.fullName.trim()) errors.fullName = 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) errors.email = 'Please enter a valid email address.'
    if (!details.phone.trim()) errors.phone = 'Please enter your phone number.'
    if (!details.address.trim()) errors.address = 'Please enter your address.'
    if (!details.postcode.trim()) errors.postcode = 'Please enter your postcode.'
    return errors
  }

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errors = validateDetails()
    if (Object.keys(errors).length) {
      setDetailsErrors(errors)
      return
    }
    if (!user) return

    setDetailsSaving(true)
    await supabase.from('profiles').update({
      full_name: details.fullName,
      email: details.email,
      phone: details.phone,
      address: details.address,
      postcode: details.postcode,
    }).eq('id', user.id)
    setDetailsSaving(false)
    setStep(2)
  }

  const handleSelectPlan = (tier: MembershipTier) => {
    setSelectedTier(tier)
    setStep(3)
  }

  const validateSchedule = () => {
    const errors: Partial<Record<keyof ScheduleForm, string>> = {}
    if (!schedule.preferredDay) errors.preferredDay = 'Please choose a preferred day.'
    if (!schedule.preferredTime) errors.preferredTime = 'Please choose a preferred time.'
    if (!schedule.preferredStartDate) errors.preferredStartDate = 'Please choose a start date.'
    return errors
  }

  const handleScheduleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errors = validateSchedule()
    if (Object.keys(errors).length) {
      setScheduleErrors(errors)
      return
    }
    setStep(4)
  }

  const buildFullInstructions = () => {
    const parts: string[] = []
    parts.push(`Bedrooms: ${propertyDetails.bedrooms} | Bathrooms: ${propertyDetails.bathrooms}`)
    if (propertyDetails.tasks.length) parts.push(`Tasks requested: ${propertyDetails.tasks.join(', ')}`)
    if (schedule.specialInstructions.trim()) parts.push(schedule.specialInstructions.trim())
    return parts.join('\n')
  }

  const handleCheckout = async () => {
    if (!user || !selectedTier) return
    setCheckoutSending(true)
    setCheckoutError('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Your session has expired. Please sign in again.')

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tier: selectedTier,
          preferredDay: schedule.preferredDay,
          preferredTime: schedule.preferredTime,
          preferredStartDate: schedule.preferredStartDate,
          specialInstructions: buildFullInstructions(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong starting checkout.')
      setClientSecret(data.clientSecret)
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setCheckoutSending(false)
    }
  }

  const selectedPlan = membershipPlans.find(p => p.tier === selectedTier)

  if (!user) {
    return <main style={{ minHeight: '60vh' }} />
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.wizard}>
          <div className={styles.steps}>
            {STEP_LABELS.map((label, idx) => {
              const num = idx + 1
              const cls = num === step ? styles.stepActive : num < step ? styles.stepDone : ''
              return (
                <span key={label} className={`${styles.step} ${cls}`}>
                  {num}. {label}
                </span>
              )
            })}
          </div>

          {step === 1 && (
            <div className={styles.panel}>
              <span className="label">Step 1</span>
              <h1 className={styles.panelTitle}>Customer Details</h1>
              <p className={styles.panelIntro}>Tell us about you and your property.</p>

              <form className={styles.form} onSubmit={handleDetailsSubmit} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="fullName" className={styles.label}>Full Name <span className={styles.req}>*</span></label>
                    <input id="fullName" value={details.fullName} onChange={e => setDetails({ ...details, fullName: e.target.value })} className={`${styles.input} ${detailsErrors.fullName ? styles.inputError : ''}`} />
                    {detailsErrors.fullName && <span className={styles.error}>{detailsErrors.fullName}</span>}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>Email <span className={styles.req}>*</span></label>
                    <input id="email" type="email" value={details.email} onChange={e => setDetails({ ...details, email: e.target.value })} className={`${styles.input} ${detailsErrors.email ? styles.inputError : ''}`} />
                    {detailsErrors.email && <span className={styles.error}>{detailsErrors.email}</span>}
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone" className={styles.label}>Phone <span className={styles.req}>*</span></label>
                  <input id="phone" type="tel" value={details.phone} onChange={e => setDetails({ ...details, phone: e.target.value })} className={`${styles.input} ${detailsErrors.phone ? styles.inputError : ''}`} />
                  {detailsErrors.phone && <span className={styles.error}>{detailsErrors.phone}</span>}
                </div>

                <PostcodeAddressField
                  postcode={details.postcode}
                  onPostcodeChange={value => setDetails({ ...details, postcode: value })}
                  address={details.address}
                  onAddressChange={value => setDetails({ ...details, address: value })}
                  fieldClassName={styles.field}
                  labelClassName={styles.label}
                  inputClassName={styles.input}
                  reqClassName={styles.req}
                  errorClassName={styles.error}
                  postcodeError={detailsErrors.postcode}
                  addressError={detailsErrors.address}
                />

                <div className={styles.actions}>
                  <span />
                  <button type="submit" className="btn btn-primary" disabled={detailsSaving}>
                    {detailsSaving ? 'Saving…' : 'Continue'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className={styles.panel}>
              <span className="label">Step 2</span>
              <h1 className={styles.panelTitle}>Choose Membership</h1>
              <p className={styles.panelIntro}>Select the plan that best suits your home.</p>

              <div className={styles.plans}>
                {membershipPlans.map(plan => (
                  <div key={plan.tier} className={`${styles.planCard} ${selectedTier === plan.tier ? styles.planCardSelected : ''}`}>
                    <div className={styles.planName}>{plan.name}</div>
                    <div className={styles.planPrice}>{plan.priceLabel}</div>
                    <ul className={styles.planFeatures}>
                      {plan.features.map(feature => <li key={feature}>{feature}</li>)}
                    </ul>
                    <button type="button" className={`btn btn-primary ${styles.planSelectBtn}`} onClick={() => handleSelectPlan(plan.tier)}>
                      {selectedTier === plan.tier ? 'Selected — Continue' : 'Select Membership'}
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                <span />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.panel}>
              <span className="label">Step 3</span>
              <h1 className={styles.panelTitle}>Preferred Schedule</h1>
              <p className={styles.panelIntro}>Let us know when you&rsquo;d like your cleans.</p>

              <form className={styles.form} onSubmit={handleScheduleSubmit} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="preferredDay" className={styles.label}>Preferred Day <span className={styles.req}>*</span></label>
                    <select id="preferredDay" value={schedule.preferredDay} onChange={e => setSchedule({ ...schedule, preferredDay: e.target.value as PreferredDay })} className={`${styles.input} ${styles.select} ${scheduleErrors.preferredDay ? styles.inputError : ''}`}>
                      <option value="">Select a day…</option>
                      {preferredDayOptions.map(day => <option key={day} value={day.toLowerCase()}>{day}</option>)}
                    </select>
                    {scheduleErrors.preferredDay && <span className={styles.error}>{scheduleErrors.preferredDay}</span>}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="preferredTime" className={styles.label}>Preferred Time <span className={styles.req}>*</span></label>
                    <select id="preferredTime" value={schedule.preferredTime} onChange={e => setSchedule({ ...schedule, preferredTime: e.target.value as PreferredTime })} className={`${styles.input} ${styles.select} ${scheduleErrors.preferredTime ? styles.inputError : ''}`}>
                      <option value="">Select a time…</option>
                      {preferredTimeOptions.map(time => <option key={time} value={time.toLowerCase()}>{time}</option>)}
                    </select>
                    {scheduleErrors.preferredTime && <span className={styles.error}>{scheduleErrors.preferredTime}</span>}
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="preferredStartDate" className={styles.label}>Preferred Start Date <span className={styles.req}>*</span></label>
                  <input id="preferredStartDate" type="date" value={schedule.preferredStartDate} onChange={e => setSchedule({ ...schedule, preferredStartDate: e.target.value })} className={`${styles.input} ${scheduleErrors.preferredStartDate ? styles.inputError : ''}`} min={new Date().toISOString().slice(0, 10)} />
                  {scheduleErrors.preferredStartDate && <span className={styles.error}>{scheduleErrors.preferredStartDate}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Property & Cleaning Details</label>
                </div>
                <PropertyCleaningDetails
                  value={propertyDetails}
                  onChange={setPropertyDetails}
                  fieldClassName={styles.field}
                  labelClassName={styles.label}
                />

                <div className={styles.field}>
                  <label htmlFor="specialInstructions" className={styles.label}>Special Instructions</label>
                  <textarea id="specialInstructions" rows={6} value={schedule.specialInstructions} onChange={e => setSchedule({ ...schedule, specialInstructions: e.target.value })} placeholder="Access details, pets, areas to focus on…" className={`${styles.input} ${styles.textarea}`} />
                </div>

                <div className={styles.actions}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                  <button type="submit" className="btn btn-primary">Continue</button>
                </div>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className={styles.panel}>
              <span className="label">Step 4</span>
              <h1 className={styles.panelTitle}>Confirm & Pay</h1>

              {!clientSecret && (
                <>
                  <p className={styles.panelIntro}>Review your membership, then set up your monthly Direct Debit below.</p>

                  {selectedPlan && (
                    <div className={styles.planCard} style={{ maxWidth: 420, marginBottom: 32 }}>
                      <div className={styles.planName}>{selectedPlan.name} Membership</div>
                      <div className={styles.planPrice}>{selectedPlan.priceLabel}</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {schedule.preferredDay && schedule.preferredDay[0].toUpperCase() + schedule.preferredDay.slice(1)}s, {schedule.preferredTime}
                        <br />Starting {schedule.preferredStartDate}
                      </p>
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                    You&rsquo;ll set up your monthly payment by Bacs Direct Debit right here. Your membership activates once payment is confirmed.
                  </p>

                  {checkoutError && <p className={styles.error} role="alert">{checkoutError}</p>}

                  <div className={styles.actions}>
                    <button type="button" className="btn btn-ghost" onClick={() => setStep(3)}>Back</button>
                    <button type="button" className="btn btn-primary" onClick={handleCheckout} disabled={checkoutSending}>
                      {checkoutSending ? 'Loading payment form…' : 'Proceed to Payment'}
                    </button>
                  </div>
                </>
              )}

              {clientSecret && <EmbeddedCheckout clientSecret={clientSecret} />}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
