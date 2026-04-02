import ServicePage from './ServicePage'
import { services } from '../data/services'

function Renovations() {
  return <ServicePage service={services.find(s => s.slug === 'renovations')} />
}

export default Renovations
