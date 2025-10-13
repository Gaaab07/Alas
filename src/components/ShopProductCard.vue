<template>
  <div class="modern-product-card">
    <!-- Badge de agotado -->
    <div v-if="stock === 0" class="modern-badge-agotado">
      Agotado
    </div>

    <!-- Imagen del producto -->
    <div class="modern-image-wrapper" @click="goToDetail">
      <img 
        :src="image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop'"
        :alt="name"
        class="modern-product-image"
        @error="handleImageError"
        loading="lazy" 
      />
      
      <!-- Overlay con botón al hacer hover -->
      <div class="modern-overlay">
        <button 
          class="modern-btn-cart"
          :disabled="stock === 0"
          @click.stop="handleAddToCart"
        >
          <i class="fa-solid fa-shopping-cart me-2"></i>
          {{ stock === 0 ? 'Agotado' : 'Agregar' }}
        </button>
      </div>
    </div>

    <!-- Información del producto -->
    <div class="modern-product-info" @click="goToDetail">
      <h3 class="modern-product-name">{{ name }}</h3>
      <p class="modern-product-price">S/. {{ price.toFixed(2) }} PEN</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'

const props = defineProps<{
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  category: string
  size?: string | null
  color?: string | null
  image_url?: string | null
}>()

const router = useRouter()
const cartStore = useCartStore()

const isAdding = ref(false)

const goToDetail = () => {
  router.push({ name: 'product-detail', params: { id: props.id } })
}

const handleAddToCart = async () => {
  if (props.stock > 0 && !isAdding.value) {
    isAdding.value = true
    
    const product: Product = {
      id: props.id,
      name: props.name,
      description: props.description || undefined,
      price: props.price,
      stock: props.stock,
      category: props.category,
      size: props.size || undefined,
      color: props.color || undefined,
      image_url: props.image_url || undefined,
      created_at: new Date().toISOString()
    }
    
    cartStore.addItem(product, 1)
    
    setTimeout(() => {
      isAdding.value = false
    }, 500)
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement | null
  if (target) {
    // Imagen placeholder moderna
    target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop'
  }
}
</script>

<style scoped>
/* Los estilos están en shop-products.css */
/* Este componente usa las clases: modern-product-card, modern-badge-agotado, etc. */
</style>