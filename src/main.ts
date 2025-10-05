import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuth } from '@/composables/useAuth'

const pinia = createPinia()

// Función async para inicializar
async function initApp() {
  console.log('🚀 Inicializando aplicación...')
  
  const app = createApp(App)
  
  app.use(pinia)
  
  // Inicializar auth ANTES de usar el router
  const { loadUser } = useAuth()
  await loadUser()
  
  console.log('✅ Auth inicializado, montando app...')
  
  app.use(router)
  app.mount('#app')
  
  console.log('✅ Aplicación montada')
}

// Iniciar la app
initApp()