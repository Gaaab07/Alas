// src/types/order.ts
import type { ShippingAddress } from './shipping'

export interface Order {
  id: string
  user_id: string
  user_email: string
  total: number
  status: string
  delivery_method: string
  shipping_address: ShippingAddress  // ✅ Ahora usa el tipo importado con las propiedades nuevas
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  product_size?: string
  product_color?: string
  product_image_url?: string
  quantity: number
  subtotal: number
  created_at: string
}

// ❌ ELIMINAR ESTA DEFINICIÓN DUPLICADA
// Ya no necesitas definir ShippingAddress aquí porque la importas de shipping.ts

export interface OrderWithItems extends Order {
  items: OrderItem[]
}