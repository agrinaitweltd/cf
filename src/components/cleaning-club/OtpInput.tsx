import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import styles from './OtpInput.module.css'

interface OtpInputProps {
  length?: number
  onComplete: (code: string) => void
  error?: boolean
}

export default function OtpInput({ length = 6, onComplete, error }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const emitIfComplete = (next: string[]) => {
    const code = next.join('')
    if (code.length === length && next.every(v => v !== '')) {
      onComplete(code)
    }
  }

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...values]
    next[index] = digit
    setValues(next)

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    emitIfComplete(next)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    e.preventDefault()
    const next = Array(length).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setValues(next)
    const lastIndex = Math.min(pasted.length, length) - 1
    inputRefs.current[lastIndex]?.focus()
    emitIfComplete(next)
  }

  const half = length / 2

  return (
    <div className={styles.group}>
      <div className={styles.half}>
        {values.slice(0, half).map((value, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`${styles.box} ${value ? styles.boxFilled : ''} ${error ? styles.boxError : ''}`}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      <div className={styles.dash} aria-hidden="true" />
      <div className={styles.half}>
        {values.slice(half).map((value, i) => {
          const index = half + i
          return (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`${styles.box} ${value ? styles.boxFilled : ''} ${error ? styles.boxError : ''}`}
              aria-label={`Digit ${index + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}
