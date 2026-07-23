export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type PreferredDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

export type PreferredTime = 'morning' | 'afternoon' | 'evening'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  postcode: string | null
  emergency_contact: string | null
  created_at: string
}

export type MembershipStatus = 'pending' | 'active' | 'paused' | 'cancelled'

export interface Membership {
  id: string
  profile_id: string
  tier: MembershipTier
  status: MembershipStatus
  preferred_day: PreferredDay | null
  preferred_time: PreferredTime | null
  preferred_start_date: string | null
  special_instructions: string | null
  created_at: string
}

export interface Subscription {
  id: string
  profile_id: string
  membership_id: string | null
  stripe_customer_id: string
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: string
  current_period_end: string | null
  created_at: string
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  profile_id: string
  membership_id: string | null
  scheduled_date: string
  scheduled_time: PreferredTime | null
  status: BookingStatus
  assigned_cleaner_id: string | null
  created_at: string
}

export interface Payment {
  id: string
  profile_id: string
  subscription_id: string | null
  stripe_invoice_id: string | null
  amount: number
  currency: string
  status: string
  invoice_pdf_url: string | null
  paid_at: string | null
  created_at: string
}
