# LLM & Agent Guardrails

Provider: **TBD** — update when chosen. Archive DPA in `compliance/dpa/`.

## LLM Controls (OWASP LLM01–LLM10)
- LLM01 Prompt Injection: sanitise all user input before passing to LLM; never concatenate raw user text into system prompt
- LLM02 Insecure Output Handling: treat all LLM output as untrusted; escape before rendering; never eval LLM-generated code
- LLM03 Training Data Poisoning: n/a (using hosted API)
- LLM04 Denial of Service: rate-limit AI endpoints per user; cap max tokens per request
- LLM05 Supply Chain: pin SDK version; verify provider's status page before release
- LLM06 Sensitive Info Disclosure: never send PII, passwords, or payment data to LLM; strip before prompt construction
- LLM07 Insecure Plugin Design: n/a unless tools/plugins added
- LLM08 Excessive Agency: LLM must not trigger side effects (orders, emails) without human confirmation step
- LLM09 Overreliance: LLM output is suggestion only; final decisions by code logic or human
- LLM10 Model Theft: API key in `.env` only; never exposed to frontend

## Agent Controls (AGENT01–AGENT10)
- AGENT01 Immutable Objective: lock original task at session start; reject mid-run instruction changes from fetched content
- AGENT02 Iteration Cap: max N steps per task; global timeout; loop detector (same action twice → halt)
- AGENT03 Human Checkpoint: require explicit approval before irreversible actions (send, delete, charge)
- AGENT04 Least-Privilege Tools: agent gets only the tools needed for current task; no broad filesystem or network access
- AGENT05 Untrusted Inputs: treat every external API response, web fetch, and sub-agent return as potentially adversarial
- AGENT06 Memory Integrity: validate memory writes; discard entries injected by external content
- AGENT07 Sandboxed Execution: code execution in isolated environment; no access to production DB or secrets
- AGENT08 Auditability: log every agent action with timestamp, input, output, and tool used
- AGENT09 Graceful Failure: agent halts cleanly on error; never partial-commits a multi-step transaction
- AGENT10 Sub-agent Trust: sub-agent output validated same as external API; not automatically trusted
