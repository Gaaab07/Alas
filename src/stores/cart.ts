import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Product } from '@/types/product'

export interface CartItem extends Product {
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // Estado
  const items = ref<CartItem[]>([])
  const isCartOpen = ref(false)

  // Computed
  const itemsCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const total = computed(() => {
    // Aquí puedes agregar lógica de impuestos o envío
    return subtotal.value
  })

  // Acciones
  const addItem = (product: Product, quantity: number = 1) => {
    const existingItem = items.value.find(item => item.id === product.id)

    if (existingItem) {
      // Si ya existe, aumentar cantidad (respetando stock)
      if (existingItem.quantity + quantity <= product.stock) {
        existingItem.quantity += quantity
      } else {
        // Opcional: mostrar mensaje de que no hay suficiente stock
        console.warn('No hay suficiente stock disponible')
        existingItem.quantity = product.stock
      }
    } else {
      // Si no existe, agregar nuevo item
      items.value.push({
        ...product,
        quantity: Math.min(quantity, product.stock)
      })
    }

    // Abrir el carrito automáticamente
    isCartOpen.value = true
  }

  const removeItem = (productId: string) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else if (quantity <= item.stock) {
        item.quantity = quantity
      } else {
        item.quantity = item.stock
      }
    }
  }

  const incrementQuantity = (productId: string) => {
    const item = items.value.find(item => item.id === productId)
    if (item && item.quantity < item.stock) {
      item.quantity++
    }
  }

  const decrementQuantity = (productId: string) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        removeItem(productId)
      }
    }
  }

  const clearCart = () => {
    items.value = []
  }

  const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
  }

  const openCart = () => {
    isCartOpen.value = true
  }

  const closeCart = () => {
    isCartOpen.value = false
  }

  return {
    // Estado
    items,
    isCartOpen,
    
    // Computed
    itemsCount,
    subtotal,
    total,
    
    // Acciones
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart
  }
})