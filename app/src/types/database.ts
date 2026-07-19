export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type LocalizedText = { fr: string; en?: string }

// ─── Catalog ────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  parent_id: string | null
  slug: string
  name: LocalizedText
  description: LocalizedText | null
  image_url: string | null
  position: number
  is_active: boolean
  created_at: string
}

export interface ProductDelivery {
  delay: string
  weight_kg: number | null
  dimensions: string
  note: string
  policy_text: string
}

export interface Product {
  id: string
  category_id: string
  slug: string
  name: LocalizedText
  description: LocalizedText | null
  brand: string | null
  is_active: boolean
  in_stock: boolean
  promo_label: string | null
  specifications: Record<string, string> | null
  delivery: ProductDelivery | null
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: LocalizedText
  sku: string
  price: number
  stock: number
  position: number
  is_active: boolean
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  alt: LocalizedText | null
  position: number
  is_primary: boolean
  created_at: string
}

export interface ProductDocument {
  id: string
  product_id: string
  storage_path: string
  label: string
  position: number
  created_at: string
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cmi' | 'cod'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface ShippingAddress {
  street: string
  city: string
  region?: string
  postal_code?: string
  country: string
}

export interface Order {
  id: string
  reference: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: ShippingAddress
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  cmi_transaction_id: string | null
  subtotal: number
  shipping_cost: number
  total: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: LocalizedText
  variant_name: LocalizedText
  unit_price: number
  quantity: number
  subtotal: number
  created_at: string
}

// ─── Blog ───────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image: string | null
  author: string
  meta_description: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// ─── Joined shapes (for queries that embed relations) ───────────────────────

export interface ProductWithVariants extends Product {
  product_variants: ProductVariant[]
  product_images: ProductImage[]
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}
