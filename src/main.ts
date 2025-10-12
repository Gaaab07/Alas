import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuth } from '@/composables/useAuth'

const pinia = createPinia()

// Función async para inicializar
async function initApp() {

  
  const app = createApp(App)
  
  app.use(pinia)
  
  // Inicializar auth ANTES de usar el router
  const { loadUser } = useAuth()
  await loadUser()
  

  
  app.use(router)
  app.mount('#app')
  
 
}

// Iniciar la app
initApp()