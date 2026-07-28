import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { safeFetchJson } from '../../lib/api'

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
  email: string | null
  phone: string | null
  active: boolean
}
export interface AdminCoupon {
  id: string
  code: string
  description: string | null
  discount_percent: number
  active: boolean
  expires_at: string | null
  usage_limit: number | null
  times_used: number
  created_at: string
}
export interface AdminReview {
  id: string
  profile_id: string
  booking_id: string | null
  rating: number
  comment: string | null
  status: string
  created_at: string
}
export interface AdminSupportTicket {
  id: string
  profile_id: string
  subject: string
  message: string
  status: string
  admin_reply: string | null
  created_at: string
  updated_at: string
}
export interface AdminUserRow {
  id: string
  profile_id: string | null
  invite_email: string | null
  full_name: string | null
  phone: string | null
  role: string
  activated: boolean
  created_at: string
}
export interface AdminAuditLog {
  id: string
  actor_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  meta: Record<string, unknown> | null
  created_at: string
}

interface AdminData {
  profiles: AdminProfile[]
  memberships: AdminMembership[]
  subscriptions: AdminSubscription[]
  bookings: AdminBooking[]
  payments: AdminPayment[]
  cleaners: AdminCleaner[]
  coupons: AdminCoupon[]
  reviews: AdminReview[]
  supportTickets: AdminSupportTicket[]
  adminUsers: AdminUserRow[]
  auditLogs: AdminAuditLog[]
}

const EMPTY: AdminData = {
  profiles: [], memberships: [], subscriptions: [], bookings: [], payments: [], cleaners: [],
  coupons: [], reviews: [], supportTickets: [], adminUsers: [], auditLogs: [],
}

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
      const json = await safeFetchJson<AdminData>('/api/admin', { headers: { Authorization: `Bearer ${token}` } })
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
  return safeFetchJson<{ success: boolean } & Record<string, unknown>>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}
