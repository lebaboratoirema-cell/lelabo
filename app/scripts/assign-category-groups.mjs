// One-off: assign group_key/group_label to équipements and petit-outillage subcategories
// per the 10-group taxonomy in
// docs/superpowers/specs/2026-07-22-subcategory-landing-redesign-design.md.
// chimie is intentionally left ungrouped (group_key stays null).
// Run: node --env-file=.env.local scripts/assign-category-groups.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DRY_RUN = process.argv.includes('--dry-run')

const EQUIPEMENTS_GROUPS = [
  { group_key: 'chauffage-sechage-etuves', label_fr: 'Chauffage, séchage & étuves', slugs: ['bains', 'block-heaters', 'drying-cabinets', 'furnaces', 'hotplates', 'ovens', 'incubators', 'stirrers'] },
  { group_key: 'refrigeration-cryogenie', label_fr: 'Réfrigération & cryogénie', slugs: ['chillers', 'cryostats', 'freeze-dryers', 'ice-machines', 'refrigeration'] },
  { group_key: 'pesee-mesure-physique', label_fr: 'Pesée & mesure physique', slugs: ['balances', 'hydrometers', 'density-meters', 'viscometers', 'refractometres', 'rheometers'] },
  { group_key: 'ph-conductivite-eau', label_fr: "pH, conductivité & qualité de l'eau", slugs: ['conductivity-meters', 'ph-meters', 'dissolved-oxygen-meters', 'multichannel-meters', 'turbidity-meters', 'osmometers', 'water-purification', 'hygrometers'] },
  { group_key: 'spectro-chromato-analyse', label_fr: 'Spectro, chromato & analyse', slugs: ['spectrophotometers', 'colorimeters', 'flame-photometers', 'hplc', 'lc-ms', 'nmr', 'mass-spectrometry-supplies', 'melting-point-apparatus', 'titrators'] },
  { group_key: 'agitation-melange-centrifugation', label_fr: 'Agitation, mélange & centrifugation', slugs: ['mixers', 'homogenisers', 'sieve-shakers', 'centrifuges', 'rotary-evaporators'] },
  { group_key: 'microscopie-comptage', label_fr: 'Microscopie & comptage', slugs: ['microscopes', 'microtomes', 'colony-counters', 'microplate-readers', 'laveurs-microplaques'] },
  { group_key: 'securite-confinement', label_fr: 'Sécurité & confinement', slugs: ['biological-safety-cabinets', 'fume-cupboards', 'laminar-flow-cabinets', 'glove-boxes', 'autoclaves', 'glass-washers'] },
  { group_key: 'biologie-moleculaire', label_fr: 'Biologie moléculaire', slugs: ['thermal-cyclers', 'electroporators'] },
  { group_key: 'instruments-consommables-divers', label_fr: 'Instruments & consommables divers', slugs: ['pipettes', 'thermometers', 'pumps'] },
]

const PETIT_OUTILLAGE_GROUPS = [
  { group_key: 'verrerie-generale-contenants', label_fr: 'Verrerie générale & contenants', slugs: ['outillage-verrerie', 'bonbonne', 'creusets', 'cristallisoir-capsule', 'cuvette-bac-plateau', 'verre-de-montre', 'bille', 'dessiccateur', 'mortier'] },
  { group_key: 'flacons-flaconnage', label_fr: 'Flacons & flaconnage', slugs: ['pissette', 'flacon-de-culture', 'flacon-plastique', 'flacon-verre', 'flacon-pycnometre', 'flacon-laveur', 'flacon-aluminium', 'flacon-mesureur-a-renversement', 'flacon-pulverisateur'] },
  { group_key: 'montage-verrerie-raccords', label_fr: 'Montage de verrerie & raccords', slugs: ['montage-verrerie-refrigerant', 'raccord-plastique-montage-verrerie', 'raccord-montage-verrerie', 'robinet-montage-verrerie', 'support-statif-montage-verrerie', 'tuyau-montage-verrerie', 'tube-montage-verrerie', 'noix-de-serrage', 'anneau-de-lestage', 'extracteur-soxhlet', 'allonge-montage-verrerie', 'collier-de-serrage', 'raccord-verre-montage-verrerie', 'trompe-a-eau-montage-verrerie'] },
  { group_key: 'lames-lamelles-microscopie', label_fr: 'Lames, lamelles & microscopie', slugs: ['cellule-numeration-lame-lamelle', 'couvre-objet-lame-lamelle', 'accessoires-lame-lamelle', 'porte-objet-lame-lamelle'] },
  { group_key: 'pesee-metrologie', label_fr: 'Pesée & métrologie', slugs: ['butyrometre', 'densimetre-areometre', 'pied-a-coulisse', 'poids-de-calibration', 'vase-sabot-nacelle-pesee', 'barometre-pluviometre-psychrometre', 'manometre', 'consistometre'] },
  { group_key: 'instruments-chronometrage', label_fr: 'Instruments de mesure & chronométrage', slugs: ['thermometre', 'minuterie', 'chronometre', 'loupe'] },
  { group_key: 'prelevement-transfert-agitation', label_fr: 'Prélèvement, transfert & agitation', slugs: ['cones', 'petit-materiel-d-agitation', 'seringue', 'sonde-de-prelevement', 'spatule-cuillere', 'louche', 'pince'] },
  { group_key: 'rangement-transport-protection', label_fr: 'Rangement, transport & protection', slugs: ['boite', 'chariot', 'glaciere-accumulateur-de-froid', 'portoir', 'seau', 'panier', 'elevateur-de-laboratoire', 'jarre-anaerobie', 'plateau'] },
  { group_key: 'nettoyage-entretien', label_fr: 'Nettoyage & entretien', slugs: ['bistouri', 'egouttoirs', 'essuyage-lingettes', 'goupillon', 'ciseaux', 'couteau', 'parafilm', 'coton', 'coupe-tube'] },
  { group_key: 'consommables-fournitures', label_fr: 'Consommables & fournitures', slugs: ['etiquettes', 'papier-d-emballage', 'becs', 'crayon-de-laboratoire', 'piles', 'papier-pour-imprimante', 'cahier-de-laboratoire', 'gabarits'] },
]

async function assignFamily(familySlug, groups) {
  const { data: parent, error: parentErr } = await supabase
    .from('categories').select('id').eq('slug', familySlug).single()
  if (parentErr) throw parentErr

  const { data: children, error: childErr } = await supabase
    .from('categories').select('id, slug').eq('parent_id', parent.id)
  if (childErr) throw childErr

  const bySlug = new Map(children.map((c) => [c.slug, c]))
  const assigned = new Set()
  let updateCount = 0

  for (const group of groups) {
    for (const slug of group.slugs) {
      const cat = bySlug.get(slug)
      if (!cat) {
        console.warn(`[${familySlug}] no category found for slug "${slug}" (group ${group.group_key})`)
        continue
      }
      assigned.add(slug)
      updateCount++
      if (DRY_RUN) {
        console.log(`[dry-run] ${familySlug}/${slug} -> ${group.group_key}`)
        continue
      }
      const { error } = await supabase
        .from('categories')
        .update({ group_key: group.group_key, group_label: { fr: group.label_fr } })
        .eq('id', cat.id)
      if (error) throw error
    }
  }

  const unassigned = children.filter((c) => !assigned.has(c.slug))
  if (unassigned.length > 0) {
    console.warn(`[${familySlug}] ${unassigned.length} categories left ungrouped:`, unassigned.map((c) => c.slug))
  }
  console.log(`[${familySlug}] ${updateCount}/${children.length} categories assigned a group.`)
}

await assignFamily('equipements', EQUIPEMENTS_GROUPS)
await assignFamily('petit-outillage', PETIT_OUTILLAGE_GROUPS)
