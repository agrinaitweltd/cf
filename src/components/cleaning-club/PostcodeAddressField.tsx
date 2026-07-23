import { useState, type CSSProperties } from 'react'
import styles from './PostcodeAddressField.module.css'

interface LookupAddress {
  line1: string
  line2: string
  city: string
  postcode: string
}

interface PostcodeAddressFieldProps {
  postcode: string
  onPostcodeChange: (value: string) => void
  address: string
  onAddressChange: (value: string) => void
  fieldClassName: string
  labelClassName: string
  inputClassName: string
  reqClassName?: string
  errorClassName?: string
  postcodeError?: string
  addressError?: string
}

export default function PostcodeAddressField({
  postcode,
  onPostcodeChange,
  address,
  onAddressChange,
  fieldClassName,
  labelClassName,
  inputClassName,
  reqClassName,
  errorClassName,
  postcodeError,
  addressError,
}: PostcodeAddressFieldProps) {
  const [matches, setMatches] = useState<LookupAddress[]>([])
  const [searching, setSearching] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleFindAddress = async () => {
    setLookupError('')
    setSearched(false)
    if (!postcode.trim()) {
      setLookupError('Enter a postcode first.')
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`/api/postcode-lookup?postcode=${encodeURIComponent(postcode.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not look up that postcode.')
      setMatches(data.addresses || [])
      setSearched(true)
      if (!data.addresses?.length) {
        setLookupError('No addresses found for that postcode. You can enter your address manually below.')
      }
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Could not look up that postcode.')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectAddress = (value: string) => {
    const match = matches.find(m => `${m.line1}|${m.line2}|${m.city}` === value)
    if (!match) return
    const full = [match.line1, match.line2, match.city].filter(Boolean).join(', ')
    onAddressChange(full)
    if (match.postcode) onPostcodeChange(match.postcode)
  }

  const rowStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 22 }

  return (
    <div style={rowStyle}>
      <div className={fieldClassName}>
        <label htmlFor="postcode" className={labelClassName}>
          Postcode {reqClassName && <span className={reqClassName}>*</span>}
        </label>
        <div className={styles.row}>
          <input
            id="postcode"
            value={postcode}
            onChange={e => onPostcodeChange(e.target.value.toUpperCase())}
            placeholder="e.g. SW1A 1AA"
            className={`${inputClassName} ${styles.postcodeInput}`}
            autoComplete="postal-code"
          />
          <button type="button" className={`btn btn-ghost ${styles.findBtn}`} onClick={handleFindAddress} disabled={searching}>
            {searching ? 'Searching…' : 'Find Address'}
          </button>
        </div>
        {postcodeError && errorClassName && <span className={errorClassName}>{postcodeError}</span>}
        {lookupError && <p className={`${styles.status} ${styles.statusError}`}>{lookupError}</p>}
      </div>

      {searched && matches.length > 0 && (
        <div className={fieldClassName}>
          <label htmlFor="addressMatches" className={labelClassName}>Select Your Address</label>
          <select
            id="addressMatches"
            className={inputClassName}
            defaultValue=""
            onChange={e => handleSelectAddress(e.target.value)}
          >
            <option value="" disabled>Choose an address…</option>
            {matches.map(match => (
              <option key={`${match.line1}|${match.line2}|${match.city}`} value={`${match.line1}|${match.line2}|${match.city}`}>
                {[match.line1, match.line2, match.city].filter(Boolean).join(', ')}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={fieldClassName}>
        <label htmlFor="address" className={labelClassName}>
          Address {reqClassName && <span className={reqClassName}>*</span>}
        </label>
        <input
          id="address"
          value={address}
          onChange={e => onAddressChange(e.target.value)}
          placeholder="Flat/House number, street, town"
          className={inputClassName}
          autoComplete="street-address"
        />
        {addressError && errorClassName && <span className={errorClassName}>{addressError}</span>}
        <p className={styles.status}>Found the wrong address? You can edit it directly here.</p>
      </div>
    </div>
  )
}
