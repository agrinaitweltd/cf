import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import type { Booking, Membership, Payment, Profile, Subscription } from '../../../types/membership'

export interface ReviewRow {
  id: string
  booking_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

interface MembershipData {
  loading: boolean
  profile: Profile | null
  membership: Membership | null
  subscription: Subscription | null
  bookings: Booking[]
  payments: Payment[]
  reviews: ReviewRow[]
  refresh: () => void
}

export function useMembershipData(): MembershipData {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [refreshTick, setRefreshTick] = useState(0)

  const refresh = useCallback(() => setRefreshTick(t => t + 1), [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    async function load() {
      const [profileRes, membershipRes, subscriptionRes, bookingsRes, paymentsRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle(),
        supabase
          .from('memberships')
          .select('*')
          .eq('profile_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('profile_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('bookings')
          .select('*')
          .eq('profile_id', user!.id)
          .order('scheduled_date', { ascending: true }),
        supabase
          .from('payments')
          .select('*')
          .eq('profile_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('*')
          .eq('profile_id', user!.id)
          .order('created_at', { ascending: false }),
      ])

      if (!isMounted) return

      setProfile((profileRes.data as Profile) ?? null)
      setMembership((membershipRes.data as Membership) ?? null)
      setSubscription((subscriptionRes.data as Subscription) ?? null)
      setBookings((bookingsRes.data as Booking[]) ?? [])
      setPayments((paymentsRes.data as Payment[]) ?? [])
      setReviews((reviewsRes.data as ReviewRow[]) ?? [])
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [user, refreshTick])

  return { loading, profile, membership, subscription, bookings, payments, reviews, refresh }
}
