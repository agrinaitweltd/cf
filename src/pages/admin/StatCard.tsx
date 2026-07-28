import styles from './AdminPages.module.css'

type StatColor = 'blue' | 'green' | 'teal' | 'orange'

interface StatCardProps {
  label: string
  value: string | number
  percent: number
  trend?: 'up' | 'down'
  trendLabel?: string
  icon: React.ReactNode
  color?: StatColor
}

const ICON_CLASS: Record<StatColor, string> = {
  blue: 'statIconBlue',
  green: 'statIconGreen',
  teal: 'statIconTeal',
  orange: 'statIconOrange',
}
const RING_CLASS: Record<StatColor, string> = {
  blue: 'ringBlue',
  green: 'ringGreen',
  teal: 'ringTeal',
  orange: 'ringOrange',
}

export default function StatCard({ label, value, percent, trend, trendLabel, icon, color = 'blue' }: StatCardProps) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={styles.statCardNew}>
      <div className={styles.statCardTop}>
        <div className={`${styles.statIconWrap} ${styles[ICON_CLASS[color]]}`}>{icon}</div>
        <div className={styles.statRing}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle
              cx="24" cy="24" r={radius} fill="none" className={styles[RING_CLASS[color]]} strokeWidth="4"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              transform="rotate(-90 24 24)"
            />
          </svg>
          <span className={styles.statRingLabel}>{clamped}%</span>
        </div>
      </div>
      <div className={styles.statValueNew}>{value}</div>
      <div className={styles.statLabelNew}>
        {label}
        {trendLabel && (
          <span className={trend === 'down' ? styles.trendDown : styles.trendUp}>
            {trend === 'down' ? '↓' : '↑'} {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}
