import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Layouts
import DefaultLayout from '../layouts/DefaultLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Vistas
import SignIn from '../views/Auth/SignIn.vue'
import SignUpView from '../views/Auth/SignUp.vue'
import ShopView from '../views/Shop/ShopView.vue'

const routes = [
  // Páginas normales con DefaultLayout
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { 
        path: '', 
        name: 'home', 
        component: ShopView  // HOME con HeroVideo
      },
      { 
        path: 'shop', 
        name: 'shop', 
        component: () => import('../views/Shop/ProductsView.vue')  // TIENDA solo productos
      },
      { 
        path: 'welcome', 
        name: 'welcome', 
        component: () => import('../views/Auth/WelcomeView.vue') 
      },
      { 
        path: 'auth/v1/callback', 
        name: 'auth-callback', 
        component: () => import('../views/Auth/AuthCallback.vue') 
      },
      {
        path: 'product/:id',
        name: 'product-detail',
        component: () => import('@/views/Shop/ProductDetailView.vue')
      },
      {
        path: '/checkout',
        name: 'checkout',
        component: () => import('@/views/Shop/CheckoutView.vue'),
        meta: { requiresAuth: false }
      },
      // Rutas protegidas
      { 
        path: 'orders',
        name: 'orders',
        component: () => import('../views/admin/OrdersView.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'profile',
        name: 'profile',
        component: () => import('../views/user/ProfileView.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'admin',
        name: 'admin',
        component: () => import('../views/admin/AdminView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/products',
        name: 'admin-products',
        component: () => import('@/views/admin/AdminProductsView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },

  // Login/Signup con AuthLayout
  {
    path: '/signin',
    component: AuthLayout,
    children: [
      { path: '', name: 'signin', component: SignIn }
    ]
  },
  {
    path: '/signup',
    component: AuthLayout,
    children: [
      { path: '', name: 'signup', component: SignUpView }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, _from, next) => {
  console.log('🛣️ Navegando a:', to.path, 'Meta:', to.meta)
  
  const { isAuthenticated, isAdmin, loadUser, profile, isLoadingProfile } = useAuth()

  // Recargar usuario y perfil primero
  await loadUser()

  // Esperar hasta 2 segundos a que se cargue el perfil
  let attempts = 0
  while (isLoadingProfile.value && attempts < 20) {
    console.log('⏳ Esperando carga de perfil... intento', attempts + 1)
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  // Si requiere auth pero no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    console.log('❌ Ruta requiere autenticación, redirigiendo a signin')
    return next({ name: 'signin' })
  }

  // Si requiere admin, esperar a que el perfil esté cargado
  if (to.meta.requiresAdmin) {
    // Dar un momento extra para asegurar que el perfil se cargó
    if (!profile.value) {
      console.log('⚠️ Perfil no cargado, esperando...')
      await new Promise(resolve => setTimeout(resolve, 500))
      await loadUser()
    }

    console.log('🔍 Estado auth completo:', {
      isAuthenticated: isAuthenticated.value,
      isAdmin: isAdmin.value,
      role: profile.value?.role,
      profileId: profile.value?.id,
      requiresAuth: to.meta.requiresAuth,
      requiresAdmin: to.meta.requiresAdmin
    })

    if (!isAdmin.value) {
      console.log('❌ Ruta requiere admin. Usuario no es admin:', {
        role: profile.value?.role,
        profile: profile.value
      })
      return next({ name: 'home' })  // Cambiado de 'shop' a 'home'
    }
  }

  console.log('✅ Acceso permitido a', to.path)
  next()
})

export default router