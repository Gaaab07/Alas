<template>
  <div class="owner-container">
    <div class="container-fluid py-5">
      <h1 class="owner-title mb-5">
        <i class="fa-solid fa-crown me-3"></i>
        Panel Owner - Gestión de Usuarios
      </h1>

      <!-- Alertas -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
        <i class="fa-solid fa-check-circle me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = null"></button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
        <i class="fa-solid fa-exclamation-triangle me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" @click="errorMessage = null"></button>
      </div>

      <!-- Estadísticas -->
      <div class="row mb-5">
        <div class="col-md-4">
          <div class="stat-card bg-primary">
            <div class="stat-icon">
              <i class="fa-solid fa-users"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.total }}</h3>
              <p>Total Usuarios</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card bg-warning">
            <div class="stat-icon">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.admins }}</h3>
              <p>Administradores</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card bg-success">
            <div class="stat-icon">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.customers }}</h3>
              <p>Clientes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-bold">Buscar por nombre o email</label>
              <input 
                v-model="searchQuery"
                type="text" 
                class="form-control" 
                placeholder="Buscar..."
                @input="handleSearch"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Filtrar por rol</label>
              <select v-model="roleFilter" class="form-select" @change="handleFilterChange">
                <option value="">Todos los roles</option>
                <option value="customer">Clientes</option>
                <option value="admin">Administradores</option>
                <option value="owner">Owners</option>
              </select>
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button class="btn btn-secondary w-100" @click="resetFilters">
                <i class="fa-solid fa-rotate-right me-2"></i>Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de usuarios -->
      <div class="card shadow-sm">
        <div class="card-header bg-dark text-white">
          <h5 class="mb-0">
            <i class="fa-solid fa-list me-2"></i>
            Usuarios ({{ totalUsers }})
          </h5>
        </div>
        <div class="card-body">
          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando usuarios...</span>
            </div>
          </div>

          <!-- Sin usuarios -->
          <div v-else-if="paginatedUsers.length === 0" class="text-center py-5 text-muted">
            <i class="fa-solid fa-user-slash fa-3x mb-3"></i>
            <p>No se encontraron usuarios</p>
          </div>

          <!-- Tabla de usuarios -->
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol Actual</th>
                  <th>Fecha Registro</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="user-avatar me-2">
                        {{ getInitials(user.first_name, user.last_name) }}
                      </div>
                      <div>
                        <strong>{{ user.first_name }} {{ user.last_name }}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.phone || '-' }}</td>
                  <td>
                    <span class="badge" :class="getRoleBadgeClass(user.role)">
                      <i class="fa-solid" :class="getRoleIcon(user.role)"></i>
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td class="text-center">
                    <button 
                      v-if="user.role !== 'owner'"
                      class="btn btn-sm btn-warning me-2"
                      @click="openRoleModal(user)"
                    >
                      <i class="fa-solid fa-user-edit"></i> Cambiar Rol
                    </button>
                    <span v-else class="text-muted">
                      <i class="fa-solid fa-lock"></i> Protegido
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="pagination-container mt-4">
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

    <!-- Modal para cambiar rol -->
    <div v-if="showRoleModal" class="modal-overlay" @click="closeRoleModal">
      <div class="modal-content" @click.stop>
        <h5 class="mb-3">
          <i class="fa-solid fa-user-edit me-2"></i>
          Cambiar Rol de Usuario
        </h5>
        
        <div v-if="selectedUser" class="mb-4">
          <div class="user-info-card">
            <div class="user-avatar-large">
              {{ getInitials(selectedUser.first_name, selectedUser.last_name) }}
            </div>
            <div class="ms-3">
              <h6 class="mb-1">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</h6>
              <p class="text-muted mb-0">{{ selectedUser.email }}</p>
            </div>
          </div>

          <div class="mt-4">
            <label class="form-label fw-bold">Rol Actual</label>
            <div class="alert alert-info mb-3">
              <i class="fa-solid" :class="getRoleIcon(selectedUser.role)"></i>
              {{ getRoleLabel(selectedUser.role) }}
            </div>

            <label class="form-label fw-bold">Nuevo Rol</label>
            <select v-model="newRole" class="form-select form-select-lg mb-3">
              <option value="customer">
                👤 Cliente - Puede comprar productos
              </option>
              <option value="admin">
                🛡️ Administrador - Puede gestionar productos y ver pedidos
              </option>
            </select>

            <div class="alert alert-warning">
              <i class="fa-solid fa-exclamation-triangle me-2"></i>
              <strong>Nota:</strong> Solo puedes asignar roles de Cliente o Administrador. 
              El rol de Owner no puede ser asignado.
            </div>
          </div>
        </div>

        <div class="d-flex gap-2 justify-content-end">
          <button class="btn btn-secondary" @click="closeRoleModal">
            Cancelar
          </button>
          <button 
            class="btn btn-primary" 
            @click="updateUserRole"
            :disabled="updating || newRole === selectedUser?.role"
          >
            <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
            {{ updating ? 'Actualizando...' : 'Confirmar Cambio' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: 'customer' | 'admin' | 'owner'
  phone: string | null
  created_at: string
}

interface Stats {
  total: number
  admins: number
  customers: number
}

const users = ref<User[]>([])
const filteredUsers = ref<User[]>([])
const loading = ref(true)
const updating = ref(false)
const showRoleModal = ref(false)
const selectedUser = ref<User | null>(null)
const newRole = ref<'customer' | 'admin'>('customer')
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Paginación
const currentPage = ref(1)
const usersPerPage = 10
const totalUsers = ref(0)

// Filtros
const searchQuery = ref('')
const roleFilter = ref('')

// Estadísticas
const stats = computed<Stats>(() => {
  return {
    total: users.value.length,
    admins: users.value.filter(u => u.role === 'admin').length,
    customers: users.value.filter(u => u.role === 'customer').length
  }
})

// Computed para paginación
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / usersPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * usersPerPage
  const end = start + usersPerPage
  return filteredUsers.value.slice(start, end)
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

const fetchUsers = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('user_profiles_with_email')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    users.value = (data as User[]) || []
    filteredUsers.value = (data as User[]) || []
    totalUsers.value = users.value.length
  } catch  {
    errorMessage.value = 'Error al cargar usuarios.'
  } finally {
    loading.value = false
  }
}

const filterUsers = () => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.email.toLowerCase().includes(query) ||
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query)
    )
  }

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  filteredUsers.value = filtered
  totalUsers.value = filtered.length
  currentPage.value = 1
}

const handleSearch = () => {
  filterUsers()
}

const handleFilterChange = () => {
  filterUsers()
}

const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  filteredUsers.value = users.value
  totalUsers.value = users.value.length
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const openRoleModal = (user: User) => {
  selectedUser.value = user
  newRole.value = user.role === 'owner' ? 'admin' : user.role as 'customer' | 'admin'
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  selectedUser.value = null
}

const updateUserRole = async () => {
  if (!selectedUser.value) return

  try {
    updating.value = true

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole.value })
      .eq('id', selectedUser.value.id)

    if (error) throw error

    successMessage.value = `✅ Rol actualizado correctamente a ${getRoleLabel(newRole.value)}`
    
    const userIndex = users.value.findIndex(u => u.id === selectedUser.value!.id)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole.value
    }
    filterUsers()
    
    closeRoleModal()
  } catch  {
    errorMessage.value = '❌ Error al actualizar el rol'
  } finally {
    updating.value = false
  }
}

const getInitials = (firstName: string | null, lastName: string | null) => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    customer: 'Cliente',
    admin: 'Administrador',
    owner: 'Owner'
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    customer: 'bg-success',
    admin: 'bg-warning text-dark',
    owner: 'bg-danger'
  }
  return classes[role] || 'bg-secondary'
}

const getRoleIcon = (role: string) => {
  const icons: Record<string, string> = {
    customer: 'fa-user',
    admin: 'fa-user-shield',
    owner: 'fa-crown'
  }
  return icons[role] || 'fa-user'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.owner-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.owner-title {
  color: #2c3e50;
  font-weight: 700;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
}

.stat-card.bg-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  color: white;
}

.stat-card.bg-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white;
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.8;
  margin-right: 1.5rem;
}

.stat-info h3 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.stat-info p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
}

.user-info-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: slideUp 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

/* Paginación */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.pagination-arrow,
.pagination-number {
  min-width: 40px;
  height: 40px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.pagination-arrow:hover:not(:disabled),
.pagination-number:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

.pagination-arrow:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}
</style>