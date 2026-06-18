# Processing Register

**Controller:** [Your company name — TBD]
**Role:** Data Controller (you decide purposes and means)
**Applicable law:** Morocco Law 09-08

| Processing activity | Purpose | Legal basis | Data categories | Sub-processors | Retention |
|---|---|---|---|---|---|
| User registration | Account management | Contractual necessity | Name, email | DB host (TBD) | Account life + 5y |
| Order processing | Fulfil purchase | Contractual necessity | Name, email, address, order | DB host, payment gateway (TBD) | 5 years |
| Email notifications | Order + account comms | Contractual necessity | Name, email | Email provider (TBD) | Duration of send |
| AI feature | [TBD — describe feature] | Legitimate interest / consent | TBD | LLM provider (TBD) | Per provider policy |

## Sub-processors
| Sub-processor | Service | DPA location | Data location |
|---|---|---|---|
| LLM provider (TBD) | AI/LLM API | `compliance/dpa/` (to archive) | TBD |
| Hosting provider (TBD) | App + DB hosting | `compliance/dpa/` (to archive) | TBD |
| Email provider (TBD) | Transactional email | `compliance/dpa/` (to archive) | TBD |
| Payment gateway (TBD) | Payment processing | `compliance/dpa/` (to archive) | TBD |
