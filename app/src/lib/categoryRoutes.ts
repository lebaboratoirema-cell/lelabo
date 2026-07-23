// app/src/lib/categoryRoutes.ts

export const CATEGORY_ROUTE_SLUGS = {
  chemicals: 'chimie',
  'lab-equipment': 'equipements',
  'petit-outillage': 'petit-outillage',
} as const

export type CategoryRoute = keyof typeof CATEGORY_ROUTE_SLUGS

// URL path segment for each route key — differs from the key for chemicals.
export const CATEGORY_ROUTE_SEGMENT: Record<CategoryRoute, string> = {
  chemicals: 'produits-chimiques',
  'lab-equipment': 'lab-equipment',
  'petit-outillage': 'petit-outillage',
}

export const CATEGORY_ROUTE_META: Record<CategoryRoute, {
  title: string
  breadcrumb: string
  bannerImage: string
  description: string
}> = {
  chemicals: {
    title: 'Produit chimie',
    breadcrumb: 'Chimie',
    bannerImage: '/images/hero-chem.webp',
    description:
      "Produits chimiques de laboratoire : réactifs, enzymes, milieux de culture, antibiotiques, biocides et consommables associés, pour la chimie analytique, la microbiologie et la biologie moléculaire.",
  },
  'lab-equipment': {
    title: 'Équipements de laboratoire',
    breadcrumb: 'Équipements',
    bannerImage: '/images/hero-tech.webp',
    description:
      "Équipements de laboratoire : autoclaves, centrifugeuses, balances, étuves, spectrophotomètres, pH-mètres, HPLC et instruments d'analyse, pour la chimie, la microbiologie et le contrôle qualité.",
  },
  'petit-outillage': {
    title: 'Petit outillage',
    breadcrumb: 'Petit outillage',
    bannerImage: '/images/hero-tech.webp',
    description:
      "Verrerie de laboratoire (béchers, ballons, éprouvettes, matériel de montage) et petit outillage (pinces, spatules, minuteurs, consommables de paillasse), pour l'équipement courant du laboratoire.",
  },
}
