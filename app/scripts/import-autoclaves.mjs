// One-off pilot import: autoclaves category, 10 products, from competitor scrape.
// Run: node --env-file=.env.local scripts/import-autoclaves.mjs
// Images are re-hosted into our own Supabase Storage bucket (product-images) —
// downloaded once here, not hotlinked from the source site.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const IMAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.tmp', 'autoclave-images')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PARENT_SLUG = 'equipements'
const CATEGORY = {
  slug: 'autoclaves',
  name: { fr: 'Autoclaves', en: 'Autoclaves' },
  description: {
    fr: 'Autoclaves de laboratoire, accessoires et consommables de stérilisation pour la décontamination fiable du matériel et des milieux de culture.',
  },
}

const PRODUCTS = [
  {
    sku: '219748',
    slug: 'joint-rechange-autoclaves-prestige',
    brand: null,
    name_fr: 'Joint de rechange pour autoclaves Prestige',
    description_fr:
      "Joint vert de rechange pour autoclaves Prestige, compatible avec les cycles 121 °C et 126 °C. Pièce d'usure à remplacer périodiquement pour garantir l'étanchéité de la chambre et la sécurité du cycle de stérilisation.",
    price_gbp: 165.6,
    image_url: 'https://www.scientificlabs.co.uk/image/display/219748',
  },
  {
    sku: 'AAN420',
    slug: 'refroidissement-vidange-autoclave-astell',
    brand: 'Astell',
    name_fr: 'Système de refroidissement de vidange pour autoclave Astell',
    description_fr:
      "Accessoire de refroidissement de vidange pour autoclaves Astell, assurant l'évacuation des effluents à une température sûre avant rejet. Vérifier la compatibilité avec le modèle d'autoclave avant commande.",
    price_gbp: 1860.0,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AAN420',
  },
  {
    sku: 'AC701',
    slug: 'systeme-vide-campact-rodwell',
    brand: 'Rodwell',
    name_fr: 'Système à vide Campact',
    description_fr:
      "Système de mise sous vide Campact pour autoclaves, facilitant l'extraction d'air résiduel avant stérilisation et l'amélioration de la pénétration de la vapeur sur charges poreuses (textiles, instruments creux).",
    price_gbp: 3241.2,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AC701',
  },
  {
    sku: 'AUT1653',
    slug: 'boite-sterilisation-pipettes-inox-290mm',
    brand: 'Nickel Electro',
    name_fr: 'Boîte inox de stérilisation pour pipettes 290 x 70 x 70 mm',
    description_fr:
      "Boîte de stérilisation à section carrée en acier inoxydable 304 (18/8), non magnétique, finition brillante. Coussinets en silicone moulés au couvercle et au fond limitant les chocs sur les pointes de pipette. Autoclavable à 120 °C, résiste à la chaleur sèche jusqu'à 180 °C.",
    price_gbp: 76.8,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AUT1651',
  },
  {
    sku: 'AUT1655',
    slug: 'boite-sterilisation-pipettes-inox-340mm',
    brand: 'Nickel Electro',
    name_fr: 'Boîte inox de stérilisation pour pipettes 340 x 70 x 70 mm',
    description_fr:
      "Boîte de stérilisation à section carrée en acier inoxydable 304 (18/8), non magnétique, finition brillante. Coussinets en silicone moulés au couvercle et au fond limitant les chocs sur les pointes de pipette. Autoclavable à 120 °C, résiste à la chaleur sèche jusqu'à 180 °C.",
    price_gbp: 80.4,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AUT1651',
  },
  {
    sku: 'AUT1657',
    slug: 'boite-sterilisation-pipettes-inox-430mm',
    brand: 'Nickel Electro',
    name_fr: 'Boîte inox de stérilisation pour pipettes 430 x 70 x 70 mm',
    description_fr:
      "Boîte de stérilisation à section carrée en acier inoxydable 304 (18/8), non magnétique, finition brillante. Coussinets en silicone moulés au couvercle et au fond limitant les chocs sur les pointes de pipette. Autoclavable à 120 °C, résiste à la chaleur sèche jusqu'à 180 °C.",
    price_gbp: 86.4,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AUT1651',
  },
  {
    sku: 'AUT1659',
    slug: 'boite-sterilisation-pipettes-inox-490mm',
    brand: 'Nickel Electro',
    name_fr: 'Boîte inox de stérilisation pour pipettes 490 x 70 x 70 mm',
    description_fr:
      "Boîte de stérilisation à section carrée en acier inoxydable 304 (18/8), non magnétique, finition brillante. Coussinets en silicone moulés au couvercle et au fond limitant les chocs sur les pointes de pipette. Autoclavable à 120 °C, résiste à la chaleur sèche jusqu'à 180 °C.",
    price_gbp: 116.4,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AUT1651',
  },
  {
    sku: 'AUT1670',
    slug: 'panier-autoclavable-nalgene-couvercle',
    brand: 'Nalgene',
    name_fr: 'Panier autoclavable Nalgene en PP avec couvercle 104 x 156 x 104 mm',
    description_fr:
      "Panier en polypropylène autoclavable Nalgene, avec couvercle, pour le transport et la stérilisation de petits consommables de laboratoire. Léger, résistant aux chocs et aux cycles répétés d'autoclave.",
    price_gbp: 33.96,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AUT1670',
  },
  {
    sku: 'AUT1694',
    slug: 'capsules-desodorisantes-autoclave-citron',
    brand: null,
    name_fr: "Capsules désodorisantes pour autoclave — Citron",
    description_fr:
      "Capsules désodorisantes parfum citron à insérer dans la charge de l'autoclave pour neutraliser les odeurs de stérilisation. Une à deux capsules par cycle selon le volume de la chambre.",
    price_gbp: 140.4,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AUT1694',
  },
  {
    sku: 'AUT1698',
    slug: 'capsules-desodorisantes-autoclave-rose',
    brand: null,
    name_fr: "Capsules désodorisantes pour autoclave — Rose",
    description_fr:
      "Capsules désodorisantes parfum rose à insérer dans la charge de l'autoclave pour neutraliser les odeurs de stérilisation. Une à deux capsules par cycle selon le volume de la chambre.",
    price_gbp: 140.4,
    image_url: 'https://www.scientificlabs.co.uk/image/display/AUT1698',
  },
]

const GBP_TO_MAD = 12.5 // approximate — adjust before go-live

function toMad(gbp) {
  return Math.round((gbp * GBP_TO_MAD) / 5) * 5
}

async function getOrCreateCategory() {
  const { data: parent, error: parentErr } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', PARENT_SLUG)
    .single()
  if (parentErr) throw new Error(`Parent category '${PARENT_SLUG}' not found: ${parentErr.message}`)

  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', CATEGORY.slug)
    .maybeSingle()
  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('categories')
    .insert({
      parent_id: parent.id,
      slug: CATEGORY.slug,
      name: CATEGORY.name,
      description: CATEGORY.description,
      position: 0,
      is_active: true,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Create category failed: ${error.message}`)
  console.log(`Created category '${CATEGORY.slug}' -> ${created.id}`)
  return created.id
}

async function uploadImage(sku) {
  const localPath = join(IMAGE_DIR, `${sku}.jpg`)
  const buf = readFileSync(localPath)
  const path = `autoclaves/${sku}.jpg`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, buf, { contentType: 'image/jpeg', upsert: true })
  if (error) throw new Error(`Storage upload failed for ${sku}: ${error.message}`)
  return path
}

async function importProduct(categoryId, p) {
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', p.slug)
    .maybeSingle()
  if (existing) {
    console.log(`Skip (exists): ${p.slug}`)
    return
  }

  const { data: product, error: prodErr } = await supabase
    .from('products')
    .insert({
      category_id: categoryId,
      slug: p.slug,
      name: { fr: p.name_fr },
      description: { fr: p.description_fr },
      brand: p.brand,
      is_active: true,
      in_stock: true,
    })
    .select('id')
    .single()
  if (prodErr) throw new Error(`Insert product failed (${p.sku}): ${prodErr.message}`)

  const { error: varErr } = await supabase.from('product_variants').insert({
    product_id: product.id,
    name: { fr: 'Standard' },
    sku: p.sku,
    price: toMad(p.price_gbp),
    stock: 0,
    position: 0,
    is_active: true,
  })
  if (varErr) throw new Error(`Insert variant failed (${p.sku}): ${varErr.message}`)

  const storagePath = await uploadImage(p.sku)
  const { error: imgErr } = await supabase.from('product_images').insert({
    product_id: product.id,
    storage_path: storagePath,
    alt: { fr: p.name_fr },
    position: 0,
    is_primary: true,
  })
  if (imgErr) throw new Error(`Insert image failed (${p.sku}): ${imgErr.message}`)

  console.log(`Imported: ${p.slug} (${toMad(p.price_gbp)} MAD)`)
}

async function main() {
  const categoryId = await getOrCreateCategory()
  for (const p of PRODUCTS) {
    await importProduct(categoryId, p)
  }
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
