import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import PostcodeAddressField from '../../components/cleaning-club/PostcodeAddressField'
import styles from './AuthForm.module.css'

function calculateAge(dob: string) {
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState((user?.user_metadata?.full_name as string | undefined) ?? '')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phone, setPhone] = useState('')
  const [postcode, setPostcode] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) return
    if (!fullName.trim()) return setError('Please enter your full name.')
    if (!dateOfBirth) return setError('Please enter your date of birth.')
    if (calculateAge(dateOfBirth) < 18) return setError('You must be at least 18 years old to use Clean Club.')
    if (!phone.trim()) return setError('Please enter your mobile phone number.')
    if (!postcode.trim()) return setError('Please enter your postcode.')
    if (!address.trim()) return setError('Please enter your address.')

    setSaving(true)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth,
        phone: phone.trim(),
        postcode: postcode.trim(),
        address: address.trim(),
      })
      .eq('id', user.id)
    setSaving(false)

    if (updateError) {
      setError('Could not save your details. Please try again.')
      return
    }
    navigate('/cleaning/dashboard', { replace: true })
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.wrap}>
          <div className="animate-scalein">
            <div className={styles.card}>
              <span className="label">Clean Club</span>
              <h1 className={styles.title}>Just a Few More Details</h1>
              <p className={styles.intro}>
                Before you can book a clean, we need a few more details to set up your account —
                your name, date of birth, phone number and address.
              </p>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="fullName" className={styles.label}>Full Name <span className={styles.req}>*</span></label>
                  <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" className={styles.input} autoComplete="name" />
                </div>

                <div className={styles.field}>
                  <label htmlFor="dateOfBirth" className={styles.label}>Date of Birth <span className={styles.req}>*</span></label>
                  <input id="dateOfBirth" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={styles.input} autoComplete="bday" max={new Date().toISOString().slice(0, 10)} />
                </div>

                <div className={styles.field}>
                  <label htmlFor="phone" className={styles.label}>Mobile Phone Number <span className={styles.req}>*</span></label>
                  <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07700 900000" className={styles.input} autoComplete="tel" />
                </div>

                <PostcodeAddressField
                  postcode={postcode}
                  onPostcodeChange={setPostcode}
                  address={address}
                  onAddressChange={setAddress}
                  fieldClassName={styles.field}
                  labelClassName={styles.label}
                  inputClassName={styles.input}
                  reqClassName={styles.req}
                  errorClassName={styles.error}
                />

                {error && <p className={styles.error} role="alert">{error}</p>}

                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={saving}>
                  {saving ? 'Saving…' : 'Continue to Dashboard'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
