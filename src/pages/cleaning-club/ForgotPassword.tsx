import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AuthForm.module.css'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

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

    navigate('/cleaning/reset-password', { state: { email } })
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.wrap}>
          <div className={`${styles.card} animate-scalein ${error ? styles.shake : ''}`}>
            <span className="label">Clean Club</span>
            <h1 className={styles.title}>Forgot Password</h1>
            <p className={styles.intro}>Enter your account email and we&rsquo;ll send you a 6-digit code to reset your password.</p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email Address <span className={styles.req}>*</span></label>
                <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.co.uk" className={styles.input} autoComplete="email" />
              </div>

              {error && <p className={styles.error} role="alert">{error}</p>}

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
                {sending ? 'Sending…' : 'Send Reset Code'}
              </button>
            </form>

            <p className={styles.footNote}>
              <Link to="/cleaning/sign-in">Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
