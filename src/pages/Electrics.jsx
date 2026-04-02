import ServicePage from './ServicePage'
import { services } from '../data/services'

function Electrics() {
  return <ServicePage service={services.find(s => s.slug === 'electrics')} />
}

export default Electrics
