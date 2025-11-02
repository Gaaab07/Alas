// src/types/product.ts
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  category: string
  size?: string  // Esta es la talla de esta variante específica
  color?: string
  image_url?: string
  collection?: string
  created_at: string
  product_group?: string  // NUEVO: Para agrupar variantes
}