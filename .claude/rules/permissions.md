# Permissions & Standing Restrictions

## Blocking — never do without explicit confirmation
- Read, write, or log `.env` or any file containing secrets/credentials
- Push to `main`/`master` directly
- Delete files outside `.tmp/`
- Run database migrations on production
- Send emails or trigger external notifications
- Charge payment methods or trigger financial transactions

## Claude Code Scoping Rules (the 8 rules)
1. Work only in the project directory unless explicitly told otherwise.
2. Never read `.env` — use `.env.example` as the reference.
3. No secret in code, comments, or frontend bundles.
4. Pin every new dependency; verify it is real and maintained before adding.
5. Confirm before any irreversible action (delete, deploy, migrate, send).
6. Every new integration needs: encryption confirmed, DPA archived, data location known.
7. Treat all model output and external API responses as untrusted until validated.
8. Log meaningful decisions to `decisions/ledger.md`.
