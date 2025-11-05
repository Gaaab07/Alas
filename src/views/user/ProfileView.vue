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
                <h6 class="mb-0">
                  {{ profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Usuario' }}
                </h6>
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
                  @click="activeTab = 'security'" 
                  :class="{ active: activeTab === 'security' }"
                  class="profile-nav-item"
                >
                  <i class="bi bi-shield-lock me-2"></i>Seguridad
                </button>
                
                <hr class="my-2">
                
                <router-link 
                  v-if="profile?.role === 'admin'" 
                  to="/admin/products" 
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
              <small class="text-muted">Esta información se usará para rellenar automáticamente tus pedidos</small>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateProfile">
                <!-- Nombres -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nombre *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.first_name"
                      placeholder="Juan"
                      @keypress="preventNumbers"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Apellidos *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.last_name"
                      placeholder="Pérez García"
                      @keypress="preventNumbers"
                      required
                    />
                  </div>
                </div>

                <!-- Email (no editable) -->
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    :value="user.email"
                    disabled
                  />
                  <small class="text-muted">No se puede cambiar</small>
                </div>

                <!-- Documento -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Tipo de Documento</label>
                    <select v-model="form.document_type" class="form-select">
                      <option value="">Seleccionar...</option>
                      <option value="dni">DNI - Documento Nacional de Identidad</option>
                      <option value="ce">Carné de Extranjería</option>
                      <option value="passport">Pasaporte</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Número de Documento</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.document_number"
                      placeholder="12345678"
                      :maxlength="form.document_type === 'dni' ? 8 : 12"
                    />
                  </div>
                </div>

                <!-- Teléfono y País -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Teléfono</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      v-model="form.phone"
                      placeholder="+51 999 999 999"
                      maxlength="15"
                      @keypress="preventLetters"
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">País</label>
                    <select v-model="form.country" class="form-select">
                      <option value="">Seleccionar...</option>
                      <option value="PE">Perú</option>
                      <option value="AR">Argentina</option>
                      <option value="CL">Chile</option>
                      <option value="CO">Colombia</option>
                      <option value="MX">México</option>
                      <option value="US">Estados Unidos</option>
                    </select>
                  </div>
                </div>

                <hr class="my-4">
                <h6 class="mb-3"><i class="bi bi-house me-2"></i>Dirección de Envío</h6>

                <!-- Dirección -->
                <div class="mb-3">
                  <label class="form-label">Dirección Completa</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.address"
                    placeholder="Av. Principal 123"
                  />
                </div>

                <!-- Referencia -->
                <div class="mb-3">
                  <label class="form-label">Referencia</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.apartment"
                    placeholder="Frente al parque, casa color azul..."
                  />
                </div>

                <!-- Provincia y Distrito -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Provincia</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.province"
                      placeholder="Lima"
                      @keypress="preventNumbers"
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Distrito</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.district"
                      placeholder="Miraflores"
                      @keypress="preventNumbers"
                    />
                  </div>
                </div>

                <!-- Código Postal -->
                <div class="mb-3">
                  <label class="form-label">Código Postal</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.postal_code"
                    placeholder="15001"
                    maxlength="10"
                  />
                </div>

                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  <strong>Tip:</strong> Completa toda tu información para que el proceso de compra sea más rápido. 
                  Esta información se usará automáticamente en el checkout.
                </div>

                <button type="submit" class="btn btn-primary" :disabled="updating">
                  <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                  {{ updating ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </form>
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

              <!-- Formulario de cambio de contraseña -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'

const { profile, user, getProfile } = useAuth()

// State
const activeTab = ref('info')
const form = ref({ 
  first_name: '',
  last_name: '',
  phone: '',
  document_type: '',
  document_number: '',
  country: '',
  address: '',
  apartment: '',
  province: '',
  district: '',
  postal_code: ''
})
const passwordForm = ref({ newPassword: '', confirmPassword: '' })
const updating = ref(false)
const updatingPassword = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Computed
const isGoogleUser = computed(() => {
  return user.value?.app_metadata?.provider === 'google'
})

const userAvatar = computed(() => {
  return user.value?.user_metadata?.picture || null
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
      .update({ 
        first_name: form.value.first_name.trim(),
        last_name: form.value.last_name.trim(),
        phone: form.value.phone.trim(),
        document_type: form.value.document_type,
        document_number: form.value.document_number.trim(),
        country: form.value.country,  
        address: form.value.address.trim(),
        apartment: form.value.apartment.trim(),
        province: form.value.province.trim(),
        district: form.value.district.trim(),
        postal_code: form.value.postal_code.trim()
      })
      .eq('id', user.value.id)
    
    if (error) throw error
    await getProfile()
    successMessage.value = 'Perfil actualizado correctamente'
  } catch {
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
  } catch {
    errorMessage.value = 'Error al cambiar contraseña'
  } finally {
    updatingPassword.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (profile.value) {
    form.value.first_name = profile.value.first_name || ''
    form.value.last_name = profile.value.last_name || ''
    form.value.phone = profile.value.phone || ''
    form.value.document_type = profile.value.document_type || ''
    form.value.document_number = profile.value.document_number || ''
    form.value.country = profile.value.country || ''
    form.value.address = profile.value.address || ''
    form.value.apartment = profile.value.apartment || ''
    form.value.province = profile.value.province || ''
    form.value.district = profile.value.district || ''
    form.value.postal_code = profile.value.postal_code || ''
  }
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
</style>