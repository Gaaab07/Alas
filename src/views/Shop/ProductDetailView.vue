<template>
  <div class="product-detail-container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando producto...</p>
    </div>

    <div v-else-if="!product" class="text-center py-5">
      <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
      <h3 class="mt-3">Producto no encontrado</h3>
      <router-link to="/shop" class="btn btn-primary mt-3">Volver a la tienda</router-link>
    </div>

    <div v-else class="row g-0 product-detail-row">
      <div class="col-lg-6 product-image-section">
        <div class="image-container">
          <img 
            v-if="currentVariant?.image_url" 
            :src="currentVariant.image_url" 
            :alt="product.name"
            loading="lazy"
            class="product-image"
            @error="handleImageError"
          />
          <div v-else class="no-image">
            <i class="bi bi-image" style="font-size: 6rem;"></i>
            <p>Sin imagen disponible</p>
          </div>
        </div>
      </div>

      <div class="col-lg-6 product-info-section">
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price">
            S/. {{ product.price.toFixed(2) }}
          </div>

          <div class="product-description" v-if="product.description">
            <p>{{ product.description }}</p>
          </div>

          <div v-if="product.color || product.category" class="product-specs">
            <h6 class="mb-3 text-white">Detalles:</h6>
            <div class="specs-grid">
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

          <div class="size-selector mb-4">
            <h6>Talla</h6>
            <div v-if="loadingVariants" class="text-muted-custom">
              <i class="bi bi-hourglass-split me-2"></i>Cargando tallas...
            </div>
            <div v-else class="size-options">
              <button 
                v-for="size in availableSizes" 
                :key="size.name"
                class="size-option"
                :class="{ 
                  active: selectedSize === size.name,
                  disabled: size.stock === 0
                }"
                :disabled="size.stock === 0"
                @click="selectSize(size)"
              >
                {{ size.name }}
                <span v-if="size.stock === 0" class="stock-badge">Agotado</span>
              </button>
            </div>
            <p v-if="!selectedSize" class="text-muted-custom small mt-2">
              <i class="bi bi-info-circle"></i>
              Selecciona una talla disponible para continuar.
            </p>
           
          </div>

          <div class="quantity-selector mb-4">
            <h6>Cantidad</h6>
            <div class="input-group">
              <button 
                class="btn btn-outline-secondary" 
                type="button"
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              >
                <i class="fa-solid fa-minus"></i>
              </button>
              <input 
                type="number" 
                class="form-control text-center" 
                v-model.number="quantity"
                min="1"
                :max="maxStock"
                readonly
              />
              <button 
                class="btn btn-outline-secondary" 
                type="button"
                @click="increaseQuantity"
                :disabled="quantity >= maxStock"
              >
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
            <p class="text-muted-custom small mt-2">
              Stock disponible: {{ maxStock }} unidades
            </p>
          </div>

          <div class="action-buttons">
            <button 
              class="btn btn-primary btn-lg w-100 mb-3"
              @click="addToCart"
              :disabled="!selectedSize || maxStock === 0 || isAdding"
            >
              <span v-if="isAdding">
                <i class="bi bi-hourglass-split me-2"></i>
                Añadiendo...
              </span>
              <span v-else>
                <i class="bi bi-cart-plus me-2"></i>
                {{ maxStock === 0 ? 'Agotado' : 'COMPRAR AHORA' }}
              </span>
            </button>
            
            <button class="btn btn-outline-secondary btn-lg w-100">
              <i class="bi bi-heart me-2"></i>
              Agregar a favoritos
            </button>
          </div>

          <Transition name="fade">
            <div v-if="showSuccessMessage" class="alert alert-success-custom mt-3">
              <i class="bi bi-check-circle-fill me-2"></i>
              {{ quantity > 1 ? `${quantity} productos agregados` : 'Producto agregado' }} al carrito
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'
import '@/assets/Styles/product-detail.css'

const route = useRoute()
const cartStore = useCartStore()

const product = ref<Product | null>(null)
const loading = ref(true)
const loadingVariants = ref(false)
const selectedSize = ref('')
const quantity = ref(1)
const showSuccessMessage = ref(false)
const isAdding = ref(false)
const productVariants = ref<Product[]>([])
const availableSizes = ref<{ name: string, stock: number, variantId: string }[]>([])

const currentVariant = computed(() => {
  if (!selectedSize.value) return product.value
  return productVariants.value.find(v => v.size === selectedSize.value) || product.value
})

const maxStock = computed(() => {
  const size = availableSizes.value.find(s => s.name === selectedSize.value)
  return size ? size.stock : 0
})

const loadProductVariants = async (baseProduct: Product) => {
  loadingVariants.value = true
  try {
    if (baseProduct.product_group) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_group', baseProduct.product_group)
        .order('size', { ascending: true })
      if (error) throw error
      productVariants.value = data || []
    } else {
      const baseName = baseProduct.name.replace(/ - Talla .*/i, '').trim()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `${baseName}%`)
        .order('size', { ascending: true })
      if (error) throw error
      productVariants.value = data || []
    }

    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    const sizesMap = new Map<string, { stock: number, variantId: string }>()

    productVariants.value.forEach(variant => {
      if (variant.size) {
        sizesMap.set(variant.size, {
          stock: variant.stock,
          variantId: variant.id
        })
      }
    })

    availableSizes.value = sizeOrder
      .filter(size => sizesMap.has(size))
      .map(size => ({
        name: size,
        stock: sizesMap.get(size)!.stock,
        variantId: sizesMap.get(size)!.variantId
      }))

    const firstAvailable = availableSizes.value.find(s => s.stock > 0)
    if (firstAvailable) selectedSize.value = firstAvailable.name
    else selectedSize.value = ''
  } catch {
    availableSizes.value = []
  } finally {
    loadingVariants.value = false
  }
}

const selectSize = (size: { name: string, stock: number, variantId: string }) => {
  if (size.stock > 0) {
    selectedSize.value = size.name
    if (quantity.value > size.stock) {
      quantity.value = size.stock
    }
  }
}

const fetchProduct = async () => {
  loading.value = true
  product.value = null
  const productId = route.params.id as string
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
    if (error) throw error
    product.value = data
    quantity.value = 1
    showSuccessMessage.value = false
    await loadProductVariants(data)
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

const increaseQuantity = () => {
  if (quantity.value < maxStock.value) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = async () => {
  if (!selectedSize.value) {
    alert('Por favor selecciona una talla')
    return
  }
  if (!currentVariant.value) return
  isAdding.value = true
  cartStore.addItem(currentVariant.value, quantity.value)
  showSuccessMessage.value = true
  setTimeout(() => {
    isAdding.value = false
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }, 500)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchProduct()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
)

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
