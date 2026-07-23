import styles from './ServiceSelection.module.css'

function ServiceSelection({ onSelect }) {
  return (
    <section className={styles.page} aria-label="Choose a CF Hub service">
      <div className={styles.bgLayer} aria-hidden="true" />
      <div className="container">
        <div className={styles.content}>
          <span className="label">Welcome To CF Hub UK</span>
          <h1 className={styles.title}>Choose Your Service</h1>
          <p className={styles.subtitle}>
            Select the service website you would like to continue to.
          </p>

          <div className={styles.grid}>
            <article className={styles.card}>
              <div className={styles.logoWrap}>
                <img src="/logo.png" alt="CF Hub UK" className={styles.cardLogo} loading="lazy" decoding="async" />
              </div>
              <span className={styles.kicker}>CF Hub UK</span>
              <h2 className={styles.cardTitle}>CF Hub Handyman Services</h2>
              <p className={styles.cardText}>
                Property improvement, maintenance and repair services delivered by trusted professionals.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSelect('handyman')}
              >
                Enter Handyman Services
              </button>
            </article>

            <article className={styles.card}>
              <div className={styles.logoWrap}>
                <img src="/logo2.png" alt="CF Hub & Co. Cleaning Services" className={styles.cardLogo} loading="lazy" decoding="async" />
              </div>
              <span className={styles.kicker}>CF Hub & Co.</span>
              <h2 className={styles.cardTitle}>CF Hub & Co. Cleaning Services</h2>
              <p className={styles.cardText}>
                Reliable, professional and trusted cleaning teams for homes, landlords and businesses.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSelect('cleaning')}
              >
                Enter Cleaning Services
              </button>
            </article>
          </div>

          <div className={styles.about}>
            <span className="label">About This Platform</span>
            <h2 className={styles.aboutTitle}>Welcome to CF Hub UK</h2>
            <p className={styles.subtitle}>
              CF Hub UK is an online platform where customers can browse, book and manage professional
              property services such as cleaning, plumbing, electrical, gardening, decorating, removals
              and maintenance. Create an account, sign in, manage your bookings, view your booking
              history and securely pay for services online.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceSelection
