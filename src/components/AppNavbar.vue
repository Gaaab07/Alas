<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light w-100">
    <div class="container-fluid px-4 px-lg-5">
      <router-link to="/" class="navbar-brand fw-bold text-primary text-decoration-none">ALAS®</router-link>
      
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <!-- Menú principal centrado -->
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/" class="nav-link text-muted">INICIO</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/shop" class="nav-link text-muted">TIENDA</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/collections" class="nav-link text-muted">COLECCIONES</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link text-muted">CONOCENOS</router-link>
          </li>
          
          <!-- Botón Admin - Solo visible para administradores -->
          <li class="nav-item" v-if="isAdmin">
            <router-link to="/admin/products" class="nav-link text-warning fw-bold">
              <i class="fa-solid fa-gear"></i> PANEL ADMIN
            </router-link>
          </li>
        </ul>
        
        <!-- Sección derecha con idioma, búsqueda, usuario y carrito -->
        <div class="d-flex align-items-center">
          <!-- Selector de idioma -->
          <div class="dropdown me-3">
            <button class="btn btn-link text-dark p-0 border-0" type="button" data-bs-toggle="dropdown">
              🇩🇪 PEN <i class="fa-solid fa-chevron-down ms-1"></i>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">🇩🇪 PEN</a></li>
              <li><a class="dropdown-item" href="#">🇺🇸 USD</a></li>
              <li><a class="dropdown-item" href="#">🇪🇸 EUR</a></li>
            </ul>
          </div>

          <!-- Icono de búsqueda -->
          <router-link to="/search" class="btn btn-link text-dark p-2 me-2">
            <i class="fa-solid fa-magnifying-glass"></i>
          </router-link>
          
          <!-- Dropdown de usuario -->
          <div class="dropdown me-2" ref="userDropdownRef">
            <button 
              class="btn btn-link text-dark p-2 border-0 position-relative" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              ref="dropdownToggleRef"
            >
              <i class="fa-solid fa-user"></i>
              <!-- Badge de Admin -->
              <span v-if="isAdmin" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style="font-size: 0.6rem;">
                A
              </span>
            </button>
            
            <!-- Dropdown menu para usuario no autenticado -->
            <div class="dropdown-menu dropdown-menu-end p-3" style="min-width: 300px;" v-if="!isAuthenticated">
              <div class="text-center">
                <h6 class="mb-3">CUENTA</h6>
                <button 
                  class="btn btn-primary w-100 mb-3" 
                  @click="redirectToSignIn"
                >
                  INICIAR SESIÓN
                </button>
                <div class="d-flex justify-content-between">
                  <button 
                    class="btn btn-outline-secondary flex-fill me-1" 
                    disabled
                  >
                    <i class="fa-solid fa-box me-1"></i> Pedidos
                  </button>
                  <button 
                    class="btn btn-outline-secondary flex-fill ms-1" 
                    disabled
                  >
                    <i class="fa-solid fa-user me-1"></i> Perfil
                  </button>
                </div>
                <small class="text-muted d-block mt-2">
                  Inicia sesión para acceder a pedidos y perfil
                </small>
              </div>
            </div>

            <!-- Dropdown menu para usuario autenticado -->
            <div class="dropdown-menu dropdown-menu-end p-3" style="min-width: 300px;" v-else>
              <div class="text-center">
                <h6 class="mb-2">¡Hola, {{ displayName }}!</h6>
                <!-- Badge de rol Admin -->
                <span v-if="isAdmin" class="badge bg-warning text-dark mb-3">
                  <i class="fa-solid fa-crown me-1"></i> Administrador
                </span>
                
                <!-- Botón destacado de Panel Admin -->
                <button 
                  v-if="isAdmin"
                  class="btn btn-warning w-100 mb-3 fw-bold"
                  @click="goToAdminPanel"
                >
                  <i class="fa-solid fa-gear me-1"></i> Panel de Administración
                </button>
                
                <div class="d-flex justify-content-between mb-3">
                  <button 
                    class="btn btn-outline-primary flex-fill me-1"
                    @click="goToOrders"
                  >
                    <i class="fa-solid fa-box me-1"></i> Pedidos
                  </button>
                  <button 
                    class="btn btn-outline-primary flex-fill ms-1"
                    @click="goToProfile"
                  >
                    <i class="fa-solid fa-user me-1"></i> Perfil
                  </button>
                </div>
                <button 
                  class="btn btn-outline-danger w-100" 
                  @click="logout"
                >
                  <i class="fa-solid fa-sign-out-alt me-1"></i> Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
          
          <!-- Icono del carrito -->
          <router-link to="/cart" class="btn btn-link text-dark p-2 position-relative">
            <i class="fa-solid fa-shopping-cart"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark" v-if="cartItemsCount > 0">
              {{ cartItemsCount }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()

// Referencias del template
const userDropdownRef = ref<HTMLElement>()
const dropdownToggleRef = ref<HTMLElement>()

// Usar el composable de autenticación
const { user, profile, isAuthenticated, isAdmin, signOut } = useAuth()

// Estados locales que no están relacionados con autenticación
const cartItemsCount = ref(0)

// Nombre a mostrar - computed para que sea reactivo
const displayName = computed(() => {
  if (profile.value?.full_name) {
    return profile.value.full_name
  }
  // Si no hay profile pero hay user, usar el email
  if (user.value?.email) {
    return user.value.email.split('@')[0]
  }
  return 'Usuario'
})

// Declarar tipos para Bootstrap
declare global {
  interface Window {
    bootstrap?: {
      Dropdown: {
        getInstance: (element: HTMLElement) => { dispose: () => void } | null
        new (element: HTMLElement): void
      }
    }
  }
}

// Función para reinicializar el dropdown de Bootstrap
const reinitializeDropdown = async () => {
  await nextTick()
  
  if (dropdownToggleRef.value) {
    try {
      // Forzar que se limpien todos los estados
      const allDropdowns = document.querySelectorAll('.dropdown-menu.show')
      allDropdowns.forEach(dropdown => {
        dropdown.classList.remove('show')
      })
      
      const allButtons = document.querySelectorAll('[data-bs-toggle="dropdown"].show')
      allButtons.forEach(button => {
        button.classList.remove('show')
        button.setAttribute('aria-expanded', 'false')
      })
      
      // Reinicializar el dropdown si Bootstrap está disponible
      if (typeof window !== 'undefined' && window.bootstrap?.Dropdown) {
        const existingDropdown = window.bootstrap.Dropdown.getInstance(dropdownToggleRef.value)
        if (existingDropdown) {
          existingDropdown.dispose()
        }
        new window.bootstrap.Dropdown(dropdownToggleRef.value)
      }
    } catch (error) {
      console.log('Dropdown reinitialize:', error)
    }
  }
}

// Watcher para reinicializar dropdown cuando cambie el estado de autenticación
watch(isAuthenticated, () => {
  reinitializeDropdown()
})

// Redirigir a SignIn
const redirectToSignIn = () => {
  router.push('/signin')
}

// Ir a panel admin
const goToAdminPanel = () => {
  router.push('/admin/products')
  closeDropdown()
}

// Ir a pedidos
const goToOrders = () => {
  router.push('/orders')
  closeDropdown()
}

// Ir a perfil
const goToProfile = () => {
  router.push('/profile')
  closeDropdown()
}

// Cerrar sesión usando el composable
const logout = async () => {
  try {
    await signOut()
    router.push('/')
    closeDropdown()
    // Reinicializar dropdown después del logout
    await reinitializeDropdown()
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

// Función helper para cerrar dropdown
const closeDropdown = () => {
  const dropdownEl = document.querySelector('.dropdown-menu.show')
  if (dropdownEl) {
    dropdownEl.classList.remove('show')
  }
  
  // También remover la clase show del botón
  const dropdownButton = document.querySelector('[data-bs-toggle="dropdown"].show')
  if (dropdownButton) {
    dropdownButton.classList.remove('show')
    dropdownButton.setAttribute('aria-expanded', 'false')
  }
}
</script>

<style scoped>
.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-link {
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.btn-link {
  text-decoration: none !important;
}

.btn-link:hover {
  color: #0d6efd !important;
}

.dropdown-menu {
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.dropdown-menu .btn {
  transition: all 0.2s ease;
}

.dropdown-menu .btn:hover {
  transform: translateY(-1px);
}

/* Estilos para botones deshabilitados */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Badge del carrito */
.badge {
  font-size: 0.7rem;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Estilos especiales para elementos admin */
.text-warning {
  color: #ffc107 !important;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background-color: #ffca2c;
  border-color: #ffc720;
}

/* Animación suave para el nav-link */
.nav-link {
  transition: color 0.3s ease;
}

.nav-link.text-warning:hover {
  color: #ffca2c !important;
}
</style>