<template>
  <div>
    <!-- Hero video -->
    <HeroVideo />

    <!-- Sección de productos -->
    <section class="py-5">
      <div class="container-fluid px-4 px-lg-5 mt-5">
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-content-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando productos...</span>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Error al cargar productos</h4>
          <p>{{ error }}</p>
          <hr>
          <button @click="fetchProducts" class="btn btn-outline-danger">
            <i class="fas fa-redo"></i> Intentar de nuevo
          </button>
        </div>

        <!-- Products grid -->
        <div v-else>
          <div v-if="products.length === 0" class="text-center py-5">
            <h3 class="text-muted">No hay productos disponibles</h3>
            <p class="text-muted">Los productos aparecerán aquí cuando estén disponibles.</p>
          </div>
          
          <div v-else class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :id="product.id"
              :name="product.name"
              :description="product.description"
              :price="product.price"
              :stock="product.stock"
              :category="product.category"
              :size="product.size"
              :color="product.color"
              :image_url="product.image_url"
              @add-to-cart="(productId) => console.log('Producto añadido:', productId)"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import HeroVideo from '@/components/HeroVideo.vue'
import ProductCard from '@/components/ShopProductCard.vue'

// Types
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
  created_at: string
}

// Reactive data
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Methods
const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0) // Solo productos con stock disponible
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    products.value = data || []
    
    // Debug: Ver los datos que llegan
    console.log('Productos cargados:', products.value)
    products.value.forEach((product, index) => {
      console.log(`Producto ${index + 1}:`, {
        name: product.name,
        image_url: product.image_url,
        price: product.price
      })
    })
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido al cargar productos'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchProducts()
})

// Expose methods for potential parent component use
defineExpose({
  fetchProducts,
  products,
  loading
})
</script>

<style scoped>
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  margin: 2rem 0;
}

/* Opcional: Estilos para mejorar la UX */
.row > * {
  margin-bottom: 2rem;
}

@media (max-width: 576px) {
  .container-fluid {
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>