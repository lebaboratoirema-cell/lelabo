# Threat Model

Check every feature against these before shipping.

## Business Logic Threats
- **Step-skipping:** Can a user reach checkout without adding to cart? Pay without confirming order?
- **Mass abuse / scraping:** Can a bot enumerate products, prices, or user accounts?
- **Invalid values:** Negative quantities, zero-price orders, out-of-stock bypass?
- **Double submission:** Double-click checkout → two orders / two charges?
- **Empty required fields:** Order submitted without shipping address, contact?

## Auth Threats
- Brute-force login (rate limit + lockout)
- Password reset token reuse or leak
- Session fixation after login

## Data Threats
- Customer order data accessible by other customers (IDOR)
- Admin endpoints accessible without admin role
- PII in URL params or logs

## AI/LLM Threats (provider TBD)
- Prompt injection via product descriptions or user input fed to LLM
- LLM output rendered unsanitised → XSS
- Excessive agency: LLM triggers actions (send email, place order) without human confirmation
- Token cost abuse: users craft inputs that maximise LLM token consumption

## Payment Threats
- Price tampering (client sends modified price to server)
- Webhook replay or spoofing from payment gateway
