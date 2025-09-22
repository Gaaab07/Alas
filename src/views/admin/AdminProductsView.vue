<template>
  <div class="container py-5">
    <div class="row">
      <div class="col-12">
        <h2 class="mb-4 text-center">Panel de Administración - Productos</h2>
      </div>
    </div>

    <!-- Alertas -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = null"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = null"></button>
    </div>

    <div class="row">
      <!-- Formulario para agregar producto -->
      <div class="col-lg-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="bi bi-plus-circle me-2"></i>Agregar Nuevo Producto
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="addProduct">
              <div class="mb-3">
                <label class="form-label fw-bold">Nombre del Producto</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.name" 
                  placeholder="Ej: Camiseta deportiva"
                  required 
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Descripción</label>
                <textarea 
                  class="form-control" 
                  v-model="form.description" 
                  rows="3"
                  placeholder="Descripción detallada del producto..."
                ></textarea>
              </div>

              <div class="row">
                <div class="col-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Precio ($)</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model.number="form.price" 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00"
                        required 
                      />
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Stock</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model.number="form.stock" 
                      min="0" 
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Categoría *</label>
                <div class="input-group">
                  <select 
                    v-model="form.category" 
                    class="form-select"
                    required
                    aria-label="Seleccionar categoría del producto"
                  >
                    <option value="">Seleccionar categoría...</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                    <option value="__new__">+ Crear nueva categoría</option>
                  </select>
                </div>
                <!-- Campo para nueva categoría -->
                <div v-if="form.category === '__new__'" class="mt-2">
                  <input 
                    v-model="newCategory" 
                    class="form-control" 
                    placeholder="Nombre de la nueva categoría"
                    required
                    @input="handleNewCategory"
                  />
                </div>
              </div>

              <div class="row">
                <div class="col-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Tamaño</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.size" 
                      placeholder="XS, S, M, L, XL"
                    />
                  </div>
                </div>
                <div class="col-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Color</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.color" 
                      placeholder="Azul, Rojo, etc."
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">URL de la Imagen</label>
                <input 
                  type="url" 
                  class="form-control" 
                  v-model="form.image_url" 
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading || !isFormValid">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-plus-circle me-2"></i>
                  {{ loading ? 'Agregando...' : 'Agregar Producto' }}
                </button>
                
                <!-- Botón de prueba para debug -->
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm"
                  @click="testConnection"
                  :disabled="loading"
                >
                  🔍 Probar Conexión y Permisos
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-box-seam me-2"></i>Productos Existentes ({{ products.length }})
            </h5>
            <button class="btn btn-outline-light btn-sm" @click="fetchProducts">
              <i class="bi bi-arrow-clockwise"></i> Actualizar
            </button>
          </div>
          <div class="card-body">
            <!-- Loading state -->
            <div v-if="loadingProducts" class="text-center py-5">
              <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-3 text-muted">Cargando productos...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="products.length === 0" class="text-center py-5">
              <i class="bi bi-box text-muted" style="font-size: 4rem;"></i>
              <h5 class="mt-3 text-muted">No hay productos registrados</h5>
              <p class="text-muted">Agrega tu primer producto usando el formulario</p>
            </div>

            <!-- Products grid -->
            <div v-else class="row row-cols-1 row-cols-md-2 g-3">
              <div v-for="product in products" :key="product.id" class="col">
                <div class="card h-100 shadow-sm">
                  <div v-if="product.image_url" class="position-relative">
                    <img 
                      :src="product.image_url" 
                      class="card-img-top"
                      :alt="product.name"
                      style="height: 200px; object-fit: cover;"
                      @error="handleImageError"
                    />
                    <!-- Badge de stock -->
                    <span class="position-absolute top-0 end-0 m-2">
                      <span v-if="product.stock > 0" class="badge bg-success">
                        Stock: {{ product.stock }}
                      </span>
                      <span v-else class="badge bg-danger">
                        Sin stock
                      </span>
                    </span>
                  </div>
                  <div v-else class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                    <i class="bi bi-image text-muted" style="font-size: 3rem;"></i>
                  </div>

                  <div class="card-body d-flex flex-column">
                    <h6 class="card-title fw-bold">{{ product.name }}</h6>
                    <p class="card-text text-muted small flex-grow-1">
                      {{ product.description || 'Sin descripción' }}
                    </p>
                    
                    <div class="mt-auto">
                      <div class="row g-2 mb-2">
                        <div class="col-6">
                          <small class="text-muted d-block">Precio</small>
                          <span class="fw-bold text-success">${{ product.price.toFixed(2) }}</span>
                        </div>
                        <div class="col-6" v-if="product.category">
                          <small class="text-muted d-block">Categoría</small>
                          <span class="badge bg-primary">{{ product.category }}</span>
                        </div>
                      </div>
                      
                      <div v-if="product.size || product.color" class="d-flex gap-2 flex-wrap">
                        <small v-if="product.size" class="badge bg-light text-dark">
                          Talla: {{ product.size }}
                        </small>
                        <small v-if="product.color" class="badge bg-light text-dark">
                          Color: {{ product.color }}
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="card-footer bg-transparent">
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-pencil"></i> Editar
                      </button>
                      <button class="btn btn-outline-danger btn-sm">
                        <i class="bi bi-trash"></i> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import { useAuth } from '@/composables/useAuth'

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

// Usar el composable de auth
const { user, profile, isAuthenticated, isAdmin, getProfile } = useAuth()

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  size: '',
  color: '',
  image_url: ''
})

const newCategory = ref('')
const loading = ref(false)
const loadingProducts = ref(true)
const products = ref<Product[]>([])
const categories = ref<string[]>([])
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Computed
const isFormValid = computed(() => {
  const hasName = form.value.name.trim() !== ''
  const hasPrice = form.value.price > 0
  const hasValidCategory = form.value.category !== '' && 
    (form.value.category !== '__new__' || (form.value.category === '__new__' && newCategory.value.trim() !== ''))
  
  console.log('Validación formulario:', {
    hasName,
    hasPrice,
    hasValidCategory,
    category: form.value.category,
    newCategory: newCategory.value,
    isAdmin: isAdmin.value,
    userRole: profile.value?.role
  })
  
  return hasName && hasPrice && hasValidCategory
})

const finalCategoryValue = computed(() => {
  const result = form.value.category === '__new__' ? newCategory.value.trim() : form.value.category.trim()
  console.log('Categoría final:', result)
  return result
})

// Manejar nueva categoría
const handleNewCategory = () => {
  // No cambiar form.category automáticamente, solo cuando el usuario termine de escribir
  // Esto evita que desaparezca el campo
}

// Obtener categorías existentes
const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .neq('category', '')

    if (error) throw error

    if (data) {
      const uniqueCats = Array.from(new Set(data.map(p => p.category).filter(cat => cat)))
      categories.value = uniqueCats.sort()
    }
  } catch (error) {
    console.error('Error obteniendo categorías:', error)
  }
}

// Obtener productos
const fetchProducts = async () => {
  loadingProducts.value = true
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data) {
      products.value = data
    }
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    errorMessage.value = 'Error al cargar los productos'
  } finally {
    loadingProducts.value = false
  }
}

// Agregar producto
const addProduct = async () => {
  if (!isFormValid.value) {
    console.log('Formulario no válido:', form.value)
    return
  }

  // Verificar autenticación antes de proceder
  if (!isAuthenticated.value) {
    errorMessage.value = 'Debes estar autenticado para agregar productos'
    return
  }

  if (!isAdmin.value) {
    errorMessage.value = `No tienes permisos de administrador. Rol actual: ${profile.value?.role || 'sin rol'}`
    return
  }

  loading.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    const productData = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || null,
      price: parseFloat(form.value.price.toString()),
      stock: parseInt(form.value.stock.toString()) || 0,
      category: finalCategoryValue.value,
      size: form.value.size.trim() || null,
      color: form.value.color.trim() || null,
      image_url: form.value.image_url.trim() || null
    }

    console.log('=== ESTADO DE AUTENTICACIÓN ===')
    console.log('Usuario autenticado:', isAuthenticated.value)
    console.log('Es admin:', isAdmin.value)
    console.log('Usuario:', user.value?.email)
    console.log('Perfil:', profile.value)
    console.log('=== ENVIANDO PRODUCTO ===')
    console.log('Datos del producto:', productData)

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()

    if (error) {
      console.error('Error de Supabase:', error)
      console.error('Código:', error.code)
      console.error('Detalles:', error.details)
      console.error('Hint:', error.hint)
      throw error
    }

    console.log('✅ Producto agregado exitosamente:', data)
    successMessage.value = `Producto "${productData.name}" agregado correctamente`

    // Reiniciar formulario
    form.value = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      size: '',
      color: '',
      image_url: ''
    }
    newCategory.value = ''

    // Actualizar listas
    await fetchProducts()
    await fetchCategories()

  } catch (err) {
    console.error('❌ Error agregando producto:', err)
    if (err instanceof Error) {
      if (err.message.includes('permission') || err.message.includes('policy')) {
        errorMessage.value = 'Sin permisos para agregar productos. Verifica que seas admin y que las políticas RLS estén correctas.'
      } else {
        errorMessage.value = `Error: ${err.message}`
      }
    } else {
      errorMessage.value = 'Ocurrió un error inesperado al agregar el producto'
    }
  } finally {
    loading.value = false
  }
}

// Función de prueba para debug
const testConnection = async () => {
  console.log('=== PRUEBA DE CONEXIÓN Y PERMISOS ===')
  
  try {
    // 1. Estado del composable useAuth
    console.log('📱 Estado useAuth:')
    console.log('  - Autenticado:', isAuthenticated.value)
    console.log('  - Es Admin:', isAdmin.value)
    console.log('  - Usuario:', user.value?.email, user.value?.id)
    console.log('  - Perfil:', profile.value)

    // 2. Verificación directa con Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser()
    console.log('🔍 Verificación directa Supabase:')
    console.log('  - Usuario:', userData?.user?.email, userData?.user?.id)
    console.log('  - Error usuario:', userError)
    
    if (userError || !userData?.user) {
      throw new Error('No hay usuario autenticado en Supabase')
    }

    // 3. Verificar perfil directamente
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()
    
    console.log('👤 Perfil desde DB:')
    console.log('  - Datos:', profileData)
    console.log('  - Error:', profileError)
    
    if (profileError) {
      throw new Error(`Error obteniendo perfil: ${profileError.message}`)
    }

    // 4. Probar INSERT
    const testProduct = {
      name: 'PRODUCTO PRUEBA - ELIMINAR',
      description: 'Prueba de permisos',
      price: 1.99,
      stock: 1,
      category: 'PRUEBA'
    }
    
    console.log('🧪 Probando INSERT...')
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
    
    if (insertError) {
      console.error('❌ Error en INSERT:', insertError)
      throw new Error(`Error INSERT: ${insertError.message} (${insertError.code})`)
    } else {
      console.log('✅ INSERT exitoso:', insertData)
      successMessage.value = 'Prueba exitosa: Los permisos funcionan correctamente'
      
      // Limpiar producto de prueba
      if (insertData?.[0]?.id) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', insertData[0].id)
        
        if (!deleteError) {
          console.log('🗑️ Producto de prueba eliminado')
        }
      }
      
      await fetchProducts()
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error)
    errorMessage.value = `Error en prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`
  }
}

// Manejar error de imagen
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  const parent = target.parentElement
  if (parent) {
    parent.innerHTML = '<div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;"><i class="bi bi-image text-muted" style="font-size: 3rem;"></i></div>'
  }
}

// Auto-hide messages
const hideMessages = () => {
  setTimeout(() => {
    successMessage.value = null
    errorMessage.value = null
  }, 5000)
}

// Watch for messages
import { watch } from 'vue'
watch([successMessage, errorMessage], () => {
  if (successMessage.value || errorMessage.value) {
    hideMessages()
  }
})

// Lifecycle
onMounted(async () => {
  console.log('🚀 Componente montado')
  console.log('Estado inicial auth:', {
    isAuthenticated: isAuthenticated.value,
    isAdmin: isAdmin.value,
    user: user.value?.email,
    profile: profile.value
  })

  // Si el usuario existe pero no hay perfil, forzar carga
  if (user.value && !profile.value) {
    console.log('⚠️ Forzando carga de perfil...')
    await getProfile()
    console.log('Estado después de getProfile:', {
      isAdmin: isAdmin.value,
      profile: profile.value
    })
  }

  await Promise.all([
    fetchCategories(),
    fetchProducts()
  ])
})
</script>