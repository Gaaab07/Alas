import { createRouter, createWebHistory } from 'vue-router'

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
      { path: 'auth/v1/callback', name: 'auth-callback', component: () => import('../views/Auth/AuthCallback.vue') }
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
  },
  // {
  // path: '/orders',
  // component: () => import('@/views/Orders.vue'),
  // meta: { requiresAuth: true }
  // },
  // {
  // path: '/profile',
  // component: () => import('@/views/Profile.vue'),
  // meta: { requiresAuth: true }
  // }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
