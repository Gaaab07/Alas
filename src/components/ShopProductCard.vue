<template>
  <div class="col mb-5">
    <div class="card h-100">
      <!-- Sale badge - se muestra si hay stock bajo o está en oferta -->
      <div v-if="showSaleBadge" class="badge bg-dark text-white position-absolute" style="top: 0.5rem; right: 0.5rem">
        {{ stock < 5 ? 'Stock bajo' : 'Oferta' }}
      </div>
      
      <!-- Imagen del producto - clickeable para ir al detalle -->
      <div class="image-wrapper" @click="goToDetail">
        <img 
          class="card-img-top"
          :src="image_url || 'https://dummyimage.com/450x300/dee2e6/6c757d.jpg'"
          :alt="name"
          style="height: 300px; object-fit: cover;"
        />
      </div>
      
      <!-- Contenido del card - clickeable para ir al detalle -->
      <div class="card-body p-4" @click="goToDetail" style="cursor: pointer;">
        <div class="text-center">
          <!-- Nombre del producto -->
          <h5 class="fw-bolder">{{ name }}</h5>
          
          <!-- Categoría -->
          <p class="text-muted small mb-2">{{ category }}</p>
          
          <!-- Descripción (si existe) -->
          <p v-if="description" class="card-text small text-muted mb-2">
            {{ truncatedDescription }}
          </p>
          
          <!-- Detalles del producto (talla y color) -->
          <div v-if="size || color" class="mb-2">
            <small class="text-muted">
              <span v-if="size">Talla: {{ size }}</span>
              <span v-if="size && color"> | </span>
              <span v-if="color">Color: {{ color }}</span>
            </small>
          </div>
          
          <!-- Precio -->
          <div class="fw-bolder text-primary fs-5">
            {{ formattedPrice }}
          </div>
          
          <!-- Stock disponible -->
          <small class="text-muted">
            {{ stock > 0 ? `${stock} disponibles` : 'Sin stock' }}
          </small>
        </div>
      </div>
      
      <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
        <div class="text-center">
          <!-- Botón Ver Detalles -->
          <button 
            class="btn btn-outline-primary w-100 mb-2"
            @click="goToDetail"
          >
            <i class="bi bi-eye me-2"></i>Ver Detalles
          </button>
          
          <!-- Botón Añadir al carrito -->
          <button 
            class="btn mt-auto w-100"
            :class="stock > 0 ? 'btn-outline-dark' : 'btn-secondary'"
            :disabled="stock === 0"
            @click.stop="handleAddToCart"
          >
            {{ stock > 0 ? 'Añadir al carrito' : 'Sin stock' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// Props que coinciden exactamente con tu tabla de productos
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

// Computed properties
const formattedPrice = computed(() => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(props.price)
})

const showSaleBadge = computed(() => {
  return props.stock < 5 && props.stock > 0 // Muestra badge si stock es bajo
})

const truncatedDescription = computed(() => {
  if (!props.description) return ''
  return props.description.length > 80 
    ? props.description.substring(0, 80) + '...'
    : props.description
})

// Events
const emit = defineEmits<{
  addToCart: [productId: string]
}>()

// Navegar al detalle del producto
const goToDetail = () => {
  router.push({ name: 'product-detail', params: { id: props.id } })
}

const handleAddToCart = () => {
  if (props.stock > 0) {
    emit('addToCart', props.id)
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

/* Efecto hover en el botón Ver Detalles */
.btn-outline-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

/* Estilos responsive */
@media (max-width: 576px) {
  .card-img-top {
    height: 200px;
  }
}
</style>