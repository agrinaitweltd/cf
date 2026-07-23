import Stripe from 'stripe';

let stripeClient = null;

export function getStripe() {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
  }
  stripeClient = new Stripe(secretKey, { apiVersion: '2024-06-20' });
  return stripeClient;
}

export const TIER_PRICE_ENV_KEYS = {
  bronze: 'STRIPE_PRICE_BRONZE',
  silver: 'STRIPE_PRICE_SILVER',
  gold: 'STRIPE_PRICE_GOLD',
  platinum: 'STRIPE_PRICE_PLATINUM',
};

export function getPriceIdForTier(tier) {
  const envKey = TIER_PRICE_ENV_KEYS[tier];
  if (!envKey) return null;
  return process.env[envKey] || null;
}
