# Data Map

**Applicable law:** Morocco Law 09-08 / CNDP
**Last updated:** 2026-06-18

| Data element | Classification | Source | Storage location | Retention | Notes |
|---|---|---|---|---|---|
| Full name | Ordinary identifier | Registration / checkout | DB (TBD) | Duration of account + 5y | Required for orders |
| Email address | Ordinary identifier | Registration | DB (TBD) | Duration of account + 5y | Login + notifications |
| Shipping address | Ordinary identifier | Checkout | DB (TBD) | Order lifetime + 5y | |
| Order history | Ordinary identifier | Checkout | DB (TBD) | 5 years (accounting) | |
| LLM prompt/response | Depends on content | AI feature | Provider servers (TBD) | Per provider policy | Strip PII before sending |

## Data Flows
1. User → Website → DB (registration, checkout)
2. Website → LLM Provider (TBD) → Website (AI feature — PII stripped before send)
3. Website → Email provider → User (order confirmations)
4. Website → Payment gateway → User (payment processing — no card data stored)

## International Transfers
- LLM provider (TBD): if US-based → cross-border transfer from Morocco. Requires DPA + legal basis.
- Email provider (TBD): same consideration.
- Payment gateway (TBD): same consideration.
