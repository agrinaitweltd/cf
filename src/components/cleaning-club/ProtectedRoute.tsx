import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
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
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(Boolean(data))
        setChecking(false)
      })
  }, [user, loading])

  if (loading || checking) {
    return <main style={{ minHeight: '60vh' }} />
  }

  if (!user) {
    return <Navigate to="/cleaning/sign-in" replace />
  }

  // Admin accounts are managed separately and must not use the customer dashboard.
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
