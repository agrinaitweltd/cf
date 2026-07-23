import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AuthForm.module.css'

export default function SignIn() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [googleSending, setGoogleSending] = useState(false)

  const locationState = location.state as { from?: string; redirect?: string; tier?: string } | null
  const redirectTo = locationState?.redirect || locationState?.from || '/cleaning/dashboard'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.')
    if (!password) return setError('Please enter your password.')

    setSending(true)
    const { error: signInError } = await signIn(email, password)
    setSending(false)

    if (signInError) {
      setError(signInError)
      return
    }

    navigate(redirectTo, { replace: true })
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
            <h1 className={styles.title}>Sign in to your account</h1>
            <p className={styles.intro}>Sign in to manage your Clean Club membership, cleans and billing.</p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email Address <span className={styles.req}>*</span></label>
                <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.co.uk" className={styles.input} autoComplete="email" />
              </div>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label htmlFor="password" className={styles.label}>Password <span className={styles.req}>*</span></label>
                  <Link to="/cleaning/forgot-password" className={styles.forgotLink}>Forgot your password?</Link>
                </div>
                <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className={styles.input} autoComplete="current-password" />
              </div>

              {error && <p className={styles.error} role="alert">{error}</p>}

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
                {sending ? 'Signing In…' : 'Sign In'}
              </button>
            </form>

            <div className={styles.divider}>Or sign in with</div>

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
              New to Clean Club? <Link to="/cleaning/sign-up" state={locationState}>Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
