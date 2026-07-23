import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AuthForm.module.css'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    setSending(true)
    const { error: updateError } = await updatePassword(password)
    setSending(false)

    if (updateError) {
      setError(updateError)
      return
    }

    setSubmitted(true)
    setTimeout(() => navigate('/cleaning/dashboard', { replace: true }), 1800)
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.card}>
            <span className="label">Clean Club</span>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.intro}>Choose a new password for your account.</p>

            {submitted ? (
              <div className={styles.success} role="alert">
                <h3>Password Updated</h3>
                <p>Redirecting you to your dashboard…</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>New Password <span className={styles.req}>*</span></label>
                  <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className={styles.input} autoComplete="new-password" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password <span className={styles.req}>*</span></label>
                  <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your new password" className={styles.input} autoComplete="new-password" />
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
                  {sending ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
