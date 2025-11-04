import { describe, it, expect } from 'vitest'
import { 
  formatShippingCost,
  getShippingOptions,
  calculateTotal,
  isDistrictExcludedFromExpress,
  getDefaultDeliveryMethod,
  COUNTRIES,
  PROVINCES
} from '@/utils/shipping'

describe('Shipping Utils', () => {
  describe('formatShippingCost', () => {
    it('debe formatear costo en PEN correctamente', () => {
      const result = formatShippingCost(15, 'PEN')
      expect(result).toBe('S/. 15.00')
    })

    it('debe formatear costo en USD correctamente', () => {
      const result = formatShippingCost(25, 'USD')
      expect(result).toBe('$25.00 USD')
    })

    it('debe mostrar "Gratis" cuando costo es 0', () => {
      const result = formatShippingCost(0, 'PEN')
      expect(result).toBe('Gratis')
    })

    it('debe redondear a 2 decimales', () => {
      const result = formatShippingCost(15.556, 'PEN')
      expect(result).toBe('S/. 15.56')
    })
  })

  describe('isDistrictExcludedFromExpress', () => {
    it('debe detectar distritos excluidos', () => {
      expect(isDistrictExcludedFromExpress('Puente Piedra')).toBe(true)
      expect(isDistrictExcludedFromExpress('ventanilla')).toBe(true)
      expect(isDistrictExcludedFromExpress('ANCON')).toBe(true)
    })

    it('debe retornar false para distritos no excluidos', () => {
      expect(isDistrictExcludedFromExpress('Miraflores')).toBe(false)
      expect(isDistrictExcludedFromExpress('San Isidro')).toBe(false)
    })
  })

  describe('getShippingOptions', () => {
    it('debe retornar opciones para Lima con pickup y 2 métodos de envío', () => {
      const options = getShippingOptions('PE', 'Lima', 'Miraflores')
      
      expect(options).toHaveLength(3)
      expect(options[0].id).toBe('pickup')
      expect(options[1].id).toBe('express-lima')
      expect(options[2].id).toBe('regular-lima')
    })

    it('debe excluir express para distritos no cubiertos', () => {
      const options = getShippingOptions('PE', 'Lima', 'Puente Piedra')
      const expressOption = options.find(opt => opt.id === 'express-lima')
      
      expect(expressOption).toBeDefined()
      expect(expressOption?.available).toBe(false)
    })

    it('debe retornar opciones para provincia con pickup y province', () => {
      const options = getShippingOptions('PE', 'Arequipa', 'Cercado')
      
      expect(options).toHaveLength(2)
      expect(options[0].id).toBe('pickup')
      expect(options[1].id).toBe('province')
    })

    it('debe retornar opciones internacionales para otros países', () => {
      const options = getShippingOptions('US', 'California', 'Los Angeles')
      
      expect(options).toHaveLength(2)
      expect(options[0].id).toBe('pickup')
      expect(options[1].id).toBe('international')
      expect(options[1].currency).toBe('USD')
    })
  })

  describe('calculateTotal', () => {
    it('debe sumar correctamente costo de envío en PEN', () => {
      const shippingOption = {
        id: 'regular-lima' as const,
        label: 'Regular',
        description: 'Test',
        cost: 12,
        currency: 'PEN',
        deliveryTime: '3-5 días',
        icon: 'fa-truck',
        available: true
      }
      
      const total = calculateTotal(100, shippingOption)
      expect(total).toBe(112) // 100 + 12
    })

    it('debe convertir USD a PEN al calcular total', () => {
      const shippingOption = {
        id: 'international' as const,
        label: 'Internacional',
        description: 'Test',
        cost: 35,
        currency: 'USD',
        deliveryTime: '15 días',
        icon: 'fa-plane',
        available: true
      }
      
      const total = calculateTotal(100, shippingOption)
      // 100 + (35 * 3.75) = 100 + 131.25 = 231.25
      expect(total).toBe(231.25)
    })

    it('debe retornar solo subtotal si no hay shipping option', () => {
      const total = calculateTotal(100, null)
      expect(total).toBe(100)
    })
  })

  describe('getDefaultDeliveryMethod', () => {
    it('debe retornar regular-lima para Lima', () => {
      expect(getDefaultDeliveryMethod('PE', 'Lima')).toBe('regular-lima')
    })

    it('debe retornar province para provincias de Perú', () => {
      expect(getDefaultDeliveryMethod('PE', 'Arequipa')).toBe('province')
    })

    it('debe retornar international para otros países', () => {
      expect(getDefaultDeliveryMethod('US', 'California')).toBe('international')
      expect(getDefaultDeliveryMethod('AR', 'Buenos Aires')).toBe('international')
    })
  })

  describe('COUNTRIES y PROVINCES', () => {
    it('debe contener Perú en la lista de países', () => {
      const peru = COUNTRIES.find(c => c.code === 'PE')
      expect(peru).toBeDefined()
      expect(peru?.name).toBe('Perú')
      expect(peru?.currency).toBe('PEN')
      expect(peru?.isInternational).toBe(false)
    })

    it('debe tener provincias para Perú', () => {
      expect(PROVINCES.PE).toBeDefined()
      expect(PROVINCES.PE.length).toBeGreaterThan(0)
      expect(PROVINCES.PE[0].name).toBe('Lima')
    })
  })
})