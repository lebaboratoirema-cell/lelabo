# Regulatory Track — Morocco Law 09-08 / CNDP

## Applicable Framework
Morocco Law 09-08 on personal data protection, enforced by CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel).

## Filing Requirements

### Standard Processing (name, email, order data)
- **Declaration:** File a déclaration with CNDP before going live.
  - Submit via: cndp.ma (online portal or paper form)
  - Required fields: controller identity, processing purpose, data categories, recipients, retention, security measures, international transfers
  - Timeline: CNDP has 30 days to object; if no objection, you may proceed.

### Prior Authorisation (not triggered for this project — ordinary data only)
- Required for: health data, biometric, criminal records, minors, cross-border transfers to non-adequate countries where no derogation applies.
- If AI provider is US-based and no adequacy decision exists between Morocco and that country, a prior authorisation or contractual clause may be required.

## Obligations
- [ ] Inform users of processing at collection point (privacy notice)
- [ ] Privacy notice must include: controller identity, purpose, rights (access, rectification, opposition), international transfers
- [ ] Publish privacy notice in Arabic (required) + French (recommended)
- [ ] Respond to user access/rectification requests within 30 days
- [ ] Implement appropriate security measures (Law 09-08 Art. 23)
- [ ] Report data breaches to CNDP (no statutory deadline in 09-08 but best practice: 72h)

## International Transfer Notes
If any sub-processor (LLM, hosting, email) is outside Morocco:
- Check if destination country has adequate protection (EU/EEA countries generally yes)
- For US providers: no adequacy decision — use contractual clauses or prior authorisation
- Document transfer basis in `compliance/register.md`

## Checklist
- [ ] CNDP declaration filed
- [ ] Privacy notice published (Arabic + French)
- [ ] Sub-processor DPAs archived in `compliance/dpa/`
- [ ] International transfer basis documented
- [ ] User rights process documented and tested
