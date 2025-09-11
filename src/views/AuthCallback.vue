<template>
  <div class="auth-callback">
    <p>Procesando inicio de sesión...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

onMounted(async () => {
  // Supabase maneja la sesión automáticamente en la URL /auth/v1/callback
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    // Si hay sesión, redirige a WelcomeView
    router.replace('/welcome')
  } else {
    // Si no hay sesión válida, vuelve al login
    router.replace('/')
  }
})
</script>
