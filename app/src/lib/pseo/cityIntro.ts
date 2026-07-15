import type { CategoryRoute } from '@/lib/categoryRoutes'
import { CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import type { CityInfo } from '@/lib/pseo/cities'

const INTRO_VERBS: Record<CategoryRoute, string> = {
  chemicals: 'livrons des produits chimiques de laboratoire',
  glassware: 'fournissons de la verrerie et des consommables de laboratoire',
  'lab-equipment': 'équipons les laboratoires en instruments et appareils',
  'petit-outillage': 'fournissons du petit outillage de laboratoire',
}

export function buildCityIntro(categoryRoute: CategoryRoute, city: CityInfo): string {
  const label = CATEGORY_ROUTE_META[categoryRoute].breadcrumb
  const verb = INTRO_VERBS[categoryRoute]
  const zones = city.zonesServed.join(', ')
  return `À ${city.name} (région ${city.region}), nous ${verb} aux laboratoires, universités, cliniques et centres industriels. Notre catalogue ${label.toLowerCase()} est livré sous ${city.deliveryDays}, avec une couverture incluant ${zones} et les environs.`
}

export function buildCityMetaDescription(categoryRoute: CategoryRoute, city: CityInfo): string {
  const label = CATEGORY_ROUTE_META[categoryRoute].breadcrumb
  return `${label} à ${city.name} : catalogue complet, livraison en ${city.deliveryDays}. Le Laboratoire dessert ${city.zonesServed[0]} et tout ${city.region}.`.slice(0, 155)
}
