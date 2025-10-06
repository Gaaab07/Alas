<template>
  <div class="col mb-5">
    <div class="card h-100">
      <!-- Sale badge -->
      <div v-if="showSaleBadge" class="badge bg-dark text-white position-absolute" style="top: 0.5rem; right: 0.5rem">
        {{ stock < 5 ? 'Stock bajo' : 'Oferta' }}
      </div>
      
      <!-- Added to cart badge -->
      <Transition name="badge-pop">
        <div v-if="showAddedBadge" class="badge bg-success text-white position-absolute" style="top: 0.5rem; left: 0.5rem">
          <i class="fa-solid fa-check me-1"></i> Añadido
        </div>
      </Transition>
      
      <!-- Imagen del producto -->
      <div class="image-wrapper" @click="goToDetail">
        <img 
          class="card-img-top"
          :src="image_url || 'https://dummyimage.com/450x300/dee2e6/6c757d.jpg'"
          :alt="name"
          style="height: 300px; object-fit: cover;"
        />
      </div>
      
      <!-- Contenido del card -->
      <div class="card-body p-4" @click="goToDetail" style="cursor: pointer;">
        <div class="text-center">
          <h5 class="fw-bolder">{{ name }}</h5>
          <p class="text-muted small mb-2">{{ category }}</p>
          
          <p v-if="description" class="card-text small text-muted mb-2">
            {{ truncatedDescription }}
          </p>
          
          <div v-if="size || color" class="mb-2">
            <small class="text-muted">
              <span v-if="size">Talla: {{ size }}</span>
              <span v-if="size && color"> | </span>
              <span v-if="color">Color: {{ color }}</span>
            </small>
          </div>
          
          <div class="fw-bolder text-primary fs-5">
            {{ formattedPrice }}
          </div>
          
          <small class="text-muted">
            {{ stock > 0 ? `${stock} disponibles` : 'Sin stock' }}
          </small>
        </div>
      </div>
      
      <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
        <div class="text-center">
          <button 
            class="btn btn-outline-primary w-100 mb-2"
            @click="goToDetail"
          >
            <i class="bi bi-eye me-2"></i>Ver Detalles
          </button>
          
          <button 
            class="btn mt-auto w-100"
            :class="stock > 0 ? 'btn-outline-dark' : 'btn-secondary'"
            :disabled="stock === 0 || isAdding"
            @click.stop="handleAddToCart"
          >
            <span v-if="isAdding">
              <i class="fa-solid fa-spinner fa-spin me-2"></i>Añadiendo...
            </span>
            <span v-else>
              {{ stock > 0 ? 'Añadir al carrito' : 'Sin stock' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

// Estados locales
const isAdding = ref(false)
const showAddedBadge = ref(false)

// Computed properties
const formattedPrice = computed(() => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(props.price)
})

const showSaleBadge = computed(() => {
  return props.stock < 5 && props.stock > 0
})

const truncatedDescription = computed(() => {
  if (!props.description) return ''
  return props.description.length > 80 
    ? props.description.substring(0, 80) + '...'
    : props.description
})

// Navegar al detalle
const goToDetail = () => {
  router.push({ name: 'product-detail', params: { id: props.id } })
}

// Añadir al carrito
const handleAddToCart = async () => {
  if (props.stock > 0 && !isAdding.value) {
    isAdding.value = true
    
    // Crear objeto producto completo
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
    
    // Añadir al carrito
    cartStore.addItem(product, 1)
    
    // Mostrar badge de confirmación
    showAddedBadge.value = true
    
    // Simular un pequeño delay para feedback visual
    setTimeout(() => {
      isAdding.value = false
      
      // Ocultar badge después de 2 segundos
      setTimeout(() => {
        showAddedBadge.value = false
      }, 2000)
    }, 500)
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.image-wrapper {
  cursor: pointer;
  overflow: hidden;
}

.image-wrapper img {
  transition: transform 0.3s ease;
}

.image-wrapper:hover img {
  transform: scale(1.05);
}

.btn:disabled {
  cursor: not-allowed;
}

.badge {
  z-index: 10;
}

.btn-outline-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

/* Animación del badge de "Añadido" */
.badge-pop-enter-active {
  animation: badge-pop 0.3s ease-out;
}

.badge-pop-leave-active {
  animation: badge-pop 0.3s ease-out reverse;
}

@keyframes badge-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 576px) {
  .card-img-top {
    height: 200px;
  }
}
</style>