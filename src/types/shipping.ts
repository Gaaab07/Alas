// src/types/shipping.ts

export type DeliveryMethod = 'pickup' | 'express-lima' | 'regular-lima' | 'province' | 'international'

export interface ShippingOption {
  id: DeliveryMethod
  label: string
  description: string
  cost: number
  currency: string
  deliveryTime: string
  icon: string
  available: boolean
  conditions?: string[]
}

export interface Country {
  code: string
  name: string
  currency: string
  isInternational: boolean
}

export interface Province {
  name: string
  country: string
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
  
  // ✅ AGREGAR ESTAS 3 PROPIEDADES OPCIONALES
  shippingMethod?: string    // Ej: "Envío Express - Lima"
  deliveryTime?: string       // Ej: "24 horas"
  shippingCost?: number       // Ej: 25
}

export interface ShippingCalculation {
  subtotal: number
  shippingCost: number
  total: number
  currency: string
  deliveryMethod: DeliveryMethod
  estimatedDelivery: string
}