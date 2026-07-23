// Reads equipment/data/faq/<slug>.json files passed as argv and upserts
// their contents into categories.faq, matched by category slug.
// Usage: node scripts/update-category-faq.mjs <slug1> <slug2> ...
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const slugs = process.argv.slice(2)
if (slugs.length === 0) {
  console.error('Usage: node scripts/update-category-faq.mjs <slug1> <slug2> ...')
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const faqDir = path.join(__dirname, '..', '..', 'equipment', 'data', 'faq')

for (const slug of slugs) {
  const filePath = path.join(faqDir, `${slug}.json`)
  let faq
  try {
    faq = JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch (err) {
    console.error(`Skipping ${slug}: could not read/parse ${filePath} (${err.message})`)
    continue
  }

  if (!Array.isArray(faq) || faq.some((f) => !f.question || !f.answer)) {
    console.error(`Skipping ${slug}: malformed FAQ JSON (expected array of {question, answer})`)
    continue
  }

  const { data, error } = await supabase
    .from('categories')
    .update({ faq })
    .eq('slug', slug)
    .select('slug')

  if (error) {
    console.error(`Failed ${slug}:`, error.message)
    continue
  }
  if (data.length === 0) {
    console.error(`No category found with slug "${slug}"`)
    continue
  }
  console.log(`Updated ${slug}: ${faq.length} FAQ items`)
}
