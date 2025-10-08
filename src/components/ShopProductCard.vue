<template>
  <div class="product-card">
    <!-- Badge de agotado -->
    <div v-if="stock === 0" class="badge-agotado">
      Agotado
    </div>

    <!-- Imagen del producto -->
    <div class="product-image-wrapper" @click="goToDetail">
      <img 
        :src="image_url || 'https://dummyimage.com/400x400/dee2e6/6c757d.jpg'"
        :alt="name"
        class="product-image"
      />
      
      <!-- Overlay con botón al hacer hover -->
      <div class="product-overlay">
        <button 
          class="btn-add-cart"
          :disabled="stock === 0"
          @click.stop="handleAddToCart"
        >
          <i class="fa-solid fa-shopping-cart me-2"></i>
          {{ stock === 0 ? 'Agotado' : 'Agregar' }}
        </button>
      </div>
    </div>

    <!-- Información del producto -->
    <div class="product-info" @click="goToDetail">
      <h3 class="product-name">{{ name }}</h3>
      <p class="product-price">S/. {{ price.toFixed(2) }} PEN</p>
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
</script>

<style scoped>
.product-card {
  position: relative;
  background-color: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.badge-agotado {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: #1a1a1a;
  color: #fff;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 1px;
  z-index: 10;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Aspect ratio 1:1 */
  background-color: #e5e5e5;
  overflow: hidden;
  cursor: pointer;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 2rem 1rem 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.btn-add-cart {
  background-color: #fff;
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-add-cart:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.btn-add-cart:disabled {
  background-color: #666;
  color: #999;
  cursor: not-allowed;
}

.product-info {
  padding: 1.25rem 1rem;
  cursor: pointer;
}

.product-name {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 400;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.product-price {
  color: #999;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 300;
}

/* Responsive */
@media (max-width: 768px) {
  .product-info {
    padding: 1rem 0.75rem;
  }
  
  .product-name {
    font-size: 0.875rem;
  }
  
  .product-price {
    font-size: 0.8rem;
  }
  
  .btn-add-cart {
    padding: 0.625rem 1rem;
    font-size: 0.75rem;
  }
}
</style>