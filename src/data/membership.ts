import type { MembershipTier } from '../types/membership'

export interface MembershipPlan {
  tier: MembershipTier
  name: string
  price: number
  priceLabel: string
  priceEnvKey: string
  visitsPerMonth: number
  features: string[]
}

export const membershipPlans: MembershipPlan[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    price: 79,
    priceLabel: '£79/month',
    priceEnvKey: 'VITE_STRIPE_PRICE_BRONZE',
    visitsPerMonth: 1,
    features: [
      'One visit every month',
      'Up to 3 hours',
      'Priority booking',
      'Regular cleaner where possible',
      '10% off Deep Cleans',
      '10% off End of Tenancy Cleans',
    ],
  },
  {
    tier: 'silver',
    name: 'Silver',
    price: 149,
    priceLabel: '£149/month',
    priceEnvKey: 'VITE_STRIPE_PRICE_SILVER',
    visitsPerMonth: 2,
    features: [
      'Two visits every month',
      'Up to 3 hours each visit',
      'Priority booking',
      '15% off Deep Cleans',
      '15% off End of Tenancy Cleans',
      'Free fridge or microwave clean every 3 months',
    ],
  },
  {
    tier: 'gold',
    name: 'Gold',
    price: 279,
    priceLabel: '£279/month',
    priceEnvKey: 'VITE_STRIPE_PRICE_GOLD',
    visitsPerMonth: 4,
    features: [
      'Weekly cleaning',
      'Four visits every month',
      'Up to 3 hours each visit',
      'Guaranteed weekly slot',
      'Priority booking',
      '20% off Deep Cleans',
      'Complimentary oven clean every 6 months',
    ],
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    price: 399,
    priceLabel: '£399/month',
    priceEnvKey: 'VITE_STRIPE_PRICE_PLATINUM',
    visitsPerMonth: 4,
    features: [
      'Weekly extended cleaning',
      'Four visits every month',
      'Up to 4 hours each visit',
      'Dedicated cleaner where possible',
      '25% discounts',
      'Complimentary oven clean',
      'Complimentary fridge/microwave clean',
      'Interior windows every 3 months',
      'Annual Deep Clean refresh',
    ],
  },
]

export const preferredDayOptions = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const preferredTimeOptions = ['Morning', 'Afternoon', 'Evening']

export function getPlanByTier(tier: MembershipTier): MembershipPlan | undefined {
  return membershipPlans.find(plan => plan.tier === tier)
}
