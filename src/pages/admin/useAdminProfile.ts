import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export function useAdminProfile() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState<string | null>(null)
  const [role, setRole] = useState<string>('admin')

  useEffect(() => {
    if (!user) return
    supabase
      .from('admin_users')
      .select('full_name, role')
      .eq('profile_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? null)
        setRole(data?.role ?? 'admin')
      })
  }, [user])

  return { fullName, role, email: user?.email ?? null }
}
