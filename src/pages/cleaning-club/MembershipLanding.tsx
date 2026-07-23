import { useNavigate } from 'react-router-dom'
import CleaningBanner from '../../components/CleaningBanner'
import CTABanner from '../../components/CTABanner'
import { useAuth } from '../../context/AuthContext'
import { membershipPlans } from '../../data/membership'
import type { MembershipTier } from '../../types/membership'
import styles from './MembershipLanding.module.css'

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
            <span className="label">Membership Plans</span>
            <h2>Choose Your Clean Club Membership</h2>
            <p>
              Join The Clean Club for regular, hassle-free cleaning visits at a fixed monthly price.
              Every plan includes priority booking and ongoing discounts on Deep Cleans and End of Tenancy Cleans.
            </p>
          </div>

          <div className={styles.plans}>
            {membershipPlans.map(plan => (
              <div key={plan.tier} className={styles.planCard}>
                <div className={styles.planName}>{plan.name}</div>
                <div className={styles.planPrice}>{plan.priceLabel}</div>
                <ul className={styles.planFeatures}>
                  {plan.features.map(feature => <li key={feature}>{feature}</li>)}
                </ul>
                <button type="button" className={`btn btn-primary ${styles.startBtn}`} onClick={() => handleStartNow(plan.tier)}>
                  Start Now
                </button>
              </div>
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
