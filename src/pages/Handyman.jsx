import ServicePage from './ServicePage'
import { services } from '../data/services'

function Handyman() {
  return <ServicePage service={services.find(s => s.slug === 'handyman')} />
}

export default Handyman
