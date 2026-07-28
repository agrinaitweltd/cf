import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import styles from './Dashboard.module.css'
import notifStyles from './NotificationBell.module.css'

interface NotificationRow {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export default function Notifications() {
  const { user } = useAuth()
  const [items, setItems] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('notifications').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => {
        setItems((data as NotificationRow[]) ?? [])
        setLoading(false)
      })
  }, [user])

  const markAllRead = async () => {
    const unreadIds = items.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
  }

  if (loading) return <main style={{ minHeight: '40vh' }} />

  const unreadCount = items.filter(n => !n.read).length

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <h1 className={styles.welcome}>Notifications</h1>
          <p className={styles.subIntro}>Updates on your bookings, membership and payments.</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-ghost" onClick={markAllRead}>Mark all read ({unreadCount})</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}><p>No notifications yet.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
          {items.map(n => (
            <div key={n.id} className={`${notifStyles.item} ${!n.read ? notifStyles.itemUnread : ''}`} style={{ position: 'static', width: '100%', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
              <div className={notifStyles.itemTitle}>{n.title}</div>
              <div className={notifStyles.itemMessage}>{n.message}</div>
              <div className={notifStyles.itemTime}>{new Date(n.created_at).toLocaleString('en-GB')}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
