# Le Laboratoire — Project Rules

## What this project is
E-commerce website selling laboratory equipment and products. Users in Morocco. Compliance: Law 09-08 / CNDP.

## Three Engine Model
- **Architect** (Claude) — reasons, coordinates, sequences
- **Equipment** (`equipment/`) — deterministic scripts; run, don't reason
- **Blueprint** (`blueprints/`) — connects Architect to Equipment

## Start of every session
1. Read `live/state.md` and `intel/focus.md`
2. Read relevant Blueprint if one exists
3. Scan `equipment/` and `.tmp/` for available tools
4. Confirm inputs; report missing; no assumptions

## Rules (see `.claude/rules/permissions.md` for full list)
- Never read `.env` — reference `.env.example`
- No secrets in code, comments, or frontend bundles
- Pin every new dependency; verify before adding
- Confirm before any irreversible action
- Log meaningful decisions to `decisions/ledger.md`

## Key files
- `live/tasks.md` — blocking items + active queue
- `security/checklist.md` — security gates
- `compliance/regulatory-track.md` — CNDP filing checklist
- `security/llm-agent-guardrails.md` — LLM safety controls
