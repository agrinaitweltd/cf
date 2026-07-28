import { useMemo, useState } from 'react'
import type { AdminBooking, AdminProfile } from './useAdminData'
import styles from './BookingsCalendar.module.css'

interface BookingsCalendarProps {
  bookings: AdminBooking[]
  profileById: Map<string, AdminProfile>
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function BookingsCalendar({ bookings, profileById }: BookingsCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, AdminBooking[]>()
    bookings.forEach(b => {
      const key = b.scheduled_date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(b)
    })
    return map
  }, [bookings])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = toDateKey(new Date())

  const cells: Array<{ day: number; key: string } | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = toDateKey(new Date(year, month, d))
    cells.push({ day: d, key })
  }

  const selectedBookings = selectedDate ? bookingsByDate.get(selectedDate) ?? [] : []

  return (
    <div>
      <div className={styles.calHead}>
        <span className={styles.calTitle}>{cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
        <div className={styles.calNav}>
          <button type="button" className={styles.calNavBtn} onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">‹</button>
          <button type="button" className={styles.calNavBtn} onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">›</button>
        </div>
      </div>

      <div className={styles.grid}>
        {DAY_NAMES.map(d => <div key={d} className={styles.dayName}>{d}</div>)}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className={`${styles.cell} ${styles.cellEmpty}`} />
          const dayBookings = bookingsByDate.get(cell.key) ?? []
          const isToday = cell.key === todayKey
          const isSelected = cell.key === selectedDate
          return (
            <div
              key={cell.key}
              className={`${styles.cell} ${isToday ? styles.cellToday : ''} ${isSelected ? styles.cellSelected : ''}`}
              onClick={() => setSelectedDate(cell.key)}
            >
              <div className={styles.cellNum}>{cell.day}</div>
              {dayBookings.length > 0 && (
                <div className={styles.cellDots}>
                  {dayBookings.slice(0, 4).map(b => <span key={b.id} className={styles.cellDot} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <div className={styles.dayPanel}>
          <div className={styles.dayPanelTitle}>
            {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' '}— {selectedBookings.length} clean{selectedBookings.length === 1 ? '' : 's'}
          </div>
          {selectedBookings.length === 0 ? (
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>No cleans scheduled this day.</p>
          ) : (
            selectedBookings.map(b => {
              const profile = profileById.get(b.profile_id)
              return (
                <div key={b.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.86rem' }}>
                  <strong>{profile?.full_name || profile?.email}</strong> — {b.scheduled_time || 'time TBC'} — <span style={{ textTransform: 'capitalize' }}>{b.status}</span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
