export interface Order {
  id: string
  user_id: string
  user_email: string
  total: number
  status: string
  delivery_method: string
  shipping_address: ShippingAddress
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

export interface ShippingAddress {
  firstName: string
  lastName: string
  documentId: string
  email: string
  phone: string
  country: string
  address: string
  apartment?: string
  district: string
  province: string
  postalCode?: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}