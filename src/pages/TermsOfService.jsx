import styles from './LegalPage.module.css'

function TermsOfService() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.wrap}>
          <span className="label">Legal</span>
          <h1>Terms of Service</h1>
          <p className={styles.updated}>Last updated: 23 July 2026</p>

          <p className={styles.intro}>
            These Terms of Service govern your use of cfhubuk.com, operated by CF Hub UK / CF Hub &amp; Co.
            ("we", "us", "our"). By creating an account, booking a service, or otherwise using our platform,
            you agree to these terms.
          </p>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Our Services</h2>
            <p>
              CF Hub UK is an online platform for browsing, booking and managing professional property
              services, including handyman, maintenance, cleaning, gardening, decorating, plumbing,
              electrical and removals services, delivered by our team and trusted professionals across the UK.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Accounts</h2>
            <p>
              To access certain features, such as Clean Club membership management, you must create an
              account with accurate information and keep your login details secure. You are responsible for
              all activity that occurs under your account. You may sign in with an email and password, or via
              Google Sign-In.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Bookings and Memberships</h2>
            <p>
              Clean Club memberships are recurring monthly subscriptions billed via Direct Debit through
              Stripe. You can view, upgrade, downgrade or cancel your membership at any time from your
              dashboard. Cancellations take effect at the end of your current billing period unless stated
              otherwise. One-off bookings and quote requests are subject to confirmation by our team.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Payments</h2>
            <p>
              All payments are processed securely through Stripe. By providing payment or Direct Debit
              details, you authorise us to charge the applicable fees for the services or membership plan you
              select. Prices are shown in GBP and may be updated from time to time; any change will not
              affect a billing period already in progress.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Cancellations and Refunds</h2>
            <p>
              You may cancel a Clean Club membership at any time; no further payments will be taken once
              cancellation takes effect. Refunds for one-off services are considered on a case-by-case basis —
              contact us to discuss any issue with a completed or upcoming booking.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Acceptable Use</h2>
            <p>
              You agree not to misuse the platform, including attempting to gain unauthorised access to
              accounts or systems, submitting false information, or using the site for any unlawful purpose.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Intellectual Property</h2>
            <p>
              All content on cfhubuk.com, including text, graphics, logos and images, is owned by or licensed
              to CF Hub UK and may not be reproduced without permission.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Limitation of Liability</h2>
            <p>
              We aim to deliver a high standard of service, but we do not guarantee that the platform will be
              uninterrupted or error-free. To the extent permitted by law, CF Hub UK is not liable for indirect
              or consequential losses arising from your use of the platform.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the platform after changes are
              posted constitutes acceptance of the updated terms.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Governing Law</h2>
            <p>
              These terms are governed by the laws of England and Wales, and any disputes will be subject to
              the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </div>

          <div className={styles.contactBox}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p>Questions about these terms? Contact us at:</p>
            <p><a href="mailto:enquiries@cfhubuk.com">enquiries@cfhubuk.com</a></p>
            <p><a href="tel:+447806949497">+44 (0) 7806 949497</a></p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TermsOfService
