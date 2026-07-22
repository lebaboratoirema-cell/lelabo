-- ============================================================
-- Le Laboratoire — MySQL schema mirror of Supabase/Postgres schema
-- Target: Hostinger MySQL (5.7+/8.0)
-- Run once on the empty Hostinger database before migrate.py.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- CATALOG TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id          CHAR(36)     PRIMARY KEY,
  parent_id   CHAR(36)     NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  name        JSON         NOT NULL,
  description JSON         NULL,
  image_url   TEXT         NULL,
  position    INT          NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  group_key   VARCHAR(255) NULL,
  group_label JSON         NULL,
  created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX categories_group_key_idx (parent_id, group_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id                CHAR(36)      PRIMARY KEY,
  category_id       CHAR(36)      NOT NULL,
  slug              VARCHAR(255)  NOT NULL UNIQUE,
  name              JSON          NOT NULL,
  description       JSON          NULL,
  brand             VARCHAR(255)  NULL,
  is_active         TINYINT(1)    NOT NULL DEFAULT 1,
  specifications    JSON          NULL,
  delivery          JSON          NULL,
  is_featured       TINYINT(1)    NOT NULL DEFAULT 0,
  featured_position INT           NULL,
  created_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX products_featured_idx (is_featured, featured_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_variants (
  id         CHAR(36)      PRIMARY KEY,
  product_id CHAR(36)      NOT NULL,
  name       JSON          NOT NULL,
  sku        VARCHAR(255)  NOT NULL UNIQUE,
  price      DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock      INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
  position   INT           NOT NULL DEFAULT 0,
  is_active  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
  id           CHAR(36)    PRIMARY KEY,
  product_id   CHAR(36)    NOT NULL,
  storage_path TEXT        NOT NULL,
  alt          JSON        NULL,
  position     INT         NOT NULL DEFAULT 0,
  is_primary   TINYINT(1)  NOT NULL DEFAULT 0,
  created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_documents (
  id           CHAR(36)     PRIMARY KEY,
  product_id   CHAR(36)     NOT NULL,
  storage_path TEXT         NOT NULL,
  label        VARCHAR(255) NOT NULL,
  position     INT          NOT NULL DEFAULT 0,
  created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_documents_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDER TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id                 CHAR(36)      PRIMARY KEY,
  reference          VARCHAR(64)   NOT NULL UNIQUE,
  customer_name      VARCHAR(255)  NOT NULL,
  customer_email     VARCHAR(255)  NOT NULL,
  customer_phone     VARCHAR(64)   NOT NULL,
  shipping_address   JSON          NOT NULL,
  status             VARCHAR(20)   NOT NULL DEFAULT 'pending'
                       CHECK (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_method     VARCHAR(20)   NOT NULL
                       CHECK (payment_method in ('cmi','cod')),
  payment_status     VARCHAR(20)   NOT NULL DEFAULT 'pending'
                       CHECK (payment_status in ('pending','paid','failed','refunded')),
  cmi_transaction_id VARCHAR(255)  NULL,
  subtotal           DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost      DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total              DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  notes              TEXT          NULL,
  created_at         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id           CHAR(36)      PRIMARY KEY,
  order_id     CHAR(36)      NOT NULL,
  product_id   CHAR(36)      NOT NULL,
  variant_id   CHAR(36)      NOT NULL,
  product_name JSON          NOT NULL,
  variant_name JSON          NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity     INT           NOT NULL CHECK (quantity > 0),
  subtotal     DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT fk_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BLOG
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id               CHAR(36)     PRIMARY KEY,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  title            VARCHAR(500) NOT NULL,
  excerpt          TEXT         NULL,
  content          LONGTEXT     NOT NULL,
  cover_image      TEXT         NULL,
  is_published     TINYINT(1)   NOT NULL DEFAULT 0,
  published_at     DATETIME(6)  NULL,
  author           VARCHAR(255) NOT NULL DEFAULT 'lelaboratoire.ma',
  meta_description TEXT         NULL,
  created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX blog_posts_published_idx (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- COOKIE CONSENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS cookie_consents (
  id         CHAR(36)     PRIMARY KEY,
  choice     VARCHAR(20)  NOT NULL CHECK (choice in ('accepted','rejected')),
  locale     VARCHAR(10)  NOT NULL,
  ip_hash    VARCHAR(255) NOT NULL,
  user_agent TEXT         NULL,
  created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- NOTE — dropped on migration, no MySQL equivalent shipped here:
--   * Row Level Security policies (anon/authenticated/service_role) —
--     MySQL has no RLS. Access control must move to the app layer
--     (only expose "public read" queries for is_active=true rows,
--     never let a client-facing DB user touch orders/order_items).
--   * order_reference_seq / generate_order_reference() — Postgres-only
--     sequence+function used to mint "ORD-YYYY-00001". Existing
--     reference values are copied as plain data; if you keep creating
--     orders against MySQL you need an app-side equivalent generator.
--   * update_updated_at() trigger — replaced above by native
--     ON UPDATE CURRENT_TIMESTAMP(6) column clauses on products/orders/
--     blog_posts.
-- ============================================================
