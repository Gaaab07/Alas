export interface Product {
  id: string // porque es uuid
  name: string
  description?: string
  price: number
  stock: number
  category: string
  size?: string
  color?: string
  image_url?: string
  created_at: string
}
