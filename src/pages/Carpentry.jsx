import ServicePage from './ServicePage'
import { services } from '../data/services'

function Carpentry() {
  return <ServicePage service={services.find(s => s.slug === 'carpentry')} />
}

export default Carpentry
