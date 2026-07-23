import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import OtpInput from '../../components/cleaning-club/OtpInput'
import styles from './AuthForm.module.css'

interface ResetPasswordState {
  email?: string
}

export default function ResetPassword() {
  const { verifyRecoveryOtp, updatePassword, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as ResetPasswordState | null) ?? null

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resent, setResent] = useState(false)
  const [otpKey, setOtpKey] = useState(0)

  if (!state?.email) {
    return <Navigate to="/cleaning/forgot-password" replace />
  }

  const email = state.email

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (code.length !== 6) return setError('Please enter the 6-digit code from your email.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    setSending(true)
    const { error: verifyError } = await verifyRecoveryOtp(email, code)
    if (verifyError) {
      setSending(false)
      setError(verifyError)
      setOtpKey(k => k + 1)
      return
    }

    const { error: updateError } = await updatePassword(password)
    setSending(false)

    if (updateError) {
      setError(updateError)
      return
    }

    setSubmitted(true)
    setTimeout(() => navigate('/cleaning/dashboard', { replace: true }), 1800)
  }

  const handleResend = async () => {
    setError('')
    const { error: resendError } = await resetPassword(email)
    if (resendError) {
      setError(resendError)
      return
    }
    setResent(true)
    setOtpKey(k => k + 1)
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.card}>
            <span className="label">Clean Club</span>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.intro}>Enter the 6-digit code sent to <strong>{email}</strong>, then choose a new password.</p>

            {submitted ? (
              <div className={styles.success} role="alert">
                <h3>Password Updated</h3>
                <p>Redirecting you to your dashboard…</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label className={styles.label}>Verification Code <span className={styles.req}>*</span></label>
                  <OtpInput key={otpKey} onComplete={setCode} error={Boolean(error)} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>New Password <span className={styles.req}>*</span></label>
                  <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className={styles.input} autoComplete="new-password" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password <span className={styles.req}>*</span></label>
                  <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your new password" className={styles.input} autoComplete="new-password" />
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}
                {resent && !error && <p style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>A new code has been sent.</p>}

                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
                  {sending ? 'Updating…' : 'Update Password'}
                </button>

                <p className={styles.footNote}>
                  Didn&rsquo;t receive a code?{' '}
                  <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>
                    Resend
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
