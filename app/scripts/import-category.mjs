// Generic catalog import: category + products + variants + images from a
// equipment/data/<slug>.json file, images sourced from .tmp/<slug>-images/.
// Idempotent — safe to re-run (skips existing category/product rows).
//
// Run: node --env-file=.env.local scripts/import-category.mjs <slug>

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: node --env-file=.env.local scripts/import-category.mjs <slug>')
  process.exit(1)
}

const DATA_PATH = join(ROOT, 'equipment', 'data', `${slug}.json`)
const IMAGE_DIR = join(ROOT, '.tmp', `${slug}-images`)
const GBP_TO_MAD = 12.5 // approximate — adjust before go-live

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { category, products } = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

function toMad(gbp) {
  return Math.round((gbp * GBP_TO_MAD) / 5) * 5
}

async function getOrCreateCategory() {
  const { data: parent, error: parentErr } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category.parent_slug)
    .single()
  if (parentErr) throw new Error(`Parent category '${category.parent_slug}' not found: ${parentErr.message}`)

  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category.slug)
    .maybeSingle()
  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('categories')
    .insert({
      parent_id: parent.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      position: 0,
      is_active: true,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Create category failed: ${error.message}`)
  console.log(`Created category '${category.slug}' -> ${created.id}`)
  return created.id
}

function safeSku(sku) {
  return sku.replace(/\//g, '-')
}

async function uploadImage(sku) {
  const localPath = join(IMAGE_DIR, `${safeSku(sku)}.jpg`)
  const buf = readFileSync(localPath)
  const path = `${category.slug}/${safeSku(sku)}.jpg`

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

  const localImagePath = join(IMAGE_DIR, `${safeSku(p.sku)}.jpg`)
  if (!existsSync(localImagePath)) {
    console.log(`Skip (no image fetched): ${p.slug} (${p.sku})`)
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
    name: { fr: p.variant_name_fr ?? 'Standard' },
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
  for (const p of products) {
    await importProduct(categoryId, p)
  }
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
