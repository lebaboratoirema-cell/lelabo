# Security Checklist

Legend: 🔴 blocking | 🟡 important | 🟢 done | ⬜ pending

## Secrets & Config
- 🔴 `.env` in `.gitignore` before first commit — **DONE**
- 🔴 No secrets in source code or comments
- 🔴 No secrets in frontend bundle (env vars prefixed PUBLIC_ only)
- ⬜ Secret rotation process documented

## Dependencies
- ⬜ Every dependency pinned to exact version
- ⬜ `npm audit` / `pip audit` run before each release
- ⬜ No abandoned packages (last commit > 2 years, no maintainer)

## Access Control
- 🔴 Admin routes require authentication
- ⬜ Role-based access: customer vs admin vs staff
- ⬜ Session tokens expire; refresh token rotation in place

## Encryption & Transport
- 🔴 HTTPS everywhere (no HTTP fallback in prod)
- ⬜ Passwords hashed with bcrypt/argon2 (never stored plain)
- ⬜ Payment data never stored server-side (use gateway tokenisation)

## Anti-intrusion
- ⬜ Rate limiting on login, register, checkout, and AI endpoints
- ⬜ CSRF protection on all state-changing requests
- ⬜ Input validation + sanitisation on all user-supplied fields
- ⬜ SQL injection protection (parameterised queries / ORM)
- ⬜ XSS protection (Content-Security-Policy header)

## Error Handling
- ⬜ No stack traces or internal details in API responses
- ⬜ Structured error logging (server-side only)

## Backups
- ⬜ DB backup schedule defined
- ⬜ Restore tested at least once

## LLM / Agent (applies — provider TBD)
See `security/llm-agent-guardrails.md`
