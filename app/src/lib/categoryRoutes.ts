// app/src/lib/categoryRoutes.ts

export const CATEGORY_ROUTE_SLUGS = {
  chemicals: 'FILL_FROM_DB',      // e.g. 'produits-chimiques'
  glassware: 'FILL_FROM_DB',      // e.g. 'verrerie'
  'lab-equipment': 'FILL_FROM_DB', // e.g. 'equipements'
} as const

export type CategoryRoute = keyof typeof CATEGORY_ROUTE_SLUGS

export const CATEGORY_ROUTE_META: Record<CategoryRoute, {
  title: string
  breadcrumb: string
  bannerImage: string
}> = {
  chemicals: {
    title: 'Produits chimiques',
    breadcrumb: 'Chimie',
    bannerImage: '/images/hero-chem.jpg',
  },
  glassware: {
    title: 'Verrerie & consommables',
    breadcrumb: 'Verrerie',
    bannerImage: '/images/glassware.jpg',
  },
  'lab-equipment': {
    title: 'Équipements de laboratoire',
    breadcrumb: 'Équipements',
    bannerImage: '/images/hero-tech.jpg',
  },
}
