import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import styles from './NotificationBell.module.css'

interface NotificationRow {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB')
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationRow[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  const unreadCount = items.filter(n => !n.read).length

  useEffect(() => {
    if (!user) return

    supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setItems((data as NotificationRow[]) ?? []))

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${user.id}` },
        payload => setItems(prev => [payload.new as NotificationRow, ...prev])
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const markAsRead = async (id: string) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  const markAllRead = async () => {
    const unreadIds = items.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button type="button" className={styles.bellBtn} onClick={() => setOpen(v => !v)} aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAllBtn} onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          {items.length === 0 ? (
            <div className={styles.empty}>No notifications yet.</div>
          ) : (
            items.map(n => (
              <button
                key={n.id}
                type="button"
                className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <div className={styles.itemTitle}>{n.title}</div>
                <div className={styles.itemMessage}>{n.message}</div>
                <div className={styles.itemTime}>{timeAgo(n.created_at)}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
