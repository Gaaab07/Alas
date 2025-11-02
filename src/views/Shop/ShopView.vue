<template>
  <div class="shop-main-container">
    <!-- Hero video -->
    <HeroVideo />
    
    <!-- Sección de productos -->
    <section class="py-5">
      <div class="container-fluid px-4 px-lg-5">
        <h1 class="modern-section-title">Productos destacados</h1>
        
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
          <div v-if="products.length === 0" class="modern-empty-state">
            <h3>No hay productos disponibles</h3>
            <p>Los productos aparecerán aquí cuando estén disponibles.</p>
          </div>
                    
          <div v-else class="modern-products-grid">
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
import HeroVideo from '@/components/HeroVideo.vue'
import ProductCard from '@/components/ShopProductCard.vue'
import '@/assets/Styles/shop-products.css'

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
      .order('created_at', { ascending: false })
      .limit(8)  // Solo obtener 6 productos
    
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

onMounted(() => {
  fetchProducts()
})

defineExpose({
  fetchProducts,
  products,
  loading
})
</script>

<style scoped>
/* Estilos específicos si son necesarios */
</style>