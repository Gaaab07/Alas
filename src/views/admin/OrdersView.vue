<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Mis pedidos</h1>
    <p v-if="!user">Necesitas iniciar sesión para ver tus pedidos.</p>
    <p v-else>Aquí aparecerá la lista de pedidos del usuario <b>{{ user.email }}</b>.</p>
  </div>
</template>
