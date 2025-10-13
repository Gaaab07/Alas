<template>
  <div class="shop-main-container">
    <!-- Header de la página -->
    <div class="products-header">
      <div class="container-fluid px-4 px-lg-5">
        <h1 class="modern-section-title">Productos destacados</h1>
      </div>
    </div>
    
    <!-- Sección de productos -->
    <section>
      <div class="container-fluid px-4 px-lg-5">
        <!-- Loading state -->
        <div v-if="loading" class="modern-loading-container">
          <div class="modern-spinner"></div>
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
          <div v-if="totalProducts === 0" class="modern-empty-state">
            <h3>No hay productos disponibles</h3>
            <p>Los productos aparecerán aquí cuando estén disponibles.</p>
          </div>
                    
          <div v-else>
            <div class="modern-products-grid">
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
            
            <!-- Paginación -->
            <div class="pagination-container">
              <button 
                class="pagination-arrow"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <div class="pagination-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  class="pagination-number"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
              </div>
              
              <button 
                class="pagination-arrow"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import ProductCard from '@/components/ShopProductCard.vue'
import '@/assets/Styles/shop-products.css'
import '@/assets/Styles/pagination.css'

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
const currentPage = ref(1)
const itemsPerPage = 8
const totalProducts = ref(0)

// Computed properties
const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage))

// Páginas visibles en la paginación (máximo 5)
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Obtener el total de productos para la paginación
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gt('stock', 0)
    
    totalProducts.value = count || 0
    
    // Calcular el offset para la paginación
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    
    // Obtener productos con paginación
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (fetchError) {
      throw fetchError
    }
    
    products.value = data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido al cargar productos'
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchProducts()
    // Scroll hacia arriba suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-header {
  padding-top: 100px;
}
</style>