<template>
  <div class="profile-container">
    <div class="container py-5">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="mb-1">Mi Cuenta</h2>
          <p class="text-muted">Gestiona tu información y pedidos</p>
        </div>
      </div>

      <!-- Alertas -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
        <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = null"></button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" @click="errorMessage = null"></button>
      </div>

      <div v-if="!user" class="text-center py-5">
        <i class="bi bi-person-x text-muted" style="font-size: 4rem;"></i>
        <h4 class="mt-3">Debes iniciar sesión</h4>
        <router-link to="/signin" class="btn btn-primary mt-3">Iniciar Sesión</router-link>
      </div>

      <div v-else class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card">
            <div class="card-body">
              <div class="text-center mb-3">
                <div class="profile-icon-circle mb-2">
                  <img 
                    v-if="userAvatar" 
                    :src="userAvatar" 
                    alt="Avatar"
                    class="profile-avatar"
                  />
                  <i v-else class="bi bi-person-fill"></i>
                </div>
                <h6 class="mb-0">{{ profile?.full_name || 'Usuario' }}</h6>
                <small class="text-muted">{{ user.email }}</small>
              </div>

              <hr>

              <!-- Menú de navegación -->
              <nav class="profile-nav">
                <router-link 
                  to="/orders" 
                  class="profile-nav-item"
                >
                  <i class="bi bi-bag-check me-2"></i>Mis Pedidos
                </router-link>
                <button 
                  @click="activeTab = 'info'" 
                  :class="{ active: activeTab === 'info' }"
                  class="profile-nav-item"
                >
                  <i class="bi bi-person me-2"></i>Información Personal
                </button>
                <button 
                  @click="activeTab = 'addresses'" 
                  :class="{ active: activeTab === 'addresses' }"
                  class="profile-nav-item"
                >
                  <i class="bi bi-geo-alt me-2"></i>Direcciones
                </button>
                <button 
                  @click="activeTab = 'security'" 
                  :class="{ active: activeTab === 'security' }"
                  class="profile-nav-item"
                >
                  <i class="bi bi-shield-lock me-2"></i>Seguridad
                </button>
                
                <hr class="my-2">
                
                <router-link 
                  v-if="profile?.role === 'admin'" 
                  to="/admin" 
                  class="profile-nav-item text-warning"
                >
                  <i class="bi bi-shield-check me-2"></i>Panel Admin
                </router-link>
              </nav>
            </div>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="col-lg-9">
          <!-- Información Personal -->
          <div v-if="activeTab === 'info'" class="card">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="bi bi-person me-2"></i>Información Personal</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateProfile">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nombre Completo *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.full_name"
                      placeholder="Juan Pérez"
                      @keypress="preventNumbers"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Email</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      :value="user.email"
                      disabled
                    />
                    <small class="text-muted">No se puede cambiar</small>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary" :disabled="updating">
                  <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                  {{ updating ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Direcciones -->
          <div v-if="activeTab === 'addresses'" class="card">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-geo-alt me-2"></i>Mis Direcciones</h5>
              <button class="btn btn-sm btn-primary" @click="showAddressModal = true">
                <i class="bi bi-plus-lg me-1"></i>Nueva Dirección
              </button>
            </div>
            <div class="card-body">
              <!-- Loading -->
              <div v-if="loadingAddresses" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2 text-muted">Cargando direcciones...</p>
              </div>

              <!-- Sin direcciones -->
              <div v-else-if="savedAddresses.length === 0" class="text-center py-4">
                <i class="bi bi-house text-muted" style="font-size: 3rem;"></i>
                <p class="mt-3 text-muted">No tienes direcciones guardadas</p>
                <button class="btn btn-primary" @click="showAddressModal = true">
                  Agregar dirección
                </button>
              </div>

              <!-- Lista de direcciones -->
              <div v-else class="row">
                <div v-for="address in savedAddresses" :key="address.id" class="col-md-6 mb-3">
                  <div class="address-card">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="badge bg-primary">{{ address.label }}</span>
                      <button 
                        class="btn btn-sm btn-link text-danger p-0" 
                        @click="deleteAddress(address.id)"
                        :disabled="deletingAddress === address.id"
                      >
                        <i v-if="deletingAddress === address.id" class="bi bi-hourglass-split"></i>
                        <i v-else class="bi bi-trash"></i>
                      </button>
                    </div>
                    <div>
                      <strong>{{ address.full_name }}</strong><br>
                      <small class="text-muted">
                        {{ address.address }}<br>
                        {{ address.district }}, {{ address.province }}<br>
                        Tel: {{ address.phone }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Seguridad -->
          <div v-if="activeTab === 'security'" class="card">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="bi bi-shield-lock me-2"></i>Seguridad</h5>
            </div>
            <div class="card-body">
              <!-- Aviso para usuarios de Google -->
              <div v-if="isGoogleUser" class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Has iniciado sesión con Google. Tu contraseña es administrada por Google y no se puede cambiar aquí.
              </div>

              <!-- Formulario de cambio de contraseña (solo para usuarios con email/password) -->
              <form v-else @submit.prevent="changePassword">
                <div class="mb-3">
                  <label class="form-label">Nueva Contraseña *</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    v-model="passwordForm.newPassword"
                    placeholder="Mínimo 6 caracteres"
                    minlength="6"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Confirmar Contraseña *</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    v-model="passwordForm.confirmPassword"
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>
                <button type="submit" class="btn btn-warning" :disabled="updatingPassword">
                  <span v-if="updatingPassword" class="spinner-border spinner-border-sm me-2"></span>
                  {{ updatingPassword ? 'Actualizando...' : 'Cambiar Contraseña' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para nueva dirección -->
    <div v-if="showAddressModal" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nueva Dirección</h5>
            <button type="button" class="btn-close" @click="closeAddressModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Referencia *</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="newAddress.label" 
                placeholder="Casa, Oficina, Cerca del parque, etc." 
                @keypress="preventNumbers"
                required
              >
            </div>
            <div class="mb-3">
              <label class="form-label">Nombre Completo *</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="newAddress.full_name" 
                @keypress="preventNumbers"
                required
              >
            </div>
            <div class="mb-3">
              <label class="form-label">Dirección *</label>
              <input type="text" class="form-control" v-model="newAddress.address" required>
            </div>
            <div class="row">
              <div class="col-6 mb-3">
                <label class="form-label">Distrito *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="newAddress.district" 
                  @keypress="preventNumbers"
                  required
                >
              </div>
              <div class="col-6 mb-3">
                <label class="form-label">Provincia *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="newAddress.province" 
                  @keypress="preventNumbers"
                  required
                >
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Teléfono *</label>
              <input 
                type="tel" 
                class="form-control" 
                v-model="newAddress.phone" 
                maxlength="15"
                @keypress="preventLetters"
                placeholder="+51 999 999 999"
                required
              >
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddressModal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="saveAddress" :disabled="savingAddress">
              <span v-if="savingAddress" class="spinner-border spinner-border-sm me-2"></span>
              {{ savingAddress ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'

// Interfaces
interface SavedAddress {
  id: string
  label: string
  full_name: string
  address: string
  district: string
  province: string
  phone: string
}

// Composables
const { profile, user, getProfile } = useAuth()

// State
const activeTab = ref('info')
const form = ref({ full_name: '' })
const passwordForm = ref({ newPassword: '', confirmPassword: '' })
const savedAddresses = ref<SavedAddress[]>([])
const loadingAddresses = ref(false)
const updating = ref(false)
const updatingPassword = ref(false)
const savingAddress = ref(false)
const deletingAddress = ref<string | null>(null)
const showAddressModal = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const newAddress = ref({
  label: '',
  full_name: '',
  address: '',
  district: '',
  province: '',
  phone: ''
})

// Computed
const isGoogleUser = computed(() => {
  return user.value?.app_metadata?.provider === 'google'
})

const userAvatar = computed(() => {
  return user.value?.user_metadata?.avatar_url || user.value?.user_metadata?.picture || null
})

// Methods - Validaciones
const preventNumbers = (event: KeyboardEvent) => {
  if (/[0-9]/.test(event.key)) {
    event.preventDefault()
  }
}

const preventLetters = (event: KeyboardEvent) => {
  if (!/[0-9+\-() ]/.test(event.key)) {
    event.preventDefault()
  }
}

// Methods - Perfil
const updateProfile = async () => {
  if (!user.value) return
  updating.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.value.full_name.trim() })
      .eq('id', user.value.id)
    
    if (error) throw error
    await getProfile()
    successMessage.value = 'Perfil actualizado correctamente'
  } catch (error) {
    console.error('Error updating profile:', error)
    errorMessage.value = 'Error al actualizar perfil'
  } finally {
    updating.value = false
  }
}

// Methods - Contraseña
const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }
  updatingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword
    })
    if (error) throw error
    successMessage.value = 'Contraseña actualizada correctamente'
    passwordForm.value = { newPassword: '', confirmPassword: '' }
  } catch (error) {
    console.error('Error changing password:', error)
    errorMessage.value = 'Error al cambiar contraseña'
  } finally {
    updatingPassword.value = false
  }
}

// Methods - Direcciones
const loadAddresses = async () => {
  if (!user.value) return
  loadingAddresses.value = true
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    savedAddresses.value = data || []
  } catch (error) {
    console.error('Error loading addresses:', error)
    errorMessage.value = 'Error al cargar direcciones'
  } finally {
    loadingAddresses.value = false
  }
}

const saveAddress = async () => {
  if (!user.value) return
  savingAddress.value = true
  try {
    const { error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: user.value.id,
        label: newAddress.value.label.trim(),
        full_name: newAddress.value.full_name.trim(),
        address: newAddress.value.address.trim(),
        district: newAddress.value.district.trim(),
        province: newAddress.value.province.trim(),
        phone: newAddress.value.phone.trim()
      })
    
    if (error) throw error
    
    successMessage.value = 'Dirección guardada correctamente'
    closeAddressModal()
    await loadAddresses()
  } catch (error) {
    console.error('Error saving address:', error)
    errorMessage.value = 'Error al guardar dirección'
  } finally {
    savingAddress.value = false
  }
}

const deleteAddress = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar esta dirección?')) return
  
  deletingAddress.value = id
  try {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    savedAddresses.value = savedAddresses.value.filter(a => a.id !== id)
    successMessage.value = 'Dirección eliminada correctamente'
  } catch (error) {
    console.error('Error deleting address:', error)
    errorMessage.value = 'Error al eliminar dirección'
  } finally {
    deletingAddress.value = null
  }
}

const closeAddressModal = () => {
  showAddressModal.value = false
  newAddress.value = {
    label: '',
    full_name: '',
    address: '',
    district: '',
    province: '',
    phone: ''
  }
}

// Lifecycle
onMounted(async () => {
  if (profile.value) {
    form.value.full_name = profile.value.full_name || ''
  }
  await loadAddresses()
})
</script>

<style scoped>
.profile-icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  overflow: hidden;
}

.profile-icon-circle i {
  font-size: 2.5rem;
  color: white;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-nav-item {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  transition: all 0.2s;
  color: #6c757d;
  text-decoration: none;
  display: block;
}

.profile-nav-item:hover {
  background: #f8f9fa;
  color: #0d6efd;
}

.profile-nav-item.active {
  background: #0d6efd;
  color: white;
}

.address-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  height: 100%;
  transition: all 0.2s;
}

.address-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.modal.show {
  display: block;
}
</style>