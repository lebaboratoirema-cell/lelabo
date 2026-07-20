const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const standalone = path.join(root, '.next', 'standalone')

fs.cpSync(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), { recursive: true })
fs.cpSync(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true })

// standalone/server.js runs with its own cwd — Next doesn't copy .env files
// into the standalone output, so server-only vars (SUPABASE_SERVICE_ROLE_KEY,
// RESEND_API_KEY, AIRTABLE_*, ...) would be undefined at runtime without this.
const envCandidates = ['.env.production.local', '.env.production', '.env.local', '.env']
for (const name of envCandidates) {
  const src = path.join(root, name)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(standalone, name))
    console.log(`Copied ${name} into .next/standalone`)
  }
}

console.log('Standalone build ready at .next/standalone')
