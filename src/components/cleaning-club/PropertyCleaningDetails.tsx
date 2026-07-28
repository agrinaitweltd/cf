import { useState } from 'react'
import styles from './PropertyCleaningDetails.module.css'

export interface PropertyCleaningDetailsValue {
  bedrooms: number
  bathrooms: number
  tasks: string[]
}

interface PropertyCleaningDetailsProps {
  value: PropertyCleaningDetailsValue
  onChange: (value: PropertyCleaningDetailsValue) => void
  fieldClassName: string
  labelClassName: string
}

const TASK_CATEGORIES: Record<string, string[]> = {
  Kitchen: ['Oven clean', 'Fridge / freezer clean', 'Inside cupboards', 'Extractor fan', 'Washing up / dishwasher'],
  Bathroom: ['Deep clean shower / bath', 'Descale tiles & grout', 'Toilet deep clean', 'Mirror & glass polish'],
  Bedrooms: ['Change bed linen', 'Dusting & polishing', 'Wardrobe tidy'],
  'Living Areas': ['Dusting & polishing', 'Vacuum upholstery', 'Skirting boards'],
  Laundry: ['Ironing', 'Washing & drying', 'Folding & putting away'],
  'Windows & Extras': ['Interior windows', 'Balcony / patio', 'Carpet spot cleaning'],
}

const CATEGORY_NAMES = Object.keys(TASK_CATEGORIES)

export default function PropertyCleaningDetails({ value, onChange, fieldClassName, labelClassName }: PropertyCleaningDetailsProps) {
  const [activeTab, setActiveTab] = useState(CATEGORY_NAMES[0])

  const setCount = (key: 'bedrooms' | 'bathrooms', delta: number) => {
    onChange({ ...value, [key]: Math.max(0, Math.min(10, value[key] + delta)) })
  }

  const toggleTask = (task: string) => {
    const has = value.tasks.includes(task)
    onChange({ ...value, tasks: has ? value.tasks.filter(t => t !== task) : [...value.tasks, task] })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.counters}>
        <div className={fieldClassName}>
          <label className={labelClassName}>Bedrooms</label>
          <div className={styles.stepper}>
            <button type="button" className={styles.stepperBtn} onClick={() => setCount('bedrooms', -1)} disabled={value.bedrooms === 0} aria-label="Decrease bedrooms">−</button>
            <span className={styles.stepperValue}>{value.bedrooms}</span>
            <button type="button" className={styles.stepperBtn} onClick={() => setCount('bedrooms', 1)} aria-label="Increase bedrooms">+</button>
          </div>
        </div>
        <div className={fieldClassName}>
          <label className={labelClassName}>Bathrooms</label>
          <div className={styles.stepper}>
            <button type="button" className={styles.stepperBtn} onClick={() => setCount('bathrooms', -1)} disabled={value.bathrooms === 0} aria-label="Decrease bathrooms">−</button>
            <span className={styles.stepperValue}>{value.bathrooms}</span>
            <button type="button" className={styles.stepperBtn} onClick={() => setCount('bathrooms', 1)} aria-label="Increase bathrooms">+</button>
          </div>
        </div>
      </div>

      <div className={fieldClassName} style={{ marginBottom: 0 }}>
        <label className={labelClassName}>What needs cleaning?</label>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 12px' }}>
        Select the tasks you&rsquo;d like included so we can prepare accurately.
      </p>

      <div className={styles.card}>
        <div className={styles.tabs}>
          {CATEGORY_NAMES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`${styles.tab} ${activeTab === cat ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.taskList}>
          {TASK_CATEGORIES[activeTab].map(task => (
            <div key={task} className={styles.taskRow}>
              <span className={styles.taskLabel}>{task}</span>
              <input
                type="checkbox"
                className={styles.toggle}
                checked={value.tasks.includes(task)}
                onChange={() => toggleTask(task)}
                aria-label={task}
              />
            </div>
          ))}
        </div>
        <div className={styles.selectedSummary}>
          {value.tasks.length === 0 ? 'No specific tasks selected yet — a standard clean will be assumed.' : `${value.tasks.length} task${value.tasks.length === 1 ? '' : 's'} selected.`}
        </div>
      </div>
    </div>
  )
}
