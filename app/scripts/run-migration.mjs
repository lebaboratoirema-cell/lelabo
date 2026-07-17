// Applies a single migration file from supabase/migrations/ against DATABASE_URL.
// Run: node --env-file=.env.local scripts/run-migration.mjs <filename>

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const filename = process.argv[2]
if (!filename) {
  console.error('Usage: node --env-file=.env.local scripts/run-migration.mjs <filename>')
  process.exit(1)
}

const sql = readFileSync(join(ROOT, 'supabase', 'migrations', filename), 'utf-8')

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
try {
  await client.query(sql)
  console.log(`Applied ${filename}`)
} finally {
  await client.end()
}
