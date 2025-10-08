<template>
  <div class="products-view">
    <!-- Header de la página -->
    <div class="products-header">
      <div class="container-fluid px-4 px-lg-5">
        <h1 class="products-title">Productos destacados</h1>
      </div>
    </div>

    <!-- Sección de productos -->
    <section class="products-section">
      <div class="container-fluid px-4 px-lg-5">
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-content-center py-5">
          <div class="spinner-border text-light" role="status">
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
            <h3 class="text-light">No hay productos disponibles</h3>
            <p class="text-muted">Los productos aparecerán aquí cuando estén disponibles.</p>
          </div>
          
          <div v-else class="products-grid">
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
import ProductCard from '@/components/ShopProductCard.vue'

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

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    products.value = data || []
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido al cargar productos'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-view {
  background-color: #1a1a1a;
  min-height: 100vh;
  padding-top: 80px; /* Espacio para el navbar */
}

.products-header {
  padding: 3rem 0 2rem;
  background: linear-gradient(180deg, #000 0%, #1a1a1a 100%);
}

.products-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: 2px;
  margin: 0;
}

.products-section {
  padding: 3rem 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Responsive */
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  .products-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>