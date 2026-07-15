export interface CityInfo {
  slug: string
  name: string
  region: string
  deliveryDays: string
  zonesServed: string[]
}

export const CITIES: CityInfo[] = [
  { slug: 'casablanca', name: 'Casablanca', region: 'Casablanca-Settat', deliveryDays: '24-48h', zonesServed: ['Ain Sebaâ', 'Sidi Bernoussi', 'Maârif', 'Sidi Maârouf'] },
  { slug: 'rabat', name: 'Rabat', region: 'Rabat-Salé-Kénitra', deliveryDays: '24-48h', zonesServed: ['Agdal', 'Hay Riad', 'Yacoub El Mansour'] },
  { slug: 'marrakech', name: 'Marrakech', region: 'Marrakech-Safi', deliveryDays: '48-72h', zonesServed: ['Guéliz', 'Sidi Youssef Ben Ali', 'Menara'] },
  { slug: 'fes', name: 'Fès', region: 'Fès-Meknès', deliveryDays: '48-72h', zonesServed: ['Fès Médina', 'Fès Nouvelle', 'Saïss'] },
  { slug: 'tanger', name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', deliveryDays: '48-72h', zonesServed: ['Tanger Med', 'Beni Makada', 'Charf'] },
  { slug: 'agadir', name: 'Agadir', region: 'Souss-Massa', deliveryDays: '48-72h', zonesServed: ['Founty', 'Dakhla', 'Hay Mohammadi'] },
  { slug: 'meknes', name: 'Meknès', region: 'Fès-Meknès', deliveryDays: '48-72h', zonesServed: ['Hamria', 'Marjane', 'Ville Nouvelle'] },
  { slug: 'oujda', name: 'Oujda', region: "L'Oriental", deliveryDays: '72h', zonesServed: ['Al Qods', 'Sidi Yahya', 'Centre-ville'] },
  { slug: 'kenitra', name: 'Kénitra', region: 'Rabat-Salé-Kénitra', deliveryDays: '24-48h', zonesServed: ['Ouled Oujih', 'Mimosas', 'Centre-ville'] },
  { slug: 'tetouan', name: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma', deliveryDays: '48-72h', zonesServed: ['Sania Ramel', 'Médina', 'Al Martil'] },
]

export function getCityBySlug(slug: string): CityInfo | null {
  return CITIES.find((c) => c.slug === slug) ?? null
}
