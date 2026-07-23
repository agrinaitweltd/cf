import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useMembershipData } from './useMembershipData'
import styles from './Dashboard.module.css'
import wizardStyles from '../MembershipSignup.module.css'

export default function Profile() {
  const { user } = useAuth()
  const { loading, profile, refresh } = useMembershipData()
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [postcode, setPostcode] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile) return
    setPhone(profile.phone ?? '')
    setAddress(profile.address ?? '')
    setPostcode(profile.postcode ?? '')
    setEmergencyContact(profile.emergency_contact ?? '')
  }, [profile])

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

  return (
    <>
      <h1 className={styles.welcome}>Profile</h1>
      <p className={styles.subIntro}>Keep your contact and property details up to date.</p>

      <form className={wizardStyles.form} onSubmit={handleSubmit} noValidate style={{ maxWidth: 520 }}>
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

        {error && <p className={wizardStyles.error}>{error}</p>}
        {saved && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>Profile updated.</p>}

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </>
  )
}
