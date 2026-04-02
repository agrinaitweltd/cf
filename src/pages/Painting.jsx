import ServicePage from './ServicePage'
import { services } from '../data/services'

function Painting() {
  return <ServicePage service={services.find(s => s.slug === 'painting-decorating')} />
}

export default Painting
