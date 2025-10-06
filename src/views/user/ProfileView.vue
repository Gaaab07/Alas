<template>
  <div class="container py-5">
    <!-- Header del perfil -->
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="mb-0">Mi Perfil</h2>
        <p class="text-muted">Administra tu información personal y preferencias</p>
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
      <!-- Sidebar con info del usuario -->
      <div class="col-lg-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <!-- Avatar -->
            <div class="position-relative d-inline-block mb-3">
              <div class="avatar-circle">
                <img 
                  v-if="profile?.avatar_url" 
                  :src="profile.avatar_url" 
                  alt="Avatar"
                  class="avatar-img"
                />
                <i v-else class="bi bi-person-circle text-muted" style="font-size: 5rem;"></i>
              </div>
              <button 
                class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle"
                style="width: 35px; height: 35px;"
                @click="showAvatarModal = true"
              >
                <i class="bi bi-camera"></i>
              </button>
            </div>

            <h5 class="mb-1">{{ profile?.full_name || 'Usuario' }}</h5>
            <p class="text-muted small mb-3">{{ user.email }}</p>

            <!-- Badge de rol -->
            <span 
              class="badge mb-3"
              :class="profile?.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'"
            >
              <i :class="profile?.role === 'admin' ? 'bi bi-shield-check' : 'bi bi-person'"></i>
              {{ profile?.role === 'admin' ? 'Administrador' : 'Cliente' }}
            </span>

            <!-- Estadísticas -->
            <div class="row text-center mt-4">
              <div class="col-4">
                <div class="stat-item">
                  <h4 class="mb-0">0</h4>
                  <small class="text-muted">Pedidos</small>
                </div>
              </div>
              <div class="col-4">
                <div class="stat-item">
                  <h4 class="mb-0">0</h4>
                  <small class="text-muted">Favoritos</small>
                </div>
              </div>
              <div class="col-4">
                <div class="stat-item">
                  <h4 class="mb-0">S/. 0</h4>
                  <small class="text-muted">Gastado</small>
                </div>
              </div>
            </div>

            <hr class="my-4">

            <!-- Información adicional -->
            <div class="text-start">
              <p class="small mb-2">
                <i class="bi bi-calendar3 text-muted me-2"></i>
                Miembro desde {{ formatDate(profile?.created_at) }}
              </p>
              <p class="small mb-0">
                <i class="bi bi-envelope text-muted me-2"></i>
                {{ user.email }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="col-lg-8">
        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4" role="tablist">
          <li class="nav-item" role="presentation">
            <button 
              class="nav-link active" 
              data-bs-toggle="tab" 
              data-bs-target="#info-tab"
              type="button"
            >
              <i class="bi bi-person me-2"></i>Información Personal
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button 
              class="nav-link" 
              data-bs-toggle="tab" 
              data-bs-target="#security-tab"
              type="button"
            >
              <i class="bi bi-shield-lock me-2"></i>Seguridad
            </button>
          </li>
        </ul>

        <!-- Tab content -->
        <div class="tab-content">
          <!-- Información Personal -->
          <div class="tab-pane fade show active" id="info-tab">
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">Editar Información</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="updateProfile">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nombre Completo</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.full_name"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold">Email</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      :value="user.email"
                      disabled
                    />
                    <small class="text-muted">El email no se puede cambiar</small>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold">URL del Avatar</label>
                    <input 
                      type="url" 
                      class="form-control" 
                      v-model="form.avatar_url"
                      placeholder="https://ejemplo.com/avatar.jpg"
                    />
                    <small class="text-muted">Opcional: URL de tu foto de perfil</small>
                  </div>

                  <div class="d-flex gap-2">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="updating"
                    >
                      <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-save me-2"></i>
                      {{ updating ? 'Guardando...' : 'Guardar Cambios' }}
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary"
                      @click="resetForm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Seguridad -->
          <div class="tab-pane fade" id="security-tab">
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">Cambiar Contraseña</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="changePassword">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nueva Contraseña</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.newPassword"
                      placeholder="Mínimo 6 caracteres"
                      minlength="6"
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold">Confirmar Contraseña</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.confirmPassword"
                      placeholder="Repite tu contraseña"
                    />
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-warning"
                    :disabled="updatingPassword"
                  >
                    <span v-if="updatingPassword" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-key me-2"></i>
                    {{ updatingPassword ? 'Actualizando...' : 'Cambiar Contraseña' }}
                  </button>
                </form>

                <hr class="my-4">

                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  <strong>Nota:</strong> Cambiar tu contraseña cerrará todas tus sesiones activas.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para avatar (opcional) -->
    <div v-if="showAvatarModal" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cambiar Avatar</h5>
            <button type="button" class="btn-close" @click="showAvatarModal = false"></button>
          </div>
          <div class="modal-body">
            <input 
              type="url" 
              class="form-control" 
              v-model="form.avatar_url"
              placeholder="https://ejemplo.com/avatar.jpg"
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAvatarModal = false">
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" @click="updateAvatar">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'

const { profile, user, getProfile } = useAuth()

const form = ref({
  full_name: '',
  avatar_url: ''
})

const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const updating = ref(false)
const updatingPassword = ref(false)
const showAvatarModal = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Formatear fecha
const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Cargar datos del formulario
const loadFormData = () => {
  if (profile.value) {
    form.value.full_name = profile.value.full_name || ''
    form.value.avatar_url = profile.value.avatar_url || ''
  }
}

// Resetear formulario
const resetForm = () => {
  loadFormData()
}

// Actualizar perfil
const updateProfile = async () => {
  if (!user.value) return

  updating.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.value.full_name.trim(),
        avatar_url: form.value.avatar_url.trim() || null
      })
      .eq('id', user.value.id)

    if (error) throw error

    await getProfile()
    successMessage.value = 'Perfil actualizado correctamente'
  } catch (err) {
    console.error('Error actualizando perfil:', err)
    errorMessage.value = err instanceof Error ? err.message : 'Error al actualizar perfil'
  } finally {
    updating.value = false
  }
}

// Actualizar avatar
const updateAvatar = async () => {
  await updateProfile()
  showAvatarModal.value = false
}

// Cambiar contraseña
const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  updatingPassword.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword
    })

    if (error) throw error

    successMessage.value = 'Contraseña actualizada correctamente'
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
  } catch (err) {
    console.error('Error cambiando contraseña:', err)
    errorMessage.value = err instanceof Error ? err.message : 'Error al cambiar contraseña'
  } finally {
    updatingPassword.value = false
  }
}

onMounted(() => {
  loadFormData()
})
</script>

<style scoped>
.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 3px solid #dee2e6;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stat-item {
  padding: 0.5rem 0;
}

.stat-item h4 {
  color: #0d6efd;
  font-weight: 700;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom: 2px solid #0d6efd;
  background-color: transparent;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #0d6efd;
}

.card {
  border: 1px solid #dee2e6;
}

.modal.show {
  display: block;
}
</style>