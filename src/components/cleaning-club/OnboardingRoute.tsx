import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

type Status = 'checking' | 'signedOut' | 'admin' | 'complete' | 'ok'

export default function OnboardingRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    if (loading) return
    if (!user) {
      setStatus('signedOut')
      return
    }
    Promise.all([
      supabase.from('admin_users').select('id, activated').eq('profile_id', user.id).maybeSingle(),
      supabase.from('profiles').select('full_name, phone, address, postcode, date_of_birth').eq('id', user.id).maybeSingle(),
    ]).then(([adminRes, profileRes]) => {
      if (adminRes.data?.activated) return setStatus('admin')
      const p = profileRes.data
      const complete = Boolean(p?.full_name && p?.phone && p?.address && p?.postcode && p?.date_of_birth)
      setStatus(complete ? 'complete' : 'ok')
    })
  }, [user, loading])

  if (loading || status === 'checking') {
    return <main style={{ minHeight: '60vh' }} />
  }

  if (status === 'signedOut') return <Navigate to="/cleaning/sign-in" replace />
  if (status === 'admin') return <Navigate to="/admin" replace />
  if (status === 'complete') return <Navigate to="/cleaning/dashboard" replace />

  return <>{children}</>
}
