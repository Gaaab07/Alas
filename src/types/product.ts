export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  category: string
  size?: string
  color?: string
  image_url?: string
  collection?: string  
  created_at: string
}