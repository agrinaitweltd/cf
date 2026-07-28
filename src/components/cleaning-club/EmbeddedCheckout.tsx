import { useEffect, useRef, useState } from 'react'
import { getStripeClient } from '../../lib/stripe'

interface EmbeddedCheckoutProps {
  clientSecret: string
}

export default function EmbeddedCheckout({ clientSecret }: EmbeddedCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let checkout: { mount: (el: string | HTMLElement) => void; destroy: () => void } | null = null
    let cancelled = false

    getStripeClient().then(async stripe => {
      if (!stripe || cancelled || !containerRef.current) return
      try {
        checkout = await stripe.createEmbeddedCheckoutPage({ clientSecret })
        if (cancelled) {
          checkout?.destroy()
          return
        }
        checkout?.mount(containerRef.current)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load the payment form.')
      }
    })

    return () => {
      cancelled = true
      checkout?.destroy()
    }
  }, [clientSecret])

  if (error) {
    return <p style={{ color: '#f05050', fontSize: '0.85rem' }}>{error}</p>
  }

  return <div ref={containerRef} />
}
