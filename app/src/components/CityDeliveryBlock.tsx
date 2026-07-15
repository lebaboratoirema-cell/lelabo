import type { CityInfo } from '@/lib/pseo/cities'

interface Props {
  city: CityInfo
}

export default function CityDeliveryBlock({ city }: Props) {
  return (
    <div className="city-delivery-block">
      <h2>Livraison à {city.name}</h2>
      <p>Délai de livraison estimé : <strong>{city.deliveryDays}</strong></p>
      <p>Zones desservies : {city.zonesServed.join(', ')}</p>
      <a className="btn" href="/contact">Demander un devis</a>
    </div>
  )
}
