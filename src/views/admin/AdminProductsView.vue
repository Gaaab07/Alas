<template>
  <div class="admin-products-container">
    <div class="container-fluid py-5">
      <h1 class="admin-title mb-5">
        <i class="fa-solid fa-box me-3"></i>
        Panel de Administración - Productos
      </h1>

      <!-- Formulario para agregar/editar productos -->
      <div class="card shadow-sm mb-5">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="fa-solid fa-plus-circle me-2"></i>
            {{ isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto' }}
          </h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="saveProduct">
            <div class="row g-3">
              <!-- Nombre -->
              <div class="col-md-6">
                <label class="form-label fw-bold">Nombre del Producto *</label>
                <input 
                  v-model="form.name"
                  type="text" 
                  class="form-control" 
                  placeholder="Ej: Camiseta Básica"
                  required
                />
              </div>

              <!-- Precio -->
              <div class="col-md-3">
                <label class="form-label fw-bold">Precio ($) *</label>
                <div class="input-group">
                  <span class="input-group-text">S/.</span>
                  <input 
                    v-model.number="form.price"
                    type="number" 
                    step="0.01"
                    class="form-control" 
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <!-- Stock -->
              <div class="col-md-3">
                <label class="form-label fw-bold">Stock *</label>
                <input 
                  v-model.number="form.stock"
                  type="number" 
                  class="form-control" 
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <!-- Descripción -->
              <div class="col-12">
                <label class="form-label fw-bold">Descripción</label>
                <textarea 
                  v-model="form.description"
                  class="form-control" 
                  rows="3"
                  placeholder="Describe el producto..."
                ></textarea>
              </div>

              <!-- Categoría (tipo de prenda) -->
              <div class="col-md-4">
                <label class="form-label fw-bold">Tipo de Prenda *</label>
                <select v-model="form.category" class="form-select" required>
                  <option value="">Seleccionar tipo...</option>
                  <optgroup label="Parte Superior">
                    <option value="camiseta">Camiseta</option>
                    <option value="polo">Polo</option>
                    <option value="camisa">Camisa</option>
                    <option value="sudadera">Sudadera/Hoodie</option>
                    <option value="sweater">Sweater</option>
                    <option value="chaqueta">Chaqueta</option>
                    <option value="abrigo">Abrigo</option>
                  </optgroup>
                  <optgroup label="Parte Inferior">
                    <option value="pantalon">Pantalón</option>
                    <option value="short">Short</option>
                    <option value="bermuda">Bermuda</option>
                  </optgroup>
                  <optgroup label="Accesorios">
                    <option value="gorra">Gorra</option>
                    <option value="gorro">Gorro</option>
                    <option value="zapatilla">Zapatillas</option>
                    <option value="sandalia">Sandalias</option>
                    <option value="lentes">Lentes</option>
                  </optgroup>
                </select>
              </div>

              <!-- COLECCIÓN -->
              <div class="col-md-4">
                <label class="form-label fw-bold">Colección *</label>
                <select v-model="form.collection" class="form-select" required>
                  <option value="">Seleccionar colección...</option>
                  <option value="verano">☀️ Verano</option>
                  <option value="invierno">❄️ Invierno</option>
                  <option value="primavera">🌸 Primavera</option>
                  <option value="otono">🍂 Otoño</option>
                </select>
                <small class="text-muted">Define en qué temporada se vende</small>
              </div>

              <!-- Talla -->
              <div class="col-md-2">
                <label class="form-label fw-bold">Talla</label>
                <select v-model="form.size" class="form-select">
                  <option value="">N/A</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <!-- Color -->
              <div class="col-md-2">
                <label class="form-label fw-bold">Color</label>
                <input 
                  v-model="form.color"
                  type="text" 
                  class="form-control" 
                  placeholder="Negro"
                />
              </div>

              <!-- URL de Imagen -->
              <div class="col-12">
                <label class="form-label fw-bold">URL de la Imagen</label>
                <input 
                  v-model="form.image_url"
                  type="url" 
                  class="form-control" 
                  placeholder="https://example.com/imagen.jpg"
                />
              </div>

              <!-- Preview de imagen -->
              <div class="col-12" v-if="form.image_url">
                <label class="form-label fw-bold">Vista Previa</label>
                <div class="image-preview">
                  <img :src="form.image_url" alt="Preview" @error="handleImageError" />
                </div>
              </div>
            </div>

            <!-- Botones -->
            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <i class="fa-solid" :class="saving ? 'fa-spinner fa-spin' : (isEditing ? 'fa-save' : 'fa-plus')"></i>
                {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Agregar Producto') }}
              </button>
              
              <button 
                v-if="isEditing" 
                type="button" 
                class="btn btn-secondary"
                @click="cancelEdit"
              >
                <i class="fa-solid fa-times"></i>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="card shadow-sm">
        <div class="card-header bg-dark text-white">
          <h5 class="mb-0">
            <i class="fa-solid fa-list me-2"></i>
            Productos Existentes ({{ products.length }})
          </h5>
        </div>
        <div class="card-body">
          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando productos...</span>
            </div>
          </div>

          <!-- Sin productos -->
          <div v-else-if="products.length === 0" class="text-center py-5 text-muted">
            <i class="fa-solid fa-box-open fa-3x mb-3"></i>
            <p>No hay productos agregados aún</p>
          </div>

          <!-- Grid de productos -->
          <div v-else class="row g-4">
            <div v-for="product in products" :key="product.id" class="col-md-6 col-lg-4">
              <div class="product-card">
                <!-- Badge de stock -->
                <div class="stock-badge" :class="getStockClass(product.stock)">
                  Stock: {{ product.stock }}
                </div>

                <!-- Badge de colección -->
                <div class="collection-badge" :class="`collection-${product.collection}`">
                  {{ getCollectionLabel(product.collection) }}
                </div>

                <!-- Imagen -->
                <div class="product-image">
                  <img 
                    :src="product.image_url || 'https://dummyimage.com/300x300/dee2e6/6c757d.jpg'" 
                    :alt="product.name"
                    @error="handleProductImageError"
                  />
                </div>

                <!-- Info -->
                <div class="product-info">
                  <h5 class="product-name">{{ product.name }}</h5>
                  <p class="product-description">
                    {{ product.description || 'Sin descripción' }}
                  </p>
                  
                  <div class="product-details">
                    <div class="detail-item">
                      <strong>Precio:</strong> S/. {{ product.price.toFixed(2) }}
                    </div>
                    <div class="detail-item">
                      <strong>Tipo:</strong> {{ product.category }}
                    </div>
                    <div class="detail-item" v-if="product.size">
                      <strong>Talla:</strong> {{ product.size }}
                    </div>
                    <div class="detail-item" v-if="product.color">
                      <strong>Color:</strong> {{ product.color }}
                    </div>
                  </div>

                  <!-- Botones -->
                  <div class="product-actions">
                    <button 
                      class="btn btn-sm btn-warning"
                      @click="editProduct(product)"
                    >
                      <i class="fa-solid fa-edit"></i> Editar
                    </button>
                    <button 
                      class="btn btn-sm btn-danger"
                      @click="confirmDelete(product)"
                    >
                      <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h5>¿Eliminar producto?</h5>
        <p>¿Estás seguro de que deseas eliminar <strong>{{ productToDelete?.name }}</strong>?</p>
        <div class="d-flex gap-2 justify-content-end">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn btn-danger" @click="deleteProduct">
            <i class="fa-solid fa-trash me-1"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import '@/assets/styles/admin-products.css'

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
}

const products = ref<Product[]>([])
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)
const showDeleteModal = ref(false)
const productToDelete = ref<Product | null>(null)

const form = ref({
  id: '',
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  collection: '',
  size: '',
  color: '',
  image_url: ''
})

const getCollectionLabel = (collection: string | null) => {
  const labels: Record<string, string> = {
    'verano': '☀️ Verano',
    'invierno': '❄️ Invierno',
    'primavera': '🌸 Primavera',
    'otono': '🍂 Otoño'
  }
  return collection ? labels[collection] || collection : 'Sin colección'
}

const getStockClass = (stock: number) => {
  if (stock === 0) return 'stock-out'
  if (stock < 5) return 'stock-low'
  return 'stock-ok'
}

const fetchProducts = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    products.value = data || []
  } catch (error) {
    console.error('Error:', error)
    alert('Error al cargar productos')
  } finally {
    loading.value = false
  }
}

const saveProduct = async () => {
  try {
    saving.value = true

    const productData = {
      name: form.value.name,
      description: form.value.description || null,
      price: form.value.price,
      stock: form.value.stock,
      category: form.value.category,
      collection: form.value.collection || null,
      size: form.value.size || null,
      color: form.value.color || null,
      image_url: form.value.image_url || null
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', form.value.id)

      if (error) throw error
      alert('✅ Producto actualizado')
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) throw error
      alert('✅ Producto agregado')
    }

    resetForm()
    fetchProducts()
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al guardar producto')
  } finally {
    saving.value = false
  }
}

const editProduct = (product: Product) => {
  isEditing.value = true
  form.value = {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    category: product.category,
    collection: product.collection || '',
    size: product.size || '',
    color: product.color || '',
    image_url: product.image_url || ''
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  resetForm()
}

const confirmDelete = (product: Product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const deleteProduct = async () => {
  if (!productToDelete.value) return

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productToDelete.value.id)

    if (error) throw error

    alert('✅ Producto eliminado')
    showDeleteModal.value = false
    productToDelete.value = null
    fetchProducts()
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al eliminar producto')
  }
}

const resetForm = () => {
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    collection: '',
    size: '',
    color: '',
    image_url: ''
  }
}

// Manejo de error para imagen de preview en el formulario
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement | null
  if (target) {
    target.src = 'https://dummyimage.com/300x300/dee2e6/6c757d.jpg'
  }
}

// Manejo de error para imágenes de productos en la lista
const handleProductImageError = (e: Event) => {
  const target = e.target as HTMLImageElement | null
  if (target) {
    target.src = 'https://dummyimage.com/300x300/dee2e6/6c757d.jpg'
  }
}

onMounted(() => {
  fetchProducts()
})
</script>