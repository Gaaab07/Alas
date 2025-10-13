<template>
  <div class="signup">
    <h2>Registro</h2>
    
    <form @submit.prevent="signupUser">
      <div>
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>

      <div>
        <label>Contraseña:</label>
        <input type="password" v-model="password" required />
      </div>

      <button type="submit">Registrarse</button>
    </form>

    <p v-if="mensaje">{{ mensaje }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../../supabase'
import '@/assets/Styles/signup.css'

const email = ref('')
const password = ref('')
const mensaje = ref('')

const signupUser = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (error) {
      if (error.message.includes('already registered')) {
        mensaje.value = '⚠️ Este correo ya tiene una cuenta. Si la creaste con Google, inicia sesión con Google.'
      } else {
        mensaje.value = '❌ Error: ' + error.message
      }
      return
    }

    if (data?.user?.identities?.length === 0) {
      mensaje.value = '⚠️ Ya tienes una cuenta creada con este correo. Inicia sesión con Google.'
      return
    }

    mensaje.value = '✅ Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta.'
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    mensaje.value = '❌ Error inesperado: ' + errorMessage
  }
}
</script>