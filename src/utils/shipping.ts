// src/utils/shipping.ts

import type { Country, Province, ShippingOption, DeliveryMethod } from '@/types/shipping'

// Países disponibles
export const COUNTRIES: Country[] = [
  { code: 'PE', name: 'Perú', currency: 'PEN', isInternational: false },
  { code: 'AR', name: 'Argentina', currency: 'ARS', isInternational: true },
  { code: 'CL', name: 'Chile', currency: 'CLP', isInternational: true },
  { code: 'CO', name: 'Colombia', currency: 'COP', isInternational: true },
  { code: 'MX', name: 'México', currency: 'MXN', isInternational: true },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', isInternational: true },
]

// Provincias/Estados por país
export const PROVINCES: Record<string, Province[]> = {
  PE: [
    { name: 'Lima', country: 'PE' },
    { name: 'Arequipa', country: 'PE' },
    { name: 'Cusco', country: 'PE' },
    { name: 'Trujillo', country: 'PE' },
    { name: 'Piura', country: 'PE' },
    { name: 'Chiclayo', country: 'PE' },
    { name: 'Iquitos', country: 'PE' },
    { name: 'Huancayo', country: 'PE' },
    { name: 'Tacna', country: 'PE' },
    { name: 'Puno', country: 'PE' },
  ],
  AR: [
    { name: 'Buenos Aires', country: 'AR' },
    { name: 'Córdoba', country: 'AR' },
    { name: 'Santa Fe', country: 'AR' },
    { name: 'Mendoza', country: 'AR' },
    { name: 'Tucumán', country: 'AR' },
  ],
  CL: [
    { name: 'Santiago', country: 'CL' },
    { name: 'Valparaíso', country: 'CL' },
    { name: 'Concepción', country: 'CL' },
    { name: 'La Serena', country: 'CL' },
    { name: 'Antofagasta', country: 'CL' },
  ],
  CO: [
    { name: 'Bogotá', country: 'CO' },
    { name: 'Medellín', country: 'CO' },
    { name: 'Cali', country: 'CO' },
    { name: 'Barranquilla', country: 'CO' },
    { name: 'Cartagena', country: 'CO' },
  ],
  MX: [
    { name: 'Ciudad de México', country: 'MX' },
    { name: 'Guadalajara', country: 'MX' },
    { name: 'Monterrey', country: 'MX' },
    { name: 'Puebla', country: 'MX' },
    { name: 'Cancún', country: 'MX' },
  ],
  US: [
    { name: 'California', country: 'US' },
    { name: 'Texas', country: 'US' },
    { name: 'Florida', country: 'US' },
    { name: 'New York', country: 'US' },
    { name: 'Illinois', country: 'US' },
  ],
}

// Distritos excluidos de envío express en Lima
const EXCLUDED_DISTRICTS_EXPRESS = [
  'puente piedra',
  'ancon',
  'ventanilla',
  'cieneguilla',
  'carabayllo'
]

// Función para verificar si un distrito está excluido del envío express
export const isDistrictExcludedFromExpress = (district: string): boolean => {
  const normalizedDistrict = district.toLowerCase().trim()
  return EXCLUDED_DISTRICTS_EXPRESS.some(excluded => 
    normalizedDistrict.includes(excluded)
  )
}

// Función para obtener las opciones de envío disponibles
export const getShippingOptions = (
  country: string, 
  province: string, 
  district: string
): ShippingOption[] => {
  const isLima = country === 'PE' && province === 'Lima'
  const isPeru = country === 'PE'
  const isInternational = country !== 'PE'
  const districtExcluded = isDistrictExcludedFromExpress(district)

  const options: ShippingOption[] = []

  // Opción: Retiro en tienda (siempre disponible)
  options.push({
    id: 'pickup',
    label: 'Retiro en Tienda',
    description: 'Recoge tu pedido en nuestra tienda física',
    cost: 0,
    currency: 'PEN',
    deliveryTime: 'Disponible inmediatamente',
    icon: 'fa-store',
    available: true,
    conditions: [
      'Sin costo de envío',
      'Horario: Lun-Vie 10:30am - 6:30pm, Sáb 11:00am - 1:00pm',
      'Dirección: [Tu dirección de tienda aquí]'
    ]
  })

  // Opciones para Lima Metropolitana
  if (isLima) {
    // Express Lima (excluye ciertos distritos)
    options.push({
      id: 'express-lima',
      label: 'Envío Express - Lima',
      description: 'Entrega en 24 horas',
      cost: 25,
      currency: 'PEN',
      deliveryTime: '24 horas',
      icon: 'fa-bolt',
      available: !districtExcluded,
      conditions: districtExcluded ? [
        'No disponible para tu distrito',
        'Distritos excluidos: Puente Piedra, Ancón, Ventanilla, Cieneguilla, Carabayllo'
      ] : [
        'Entrega dentro de las 24 horas',
        'Lun-Vie: 10:30am - 6:30pm',
        'Sábados: 11:00am - 1:00pm'
      ]
    })

    // Regular Lima
    options.push({
      id: 'regular-lima',
      label: 'Envío Regular - Lima',
      description: 'Entrega en 3-5 días hábiles',
      cost: 12,
      currency: 'PEN',
      deliveryTime: '3-5 días hábiles',
      icon: 'fa-truck',
      available: true,
      conditions: [
        'Cobertura: Todo Lima Metropolitana',
        'Tiempo de entrega: 3-5 días hábiles'
      ]
    })
  }

  // Opciones para Provincia (Perú, fuera de Lima)
  if (isPeru && !isLima) {
    options.push({
      id: 'province',
      label: 'Envío a Provincia',
      description: 'Entrega en 3-7 días hábiles',
      cost: 18,
      currency: 'PEN',
      deliveryTime: '3-7 días hábiles',
      icon: 'fa-truck',
      available: true,
      conditions: [
        'Cobertura: Todo el Perú',
        'La empresa de envío puede variar según la zona'
      ]
    })
  }

  // Opciones internacionales
  if (isInternational) {
    options.push({
      id: 'international',
      label: 'Envío Internacional',
      description: 'Entrega en ~15 días hábiles',
      cost: 35,
      currency: 'USD',
      deliveryTime: '~15 días hábiles',
      icon: 'fa-plane',
      available: true,
      conditions: [
        'Courier: DHL',
        'Tiempo estimado: 15 días hábiles',
        'Costos de aduana no incluidos'
      ]
    })
  }

  return options
}

// Función para calcular el costo total con envío
export const calculateTotal = (
  subtotal: number,
  shippingOption: ShippingOption | null
): number => {
  if (!shippingOption) return subtotal
  
  if (shippingOption.currency === 'USD') {
    // Conversión aproximada USD a PEN (puedes ajustar la tasa)
    const exchangeRate = 3.75
    return subtotal + (shippingOption.cost * exchangeRate)
  }
  
  return subtotal + shippingOption.cost
}

// Función para obtener el método de entrega por defecto
export const getDefaultDeliveryMethod = (
  country: string,
  province: string
): DeliveryMethod => {
  if (country === 'PE' && province === 'Lima') {
    return 'regular-lima'
  } else if (country === 'PE') {
    return 'province'
  } else {
    return 'international'
  }
}

// Función para formatear el costo
export const formatShippingCost = (cost: number, currency: string): string => {
  if (cost === 0) return 'Gratis'
  
  if (currency === 'USD') {
    return `$${cost.toFixed(2)} USD`
  }
  
  return `S/. ${cost.toFixed(2)}`
}