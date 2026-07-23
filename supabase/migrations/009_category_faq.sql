-- 009_category_faq.sql
-- FAQ content per category, for on-page display + FAQPage JSON-LD (GEO/AI-citation work).
ALTER TABLE categories ADD COLUMN IF NOT EXISTS faq jsonb;
