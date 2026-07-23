import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AuthForm.module.css'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.')

    setSending(true)
    const { error: resetError } = await resetPassword(email)
    setSending(false)

    if (resetError) {
      setError(resetError)
      return
    }

    setSubmitted(true)
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.card}>
            <span className="label">Clean Club</span>
            <h1 className={styles.title}>Forgot Password</h1>
            <p className={styles.intro}>Enter your account email and we&rsquo;ll send you a link to reset your password.</p>

            {submitted ? (
              <div className={styles.success} role="alert">
                <h3>Check your inbox</h3>
                <p>If an account exists for {email}, a password reset link is on its way.</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>Email Address <span className={styles.req}>*</span></label>
                  <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.co.uk" className={styles.input} autoComplete="email" />
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
                  {sending ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <p className={styles.footNote}>
              <Link to="/cleaning/sign-in">Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
