import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useMembershipData } from './useMembershipData'
import styles from './Dashboard.module.css'
import wizardStyles from '../MembershipSignup.module.css'

interface SavedAddress {
  id: string
  label: string
  address: string
  postcode: string
  is_default: boolean
}

export default function Profile() {
  const { user } = useAuth()
  const { loading, profile, refresh } = useMembershipData()
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [postcode, setPostcode] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [contactByEmail, setContactByEmail] = useState(true)
  const [contactBySms, setContactBySms] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newPostcode, setNewPostcode] = useState('')
  const [addingAddress, setAddingAddress] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (!profile) return
    setPhone(profile.phone ?? '')
    setAddress(profile.address ?? '')
    setPostcode(profile.postcode ?? '')
    setEmergencyContact(profile.emergency_contact ?? '')
  }, [profile])

  useEffect(() => {
    if (!user) return
    supabase.from('saved_addresses').select('*').eq('profile_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => setAddresses((data as SavedAddress[]) ?? []))
  }, [user])

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    setSaved(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ phone, address, postcode, emergency_contact: emergencyContact })
      .eq('id', user.id)

    setSaving(false)
    if (updateError) {
      setError('Could not save your changes. Please try again.')
      return
    }
    setSaved(true)
    refresh()
  }

  const handleAddAddress = async () => {
    if (!user || !newAddress.trim() || !newPostcode.trim()) return
    setAddingAddress(true)
    const { data, error: insertError } = await supabase
      .from('saved_addresses')
      .insert({ profile_id: user.id, label: newLabel.trim() || 'Address', address: newAddress.trim(), postcode: newPostcode.trim() })
      .select()
      .single()
    setAddingAddress(false)
    if (!insertError && data) {
      setAddresses(prev => [...prev, data as SavedAddress])
      setNewLabel('')
      setNewAddress('')
      setNewPostcode('')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    await supabase.from('saved_addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSaved(false)
    if (newPassword.length < 8) return setPwError('Password must be at least 8 characters.')
    if (newPassword !== confirmPassword) return setPwError('Passwords do not match.')

    setPwSaving(true)
    const { error: pwUpdateError } = await supabase.auth.updateUser({ password: newPassword })
    setPwSaving(false)
    if (pwUpdateError) {
      setPwError(pwUpdateError.message)
      return
    }
    setPwSaved(true)
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <>
      <h1 className={styles.welcome}>Profile</h1>
      <p className={styles.subIntro}>Keep your contact and property details up to date.</p>

      <form className={wizardStyles.form} onSubmit={handleSubmit} noValidate style={{ maxWidth: 520, marginBottom: 40 }}>
        <div className={wizardStyles.field}>
          <label htmlFor="phone" className={wizardStyles.label}>Phone</label>
          <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={wizardStyles.input} />
        </div>
        <div className={wizardStyles.field}>
          <label htmlFor="address" className={wizardStyles.label}>Address</label>
          <input id="address" value={address} onChange={e => setAddress(e.target.value)} className={wizardStyles.input} />
        </div>
        <div className={wizardStyles.field}>
          <label htmlFor="postcode" className={wizardStyles.label}>Postcode</label>
          <input id="postcode" value={postcode} onChange={e => setPostcode(e.target.value)} className={wizardStyles.input} />
        </div>
        <div className={wizardStyles.field}>
          <label htmlFor="emergencyContact" className={wizardStyles.label}>Emergency Contact</label>
          <input id="emergencyContact" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Name and phone number" className={wizardStyles.input} />
        </div>

        <div className={wizardStyles.field}>
          <label className={wizardStyles.label}>Contact Preferences</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            <input type="checkbox" checked={contactByEmail} onChange={e => setContactByEmail(e.target.checked)} /> Email me about my bookings and payments
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            <input type="checkbox" checked={contactBySms} onChange={e => setContactBySms(e.target.checked)} /> Text me reminders before each clean
          </label>
        </div>

        {error && <p className={wizardStyles.error}>{error}</p>}
        {saved && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>Profile updated.</p>}

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <h2 className={styles.welcome} style={{ fontSize: '1.15rem', marginBottom: 6 }}>Saved Addresses</h2>
      <p className={styles.subIntro} style={{ marginBottom: 16 }}>Store extra addresses for one-off bookings or a second property.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520, marginBottom: 24 }}>
        {addresses.map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '12px 16px', background: 'var(--bg-card)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.address}, {a.postcode}</div>
            </div>
            <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleDeleteAddress(a.id)}>Remove</button>
          </div>
        ))}
        {addresses.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No saved addresses yet.</p>}
      </div>

      <div className={wizardStyles.form} style={{ maxWidth: 520, marginBottom: 40 }}>
        <div className={wizardStyles.field}>
          <label className={wizardStyles.label}>Label</label>
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Mum's House" className={wizardStyles.input} />
        </div>
        <div className={wizardStyles.field}>
          <label className={wizardStyles.label}>Address</label>
          <input value={newAddress} onChange={e => setNewAddress(e.target.value)} className={wizardStyles.input} />
        </div>
        <div className={wizardStyles.field}>
          <label className={wizardStyles.label}>Postcode</label>
          <input value={newPostcode} onChange={e => setNewPostcode(e.target.value)} className={wizardStyles.input} />
        </div>
        <button type="button" className="btn btn-ghost" disabled={addingAddress} onClick={handleAddAddress} style={{ alignSelf: 'flex-start' }}>
          {addingAddress ? 'Adding…' : 'Add Address'}
        </button>
      </div>

      <h2 className={styles.welcome} style={{ fontSize: '1.15rem', marginBottom: 6 }}>Security</h2>
      <p className={styles.subIntro} style={{ marginBottom: 16 }}>Change the password used to sign in.</p>

      <form className={wizardStyles.form} onSubmit={handlePasswordSubmit} noValidate style={{ maxWidth: 520 }}>
        <div className={wizardStyles.field}>
          <label htmlFor="newPassword" className={wizardStyles.label}>New Password</label>
          <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={wizardStyles.input} autoComplete="new-password" />
        </div>
        <div className={wizardStyles.field}>
          <label htmlFor="confirmPassword" className={wizardStyles.label}>Confirm New Password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={wizardStyles.input} autoComplete="new-password" />
        </div>

        {pwError && <p className={wizardStyles.error}>{pwError}</p>}
        {pwSaved && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>Password updated.</p>}

        <button type="submit" className="btn btn-primary" disabled={pwSaving} style={{ alignSelf: 'flex-start' }}>
          {pwSaving ? 'Saving…' : 'Change Password'}
        </button>
      </form>
    </>
  )
}
