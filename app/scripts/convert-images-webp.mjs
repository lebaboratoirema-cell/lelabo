import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BUCKET = 'product-images'
const QUALITY = 80
const CONCURRENCY = 8

async function fetchAllProductImages() {
  let all = []
  let from = 0
  const pageSize = 1000
  while (true) {
    const { data, error } = await supabase
      .from('product_images')
      .select('id, storage_path')
      .range(from, from + pageSize - 1)
    if (error) throw error
    all = all.concat(data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}

async function convertOne(row, stats) {
  const oldPath = row.storage_path
  if (!/\.jpe?g$/i.test(oldPath)) {
    stats.skipped++
    return
  }
  const newPath = oldPath.replace(/\.jpe?g$/i, '.webp')

  try {
    const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(oldPath)
    if (dlErr) throw dlErr
    const inputBuffer = Buffer.from(await blob.arrayBuffer())

    const outputBuffer = await sharp(inputBuffer).webp({ quality: QUALITY }).toBuffer()

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, outputBuffer, { contentType: 'image/webp', upsert: true })
    if (upErr) throw upErr

    // verify new object exists before touching DB/deleting original
    const { data: verify, error: verifyErr } = await supabase.storage
      .from(BUCKET)
      .download(newPath)
    if (verifyErr || !verify) throw new Error('verify failed: ' + (verifyErr?.message || 'no data'))

    const { error: dbErr } = await supabase
      .from('product_images')
      .update({ storage_path: newPath })
      .eq('id', row.id)
    if (dbErr) throw dbErr

    const { error: rmErr } = await supabase.storage.from(BUCKET).remove([oldPath])
    if (rmErr) {
      console.log(`WARN  ${oldPath} -> ${newPath} converted+DB updated, but old file delete failed: ${rmErr.message}`)
      stats.deleteFailed++
    }

    stats.converted++
    console.log(`OK    ${oldPath} -> ${newPath} (${inputBuffer.length} -> ${outputBuffer.length} bytes)`)
  } catch (e) {
    stats.failed++
    stats.failures.push({ id: row.id, path: oldPath, error: String(e.message || e) })
    console.log(`FAIL  ${oldPath}: ${String(e.message || e)}`)
  }
}

async function runPool(items, worker, concurrency) {
  let idx = 0
  async function next() {
    while (idx < items.length) {
      const i = idx++
      await worker(items[i])
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next))
}

async function main() {
  let rows = await fetchAllProductImages()
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : null
  if (limit) rows = rows.slice(0, limit)
  console.log(`Loaded ${rows.length} product_images rows`)

  const stats = { converted: 0, skipped: 0, failed: 0, deleteFailed: 0, failures: [] }
  await runPool(rows, (row) => convertOne(row, stats), CONCURRENCY)

  console.log('\n--- Summary ---')
  console.log('converted:', stats.converted)
  console.log('skipped (already non-jpg):', stats.skipped)
  console.log('failed:', stats.failed)
  console.log('old-file delete failed (converted ok, jpg orphaned):', stats.deleteFailed)
  if (stats.failures.length) {
    console.log('\nFailures:')
    for (const f of stats.failures) console.log(`  ${f.path} (id=${f.id}): ${f.error}`)
  }
}

main()
