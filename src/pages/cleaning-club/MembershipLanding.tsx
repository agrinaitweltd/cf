import { useNavigate } from 'react-router-dom'
import CleaningBanner from '../../components/CleaningBanner'
import CTABanner from '../../components/CTABanner'
import { useAuth } from '../../context/AuthContext'
import { membershipPlans } from '../../data/membership'
import type { MembershipTier } from '../../types/membership'
import styles from './MembershipLanding.module.css'

const PLAN_TAGLINES: Record<MembershipTier, string> = {
  bronze: 'A monthly refresh to keep your home consistently clean.',
  silver: 'Fortnightly visits for busy households that like it spotless.',
  gold: 'Weekly cleaning with a guaranteed slot, every single week.',
  platinum: 'Our complete top-tier service with extended visits and extras.',
}

const BENEFITS = [
  {
    title: 'Priority Booking',
    text: 'Members always come first — your slot is protected ahead of one-off bookings.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    ),
  },
  {
    title: 'Trusted Cleaners',
    text: 'Fully insured, trained and DBS-checked cleaners — the same friendly face where possible.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
    ),
  },
  {
    title: 'Fixed Monthly Price',
    text: 'One simple Direct Debit each month. No surprises, no invoices to chase.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    ),
  },
  {
    title: 'Member Discounts',
    text: 'Save 10–25% on Deep Cleans and End of Tenancy Cleans, all year round.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
    ),
  },
]

const HOW_IT_WORKS = [
  {
    title: 'Choose your plan',
    text: 'Pick the membership that fits your home and routine — from a monthly refresh to weekly extended cleans.',
  },
  {
    title: 'Create your account',
    text: 'Sign up in under two minutes with your contact details and address — we find it from your postcode.',
  },
  {
    title: 'Set your schedule',
    text: 'Tell us your preferred day, time and start date, plus any special instructions for your cleaner.',
  },
  {
    title: 'Relax — we handle the rest',
    text: 'Pay securely by Direct Debit and manage everything — visits, billing, plan changes — from your dashboard.',
  },
]

const TRUST_BADGES = [
  { label: 'Fully Insured', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { label: 'DBS-Checked Cleaners', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg> },
  { label: 'Secure Stripe Payments', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
  { label: 'No Long-Term Contracts', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
  { label: '4.9/5 Member Rating', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
]

const COMPARISON_ROWS: { label: string; values: Record<MembershipTier, string> }[] = [
  { label: 'Visits per month', values: { bronze: '1', silver: '2', gold: '4 (weekly)', platinum: '4 (weekly, extended)' } },
  { label: 'Visit length', values: { bronze: 'Up to 3 hrs', silver: 'Up to 3 hrs', gold: 'Up to 3 hrs', platinum: 'Up to 4 hrs' } },
  { label: 'Priority booking', values: { bronze: '✓', silver: '✓', gold: '✓', platinum: '✓' } },
  { label: 'Guaranteed regular cleaner', values: { bronze: 'Where possible', silver: 'Where possible', gold: 'Where possible', platinum: 'Dedicated' } },
  { label: 'Deep clean / End of tenancy discount', values: { bronze: '10%', silver: '15%', gold: '20%', platinum: '25%' } },
  { label: 'Complimentary extras', values: { bronze: '—', silver: 'Fridge/microwave every 3mo', gold: 'Oven every 6mo', platinum: 'Oven, fridge & windows' } },
]

const FAQS = [
  {
    q: 'Can I change or cancel my membership?',
    a: 'Yes — you can upgrade, downgrade or cancel at any time from your dashboard. Changes take effect from your next billing period, and there are no long-term contracts or exit fees.',
  },
  {
    q: 'How do payments work?',
    a: 'Your membership is collected monthly by Bacs Direct Debit through Stripe, our secure payment provider. You can view every invoice and download receipts from your dashboard.',
  },
  {
    q: 'Will I get the same cleaner each visit?',
    a: 'We do our very best to send the same cleaner every time, and Platinum members get a dedicated cleaner where possible. If your regular cleaner is unavailable, we’ll always send a fully vetted replacement.',
  },
  {
    q: 'What if I need to reschedule a visit?',
    a: 'No problem — contact us or use your dashboard and we’ll rearrange your clean for another day that week wherever possible.',
  },
  {
    q: 'Do I need to provide cleaning products or equipment?',
    a: 'No — our cleaners arrive with professional products and equipment. If you’d prefer us to use your own products, just note it in your special instructions.',
  },
]

export default function MembershipLanding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleStartNow = (tier: MembershipTier) => {
    if (user) {
      navigate(`/cleaning/membership/join?tier=${tier}`)
      return
    }
    navigate('/cleaning/sign-up', {
      state: { tier, redirect: `/cleaning/membership/join?tier=${tier}` },
    })
  }

  return (
    <>
      <CleaningBanner
        title="The Clean Club"
        subtitle="Membership cleaning plans with priority booking, regular cleaners and ongoing discounts."
        tone="default"
      />

      <section className="section">
        <div className="container">
          <div className={styles.intro}>
            <span className="label">Why Join</span>
            <h2>A Cleaner Home, All Year Round</h2>
            <p>
              The Clean Club is our membership programme for homes that deserve regular, reliable care.
              One fixed monthly price, a protected slot, and a cleaning team you can trust.
            </p>
          </div>

          <div className={styles.trustRow}>
            {TRUST_BADGES.map(badge => (
              <div key={badge.label} className={styles.trustBadge}>
                <span className={styles.trustIcon} aria-hidden="true">{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>

          <div className={styles.benefits}>
            {BENEFITS.map(benefit => (
              <div key={benefit.title} className={styles.benefit}>
                <div className={styles.benefitIcon} aria-hidden="true">{benefit.icon}</div>
                <div className={styles.benefitTitle}>{benefit.title}</div>
                <p className={styles.benefitText}>{benefit.text}</p>
              </div>
            ))}
          </div>

          <div className={styles.intro}>
            <span className="label">Membership Plans</span>
            <h2>Choose Your Clean Club Membership</h2>
            <p>
              Every plan includes priority booking and ongoing member discounts.
              Upgrade, downgrade or cancel whenever you like — no contracts.
            </p>
          </div>

          <div className={styles.plans}>
            {membershipPlans.map(plan => {
              const isFeatured = plan.tier === 'gold'
              return (
                <div key={plan.tier} className={`${styles.planCard} ${isFeatured ? styles.planCardFeatured : ''}`}>
                  {isFeatured && <span className={styles.popularBadge}>Most Popular</span>}
                  <div className={styles.planName}>{plan.name}</div>
                  <div className={styles.planPrice}>£{plan.price}<span>/month</span></div>
                  <div className={styles.savingsBadge}>
                    Save {plan.discountPercent}% vs. pay-per-visit (£{plan.payPerVisitPrice})
                  </div>
                  <p className={styles.planTagline}>{PLAN_TAGLINES[plan.tier]}</p>
                  <ul className={styles.planFeatures}>
                    {plan.features.map(feature => <li key={feature}>{feature}</li>)}
                  </ul>
                  <button type="button" className={`btn btn-primary ${styles.startBtn}`} onClick={() => handleStartNow(plan.tier)}>
                    Start Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              )
            })}
          </div>

          <div className={styles.compareWrap}>
            <div className={styles.intro} style={{ marginBottom: 24 }}>
              <span className="label">Compare Plans</span>
              <h2>Every Detail, Side by Side</h2>
            </div>
            <div className={styles.compareTableScroll}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th></th>
                    {membershipPlans.map(plan => (
                      <th key={plan.tier} className={plan.tier === 'gold' ? styles.compareFeaturedCol : ''}>{plan.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map(row => (
                    <tr key={row.label}>
                      <td className={styles.compareRowLabel}>{row.label}</td>
                      {membershipPlans.map(plan => (
                        <td key={plan.tier} className={plan.tier === 'gold' ? styles.compareFeaturedCol : ''}>{row.values[plan.tier]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className={styles.intro}>
            <span className="label">How It Works</span>
            <h2>Joining Takes Minutes</h2>
          </div>

          <div className={styles.steps}>
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.title} className={styles.step}>
                <span className={styles.stepNum}>{String(idx + 1).padStart(2, '0')}</span>
                <div className={styles.stepTitle}>{step.title}</div>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.intro}>
            <span className="label">FAQs</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className={styles.faqList}>
            {FAQS.map(faq => (
              <details key={faq.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>{faq.q}</summary>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        heading="Not sure which plan is right for you?"
        subtext="Get in touch and our team will help you choose the best Clean Club membership for your home."
        btnLabel="Contact Us"
        btnTo="/cleaning/contact"
      />
    </>
  )
}
