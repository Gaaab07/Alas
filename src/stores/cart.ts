import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
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
    return subtotal.value
  })

  // Acciones
  const addItem = async (product: Product, quantity: number = 1) => {
    try {
      const { data: currentProduct, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product.id)
        .single()

      if (error) throw error

      if (!currentProduct) {
        alert('Producto no encontrado')
        return
      }

      product.stock = currentProduct.stock

      if (currentProduct.stock === 0) {
        alert('Este producto está agotado')
        return
      }

      const existingItem = items.value.find(item => item.id === product.id)

      if (existingItem) {
        const totalQuantity = existingItem.quantity + quantity
        
        if (totalQuantity <= currentProduct.stock) {
          existingItem.quantity = totalQuantity
          existingItem.stock = currentProduct.stock
        } else {
          alert(`⚠️ Solo hay ${currentProduct.stock} unidades disponibles`)
          existingItem.quantity = currentProduct.stock
          existingItem.stock = currentProduct.stock
        }
      } else {
        if (quantity <= currentProduct.stock) {
          items.value.push({
            ...product,
            stock: currentProduct.stock,
            quantity: quantity
          })
        } else {
          alert(`⚠️ Solo hay ${currentProduct.stock} unidades disponibles`)
          items.value.push({
            ...product,
            stock: currentProduct.stock,
            quantity: currentProduct.stock
          })
        }
      }

      isCartOpen.value = true
    } catch {
      alert('❌ Error al verificar disponibilidad del producto')
    }
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
        alert(`⚠️ Solo hay ${item.stock} unidades disponibles`)
      }
    }
  }

  const incrementQuantity = (productId: string) => {
    const item = items.value.find(item => item.id === productId)
    if (item && item.quantity < item.stock) {
      item.quantity++
    } else if (item) {
      alert(`⚠️ Solo hay ${item.stock} unidades disponibles`)
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