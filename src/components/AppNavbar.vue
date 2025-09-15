<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light w-100">
    <div class="container-fluid px-4 px-lg-5">
      <a class="navbar-brand fw-bold text-primary" href="#">ALAS®</a>
      
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
            <a class="nav-link text-muted" href="#">INICIO</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-muted" href="#">TIENDA</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-muted" href="#">COLECCIONES</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-muted" href="#">CONOCENOS</a>
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
          <div class="dropdown me-2">
            <button 
              class="btn btn-link text-dark p-2 border-0" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              @click="checkUserSession"
            >
              <i class="fa-solid fa-user"></i>
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
                <h6 class="mb-3">¡Hola, {{ userName }}!</h6>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase' // Ajusta la ruta según tu estructura

const router = useRouter()

// Estados reactivos
const isAuthenticated = ref(false)
const userName = ref('')
const cartItemsCount = ref(0)

// Verificar sesión del usuario
const checkUserSession = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error checking user session:', error)
      isAuthenticated.value = false
      return
    }

    if (user) {
      isAuthenticated.value = true
      // Obtener nombre del usuario (puedes ajustar según tus datos)
      userName.value = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'
    } else {
      isAuthenticated.value = false
    }
  } catch (err) {
    console.error('Error:', err)
    isAuthenticated.value = false
  }
}

// Redirigir a SignIn
const redirectToSignIn = () => {
  router.push('/signin')
}

// Ir a pedidos
const goToOrders = () => {
  router.push('/orders')
  // Cerrar dropdown manualmente si es necesario
  const dropdownEl = document.querySelector('.dropdown-menu.show')
  if (dropdownEl) {
    dropdownEl.classList.remove('show')
  }
}

// Ir a perfil
const goToProfile = () => {
  router.push('/profile')
  // Cerrar dropdown manualmente si es necesario
  const dropdownEl = document.querySelector('.dropdown-menu.show')
  if (dropdownEl) {
    dropdownEl.classList.remove('show')
  }
}

// Cerrar sesión
const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
      return
    }
    
    isAuthenticated.value = false
    userName.value = ''
    
    // Redirigir al inicio
    router.push('/')
    
    // Cerrar dropdown
    const dropdownEl = document.querySelector('.dropdown-menu.show')
    if (dropdownEl) {
      dropdownEl.classList.remove('show')
    }
  } catch (err) {
    console.error('Error during logout:', err)
  }
}

// Escuchar cambios en la autenticación
onMounted(() => {
  // Verificar sesión inicial
  checkUserSession()
  
  // Escuchar cambios de autenticación
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      isAuthenticated.value = true
      userName.value = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario'
    } else if (event === 'SIGNED_OUT') {
      isAuthenticated.value = false
      userName.value = ''
    }
  })
})
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
</style>