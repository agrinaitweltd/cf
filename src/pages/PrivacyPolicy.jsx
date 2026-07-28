import styles from './LegalPage.module.css'

function PrivacyPolicy() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.wrap}>
          <span className="label">Legal</span>
          <h1>Privacy Policy</h1>
          <p className={styles.updated}>Last updated: 23 July 2026</p>

          <p className={styles.intro}>
            CF Hub UK ("CF Hub UK", "CF Hub &amp; Co.", "we", "us", "our") operates cfhubuk.com, an online
            platform where customers can browse, book and manage professional property services — including
            handyman, maintenance, cleaning, gardening, decorating, plumbing, electrical and removals services
            — create an account, sign in, manage bookings, view booking history, and pay securely online.
            This policy explains what personal data we collect, why we collect it, and how it is used, stored
            and protected.
          </p>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li><strong>Account information:</strong> full name, email address, phone number, property address and postcode, and a securely hashed password, when you create a Clean Club account.</li>
              <li><strong>Google Sign-In information:</strong> if you choose "Continue with Google", we receive your name, email address and profile picture from Google, used solely to create or access your account. We do not receive your Google password.</li>
              <li><strong>Membership and booking information:</strong> your chosen membership plan, preferred cleaning day, time and start date, special instructions, and your booking and cleaning history.</li>
              <li><strong>Payment information:</strong> your subscription and payment status, invoice references and payment dates. Card and Direct Debit details are collected and processed directly by Stripe — we never see or store your full payment details.</li>
              <li><strong>Enquiry and application information:</strong> details you submit through our contact, quote request or "Join the Team" forms, such as your name, contact details, service requirements and, where relevant, a CV.</li>
              <li><strong>Cookies and usage data:</strong> collected only with your consent via our cookie banner, used to keep the site working properly and understand how it is used.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
            <p>We use your personal data to:</p>
            <ul>
              <li>Create and manage your CF Hub UK / Clean Club account, including verifying your email address by one-time code;</li>
              <li>Process and manage cleaning memberships, bookings and scheduling preferences;</li>
              <li>Take and manage recurring or one-off payments for services;</li>
              <li>Respond to enquiries, quote requests and job applications;</li>
              <li>Send you service-related communications, such as booking confirmations, payment receipts, password reset codes and account verification codes;</li>
              <li>Look up your address from your postcode to speed up account sign-up;</li>
              <li>Maintain the security of our platform and prevent fraud; and</li>
              <li>Improve our website, only where you have consented to non-essential cookies.</li>
            </ul>
            <p>
              We do not sell your personal data, and we do not use it for third-party advertising.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Third-Party Service Providers</h2>
            <p>
              We share personal data with the following trusted service providers, solely to operate the
              platform and deliver our services:
            </p>
            <table className={styles.table}>
              <thead>
                <tr><th>Provider</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Supabase</strong></td><td>Account authentication and secure database hosting</td></tr>
                <tr><td><strong>Stripe</strong></td><td>Payment and Direct Debit subscription processing</td></tr>
                <tr><td><strong>Google</strong></td><td>Optional "Continue with Google" sign-in</td></tr>
                <tr><td><strong>Resend</strong></td><td>Delivery of account, booking and verification emails</td></tr>
                <tr><td><strong>Ideal Postcodes</strong></td><td>Postcode-to-address lookup during sign-up</td></tr>
                <tr><td><strong>Vercel</strong></td><td>Website hosting and infrastructure</td></tr>
              </tbody>
            </table>
            <p>
              Each provider only receives the data necessary to perform its function for us and is bound by
              its own privacy and security obligations.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active, or as needed to provide you
              with services. We may retain certain records for longer where required by law, for example
              financial records for tax purposes. You can request deletion of your account and associated
              personal data at any time (see Section 6).
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Cookies</h2>
            <p>
              We use essential cookies required for the site to function, and optional cookies to understand
              site usage and improve our service. You control which cookies are set via the cookie banner
              shown on your first visit, and you can change your preference at any time by clearing your
              browser's local storage for this site.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Your Rights</h2>
            <p>Under UK data protection law, you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you;</li>
              <li>Request correction of inaccurate data;</li>
              <li>Request deletion of your account and personal data;</li>
              <li>Object to or restrict certain processing; and</li>
              <li>Request a copy of your data in a portable format.</li>
            </ul>
            <p>To exercise any of these rights, contact us using the details below.</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Data Security</h2>
            <p>
              We use industry-standard security measures, including encryption in transit, access-controlled
              databases and secure authentication, to protect your personal data. Passwords are never stored
              in plain text.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Children's Privacy</h2>
            <p>
              CF Hub UK's services are intended for users aged 18 and over. We do not knowingly collect
              personal data from children.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Any changes will be posted on this page with an
              updated "Last updated" date above.
            </p>
          </div>

          <div className={styles.contactBox}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or how we handle your data, contact us at:</p>
            <p><a href="mailto:enquiries@cfhubuk.com">enquiries@cfhubuk.com</a></p>
            <p><a href="tel:+447806949497">+44 (0) 7806 949497</a></p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PrivacyPolicy
