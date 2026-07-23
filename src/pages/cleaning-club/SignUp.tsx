import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PostcodeAddressField from '../../components/cleaning-club/PostcodeAddressField'
import styles from './AuthForm.module.css'

interface SignUpLocationState {
  tier?: string
  redirect?: string
}

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state as SignUpLocationState | null) ?? null

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [postcode, setPostcode] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [googleSending, setGoogleSending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) return setError('Please enter your full name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.')
    if (!phone.trim()) return setError('Please enter your mobile phone number.')
    if (!postcode.trim()) return setError('Please enter your postcode.')
    if (!address.trim()) return setError('Please enter your address.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')

    setSending(true)
    const { error: signUpError } = await signUp(email, password, { fullName, phone, postcode, address })
    setSending(false)

    if (signUpError) {
      setError(signUpError)
      return
    }

    navigate('/cleaning/verify-email', {
      state: { email, tier: locationState?.tier, redirect: locationState?.redirect },
    })
  }

  const handleGoogle = async () => {
    setGoogleSending(true)
    const { error: googleError } = await signInWithGoogle()
    setGoogleSending(false)
    if (googleError) setError(googleError)
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.card}>
            <span className="label">Clean Club</span>
            <h1 className={styles.title}>Create Your Account</h1>
            <p className={styles.intro}>Join The Clean Club to manage your membership, cleans and billing in one place.</p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="fullName" className={styles.label}>Full Name <span className={styles.req}>*</span></label>
                <input id="fullName" name="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" className={styles.input} autoComplete="name" />
              </div>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email Address <span className={styles.req}>*</span></label>
                <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.co.uk" className={styles.input} autoComplete="email" />
              </div>
              <div className={styles.field}>
                <label htmlFor="phone" className={styles.label}>Mobile Phone Number <span className={styles.req}>*</span></label>
                <input id="phone" name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07700 900000" className={styles.input} autoComplete="tel" />
              </div>

              <PostcodeAddressField
                postcode={postcode}
                onPostcodeChange={setPostcode}
                address={address}
                onAddressChange={setAddress}
                fieldClassName={styles.field}
                labelClassName={styles.label}
                inputClassName={styles.input}
                reqClassName={styles.req}
                errorClassName={styles.error}
              />

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>Password <span className={styles.req}>*</span></label>
                <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className={styles.input} autoComplete="new-password" />
              </div>

              {error && <p className={styles.error} role="alert">{error}</p>}

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
                {sending ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <div className={styles.divider}>Or sign up with</div>

            <button type="button" className={styles.googleBtn} onClick={handleGoogle} disabled={googleSending}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 009 18z"/>
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.27-1.7V4.97H.95A9 9 0 000 9c0 1.45.35 2.83.95 4.03l3-2.33z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
              </svg>
              {googleSending ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <p className={styles.footNote}>
              Already have an account? <Link to="/cleaning/sign-in" state={locationState}>Sign In</Link>
            </p>

            <p className={styles.privacyNote}>
              By creating an account you agree to our <Link to="/terms-of-service">Terms of Service</Link> and{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>. If you sign up with Google, we only use your
              name, email and profile photo to create and manage your account.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
