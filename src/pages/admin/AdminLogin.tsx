import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import styles from './AdminAuth.module.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !data.user) {
      setSending(false)
      setError('Invalid email or password.')
      return
    }

    const { data: adminRow } = await supabase.from('admin_users').select('id, activated').eq('profile_id', data.user.id).maybeSingle()

    if (!adminRow || !adminRow.activated) {
      await supabase.auth.signOut()
      setSending(false)
      setError('This account does not have admin access.')
      return
    }

    setSending(false)
    navigate('/admin', { replace: true })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className="label">CF Hub UK</span>
        <h1 className={styles.title}>Admin Sign In</h1>
        <p className={styles.intro}>Sign in with your administrator account.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} autoComplete="email" />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} autoComplete="current-password" />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={sending}>
            {sending ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
