import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from './AdminAuth.module.css'

export default function AdminSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) return setError('This setup link is missing its token. Please use the exact link from your invite email.')
    if (!fullName.trim()) return setError('Please enter your full name.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    setSending(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'setup', token, fullName: fullName.trim(), password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Something went wrong.')
      setDone(true)
      setTimeout(() => navigate('/admin/login', { replace: true }), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  if (done) {
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

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className="label">CF Hub UK</span>
        <h1 className={styles.title}>Activate Admin Account</h1>
        <p className={styles.intro}>Create your name and password to finish setting up your admin account. This link can only be used once.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
            {sending ? 'Activating…' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
