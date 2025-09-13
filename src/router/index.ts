import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '../views/Auth/SignIn.vue'  // <-- importa tu SignIn.vue
import SignUpView from '../views/Auth/SignUp.vue' // <-- importa tu SignUp.vue
import ShopView from '../views/Shop/ShopView.vue'
const routes = [
  {
    path: '/',
    name: 'signin',        
    component: SignIn      
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('../views/Auth/WelcomeView.vue')
  },
  {
  path: '/auth/v1/callback',
  name: 'auth-callback',
  component: () => import('../views/Auth/AuthCallback.vue')
  },
  {
  path: '/signup',
  name: 'signup',
  component: SignUpView
},
  {
    path: '/shop',
    name: 'shop',
    component: ShopView
  }
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
