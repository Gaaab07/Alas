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
      { path: '', name: 'shop', component: ShopView },
      { path: 'welcome', name: 'welcome', component: () => import('../views/Auth/WelcomeView.vue') },
      { path: 'auth/v1/callback', name: 'auth-callback', component: () => import('../views/Auth/AuthCallback.vue') },

      // Ejemplo de rutas protegidas
      { 
        path: 'orders',
        name: 'orders',
        component: () => import('../views/OrdersView.vue'),
        meta: { requiresAuth: true } // 👈 requiere login
      },
      { 
        path: 'profile',
        name: 'profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { requiresAuth: true } // 👈 requiere login
      },
      { 
        path: 'admin',
        name: 'admin',
        component: () => import('../views/AdminView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true } // 👈 requiere admin
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
  const { isAuthenticated, isAdmin, loadUser } = useAuth()

  // 🔹 Aseguramos que el usuario y perfil estén cargados
  await loadUser()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next({ name: 'signin' })
  }

  if (to.meta.requiresAdmin && !isAdmin.value) {
    return next({ name: 'shop' }) // redirigir si no es admin
  }

  next()
})


export default router
