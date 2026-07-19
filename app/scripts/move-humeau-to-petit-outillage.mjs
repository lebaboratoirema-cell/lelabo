// One-off: reassign all 80 batch-2 humeau categories (imported 2026-07-19 under
// DB parent `verrerie`) to DB parent `petit-outillage` instead.
// Run: node --env-file=.env.local scripts/move-humeau-to-petit-outillage.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DRY_RUN = process.argv.includes('--dry-run')

const SLUGS = [
  'barometre-pluviometre-psychrometre', 'becs', 'bille', 'bistouri', 'boite', 'bonbonne',
  'butyrometre', 'chariot', 'cones', 'consistometre', 'creusets', 'cristallisoir-capsule',
  'cuvette-bac-plateau', 'densimetre-areometre', 'dessiccateur', 'egouttoirs',
  'essuyage-lingettes', 'gabarits', 'glaciere-accumulateur-de-froid', 'goupillon',
  'jarre-anaerobie', 'louche', 'manometre', 'mortier', 'panier',
  'petit-materiel-d-agitation', 'pied-a-coulisse', 'pince', 'pissette', 'plateau',
  'poids-de-calibration', 'portoir', 'seau', 'seringue', 'sonde-de-prelevement',
  'spatule-cuillere', 'thermometre', 'vase-sabot-nacelle-pesee', 'verre-de-montre',
  'flacon-aluminium', 'flacon-de-culture', 'flacon-laveur', 'flacon-mesureur-a-renversement',
  'flacon-plastique', 'flacon-pulverisateur', 'flacon-pycnometre', 'flacon-verre',
  'cahier-de-laboratoire', 'chronometre', 'ciseaux', 'coton', 'coupe-tube', 'couteau',
  'crayon-de-laboratoire', 'etiquettes', 'loupe', 'minuterie', 'papier-d-emballage',
  'papier-pour-imprimante', 'parafilm', 'piles',
  'accessoires-lame-lamelle', 'cellule-numeration-lame-lamelle', 'couvre-objet-lame-lamelle',
  'porte-objet-lame-lamelle',
  'allonge-montage-verrerie', 'anneau-de-lestage', 'collier-de-serrage',
  'elevateur-de-laboratoire', 'extracteur-soxhlet', 'montage-verrerie-refrigerant',
  'noix-de-serrage', 'raccord-plastique-montage-verrerie', 'raccord-verre-montage-verrerie',
  'raccord-montage-verrerie', 'robinet-montage-verrerie', 'support-statif-montage-verrerie',
  'trompe-a-eau-montage-verrerie', 'tube-montage-verrerie', 'tuyau-montage-verrerie',
]

const { data: target, error: targetErr } = await supabase
  .from('categories')
  .select('id')
  .eq('slug', 'petit-outillage')
  .is('parent_id', null)
  .single()
if (targetErr) throw targetErr

const { data: cats, error: catsErr } = await supabase
  .from('categories')
  .select('id, slug, parent_id')
  .in('slug', SLUGS)
if (catsErr) throw catsErr

const found = new Set(cats.map((c) => c.slug))
const missing = SLUGS.filter((s) => !found.has(s))
if (missing.length) console.warn('Not found in categories table (skipped):', missing)

const alreadyThere = cats.filter((c) => c.parent_id === target.id)
const toMove = cats.filter((c) => c.parent_id !== target.id)

console.log(`${cats.length} categories matched, ${alreadyThere.length} already under petit-outillage, ${toMove.length} to move.`)

if (DRY_RUN) {
  console.log('Dry run — would move:', toMove.map((c) => c.slug))
  process.exit(0)
}

if (toMove.length === 0) {
  console.log('Nothing to do.')
  process.exit(0)
}

const { data: updated, error: updErr } = await supabase
  .from('categories')
  .update({ parent_id: target.id })
  .in('id', toMove.map((c) => c.id))
  .select('slug')
if (updErr) throw updErr

console.log(`Moved ${updated.length} categories to petit-outillage:`, updated.map((c) => c.slug))
