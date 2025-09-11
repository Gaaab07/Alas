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
import { supabase } from '../supabase'

const email = ref('')
const password = ref('')
const mensaje = ref('')

const signupUser = async () => {
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (error) {
      mensaje.value = '❌ Error: ' + error.message
      console.error(error)
      return
    }

    mensaje.value = '✅ Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta.'

 } catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : String(err)
  mensaje.value = '❌ Error inesperado: ' + errorMessage
  console.error(err)
}

}
</script>

<style scoped>
.signup {
  text-align: center;
  margin-top: 50px;
}
form div {
  margin-bottom: 15px;
}
input {
  padding: 8px;
  width: 250px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #388e3c;
}
</style>
