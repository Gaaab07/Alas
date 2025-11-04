import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 100,
    stock: 10,
    category: 'test',
    created_at: new Date().toISOString()
  }

  it('debe inicializar con carrito vacío', () => {
    const store = useCartStore()
    expect(store.items).toEqual([])
    expect(store.itemsCount).toBe(0)
    expect(store.total).toBe(0)
  })

  it('debe calcular el total correctamente', () => {
    const store = useCartStore()
    store.items = [
      { ...mockProduct, quantity: 2 },
      { ...mockProduct, id: '2', price: 50, quantity: 1 }
    ]
    expect(store.total).toBe(250) // (100 * 2) + (50 * 1)
  })

  it('debe contar items correctamente', () => {
    const store = useCartStore()
    store.items = [
      { ...mockProduct, quantity: 2 },
      { ...mockProduct, id: '2', quantity: 3 }
    ]
    expect(store.itemsCount).toBe(5)
  })

  it('debe eliminar un item correctamente', () => {
    const store = useCartStore()
    store.items = [
      { ...mockProduct, quantity: 1 },
      { ...mockProduct, id: '2', quantity: 1 }
    ]
    store.removeItem('1')
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe('2')
  })

  it('debe actualizar cantidad correctamente', () => {
    const store = useCartStore()
    store.items = [{ ...mockProduct, quantity: 1 }]
    store.updateQuantity('1', 5)
    expect(store.items[0].quantity).toBe(5)
  })

  it('debe eliminar item si cantidad es 0', () => {
    const store = useCartStore()
    store.items = [{ ...mockProduct, quantity: 1 }]
    store.updateQuantity('1', 0)
    expect(store.items).toHaveLength(0)
  })

  it('debe limpiar el carrito', () => {
    const store = useCartStore()
    store.items = [{ ...mockProduct, quantity: 1 }]
    store.clearCart()
    expect(store.items).toEqual([])
  })

  it('debe incrementar cantidad', () => {
    const store = useCartStore()
    store.items = [{ ...mockProduct, quantity: 1 }]
    store.incrementQuantity('1')
    expect(store.items[0].quantity).toBe(2)
  })

  it('NO debe incrementar si excede stock', () => {
    const store = useCartStore()
    store.items = [{ ...mockProduct, stock: 5, quantity: 5 }]
    store.incrementQuantity('1')
    expect(store.items[0].quantity).toBe(5)
  })

  it('debe decrementar cantidad', () => {
    const store = useCartStore()
    store.items = [{ ...mockProduct, quantity: 2 }]
    store.decrementQuantity('1')
    expect(store.items[0].quantity).toBe(1)
  })

  it('debe eliminar si decrementa a 0', () => {
    const store = useCartStore()
    store.items = [{ ...mockProduct, quantity: 1 }]
    store.decrementQuantity('1')
    expect(store.items).toHaveLength(0)
  })

  it('debe abrir/cerrar carrito', () => {
    const store = useCartStore()
    expect(store.isCartOpen).toBe(false)
    store.openCart()
    expect(store.isCartOpen).toBe(true)
    store.closeCart()
    expect(store.isCartOpen).toBe(false)
  })
})