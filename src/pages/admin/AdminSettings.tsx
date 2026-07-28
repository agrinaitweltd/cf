import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAdminProfile } from './useAdminProfile'
import { supabase } from '../../lib/supabase'
import { postAdminAction } from './useAdminData'
import styles from './AdminPages.module.css'

export default function AdminSettings() {
  const { user } = useAuth()
  const { fullName } = useAdminProfile()

  const [name, setName] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [nameError, setNameError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastSending, setBroadcastSending] = useState(false)
  const [broadcastSent, setBroadcastSent] = useState('')
  const [broadcastError, setBroadcastError] = useState('')

  useEffect(() => {
    if (fullName) setName(fullName)
  }, [fullName])

  const handleNameSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setNameSaving(true)
    setNameError('')
    setNameSaved(false)
    const [profileUpdate, adminUpdate] = await Promise.all([
      supabase.from('profiles').update({ full_name: name }).eq('id', user.id),
      supabase.from('admin_users').update({ full_name: name }).eq('profile_id', user.id),
    ])
    setNameSaving(false)
    if (profileUpdate.error || adminUpdate.error) {
      setNameError('Could not save your name. Please try again.')
      return
    }
    setNameSaved(true)
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSaved(false)
    if (newPassword.length < 8) return setPwError('Password must be at least 8 characters.')
    if (newPassword !== confirmPassword) return setPwError('Passwords do not match.')

    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwSaving(false)
    if (error) {
      setPwError(error.message)
      return
    }
    setPwSaved(true)
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleBroadcast = async (e: FormEvent) => {
    e.preventDefault()
    setBroadcastError('')
    setBroadcastSent('')
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return setBroadcastError('Title and message are required.')

    setBroadcastSending(true)
    try {
      const result = await postAdminAction('/api/admin', { resource: 'broadcast', title: broadcastTitle.trim(), message: broadcastMessage.trim() })
      setBroadcastSent(`Sent to ${result.recipients} member${result.recipients === 1 ? '' : 's'}.`)
      setBroadcastTitle('')
      setBroadcastMessage('')
    } catch (err) {
      setBroadcastError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBroadcastSending(false)
    }
  }

  return (
    <>
      <h1 className={styles.title}>Settings</h1>
      <p className={styles.subtitle}>Manage your admin profile, security and member notifications.</p>

      <div className={styles.dataCard} style={{ marginBottom: 20, paddingBottom: 26 }}>
        <div className={styles.dataCardHead}>
          <span className={styles.dataCardTitle}>Your Profile</span>
          <p className={styles.dataCardSubtitle}>{user?.email}</p>
        </div>
        <form onSubmit={handleNameSubmit} style={{ maxWidth: 380 }}>
          <div className={styles.modalField}>
            <label>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          {nameError && <p className={styles.error}>{nameError}</p>}
          {nameSaved && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: 12 }}>Name updated.</p>}
          <button type="submit" className="btn btn-primary" disabled={nameSaving}>{nameSaving ? 'Saving…' : 'Save Name'}</button>
        </form>
      </div>

      <div className={styles.dataCard} style={{ marginBottom: 20, paddingBottom: 26 }}>
        <div className={styles.dataCardHead}>
          <span className={styles.dataCardTitle}>Security</span>
          <p className={styles.dataCardSubtitle}>Change your admin account password.</p>
        </div>
        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 380 }}>
          <div className={styles.modalField}>
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div className={styles.modalField}>
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
          </div>
          {pwError && <p className={styles.error}>{pwError}</p>}
          {pwSaved && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: 12 }}>Password updated.</p>}
          <button type="submit" className="btn btn-primary" disabled={pwSaving}>{pwSaving ? 'Saving…' : 'Change Password'}</button>
        </form>
      </div>

      <div className={styles.dataCard} style={{ paddingBottom: 26 }}>
        <div className={styles.dataCardHead}>
          <span className={styles.dataCardTitle}>Notifications: Broadcast to Members</span>
          <p className={styles.dataCardSubtitle}>Send an announcement to every customer's notification centre.</p>
        </div>
        <form onSubmit={handleBroadcast} style={{ maxWidth: 480 }}>
          <div className={styles.modalField}>
            <label>Title</label>
            <input value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="e.g. Bank Holiday scheduling update" />
          </div>
          <div className={styles.modalField}>
            <label>Message</label>
            <textarea
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              rows={4}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '10px 13px', color: 'var(--text-primary)', fontSize: '0.86rem', resize: 'vertical', width: '100%' }}
            />
          </div>
          {broadcastError && <p className={styles.error}>{broadcastError}</p>}
          {broadcastSent && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: 12 }}>{broadcastSent}</p>}
          <button type="submit" className="btn btn-primary" disabled={broadcastSending}>{broadcastSending ? 'Sending…' : 'Send Broadcast'}</button>
        </form>
      </div>
    </>
  )
}
