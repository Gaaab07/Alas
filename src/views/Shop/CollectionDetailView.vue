<template>
  <div class="collection-detail-view">
    <div class="container-fluid px-4 px-lg-5">
      <!-- Header de la colección -->
      <div class="collection-detail-header">
        <router-link to="/collections" class="btn-back">
          <i class="fa-solid fa-arrow-left me-2"></i>
          Volver a colecciones
        </router-link>
        
        <h1 class="collection-detail-title">{{ collectionTitle }}</h1>
        <p class="collection-detail-subtitle">{{ collectionSubtitle }}</p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando productos...</span>
        </div>
      </div>

      <!-- Sin productos -->
      <div v-else-if="products.length === 0" class="empty-collection">
        <i class="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
        <h3>No hay productos en esta colección</h3>
        <p class="text-muted">Pronto agregaremos nuevos productos.</p>
        <router-link to="/shop" class="btn btn-primary mt-3">
          Ver toda la tienda
        </router-link>
      </div>

      <!-- Grid de productos -->
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
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
  collection: string | null
}

const route = useRoute()
const products = ref<Product[]>([])
const loading = ref(true)

const collectionName = computed(() => route.params.collection as string)

const collectionTitle = computed(() => {
  const titles: Record<string, string> = {
    'verano': 'COLECCIÓN VERANO',
    'invierno': 'COLECCIÓN INVIERNO',
    'primavera': 'COLECCIÓN PRIMAVERA',
    'otono': 'COLECCIÓN OTOÑO',
    'all-products': 'TODOS LOS PRODUCTOS'
  }
  return titles[collectionName.value] || 'COLECCIÓN'
})

const collectionSubtitle = computed(() => {
  const subtitles: Record<string, string> = {
    'verano': 'Frescura y estilo para los días de sol',
    'invierno': 'Calidez y confort para el frío',
    'primavera': 'Versatilidad para el cambio de estación',
    'otono': 'Elegancia para la transición',
    'all-products': 'Explora todo nuestro catálogo'
  }
  return subtitles[collectionName.value] || ''
})

const fetchProducts = async () => {
  try {
    loading.value = true

    let query = supabase
      .from('products')
      .select('*')
      

    if (collectionName.value !== 'all-products') {
      query = query.eq('collection', collectionName.value)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    products.value = data || []
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

watch(collectionName, () => {
  fetchProducts()
})

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.collection-detail-view {
  min-height: 100vh;
  background-color: #1a1a1a;
  padding-top: 100px;
  padding-bottom: 60px;
}

.collection-detail-header {
  margin-bottom: 3rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  margin-bottom: 2rem;
  transition: color 0.3s;
}

.btn-back:hover {
  color: #0d6efd;
}

.collection-detail-title {
  color: #fff;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: 3px;
}

.collection-detail-subtitle {
  color: #999;
  font-size: 1.2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.empty-collection {
  text-align: center;
  padding: 5rem 1rem;
  color: #fff;
}

@media (max-width: 768px) {
  .collection-detail-title {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
</style>