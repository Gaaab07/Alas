<template>
  <div class="shop-main-container">
    <!-- Header de la página -->
    <div class="products-header">
      <div class="container-fluid px-4 px-lg-5">
        <div class="header-content">
          <h1 class="modern-section-title">Productos destacados</h1>
          <button class="filter-toggle-btn" @click="toggleFilters">
            <i class="fas fa-filter"></i> Filtros
          </button>
        </div>
      </div>
    </div>
    
    <!-- Sección de productos con filtros -->
    <section>
      <div class="container-fluid px-4 px-lg-5">
        <div class="products-layout">
          <!-- Sidebar de filtros -->
          <aside class="filters-sidebar" :class="{ 'show': showFilters }">
            <div class="filters-header">
              <h3>Filtros</h3>
              <button class="close-filters" @click="showFilters = false">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Resultados -->
            <div class="filter-results">
              <span>{{ totalProducts }} productos</span>
              <button v-if="hasActiveFilters" @click="clearAllFilters" class="clear-all">
                Limpiar todo
              </button>
            </div>

            <!-- Filtro por Colección -->
            <div class="filter-group">
              <h4 class="filter-title">
                <i class="fas fa-calendar-alt"></i> Colección
              </h4>
              <div class="filter-options">
                <label v-for="collection in collections" :key="collection.value" class="filter-checkbox">
                  <input 
                    type="checkbox" 
                    :value="collection.value"
                    v-model="filters.collections"
                    @change="applyFilters"
                  />
                  <span>{{ collection.label }}</span>
                </label>
              </div>
            </div>

            <!-- Filtro por Tipo de Prenda -->
            <div class="filter-group">
              <h4 class="filter-title">
                <i class="fas fa-tshirt"></i> Tipo de Prenda
              </h4>
              <div class="filter-options">
                <label v-for="category in categories" :key="category" class="filter-checkbox">
                  <input 
                    type="checkbox" 
                    :value="category"
                    v-model="filters.categories"
                    @change="applyFilters"
                  />
                  <span>{{ formatCategory(category) }}</span>
                </label>
              </div>
            </div>

            <!-- Filtro por Talla -->
            <div class="filter-group">
              <h4 class="filter-title">
                <i class="fas fa-ruler"></i> Talla
              </h4>
              <div class="filter-options size-options">
                <label v-for="size in sizes" :key="size" class="filter-checkbox size-check">
                  <input 
                    type="checkbox" 
                    :value="size"
                    v-model="filters.sizes"
                    @change="applyFilters"
                  />
                  <span>{{ size }}</span>
                </label>
              </div>
            </div>

            <!-- Filtro por Precio -->
            <div class="filter-group">
              <h4 class="filter-title">
                <i class="fas fa-tag"></i> Precio
              </h4>
              <div class="filter-options">
                <label v-for="range in priceRanges" :key="range.label" class="filter-checkbox">
                  <input 
                    type="radio" 
                    name="priceRange"
                    :value="range"
                    v-model="filters.priceRange"
                    @change="applyFilters"
                  />
                  <span>{{ range.label }}</span>
                </label>
              </div>
            </div>

            <!-- Filtro por Color -->
            <div class="filter-group">
              <h4 class="filter-title">
                <i class="fas fa-palette"></i> Color
              </h4>
              <div class="filter-options">
                <label v-for="color in availableColors" :key="color" class="filter-checkbox">
                  <input 
                    type="checkbox" 
                    :value="color"
                    v-model="filters.colors"
                    @change="applyFilters"
                  />
                  <span>{{ color }}</span>
                </label>
              </div>
            </div>
          </aside>

          <!-- Contenido principal -->
          <div class="products-content">
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
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros para ver más resultados.</p>
                <button v-if="hasActiveFilters" @click="clearAllFilters" class="btn-clear-filters">
                  Limpiar filtros
                </button>
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
        </div>
      </div>
    </section>

    <!-- Overlay para móvil -->
    <div v-if="showFilters" class="filters-overlay" @click="showFilters = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import ProductCard from '@/components/ShopProductCard.vue'
import '@/assets/Styles/shop-products.css'
import '@/assets/Styles/pagination.css'
import '@/assets/Styles/filters.css'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  collection: string | null
  size: string | null
  color: string | null
  image_url: string | null
  created_at: string
}

interface PriceRange {
  label: string
  min: number
  max: number | null
}

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 8
const totalProducts = ref(0)
const showFilters = ref(false)

// Filtros
const filters = ref({
  collections: [] as string[],
  categories: [] as string[],
  sizes: [] as string[],
  colors: [] as string[],
  priceRange: null as PriceRange | null
})

// Opciones de filtros
const collections = [
  { value: 'verano', label: '☀️ Verano' },
  { value: 'invierno', label: '❄️ Invierno' },
  { value: 'primavera', label: '🌸 Primavera' },
  { value: 'otono', label: '🍂 Otoño' }
]

const categories = ref<string[]>([])
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const availableColors = ref<string[]>([])

const priceRanges: PriceRange[] = [
  { label: 'Menos de S/.50', min: 0, max: 50 },
  { label: 'S/.50 - S/.100', min: 50, max: 100 },
  { label: 'S/.100 - S/.200', min: 100, max: 200 },
  { label: 'Más de S/.200', min: 200, max: null }
]

// Computed properties
const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage))

const hasActiveFilters = computed(() => {
  return filters.value.collections.length > 0 ||
         filters.value.categories.length > 0 ||
         filters.value.sizes.length > 0 ||
         filters.value.colors.length > 0 ||
         filters.value.priceRange !== null
})

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

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const formatCategory = (category: string) => {
  const categories: Record<string, string> = {
    'camiseta': 'Camiseta',
    'polo': 'Polo',
    'camisa': 'Camisa',
    'sudadera': 'Sudadera',
    'sweater': 'Sweater',
    'chaqueta': 'Chaqueta',
    'abrigo': 'Abrigo',
    'pantalon': 'Pantalón',
    'short': 'Short',
    'bermuda': 'Bermuda',
    'gorra': 'Gorra',
    'gorro': 'Gorro',
    'zapatilla': 'Zapatillas',
    'sandalia': 'Sandalias',
    'lentes': 'Lentes'
  }
  return categories[category] || category
}

const fetchFilterOptions = async () => {
  try {
    const { data } = await supabase
      .from('products')
      .select('category, color')
      .gt('stock', 0)
    
    if (data) {
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))]
      const uniqueColors = [...new Set(data.map(p => p.color).filter(Boolean))]
      
      categories.value = uniqueCategories.sort()
      availableColors.value = uniqueColors.sort()
    }
  } catch {
    // Error silencioso para producción
  }
}

const buildQuery = () => {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .gt('stock', 0)

  // Filtro por colección
  if (filters.value.collections.length > 0) {
    query = query.in('collection', filters.value.collections)
  }

  // Filtro por categoría
  if (filters.value.categories.length > 0) {
    query = query.in('category', filters.value.categories)
  }

  // Filtro por talla
  if (filters.value.sizes.length > 0) {
    query = query.in('size', filters.value.sizes)
  }

  // Filtro por color
  if (filters.value.colors.length > 0) {
    query = query.in('color', filters.value.colors)
  }

  // Filtro por precio
  if (filters.value.priceRange) {
    query = query.gte('price', filters.value.priceRange.min)
    if (filters.value.priceRange.max !== null) {
      query = query.lte('price', filters.value.priceRange.max)
    }
  }

  return query
}

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Obtener el total de productos con filtros
    const countQuery = buildQuery()
    const { count } = await countQuery
    
    totalProducts.value = count || 0
    
    // Calcular el offset para la paginación
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    
    // Obtener productos con paginación y filtros
    const dataQuery = buildQuery()
    const { data, error: fetchError } = await dataQuery
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

const applyFilters = () => {
  currentPage.value = 1
  fetchProducts()
  if (window.innerWidth < 992) {
    showFilters.value = false
  }
}

const clearAllFilters = () => {
  filters.value = {
    collections: [],
    categories: [],
    sizes: [],
    colors: [],
    priceRange: null
  }
  currentPage.value = 1
  fetchProducts()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(async () => {
  await fetchFilterOptions()
  await fetchProducts()
})
</script>

<style scoped>
.products-header {
  padding-top: 100px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-toggle-btn {
  display: none;
  background: #fff;
  color: #000;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.filter-toggle-btn:hover {
  background: #000;
  color: #fff;
}

.products-layout {
  display: flex;
  gap: 2rem;
  position: relative;
}

@media (max-width: 991px) {
  .filter-toggle-btn {
    display: block;
  }
  
  .filters-sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
  }
  
  .filters-sidebar.show {
    left: 0;
  }
  
  .filters-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999;
  }
}
</style>