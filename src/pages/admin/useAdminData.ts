import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface AdminProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  postcode: string | null
  created_at: string
}
export interface AdminMembership {
  id: string
  profile_id: string
  tier: string
  status: string
  preferred_day: string | null
  preferred_time: string | null
  created_at: string
}
export interface AdminSubscription {
  id: string
  profile_id: string
  status: string
  stripe_price_id: string | null
  current_period_end: string | null
}
export interface AdminBooking {
  id: string
  profile_id: string
  membership_id: string | null
  scheduled_date: string
  scheduled_time: string | null
  status: string
  assigned_cleaner_id: string | null
}
export interface AdminPayment {
  id: string
  profile_id: string
  amount: number
  currency: string
  status: string
  stripe_invoice_id: string | null
  paid_at: string | null
  created_at: string
}
export interface AdminCleaner {
  id: string
  full_name: string
  active: boolean
}

interface AdminData {
  profiles: AdminProfile[]
  memberships: AdminMembership[]
  subscriptions: AdminSubscription[]
  bookings: AdminBooking[]
  payments: AdminPayment[]
  cleaners: AdminCleaner[]
}

const EMPTY: AdminData = { profiles: [], memberships: [], subscriptions: [], bookings: [], payments: [], cleaners: [] }

export function useAdminData() {
  const [data, setData] = useState<AdminData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setLoading(false)
      setError('Not authenticated.')
      return
    }
    try {
      const res = await fetch('/api/admin/data', { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load admin data.')
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { ...data, loading, error, refresh }
}

export async function postAdminAction(path: string, body: Record<string, unknown>) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Something went wrong.')
  return json
}
