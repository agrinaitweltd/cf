import { useMemo, useState } from 'react'
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

const ICONS = {
  room: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" /></svg>,
  surfaces: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="1.5" /><path d="M3 9h18" /></svg>,
  kitchen: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5" /><circle cx="9" cy="8" r="1.4" /><circle cx="15" cy="8" r="1.4" /><path d="M6 13h12" /></svg>,
  bathroom: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" /><path d="M7 12V6a2 2 0 0 1 3-1.7" /></svg>,
  soft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="7" rx="2" /><path d="M5 16v3M19 16v3M3 12V9a2 2 0 0 1 2-2h3v4" /></svg>,
  specialist: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
}

const TASK_CATEGORIES: { key: string; label: string; icon: keyof typeof ICONS; tasks: string[] }[] = [
  {
    key: 'rooms',
    label: 'Rooms & Areas',
    icon: 'room',
    tasks: [
      'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Hallway', 'Stairs', 'Landing',
      'Dining Room', 'Conservatory', 'Office', 'Study', 'Utility Room', 'Garage',
      'Basement', 'Loft', 'Balcony', 'Patio',
    ],
  },
  {
    key: 'surfaces',
    label: 'Windows & Surfaces',
    icon: 'surfaces',
    tasks: [
      'Windows (Inside)', 'Windows (Outside)', 'Skirting Boards', 'Doors & Frames',
      'Light Fixtures', 'Dusting', 'Mopping', 'Vacuuming',
    ],
  },
  {
    key: 'kitchen',
    label: 'Kitchen Deep Clean',
    icon: 'kitchen',
    tasks: [
      'Oven Cleaning', 'Fridge Cleaning', 'Freezer Cleaning', 'Interior Cupboards',
      'Interior Appliances', 'Deep Kitchen Clean',
    ],
  },
  {
    key: 'bathroom',
    label: 'Bathroom Deep Clean',
    icon: 'bathroom',
    tasks: ['Deep Bathroom Clean', 'Descale Tiles & Grout', 'Toilet Deep Clean', 'Mirror & Glass Polish'],
  },
  {
    key: 'soft',
    label: 'Soft Furnishings & Laundry',
    icon: 'soft',
    tasks: [
      'Carpet Cleaning', 'Upholstery Cleaning', 'Mattress Cleaning', 'Curtain Cleaning',
      'Ironing', 'Laundry',
    ],
  },
  {
    key: 'specialist',
    label: 'Specialist Cleans',
    icon: 'specialist',
    tasks: [
      'End of Tenancy', 'After Builders Cleaning', 'Move In Cleaning', 'Move Out Cleaning',
      'Airbnb Turnaround',
    ],
  },
]

const ALL_TASKS = TASK_CATEGORIES.flatMap(c => c.tasks)

export default function PropertyCleaningDetails({ value, onChange, fieldClassName, labelClassName }: PropertyCleaningDetailsProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')

  const setCount = (key: 'bedrooms' | 'bathrooms', delta: number) => {
    onChange({ ...value, [key]: Math.max(0, Math.min(10, value[key] + delta)) })
  }

  const toggleTask = (task: string) => {
    const has = value.tasks.includes(task)
    onChange({ ...value, tasks: has ? value.tasks.filter(t => t !== task) : [...value.tasks, task] })
  }

  const visibleTasks = useMemo(() => {
    const source = activeTab === 'all' ? ALL_TASKS : TASK_CATEGORIES.find(c => c.key === activeTab)?.tasks ?? []
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter(t => t.toLowerCase().includes(q))
  }, [activeTab, query])

  const categoryIcon = (task: string) => {
    const cat = TASK_CATEGORIES.find(c => c.tasks.includes(task))
    return cat ? ICONS[cat.icon] : ICONS.room
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
      <p className={styles.helperText}>
        Select every task and area you&rsquo;d like included so we can prepare accurately and quote correctly.
      </p>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search tasks…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search cleaning tasks"
            />
          </div>
          {value.tasks.length > 0 && (
            <button type="button" className={styles.clearBtn} onClick={() => onChange({ ...value, tasks: [] })}>
              Clear all
            </button>
          )}
        </div>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          {TASK_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              className={`${styles.tab} ${activeTab === cat.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(cat.key)}
            >
              <span className={styles.tabIcon} aria-hidden="true">{ICONS[cat.icon]}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className={styles.taskGrid}>
          {visibleTasks.length === 0 && (
            <div className={styles.noResults}>No tasks match &ldquo;{query}&rdquo;.</div>
          )}
          {visibleTasks.map(task => {
            const selected = value.tasks.includes(task)
            return (
              <button
                type="button"
                key={task}
                className={`${styles.taskCard} ${selected ? styles.taskCardSelected : ''}`}
                onClick={() => toggleTask(task)}
                aria-pressed={selected}
              >
                <span className={styles.taskCardIcon} aria-hidden="true">{categoryIcon(task)}</span>
                <span className={styles.taskCardLabel}>{task}</span>
                <span className={styles.taskCardCheck} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </button>
            )
          })}
        </div>

        <div className={styles.selectedSummary}>
          {value.tasks.length === 0
            ? 'No specific tasks selected yet — a standard clean will be assumed.'
            : `${value.tasks.length} task${value.tasks.length === 1 ? '' : 's'} selected.`}
        </div>
      </div>
    </div>
  )
}
