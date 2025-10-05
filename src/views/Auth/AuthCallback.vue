<template>
  <div class="auth-callback">
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Procesando inicio de sesión...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../supabase'

const router = useRouter()

onMounted(async () => {
  console.log('🔄 AuthCallback: Procesando callback de Google...')
  
  // Supabase maneja la sesión automáticamente en la URL /auth/v1/callback
  const { data } = await supabase.auth.getSession()
  
  if (data.session) {
    console.log('✅ Sesión válida encontrada, redirigiendo al inicio...')
    // Redirigir al inicio en lugar de welcome
    router.replace('/')
  } else {
    console.log('❌ No hay sesión válida, redirigiendo al login...')
    // Si no hay sesión válida, vuelve al login
    router.replace('/signin')
  }
})
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>