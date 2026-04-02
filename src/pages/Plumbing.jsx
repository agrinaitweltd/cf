import ServicePage from './ServicePage'
import { services } from '../data/services'

function Plumbing() {
  return <ServicePage service={services.find(s => s.slug === 'plumbing')} />
}

export default Plumbing
