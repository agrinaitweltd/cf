import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import OtpInput from '../../components/cleaning-club/OtpInput'
import styles from './AuthForm.module.css'

interface VerifyEmailState {
  email?: string
  tier?: string
  redirect?: string
}

export default function VerifyEmail() {
  const { verifySignupOtp, resendSignupOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as VerifyEmailState | null) ?? null

  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)
  const [otpKey, setOtpKey] = useState(0)

  if (!state?.email) {
    return <Navigate to="/cleaning/sign-up" replace />
  }

  const email = state.email
  const destination = state.redirect || (state.tier ? `/cleaning/membership/join?tier=${state.tier}` : '/cleaning/dashboard')

  const handleComplete = async (code: string) => {
    setError('')
    setVerifying(true)
    const { error: verifyError } = await verifySignupOtp(email, code)
    setVerifying(false)

    if (verifyError) {
      setError(verifyError)
      setOtpKey(k => k + 1)
      return
    }

    navigate(destination, { replace: true })
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    const { error: resendError } = await resendSignupOtp(email)
    setResending(false)
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
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <span className="label">Clean Club</span>
            <h1 className={styles.title}>We sent a code to your email</h1>
            <p className={styles.intro}>
              Enter the 6-digit verification code sent to <strong>{email}</strong>.
            </p>

            <OtpInput key={otpKey} onComplete={handleComplete} error={Boolean(error)} />

            {verifying && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 12 }}>Verifying…</p>}
            {error && <p className={styles.error} role="alert" style={{ marginTop: 12 }}>{error}</p>}
            {resent && !error && <p style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: 12 }}>A new code has been sent.</p>}

            <p className={styles.footNote}>
              Codes are valid for a few minutes. Didn&rsquo;t receive one?{' '}
              <button type="button" onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>
                {resending ? 'Resending…' : 'Request a resend'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
