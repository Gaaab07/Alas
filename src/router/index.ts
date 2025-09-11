import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '../views/SignIn.vue'  // <-- importa tu SignIn.vue
import SignUpView from '../views/SignUp.vue' // <-- importa tu SignUp.vue
const routes = [
  {
    path: '/',
    name: 'signin',        
    component: SignIn      
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('../views/WelcomeView.vue')
  },
  {
  path: '/auth/v1/callback',
  name: 'auth-callback',
  component: () => import('../views/AuthCallback.vue')
  },
  {
  path: '/signup',
  name: 'signup',
  component: SignUpView
}
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
