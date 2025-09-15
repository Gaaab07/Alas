<template>
  <div class="login">
    <h2>Iniciar sesión</h2>

    <!-- Login con Google -->
    <button @click="loginGoogle">Iniciar sesión con Google</button>

    <p>o</p>

    <!-- Login con Email y Contraseña -->
    <form @submit.prevent="loginEmail">
      <input 
        v-model="email" 
        type="email" 
        placeholder="Correo electrónico" 
        required 
      />
      <input 
        v-model="password" 
        type="password" 
        placeholder="Contraseña" 
        required 
      />
      <button type="submit">Iniciar sesión</button>
    </form>

    <!-- Enlace a registro -->
    <p>
      ¿No tienes cuenta?
      <router-link to="/signup">Regístrate aquí</router-link>
    </p>

    <p v-if="mensaje">{{ mensaje }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../../supabase'

const mensaje = ref('')
const email = ref('')
const password = ref('')

// Login con Google
const loginGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173/auth/v1/callback' }
    })

    if (error) {
      mensaje.value = '❌ Error: ' + error.message
      console.error(error)
      return
    }

    if (data?.url) {
      mensaje.value = '🔄 Redirigiendo a Google...'
      window.location.href = data.url
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    mensaje.value = '❌ Error inesperado: ' + errorMessage
    console.error(err)
  }
}

// Login con Email y Contraseña
const loginEmail = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) {
      mensaje.value = '❌ Error: ' + error.message
      console.error(error)
      return
    }

    mensaje.value = '✅ Inicio de sesión exitoso'
    // Redirigir al welcome
    window.location.href = '/welcome'
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    mensaje.value = '❌ Error inesperado: ' + errorMessage
    console.error(err)
  }
}
</script>

<style scoped>
.login {
  text-align: center;
  margin-top: 50px;
}

input {
  display: block;
  margin: 10px auto;
  padding: 8px;
  width: 250px;
}

button {
  padding: 10px 20px;
  margin-top: 10px;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #357AE8;
}
</style>
