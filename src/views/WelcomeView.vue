<template>
  <div class="welcome">
    <h1>Bienvenido, {{ userEmail }}</h1>
    <p>Has iniciado sesión correctamente con Google ✅</p>
    <button @click="logout">Cerrar sesión</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const userEmail = ref('')

// Al montar el componente, obtenemos el usuario logueado
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    userEmail.value = user.email || ''
  }
})

// Función para cerrar sesión
const logout = async () => {
  await supabase.auth.signOut()
  window.location.href = '/' // redirige al login
}
</script>

<style scoped>
.welcome {
  text-align: center;
  margin-top: 50px;
}
button {
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}
button:hover {
  background-color: #d32f2f;
}
</style>
