import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

type Status = 'checking' | 'signedOut' | 'admin' | 'incomplete' | 'ok'

async function resolveStatus(userId: string): Promise<Status> {
  const [adminRes, profileRes] = await Promise.all([
    supabase.from('admin_users').select('id, activated').eq('profile_id', userId).maybeSingle(),
    supabase.from('profiles').select('full_name, phone, address, postcode, date_of_birth').eq('id', userId).maybeSingle(),
  ])

  if (adminRes.data?.activated) return 'admin'

  const profile = profileRes.data
  const isComplete = Boolean(
    profile?.full_name && profile?.phone && profile?.address && profile?.postcode && profile?.date_of_birth
  )
  return isComplete ? 'ok' : 'incomplete'
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    if (loading) return
    if (!user) {
      setStatus('signedOut')
      return
    }
    resolveStatus(user.id).then(setStatus)
  }, [user, loading])

  if (loading || status === 'checking') {
    return <main style={{ minHeight: '60vh' }} />
  }

  if (status === 'signedOut') {
    return <Navigate to="/cleaning/sign-in" replace />
  }

  // Admin accounts are managed separately and must not use the customer dashboard.
  if (status === 'admin') {
    return <Navigate to="/admin" replace />
  }

  // Google sign-ups only ever provide name/email/photo — collect the rest
  // (date of birth, phone, address) before letting anyone reach the dashboard.
  if (status === 'incomplete') {
    return <Navigate to="/cleaning/onboarding" replace />
  }

  return <>{children}</>
}
