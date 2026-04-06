import { Link } from 'react-router-dom'
import styles from './ServiceCard.module.css'

function ServiceCard({ service }) {
  return (
    <article className={styles.card + ' animate-mobile-bounce'}>
      <div
        className={styles.image}
        style={{ backgroundImage: `url(${service.serviceImage})` }}
        aria-hidden="true"
      />
      <div className={styles.body}>
        <h3 className={styles.title}>{service.title}</h3>
        <p className={styles.desc}>{service.shortDesc}</p>
        <Link to={`/services/${service.slug}`} className={styles.link} aria-label={`Learn more about ${service.title}`}>
          View Service
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </article>
  )
}

export default ServiceCard
