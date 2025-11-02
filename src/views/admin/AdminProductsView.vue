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
                  <optgroup label="Otros">
                    <option value="otro">Otro</option>
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

              <!-- Método de imagen -->
              <div class="col-12">
                <label class="form-label fw-bold">Imagen del Producto</label>
                <div class="btn-group w-100 mb-3" role="group">
                  <input 
                    type="radio" 
                    class="btn-check" 
                    name="imageMethod" 
                    id="urlMethod" 
                    value="url"
                    v-model="imageMethod"
                  >
                  <label class="btn btn-outline-primary" for="urlMethod">
                    <i class="fa-solid fa-link me-2"></i>URL
                  </label>

                  <input 
                    type="radio" 
                    class="btn-check" 
                    name="imageMethod" 
                    id="fileMethod" 
                    value="file"
                    v-model="imageMethod"
                  >
                  <label class="btn btn-outline-primary" for="fileMethod">
                    <i class="fa-solid fa-upload me-2"></i>Subir Archivo
                  </label>
                </div>

                <!-- Input de URL -->
                <div v-if="imageMethod === 'url'">
                  <input 
                    v-model="form.image_url"
                    type="url" 
                    class="form-control" 
                    placeholder="https://example.com/imagen.jpg"
                  />
                </div>

                <!-- Input de Archivo -->
                <div v-else>
                  <input 
                    type="file"
                    ref="fileInput"
                    class="form-control"
                    accept="image/*"
                    @change="handleFileSelect"
                  />
                  <small class="text-muted d-block mt-2">
                    <i class="fa-solid fa-info-circle me-1"></i>
                    Formatos permitidos: JPG, PNG, GIF, WEBP (máx. 5MB)
                  </small>
                </div>
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
              <button type="submit" class="btn btn-primary" :disabled="saving || uploadingImage">
                <i class="fa-solid" :class="uploadingImage ? 'fa-spinner fa-spin' : (saving ? 'fa-spinner fa-spin' : (isEditing ? 'fa-save' : 'fa-plus'))"></i>
                {{ uploadingImage ? 'Subiendo imagen...' : (saving ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Agregar Producto')) }}
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
        <div class="card-header bg-secondary text-white">
          <h5 class="mb-0">
            <i class="fa-solid fa-list me-2"></i>
            Productos Existentes ({{ totalProducts }})
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
          <div v-else-if="totalProducts === 0" class="text-center py-5 text-muted">
            <i class="fa-solid fa-box-open fa-3x mb-3"></i>
            <p>No hay productos agregados aún</p>
          </div>

          <!-- Grid de productos -->
          <div v-else>
            <div class="row g-4">
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import '@/assets/Styles/admin-products.css'
import '@/assets/Styles/pagination.css'

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
const currentPage = ref(1)
const itemsPerPage = 9
const totalProducts = ref(0)

// Nuevas variables para manejo de archivos
const imageMethod = ref<'url' | 'file'>('url')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploadingImage = ref(false)

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
    
    // Obtener el total de productos para la paginación
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    totalProducts.value = count || 0
    
    // Calcular el offset para la paginación
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    
    // Obtener productos con paginación
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    products.value = data || []
  } catch (error) {
    console.error('Error:', error)
    alert('Error al cargar productos')
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchProducts()
    // Scroll hacia la lista de productos
    const productsList = document.querySelector('.card.shadow-sm:last-of-type')
    if (productsList) {
      productsList.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// Función para manejar selección de archivo
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    selectedFile.value = null
    form.value.image_url = ''
    return
  }

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alert('❌ Por favor selecciona un archivo de imagen válido')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    alert('❌ La imagen es muy grande. Máximo 5MB')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  selectedFile.value = file
  
  // Crear preview local
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.image_url = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Función para subir imagen a Supabase Storage
const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    uploadingImage.value = true
    
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Subir archivo a Supabase Storage
    const {  error } = await supabase.storage
      .from('product-images') // Nombre del bucket
      .upload(filePath, file)

    if (error) throw error

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error al subir imagen:', error)
    alert('❌ Error al subir la imagen')
    return null
  } finally {
    uploadingImage.value = false
  }
}

const saveProduct = async () => {
  try {
    saving.value = true

    let imageUrl = form.value.image_url

    // Si hay un archivo seleccionado, subirlo primero
    if (imageMethod.value === 'file' && selectedFile.value) {
      const uploadedUrl = await uploadImageToSupabase(selectedFile.value)
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      } else {
        alert('❌ No se pudo subir la imagen. Intenta con una URL en su lugar.')
        return
      }
    }

    const productData = {
      name: form.value.name,
      description: form.value.description || null,
      price: form.value.price,
      stock: form.value.stock,
      category: form.value.category,
      collection: form.value.collection || null,
      size: form.value.size || null,
      color: form.value.color || null,
      image_url: imageUrl || null
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
    // Volver a la primera página después de agregar/editar
    currentPage.value = 1
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
  imageMethod.value = 'url' // Al editar, por defecto usar URL
  selectedFile.value = null
  
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
    
    // Si estamos en una página que ya no existe después de eliminar, volver a la anterior
    const newTotalPages = Math.ceil((totalProducts.value - 1) / itemsPerPage)
    if (currentPage.value > newTotalPages && newTotalPages > 0) {
      currentPage.value = newTotalPages
    }
    
    fetchProducts()
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al eliminar producto')
  }
}

const resetForm = () => {
  isEditing.value = false
  imageMethod.value = 'url'
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  
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