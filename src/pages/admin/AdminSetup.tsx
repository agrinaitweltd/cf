import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { safeFetchJson } from '../../lib/api'
import styles from './AdminAuth.module.css'

type Step = 'checking' | 'invalid' | 'details' | 'otp' | 'done'

export default function AdminSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [step, setStep] = useState<Step>('checking')
  const [inviteEmail, setInviteEmail] = useState('')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStep('invalid')
      setError('This setup link is missing its token. Please use the exact link from your invite email.')
      return
    }
    safeFetchJson<{ email: string }>('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'verify_token', token }),
    })
      .then(res => {
        setInviteEmail(res.email)
        setStep('details')
      })
      .catch(err => {
        setStep('invalid')
        setError(err instanceof Error ? err.message : 'This setup link is invalid.')
      })
  }, [token])

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) return setError('Please enter your full name.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    if (!phone.trim()) return setError('Please enter a phone number.')

    setSending(true)
    try {
      await safeFetchJson('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'request_otp', token, fullName: fullName.trim(), password, phone: phone.trim() }),
      })
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) return setError('Please enter the verification code.')

    setSending(true)
    try {
      await safeFetchJson('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'setup', token, fullName: fullName.trim(), password, phone: phone.trim(), otp: otp.trim() }),
      })
      setStep('done')
      setTimeout(() => navigate('/admin/login', { replace: true }), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  const resendOtp = async () => {
    setError('')
    setSending(true)
    try {
      await safeFetchJson('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'request_otp', token, fullName: fullName.trim(), password, phone: phone.trim() }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  if (step === 'checking') {
    return <div className={styles.wrap}><div className={styles.card}><p className={styles.intro}>Checking your setup link…</p></div></div>
  }

  if (step === 'invalid') {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <span className="label">CF Hub UK</span>
          <h1 className={styles.title}>Setup Link Invalid</h1>
          <p className={styles.intro}>{error}</p>
          <Link to="/admin/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <span className="label">CF Hub UK</span>
          <h1 className={styles.title}>Account Activated</h1>
          <p className={styles.intro}>Your admin account is ready. Redirecting you to sign in…</p>
          <Link to="/admin/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <span className="label">CF Hub UK</span>
          <h1 className={styles.title}>Verify Your Email</h1>
          <p className={styles.intro}>We sent a 6-digit code to <strong>{inviteEmail}</strong>. Enter it below to finish activating your account.</p>

          <form className={styles.form} onSubmit={handleOtpSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="otp" className={styles.label}>Verification Code</label>
              <input id="otp" type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} className={styles.input} autoComplete="one-time-code" />
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
              {sending ? 'Verifying…' : 'Verify & Activate'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={resendOtp} disabled={sending} style={{ width: '100%' }}>
              Resend Code
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className="label">CF Hub UK</span>
        <h1 className={styles.title}>Activate Admin Account</h1>
        <p className={styles.intro}>Setting up <strong>{inviteEmail}</strong>. Create your name, password and phone number — we'll verify with a one-time code before activating.</p>

        <form className={styles.form} onSubmit={handleDetailsSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={styles.input} autoComplete="name" />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Create Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} autoComplete="new-password" />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={styles.input} autoComplete="new-password" />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone" className={styles.label}>Phone Number</label>
            <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={styles.input} autoComplete="tel" placeholder="+44 7700 900000" />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
            {sending ? 'Sending Code…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
