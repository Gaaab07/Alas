<template>
  <!-- Overlay oscuro -->
  <Transition name="fade">
    <div 
      v-if="isOpen" 
      class="search-overlay"
      @click="closeSearch"
    ></div>
  </Transition>

  <!-- Barra de búsqueda -->
  <Transition name="slide-down">
    <div v-if="isOpen" class="search-container">
      <div class="container-fluid px-4 px-lg-5">
        <div class="search-wrapper">
          <!-- Input de búsqueda -->
          <div class="search-input-group">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Buscar productos..."
              @input="handleSearch"
            />
            <button 
              v-if="searchQuery"
              class="clear-btn"
              @click="clearSearch"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
            <button class="close-btn" @click="closeSearch">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <!-- Resultados de búsqueda -->
          <div v-if="searchQuery" class="search-results">
            <!-- Loading -->
            <div v-if="isSearching" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Buscando...</span>
              </div>
              <p class="text-muted small mt-2">Buscando productos...</p>
            </div>

            <!-- Sin resultados -->
            <div v-else-if="searchResults.length === 0" class="no-results">
              <i class="fa-solid fa-search fa-2x text-muted mb-3"></i>
              <p class="text-muted">No se encontraron productos para "{{ searchQuery }}"</p>
            </div>

            <!-- Lista de resultados -->
            <div v-else class="results-list">
              <p class="results-header">
                <strong>PRODUCTOS</strong>
                <span class="text-muted">({{ searchResults.length }} resultados)</span>
              </p>
              
              <div 
                v-for="product in searchResults" 
                :key="product.id"
                class="result-item"
                @click="goToProduct(product.id)"
              >
                <div class="result-image">
                  <img 
                    :src="product.image_url || 'https://dummyimage.com/60x60/dee2e6/6c757d.jpg'" 
                    :alt="product.name"
                  />
                </div>
                <div class="result-info">
                  <h6>{{ product.name }}</h6>
                  <p class="text-muted small mb-1">{{ product.category }}</p>
                  <p class="result-price">S/. {{ product.price.toFixed(2) }}</p>
                </div>
                <div class="result-arrow">
                  <i class="fa-solid fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Sugerencias cuando no hay búsqueda -->
          <div v-else class="search-suggestions">
            <p class="suggestions-header">BÚSQUEDAS POPULARES</p>
            <div class="suggestions-list">
              <button 
                v-for="suggestion in popularSearches" 
                :key="suggestion"
                class="suggestion-tag"
                @click="searchQuery = suggestion; handleSearch()"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import '@/assets/styles/search-bar.css'

interface Product {
  id: string
  name: string
  category: string
  price: number
  image_url: string | null
}

const router = useRouter()

const isOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<Product[]>([])
const isSearching = ref(false)
const searchInput = ref<HTMLInputElement>()

const popularSearches = [
  'pantalon',
  'chaqueta',
  'camiseta',
  'sudadera',
  'gorra'
]

let searchTimeout: NodeJS.Timeout | null = null

const openSearch = () => {
  isOpen.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const closeSearch = () => {
  isOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchInput.value?.focus()
}

const handleSearch = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      isSearching.value = true

      const query = searchQuery.value.toLowerCase().trim()

      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price, image_url')
        .gt('stock', 0)
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)

      if (error) throw error

      searchResults.value = data || []
    } catch {
      //console.error('Error buscando productos:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const goToProduct = (productId: string) => {
  closeSearch()
  router.push({ name: 'product-detail', params: { id: productId } })
}

// Exponer función para abrir desde el padre
defineExpose({
  openSearch
})

// Cerrar con tecla Escape
watch(isOpen, (newValue) => {
  if (newValue) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch()
      }
    }
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }
})
</script>