<template>
  <div class="product-detail-container">
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando producto...</p>
    </div>

    <!-- Producto no encontrado -->
    <div v-else-if="!product" class="text-center py-5">
      <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
      <h3 class="mt-3">Producto no encontrado</h3>
      <router-link to="/" class="btn btn-primary mt-3">Volver a la tienda</router-link>
    </div>

    <!-- Detalle del producto -->
    <div v-else class="row g-0 product-detail-row">
      <!-- Imagen del producto -->
      <div class="col-lg-6 product-image-section">
        <div class="image-container">
          <img 
            v-if="product.image_url" 
            :src="product.image_url" 
            :alt="product.name"
            class="product-image"
            @error="handleImageError"
          />
          <div v-else class="no-image">
            <i class="bi bi-image" style="font-size: 6rem;"></i>
            <p>Sin imagen disponible</p>
          </div>
        </div>
      </div>

      <!-- Información del producto -->
      <div class="col-lg-6 product-info-section">
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price">
            S/. {{ product.price.toFixed(2) }}
          </div>

          <div class="product-description" v-if="product.description">
            <p>{{ product.description }}</p>
          </div>

          <!-- Información de medidas (si existen) -->
          <div v-if="product.size || product.color || product.category" class="product-specs">
            <h6 class="fw-bold mb-3">Detalles:</h6>
            <div class="specs-grid">
              <div v-if="product.size" class="spec-item">
                <span class="spec-label">Talla:</span>
                <span class="spec-value">{{ product.size }}</span>
              </div>
              <div v-if="product.color" class="spec-item">
                <span class="spec-label">Color:</span>
                <span class="spec-value">{{ product.color }}</span>
              </div>
              <div v-if="product.category" class="spec-item">
                <span class="spec-label">Categoría:</span>
                <span class="spec-value">{{ product.category }}</span>
              </div>
            </div>
          </div>

          <!-- Selector de talla -->
          <div class="size-selector mb-4">
            <h6>Talla</h6>
            <div class="size-options">
              <button 
                v-for="size in availableSizes" 
                :key="size"
                class="size-option"
                :class="{ active: selectedSize === size }"
                @click="selectedSize = size"
              >
                {{ size }}
              </button>
            </div>
            <p v-if="!selectedSize" class="text-muted-custom small mt-2">
              <i class="bi bi-info-circle"></i>
              Nota: De no encontrar tu talla es porque se encuentra agotada.
            </p>
          </div>

          <!-- Selector de cantidad -->
          <div class="quantity-selector mb-4">
            <h6>Cantidad</h6>
            <div class="input-group">
              <button 
                class="btn btn-outline-secondary" 
                type="button"
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              >
                <i class="bi bi-dash"></i>
              </button>
              <input 
                type="number" 
                class="form-control text-center" 
                v-model.number="quantity"
                min="1"
                :max="product.stock"
              />
              <button 
                class="btn btn-outline-secondary" 
                type="button"
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
              >
                <i class="bi bi-plus"></i>
              </button>
            </div>
            <p class="text-muted-custom small mt-2">
              Stock disponible: {{ product.stock }} unidades
            </p>
          </div>

          <!-- Botones de acción -->
          <div class="action-buttons">
            <button 
              class="btn btn-primary btn-lg w-100 mb-3"
              @click="addToCart"
              :disabled="!selectedSize || product.stock === 0"
            >
              <i class="bi bi-cart-plus me-2"></i>
              {{ product.stock === 0 ? 'Agotado' : 'COMPRAR AHORA' }}
            </button>
            
            <button class="btn btn-outline-secondary btn-lg w-100">
              <i class="bi bi-heart me-2"></i>
              Agregar a favoritos
            </button>
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="showSuccessMessage" class="alert alert-success-custom mt-3">
            <i class="bi bi-check-circle-fill me-2"></i>
            Producto agregado al carrito
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import '@/assets/styles/product-detail.css'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  size: string | null
  color: string | null
  image_url: string | null
}

const route = useRoute()

const product = ref<Product | null>(null)
const loading = ref(true)
const selectedSize = ref('')
const quantity = ref(1)
const showSuccessMessage = ref(false)

const availableSizes = ref(['XS', 'S', 'M', 'L'])

const fetchProduct = async () => {
  loading.value = true
  const productId = route.params.id as string

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) throw error

    product.value = data
    
    if (data.size) {
      selectedSize.value = data.size
    }
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}

const increaseQuantity = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  if (!selectedSize.value) {
    alert('Por favor selecciona una talla')
    return
  }

  console.log('Agregando al carrito:', {
    product: product.value,
    size: selectedSize.value,
    quantity: quantity.value
  })

  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(() => {
  fetchProduct()
})
</script>