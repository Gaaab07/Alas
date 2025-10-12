import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

import DefaultLayout from '../layouts/DefaultLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

import SignIn from '../views/Auth/SignIn.vue'
import SignUpView from '../views/Auth/SignUp.vue'
import ShopView from '../views/Shop/ShopView.vue'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { 
        path: '', 
        name: 'home', 
        component: ShopView
      },
      { 
        path: 'shop', 
        name: 'shop', 
        component: () => import('../views/Shop/ProductsView.vue')
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
        path: 'collections',
        name: 'collections',
        component: () => import('@/views/Shop/CollectionsView.vue')
      },
      {
        path: 'collection/:collection',
        name: 'collection-detail',
        component: () => import('@/views/Shop/CollectionDetailView.vue')
      },
      {
        path: '/checkout',
        name: 'checkout',
        component: () => import('@/views/Shop/CheckoutView.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/politicas/reembolso',
        name: 'politica-reembolso',
        component: () => import('@/views/Politicas/PoliticaReembolso.vue')
      },
      {
        path: '/politicas/envios',
        name: 'politica-envios',
        component: () => import('@/views/Politicas/PoliticaEnvios.vue')
      },
      {
        path: '/politicas/privacidad',
        name: 'politica-privacidad',
        component: () => import('@/views/Politicas/PoliticaPrivacidad.vue')
      },
      {
        path: '/politicas/terminos',
        name: 'politica-terminos',
        component: () => import('@/views/Politicas/PoliticaTerminos.vue')
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/Politicas/AboutView.vue')
      },
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
  const { isAuthenticated, isAdmin, loadUser, profile, isLoadingProfile } = useAuth()

  await loadUser()

  let attempts = 0
  while (isLoadingProfile.value && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next({ name: 'signin' })
  }

  if (to.meta.requiresAdmin) {
    if (!profile.value) {
      await new Promise(resolve => setTimeout(resolve, 500))
      await loadUser()
    }

    if (!isAdmin.value) {
      return next({ name: 'home' })
    }
  }

  next()
})

export default router