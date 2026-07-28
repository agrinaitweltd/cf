import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripeClient() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error('Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable.')
    }
    stripePromise = loadStripe(key ?? '')
  }
  return stripePromise
}
