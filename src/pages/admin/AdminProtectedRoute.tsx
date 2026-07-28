import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setChecking(false)
      return
    }
    supabase
      .from('admin_users')
      .select('id, activated')
      .eq('profile_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(Boolean(data?.activated))
        setChecking(false)
      })
  }, [user, loading])

  if (loading || checking) {
    return <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} />
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
