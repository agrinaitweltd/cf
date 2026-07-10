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
        </div>
      </div>
    </section>
  )
}

export default ServiceSelection
