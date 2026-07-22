'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { slugify } from '@/lib/slugify'

async function uploadImages(supabase: ReturnType<typeof createServiceClient>, productId: string, formData: FormData) {
  const files = formData.getAll('images') as File[]
  const validFiles = files.filter((f) => f.size > 0)
  if (validFiles.length === 0) return

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${productId}/${Date.now()}-${i}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type, upsert: false, cacheControl: '31536000' })

    if (uploadError) throw new Error(`Upload image: ${uploadError.message}`)

    const { error: dbError } = await supabase.from('product_images').insert({
      product_id: productId,
      storage_path: path,
      position: i,
      is_primary: i === 0,
    })
    if (dbError) throw new Error(`Save image record: ${dbError.message}`)
  }
}

async function uploadDocuments(supabase: ReturnType<typeof createServiceClient>, productId: string, formData: FormData) {
  const files = formData.getAll('documents') as File[]
  const validFiles = files.filter((f) => f.size > 0)
  if (validFiles.length === 0) return

  const { count: existingCount } = await supabase
    .from('product_documents')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]
    const label = (formData.get(`new_doc_label_${i}`) as string) || file.name
    const path = `${productId}/${Date.now()}-${i}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('product-documents')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) throw new Error(`Upload document: ${uploadError.message}`)

    const { error: dbError } = await supabase.from('product_documents').insert({
      product_id: productId,
      storage_path: path,
      label,
      position: (existingCount ?? 0) + i,
    })
    if (dbError) throw new Error(`Save document record: ${dbError.message}`)
  }
}

async function updateDocumentLabels(supabase: ReturnType<typeof createServiceClient>, formData: FormData) {
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('existing_doc_label_')) continue
    const id = key.replace('existing_doc_label_', '')
    const { error } = await supabase.from('product_documents').update({ label: value as string }).eq('id', id)
    if (error) throw new Error(`Update document label: ${error.message}`)
  }
}

function parseSpecifications(formData: FormData) {
  const specs: Record<string, string> = {}
  let i = 0
  while (formData.get(`spec_key_${i}`) !== null) {
    const key = (formData.get(`spec_key_${i}`) as string).trim()
    const value = (formData.get(`spec_value_${i}`) as string).trim()
    if (key) specs[key] = value
    i++
  }
  return Object.keys(specs).length > 0 ? specs : null
}

function parseDelivery(formData: FormData) {
  const delay = (formData.get('delivery_delay') as string) || ''
  const weightRaw = (formData.get('delivery_weight_kg') as string) || ''
  const dimensions = (formData.get('delivery_dimensions') as string) || ''
  const note = (formData.get('delivery_note') as string) || ''
  const policyText = (formData.get('delivery_policy_text') as string) || ''
  const weight = weightRaw ? parseFloat(weightRaw) : null

  if (!delay && !weight && !dimensions && !note && !policyText) return null
  return {
    delay,
    weight_kg: weight !== null && !isNaN(weight) ? weight : null,
    dimensions,
    note,
    policy_text: policyText,
  }
}

export async function createProduct(formData: FormData) {
  const supabase = createServiceClient()
  const nameFr = formData.get('name_fr') as string
  const baseSlug = slugify(nameFr)

  // Resolve slug collision by appending incrementing suffix
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug)
    if (count === 0) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      category_id: formData.get('category_id') as string,
      slug,
      name: { fr: nameFr },
      description: { fr: formData.get('desc_fr') as string || null },
      brand: (formData.get('brand') as string) || null,
      is_active: formData.get('is_active') === 'on',
      in_stock: formData.get('in_stock') === 'on',
      promo_label: (formData.get('promo_label') as string) || null,
      specifications: parseSpecifications(formData),
      delivery: parseDelivery(formData),
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const variantRows = parseVariants(formData)
  if (variantRows.length > 0) {
    const { error: varErr } = await supabase
      .from('product_variants')
      .insert(variantRows.map((v) => ({ ...v, product_id: product.id })))
    if (varErr) throw new Error(varErr.message)
  }

  await uploadImages(supabase, product.id, formData)
  await uploadDocuments(supabase, product.id, formData)

  revalidatePath('/fr/produits-chimiques', 'page')
  revalidatePath('/fr/glassware', 'page')
  revalidatePath('/fr/lab-equipment', 'page')
  revalidatePath('/[locale]', 'layout')
  redirect('/fr/admin/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createServiceClient()
  const nameFr = formData.get('name_fr') as string

  const { error } = await supabase
    .from('products')
    .update({
      category_id: formData.get('category_id') as string,
      name: { fr: nameFr },
      description: { fr: formData.get('desc_fr') as string || null },
      brand: (formData.get('brand') as string) || null,
      is_active: formData.get('is_active') === 'on',
      in_stock: formData.get('in_stock') === 'on',
      promo_label: (formData.get('promo_label') as string) || null,
      specifications: parseSpecifications(formData),
      delivery: parseDelivery(formData),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await supabase.from('product_variants').delete().eq('product_id', id)
  const variantRows = parseVariants(formData)
  if (variantRows.length > 0) {
    const { error: varErr } = await supabase
      .from('product_variants')
      .insert(variantRows.map((v) => ({ ...v, product_id: id })))
    if (varErr) throw new Error(varErr.message)
  }

  await uploadImages(supabase, id, formData)
  await updateDocumentLabels(supabase, formData)
  await uploadDocuments(supabase, id, formData)

  revalidatePath('/fr/produits-chimiques', 'page')
  revalidatePath('/fr/glassware', 'page')
  revalidatePath('/fr/lab-equipment', 'page')
  revalidatePath('/[locale]', 'layout')
  redirect('/fr/admin/products')
}

export async function deleteProduct(id: string) {
  const supabase = createServiceClient()

  // Delete storage files first
  const { data: imgs } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', id)

  if (imgs && imgs.length > 0) {
    await supabase.storage
      .from('product-images')
      .remove(imgs.map((i) => i.storage_path))
  }

  const { data: docs } = await supabase
    .from('product_documents')
    .select('storage_path')
    .eq('product_id', id)

  if (docs && docs.length > 0) {
    await supabase.storage
      .from('product-documents')
      .remove(docs.map((d) => d.storage_path))
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/fr/produits-chimiques', 'page')
  revalidatePath('/fr/glassware', 'page')
  revalidatePath('/fr/lab-equipment', 'page')
  revalidatePath('/[locale]', 'layout')
}

function parseVariants(formData: FormData) {
  const variants: { name: { fr: string }; sku: string; price: number; stock: number; position: number }[] = []
  let i = 0
  while (formData.get(`variant_name_fr_${i}`) !== null) {
    const nameFr = formData.get(`variant_name_fr_${i}`) as string
    const sku = formData.get(`variant_sku_${i}`) as string
    const priceRaw = formData.get(`variant_price_${i}`) as string
    const price = priceRaw ? parseFloat(priceRaw) : 0
    const stock = parseInt(formData.get(`variant_stock_${i}`) as string, 10)
    if (nameFr && sku) {
      variants.push({ name: { fr: nameFr }, sku, price: isNaN(price) ? 0 : price, stock: isNaN(stock) ? 0 : stock, position: i })
    } else if (nameFr || sku) {
      throw new Error(`Variante ${i + 1}: nom et SKU sont tous deux obligatoires`)
    }
    i++
  }
  return variants
}
