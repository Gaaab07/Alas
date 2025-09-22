<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { profile, user } = useAuth()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Mi perfil</h1>

    <div v-if="!user">
      <p>Debes iniciar sesión para ver tu perfil.</p>
    </div>

    <div v-else>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Nombre:</strong> {{ profile?.full_name ?? 'No definido' }}</p>
      <p><strong>Rol:</strong> {{ profile?.role }}</p>
    </div>
  </div>
</template>
