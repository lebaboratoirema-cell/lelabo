# Decision Ledger

| Date | Decision | Rationale | Alternatives considered |
|------|----------|-----------|------------------------|
| 2026-06-18 | Scaffold project as e-commerce website | Sell lab equipment in Morocco | — |
| 2026-06-18 | Compliance track: Law 09-08 / CNDP | Users in Morocco | GDPR not triggered (no EU users) |
| 2026-06-18 | LLM provider: TBD | Not yet decided | Anthropic, OpenAI, Google |
| 2026-06-18 | Tech stack: Next.js | Full-stack React, strong e-commerce ecosystem | Nuxt, Remix |
| 2026-06-18 | Hosting: Vercel (initial) | Fastest to ship; plan to migrate to VPS later | VPS, Railway |
| 2026-06-18 | Payments: CMI + Cash on delivery | Morocco-local cards + widest customer reach | CMI only |
| 2026-06-18 | Languages: French + English | Owner is FR speaker; EN for international reach | FR only, FR+AR |
| 2026-06-18 | Next.js app lives in app/ subdir | Keeps command centre files separate from shipping code | monorepo root |
| 2026-06-18 | Database: Supabase (Postgres) | Hosted Postgres + auth + storage; free tier sufficient to start | Neon, PlanetScale |
| 2026-06-19 | Homepage implemented from design (claude.ai/design project 706e2d4a) | User provided design mockup; converted HTML/CSS to Next.js components | — |
| 2026-06-19 | CSS approach: custom CSS classes in globals.css (not Tailwind utilities) | Design has complex CSS variable system; faithful conversion faster and safer | Full Tailwind migration |
| 2026-06-19 | Font: Poppins via next/font/google | Matches design spec; replaces Geist scaffold font | Keep Geist |
