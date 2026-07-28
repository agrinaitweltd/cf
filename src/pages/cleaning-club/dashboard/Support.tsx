import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import styles from './Dashboard.module.css'
import tableStyles from './DataTable.module.css'

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  admin_reply: string | null
  created_at: string
}

export default function Support() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!user) return
    const { data } = await supabase.from('support_tickets').select('*').eq('profile_id', user.id).order('created_at', { ascending: false })
    setTickets((data as Ticket[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !subject.trim() || !message.trim()) return
    setSending(true)
    setError('')
    const { error: insertError } = await supabase.from('support_tickets').insert({ profile_id: user.id, subject: subject.trim(), message: message.trim() })
    setSending(false)
    if (insertError) {
      setError('Could not submit your ticket. Please try again.')
      return
    }
    setSubject('')
    setMessage('')
    load()
  }

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.welcome}>Support</h1>
      <p className={styles.subIntro}>Have a question or issue? Send us a message and we'll get back to you.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 520, marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '11px 14px', color: 'var(--text-primary)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '11px 14px', color: 'var(--text-primary)', resize: 'vertical' }} />
        </div>
        {error && <p style={{ color: '#f05050', fontSize: '0.8rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={sending} style={{ alignSelf: 'flex-start' }}>
          {sending ? 'Sending…' : 'Submit Ticket'}
        </button>
      </form>

      <h2 className={styles.welcome} style={{ fontSize: '1.15rem', marginBottom: 16 }}>Your Tickets</h2>

      {tickets.length === 0 ? (
        <div className={styles.emptyState}><p>You haven't submitted any support tickets yet.</p></div>
      ) : (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr><th>Subject</th><th>Status</th><th>Submitted</th><th>Reply</th></tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td>{t.subject}</td>
                  <td><span className={tableStyles.badge}>{t.status.replace('_', ' ')}</span></td>
                  <td>{new Date(t.created_at).toLocaleDateString('en-GB')}</td>
                  <td style={{ maxWidth: 280 }}>{t.admin_reply || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
